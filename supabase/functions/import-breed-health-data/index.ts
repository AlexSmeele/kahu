import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Strip Notion URLs from text
function stripNotionUrls(text: string | null): string | null {
  if (!text) return text;
  // Remove patterns like "Issue Name (https://www.notion.so/...)"
  return text.replace(/\s*\(https:\/\/www\.notion\.so\/[^)]+\)/g, '');
}

// Parse CSV line handling quoted values properly
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  
  return result;
}

// Parse number or return null
function parseNumber(value: string | null): number | null {
  if (!value || value === '') return null;
  const num = parseFloat(value);
  return isNaN(num) ? null : num;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Starting breed and health data import...');

    // Get CSV data from request body or read from files
    const body = await req.json().catch(() => ({}));
    let breedsCSV: string;
    let healthIssuesCSV: string;
    
    if (body.breedsCSV && body.healthIssuesCSV) {
      breedsCSV = body.breedsCSV;
      healthIssuesCSV = body.healthIssuesCSV;
      console.log('Using CSV data from request body');
    } else {
      // Try to read from files (for local testing)
      try {
        breedsCSV = await Deno.readTextFile('./dog_breeds.csv');
        healthIssuesCSV = await Deno.readTextFile('./dog_health_issues.csv');
        console.log('Using CSV data from local files');
      } catch (error) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'CSV data not provided in request body and files not found. Please provide breedsCSV and healthIssuesCSV in the request body.',
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          }
        );
      }
    }

    // Parse health issues CSV
    const healthLines = healthIssuesCSV.split('\n').filter(line => line.trim());
    const healthHeaders = parseCSVLine(healthLines[0]);
    
    console.log(`Processing ${healthLines.length - 1} health issues...`);
    
    const healthIssueMap = new Map<string, string>(); // name -> id
    const healthIssueToBreeds = new Map<string, string[]>(); // health issue name -> breed names
    
    for (let i = 1; i < healthLines.length; i++) {
      const values = parseCSVLine(healthLines[i]);
      const healthIssue = {
        name: stripNotionUrls(values[0])?.trim() || '',
        category: values[2] || null,
        subcategory: values[5] || null,
        first_line_screening: values[3] || null,
        typical_signs: values[6] || null,
        notes: values[4] || null,
      };
      
      if (!healthIssue.name) continue;
      
      // Insert or get health issue
      const { data, error } = await supabase
        .from('dog_health_issues')
        .upsert(healthIssue, { onConflict: 'name' })
        .select('id, name')
        .single();
      
      if (error) {
        console.error(`Error inserting health issue ${healthIssue.name}:`, error);
        continue;
      }
      
      healthIssueMap.set(data.name, data.id);
      
      // Parse associated breeds (column 1)
      const breedsText = stripNotionUrls(values[1]) || '';
      if (breedsText) {
        const breeds = breedsText.split(',').map(b => b.trim()).filter(b => b);
        healthIssueToBreeds.set(data.name, breeds);
      }
      
      console.log(`Processed health issue: ${healthIssue.name}`);
    }

    console.log(`Processed ${healthIssueMap.size} health issues`);

    // Parse breeds CSV
    const breedLines = breedsCSV.split('\n').filter(line => line.trim());
    const breedHeaders = parseCSVLine(breedLines[0]);
    
    console.log(`Processing ${breedLines.length - 1} breeds...`);
    
    const breedNameToId = new Map<string, string>(); // breed name -> id
    const breedToHealthIssues = new Map<string, string[]>(); // breed name -> health issue names
    
    for (let i = 1; i < breedLines.length; i++) {
      const values = parseCSVLine(breedLines[i]);
      
      const breedName = values[0]?.trim() || '';
      if (!breedName) continue;
      
      // Parse common health issues (column 2)
      const healthIssuesText = stripNotionUrls(values[2]) || '';
      let healthIssuesArray: string[] = [];
      if (healthIssuesText) {
        healthIssuesArray = healthIssuesText
          .split(',')
          .map(issue => issue.trim())
          .filter(issue => issue);
      }
      
      const breed = {
        breed: breedName,
        coat: values[1] || null,
        also_known_as: values[3] || null,
        enrichment_confidence: values[4] || null,
        exercise_level: values[5] || null,
        exercise_needs: values[6] || null,
        fci_group: parseNumber(values[7]),
        female_weight_6m_kg_min: parseNumber(values[9]),
        female_weight_6m_kg_max: parseNumber(values[8]),
        female_weight_adult_kg_min: parseNumber(values[11]),
        female_weight_adult_kg_max: parseNumber(values[10]),
        grooming: values[12] || null,
        grooming_needs: values[13] || null,
        health_notes_confidence: values[14] || null,
        health_prevalence_notes: values[15] || null,
        health_watchlist_tags: values[16] || null,
        life_span_years: values[17] || null,
        male_weight_6m_kg_min: parseNumber(values[19]),
        male_weight_6m_kg_max: parseNumber(values[18]),
        male_weight_adult_kg_min: parseNumber(values[21]),
        male_weight_adult_kg_max: parseNumber(values[20]),
        origin: values[22] || null,
        recognized_by: values[23] || null,
        recommended_screenings: values[24] || null,
        temperament: values[25] || null,
        trainability: values[26] || null,
        weights_confidence: values[27] || null,
        common_health_issues: healthIssuesArray.join('; ') || null,
      };
      
      // Upsert breed
      const { data, error } = await supabase
        .from('dog_breeds')
        .upsert(breed, { onConflict: 'breed' })
        .select('id, breed')
        .single();
      
      if (error) {
        console.error(`Error upserting breed ${breedName}:`, error);
        continue;
      }
      
      breedNameToId.set(data.breed, data.id);
      if (healthIssuesArray.length > 0) {
        breedToHealthIssues.set(data.breed, healthIssuesArray);
      }
      
      console.log(`Processed breed: ${breedName}`);
    }

    console.log(`Processed ${breedNameToId.size} breeds`);

    // Create breed-health relationships
    console.log('Creating breed-health relationships...');
    let relationshipsCreated = 0;
    
    // From breeds -> health issues
    for (const [breedName, healthIssues] of breedToHealthIssues) {
      const breedId = breedNameToId.get(breedName);
      if (!breedId) continue;
      
      for (const healthIssueName of healthIssues) {
        const healthIssueId = healthIssueMap.get(healthIssueName);
        if (!healthIssueId) continue;
        
        const { error } = await supabase
          .from('dog_breed_health_issues')
          .upsert(
            { breed_id: breedId, health_issue_id: healthIssueId },
            { onConflict: 'breed_id,health_issue_id' }
          );
        
        if (error) {
          console.error(`Error creating relationship ${breedName} -> ${healthIssueName}:`, error);
        } else {
          relationshipsCreated++;
        }
      }
    }
    
    // From health issues -> breeds
    for (const [healthIssueName, breeds] of healthIssueToBreeds) {
      const healthIssueId = healthIssueMap.get(healthIssueName);
      if (!healthIssueId) continue;
      
      for (const breedName of breeds) {
        const breedId = breedNameToId.get(breedName);
        if (!breedId) continue;
        
        const { error } = await supabase
          .from('dog_breed_health_issues')
          .upsert(
            { breed_id: breedId, health_issue_id: healthIssueId },
            { onConflict: 'breed_id,health_issue_id' }
          );
        
        if (error) {
          console.error(`Error creating relationship ${breedName} <- ${healthIssueName}:`, error);
        } else {
          relationshipsCreated++;
        }
      }
    }

    console.log(`Created ${relationshipsCreated} breed-health relationships`);

    // Get final counts
    const { count: breedsCount } = await supabase
      .from('dog_breeds')
      .select('*', { count: 'exact', head: true });
    
    const { count: healthIssuesCount } = await supabase
      .from('dog_health_issues')
      .select('*', { count: 'exact', head: true });
    
    const { count: relationshipsCount } = await supabase
      .from('dog_breed_health_issues')
      .select('*', { count: 'exact', head: true });

    const result = {
      success: true,
      message: 'Import completed successfully',
      summary: {
        breeds_processed: breedNameToId.size,
        breeds_total: breedsCount,
        health_issues_processed: healthIssueMap.size,
        health_issues_total: healthIssuesCount,
        relationships_created: relationshipsCreated,
        relationships_total: relationshipsCount,
      }
    };

    console.log('Import complete:', result);

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Import failed:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
