import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Load the breed encyclopedia CSV from our project
    const csvResponse = await fetch('https://raw.githubusercontent.com/lovablelabs/lovable-frontend/main/src/data/dog_breeds_encyclopedia_v1_16sep.csv');
    
    if (!csvResponse.ok) {
      throw new Error('Could not load breed encyclopedia CSV data');
    }

    const csvText = await csvResponse.text();
    
    // Parse CSV data
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',');
    
    const breedData = lines.slice(1).map(line => {
      const values = line.split(',');
      const breed: any = {};
      
      headers.forEach((header, index) => {
        const value = values[index]?.trim() || null;
        
        // Handle specific field transformations
        switch (header) {
          case 'breed':
            breed.breed = value;
            break;
          case 'origin':
            breed.origin = value;
            break;
          case 'life_span_years':
            breed.life_span_years = value;
            break;
          case 'temperament':
            breed.temperament = value ? value.split(';').map(t => t.trim()) : null;
            break;
          case 'exercise_needs':
            breed.exercise_needs = value;
            break;
          case 'trainability':
            breed.trainability = value;
            break;
          case 'coat':
            breed.coat = value;
            break;
          case 'grooming':
            breed.grooming = value;
            break;
          case 'common_health_issues':
            breed.common_health_issues = value ? value.split(';').map(h => h.trim()) : null;
            break;
          case 'recognized_by':
            breed.recognized_by = value;
            break;
          case 'also_known_as':
            breed.also_known_as = value;
            break;
          case 'fci_group':
            breed.fci_group = value ? parseFloat(value) : null;
            break;
          case 'exercise_level':
            breed.exercise_level = value;
            break;
          case 'grooming_needs':
            breed.grooming_needs = value;
            break;
          case 'enrichment_confidence':
            breed.enrichment_confidence = value;
            break;
          case 'weights_confidence':
            breed.weights_confidence = value;
            break;
          case 'health_notes_confidence':
            breed.health_notes_confidence = value;
            break;
          case 'recommended_screenings':
            breed.recommended_screenings = value;
            break;
          case 'health_watchlist_tags':
            breed.health_watchlist_tags = value;
            break;
          case 'health_prevalence_notes':
            breed.health_prevalence_notes = value;
            break;
          // Weight data - combine into weight_kg object
          case 'male_weight_adult_kg_min':
          case 'male_weight_adult_kg_max':
          case 'male_weight_6m_kg_min':
          case 'male_weight_6m_kg_max':
          case 'female_weight_adult_kg_min':
          case 'female_weight_adult_kg_max':
          case 'female_weight_6m_kg_min':
          case 'female_weight_6m_kg_max':
            if (!breed.weight_kg) {
              breed.weight_kg = { male: {}, female: {} };
            }
            const numValue = value ? parseFloat(value) : null;
            if (header.includes('male_weight_adult_kg_min')) breed.weight_kg.male.adult_min = numValue;
            if (header.includes('male_weight_adult_kg_max')) breed.weight_kg.male.adult_max = numValue;
            if (header.includes('male_weight_6m_kg_min')) breed.weight_kg.male.m6_min = numValue;
            if (header.includes('male_weight_6m_kg_max')) breed.weight_kg.male.m6_max = numValue;
            if (header.includes('female_weight_adult_kg_min')) breed.weight_kg.female.adult_min = numValue;
            if (header.includes('female_weight_adult_kg_max')) breed.weight_kg.female.adult_max = numValue;
            if (header.includes('female_weight_6m_kg_min')) breed.weight_kg.female.m6_min = numValue;
            if (header.includes('female_weight_6m_kg_max')) breed.weight_kg.female.m6_max = numValue;
            break;
        }
      });
      
      return breed;
    });
    
    console.log(`Processing ${breedData.length} breeds...`);

    // Insert breeds in batches to avoid timeout
    const batchSize = 100;
    let inserted = 0;
    let skipped = 0;

    for (let i = 0; i < breedData.length; i += batchSize) {
      const batch = breedData.slice(i, i + batchSize);
      
      const { data, error } = await supabase
        .from('dog_breeds')
        .upsert(
          batch.map((breed: any) => ({
            breed: breed.breed,
            origin: breed.origin,
            life_span_years: breed.life_span_years,
            weight_kg: breed.weight_kg,
            temperament: breed.temperament,
            exercise_needs: breed.exercise_needs,
            trainability: breed.trainability,
            coat: breed.coat,
            grooming: breed.grooming,
            common_health_issues: breed.common_health_issues,
            recognized_by: breed.recognized_by,
            also_known_as: breed.also_known_as,
            fci_group: breed.fci_group,
            exercise_level: breed.exercise_level,
            grooming_needs: breed.grooming_needs,
            enrichment_confidence: breed.enrichment_confidence,
            weights_confidence: breed.weights_confidence,
            health_notes_confidence: breed.health_notes_confidence,
            recommended_screenings: breed.recommended_screenings,
            health_watchlist_tags: breed.health_watchlist_tags,
            health_prevalence_notes: breed.health_prevalence_notes
          })),
          { onConflict: 'breed', ignoreDuplicates: true }
        );

      if (error) {
        console.error(`Error inserting batch ${i / batchSize + 1}:`, error);
        skipped += batch.length;
      } else {
        inserted += batch.length;
        console.log(`Inserted batch ${i / batchSize + 1}/${Math.ceil(breedData.length / batchSize)}`);
      }
    }

    // Get final count
    const { count } = await supabase
      .from('dog_breeds')
      .select('*', { count: 'exact', head: true });

    return new Response(
      JSON.stringify({
        success: true,
        message: `Breed encyclopedia seeded successfully`,
        total_processed: breedData.length,
        inserted: inserted,
        skipped: skipped,
        final_count: count
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in seed-breed-encyclopedia function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});