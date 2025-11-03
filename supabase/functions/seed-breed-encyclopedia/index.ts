import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function to properly parse CSV with quoted values
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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Embedded CSV data - complete breed encyclopedia
    const csvText = `breed,origin,life_span_years,male_weight_adult_kg_min,male_weight_adult_kg_max,male_weight_6m_kg_min,male_weight_6m_kg_max,female_weight_adult_kg_min,female_weight_adult_kg_max,female_weight_6m_kg_min,female_weight_6m_kg_max,temperament,exercise_needs,trainability,coat,grooming,common_health_issues,recognized_by,also_known_as,fci_group,exercise_level,grooming_needs,enrichment_confidence,weights_confidence,health_notes_confidence,recommended_screenings,health_watchlist_tags,health_prevalence_notes
Affenpinscher,Germany,9–12,35.0,60.0,17.5,30.0,30.0,50.0,18.0,30.0,confident;protective;calm,High (60–120 min/day),Moderate–High,Short/medium double,Low–Moderate,hip dysplasia;bloat;heart issues,FCI,,9.0,Low,Varies,breed-specific,breed-specific estimate,,,,
Afghan Hound,Afghanistan,12–14,20.0,35.0,12.0,21.0,18.0,32.0,10.8,19.2,"dignified, independent, aloof",High (60–120 min/day),Moderate,Short or medium,Low to Moderate,hip dysplasia;ear infections;eye disorders,"AKC, FCI",,10.0,Moderate,High (long coat),breed-specific,breed-specific,,anesthesia plan tailored to sighthounds; owner education on bloat for giant/large sighthounds,Anesthesia; Hematologic; Dermatologic; Gastrointestinal,Sighthounds: unique anesthetic/analgesic considerations; thin skin/pressure sores; some have hyperfibrinolysis tendencies; deep‑chested types with bloat risk.
Airedale Terrier,England,11–14,7.0,12.0,4.6,7.9,6.0,11.0,4.5,8.2,"confident, friendly, alert",High (60–90 min/day),Moderate,Wire/broken or smooth,Moderate (hand-stripping for some),patellar luxation;skin issues;lens luxation,"AKC, FCI",,3.0,High,Moderate,breed-specific,breed-specific,,,,
Akita,Japan,10–13,20.0,35.0,12.0,21.0,16.0,30.0,9.6,18.0,"loyal, dignified, reserved",High (90–120 min/day),Moderate,Thick double,Moderate–High (seasonal blowouts),hip dysplasia; eye issues; zinc deficiency; gastric dilatation–volvulus (bloat) risk in deep‑chested breeds; sebaceous adenitis; autoimmune thyroiditis,"AKC, FCI",,5.0,Moderate,Moderate,breed-specific,breed-specific,pattern-based (well-established risks),owner education on bloat; consider prophylactic gastropexy where appropriate,Gastrointestinal,Deep‑chested conformation: increased risk for gastric dilatation–volvulus (bloat); discuss prevention/early signs.
Alaskan Malamute,United States (Alaska),11–14,20.0,35.0,12.0,21.0,16.0,30.0,9.6,18.0,alert;independent;friendly,High (90–120 min/day),Moderate,Thick double,Moderate–High (seasonal blowouts),hip dysplasia; eye issues; zinc deficiency; hereditary eye disease (cataract/PRA); dermatologic issues (zinc‑responsive dermatosis in some lines); chondrodysplasia (dwarfism),"AKC, FCI",,5.0,High,Moderate,breed-specific,breed-specific estimate,pattern-based (well-established risks),OFA hips; polyneuropathy screening if indicated; eye exam (CAER); dietary zinc evaluation if dermatologic signs,Dermatologic; Ophthalmic,Hereditary eye disease and zinc‑responsive dermatosis reported in some lines.
American Bulldog,United States,10–13,9.0,25.0,5.9,16.5,8.0,23.0,5.3,15.2,dignified;loyal;independent,Moderate (45–60 min/day),Moderate,Varies (often double),Low–Moderate,hip dysplasia; BOAS (for brachy breeds); allergies; brachycephalic obstructive airway syndrome (BOAS); heat intolerance; ocular issues (corneal/entropion risk),FCI,,,Moderate,Moderate,breed-specific,breed-specific estimate,pattern-based (well-established risks),airway exam for BOAS risk; eye exam (CAER); airway exam before anesthesia; weight management counseling,Respiratory; Ophthalmic; Spinal; Dermatologic; Anesthesia,BOAS prevalence high; heat intolerance common; ocular ulcer/entropion risk; vertebral malformations more frequent in screw‑tail breeds.
American Cocker Spaniel,United States,11–14,16.0,25.0,10.6,16.5,14.0,23.0,9.2,15.2,gentle;obedient;enthusiastic,High (60–90 min/day),High,Medium feathered,Moderate–High,ear infections; hip dysplasia; eye issues; otitis externa (ear infections); hereditary eye disease (PRA/cataract risk),FCI,,8.0,High,Moderate,breed-specific,breed-specific estimate,pattern-based (well-established risks),hips/elbows (OFA/FCI); ear care plan; skin/coat checks,Otic; Dermatologic; Orthopedic,Retrievers & spaniels: ear infections common; atopy/skin issues occur; orthopedic screening recommended.
American Eskimo Dog,United States,11–14,10.0,22.0,6.6,14.5,9.0,20.0,5.9,13.2,loyal;alert;trainable,Moderate,Moderate,Varies,Low–Moderate,hip dysplasia;eye disorders,FCI,,,Moderate,Moderate,breed-specific,breed-specific estimate,,,,
American Foxhound,United States,10–14,20.0,35.0,12.0,21.0,18.0,32.0,10.8,19.2,independent;gentle;prey-driven,High (60–120 min/day),Moderate (scent/sight driven),Short or medium,Low to Moderate,hip dysplasia;ear infections;eye disorders,FCI,,,Moderate,Moderate,breed-specific,breed-specific estimate,,regular ear checks/cleaning; skin/coat checks,Otic; Dermatologic; Weight,Drop‑eared scenthounds: otitis externa common; monitor weight and skin folds in heavier lines.
American Hairless Terrier,United States,12–15,7.0,12.0,4.6,7.9,6.0,11.0,4.5,8.2,bold;feisty;energetic,High (60–90 min/day),Moderate,Wire/broken or smooth,Moderate (hand-stripping for some),patellar luxation;skin issues;lens luxation,FCI,,,Moderate,Moderate,breed-specific,breed-specific estimate,,,,
American Leopard Hound,United States,10–14,20.0,35.0,12.0,21.0,18.0,32.0,10.8,19.2,independent;gentle;prey-driven,High (60–120 min/day),Moderate (scent/sight driven),Short or medium,Low to Moderate,hip dysplasia;ear infections;eye disorders,FCI,,,Moderate,Moderate,breed-specific,breed-specific estimate,,,,
American Pit Bull Terrier,United States,12–15,7.0,12.0,4.6,7.9,6.0,11.0,4.5,8.2,bold;feisty;energetic,High (60–90 min/day),Moderate,Wire/broken or smooth,Moderate (hand-stripping for some),patellar luxation;skin issues;lens luxation,"FCI, UKC",,,Moderate,Moderate,breed-specific,breed-specific estimate,,BAER hearing test,,
American Staffordshire Terrier,United States,12–15,7.0,12.0,4.6,7.9,6.0,11.0,4.5,8.2,"people‑oriented, confident",High (60–90 min/day),Moderate,Wire/broken or smooth,Moderate (hand-stripping for some),patellar luxation;skin issues;lens luxation,"AKC, FCI",,3.0,High,Low,breed-specific,breed-specific,,,,
American Water Spaniel,United States,12–14,16.0,25.0,10.6,16.5,14.0,23.0,9.2,15.2,"alert, eager, friendly",High (60–90 min/day),Moderate,Medium feathered,Moderate–High,ear infections;hip dysplasia;eye issues,FCI,,,High,Moderate (curly coat),breed-specific,breed-specific,,hips/elbows (OFA/FCI); ear care plan; skin/coat checks,Otic; Dermatologic; Orthopedic,Retrievers & spaniels: ear infections common; atopy/skin issues occur; orthopedic screening recommended.
Australian Cattle Dog,Australia,12–15,18.0,30.0,10.8,18.0,16.0,27.0,10.6,17.8,intelligent;loyal;energetic,"Very High (90–120+ min/day, mental work)",Very High,Double; medium,Moderate,hip dysplasia;CEA;MDR1 sensitivity,FCI,,,Moderate,Moderate,breed-specific,breed-specific estimate,,BAER hearing test,,
Australian Kelpie,Australia,12–15,18.0,30.0,10.8,18.0,16.0,27.0,10.6,17.8,intelligent;loyal;energetic,"Very High (90–120+ min/day, mental work)",Very High,Double; medium,Moderate,hip dysplasia;CEA;MDR1 sensitivity,FCI,,,Moderate,Moderate,breed-specific,breed-specific estimate,,,,
Australian Shepherd,United States,12–15,18.0,30.0,10.8,18.0,16.0,27.0,10.6,17.8,"smart, work‑oriented","Very High (90–120+ min/day, mental work)",High,Double; medium,Moderate,hip dysplasia; CEA; MDR1 sensitivity; MDR1 (ABCB1) drug sensitivity (screening recommended); collie eye anomaly (CEA) in some lines; collie eye anomaly (CEA),"AKC, FCI",,1.0,High,Moderate,breed-specific,breed-specific,pattern-based (well-established risks),hips (OFA/FCI); CEA/eye exam (CAER); MDR1 DNA test; eye exam (CAER),Pharmacogenetics; Ophthalmic,MDR1 drug sensitivity occurs in herding breeds; collie eye anomaly (CEA) in some lines.
Australian Terrier,Australia,12–15,7.0,12.0,4.6,7.9,6.0,11.0,4.5,8.2,bold;feisty;energetic,High (60–90 min/day),Moderate,Wire/broken or smooth,Moderate (hand-stripping for some),patellar luxation;skin issues;lens luxation,FCI,,,Moderate,Moderate,breed-specific,breed-specific estimate,,,,
Basenji,Central Africa (Congo Basin),12–14,10.0,22.0,6.6,14.5,9.0,20.0,5.9,13.2,"independent, catlike",Moderate,Challenging,Varies,Low–Moderate,hip dysplasia; eye disorders; Fanconi syndrome,"AKC, FCI",,5.0,High,Low,breed-specific,breed-specific,,Fanconi DNA test/urinalysis screen,,
Beagle,England,11–14,10.0,22.0,6.6,14.5,9.0,20.0,5.9,13.2,loyal;alert;trainable,Moderate,Moderate,Varies,Low–Moderate,hip dysplasia; eye disorders; epilepsy predisposition,"AKC, FCI",,6.0,High,Low,breed-specific,breed-specific estimate,,regular ear checks/cleaning; skin/coat checks,Otic; Dermatologic; Weight,Drop‑eared scenthounds: otitis externa common; monitor weight and skin folds in heavier lines.
Border Collie,Scotland/England,12–15,18.0,30.0,10.8,18.0,16.0,27.0,10.6,17.8,"intense, highly intelligent","Very High (90–120+ min/day, mental work)",High,Double; medium,Moderate,hip dysplasia; CEA; MDR1 sensitivity; MDR1 (ABCB1) drug sensitivity (screening recommended); collie eye anomaly (CEA) in some lines; epilepsy predisposition,"AKC, FCI",,1.0,Very High,Moderate,breed-specific,breed-specific,pattern-based (well-established risks),hips (OFA/FCI); CEA/eye exam (CAER); MDR1 DNA test; eye exam (CAER),Pharmacogenetics; Ophthalmic,MDR1 drug sensitivity occurs in herding breeds; collie eye anomaly (CEA) in some lines.
Boxer,Germany,10–12,9.0,25.0,5.9,16.5,8.0,23.0,5.3,15.2,bright;playful;dignified,Moderate (45–60 min/day),Moderate,Varies (often double),Low–Moderate,hip dysplasia; BOAS (for brachy breeds); allergies; brachycephalic obstructive airway syndrome (BOAS); heat intolerance; ocular issues (corneal/entropion risk),"AKC, FCI",,2.0,High,Low,breed-specific,breed-specific estimate,pattern-based (well-established risks),airway exam for BOAS risk; eye exam (CAER); airway exam before anesthesia; weight management counseling,Respiratory; Ophthalmic; Spinal; Dermatologic; Anesthesia,BOAS prevalence high; heat intolerance common; ocular ulcer/entropion risk; vertebral malformations more frequent in screw‑tail breeds.
Bulldog,England,8–10,7.0,12.0,4.6,7.9,6.0,11.0,4.5,8.2,"gentle, loyal",Low–Moderate (20–40 min/day),Easy,Wire/broken or smooth,Moderate (hand-stripping for some),patellar luxation;skin issues;lens luxation,"AKC, FCI",,9.0,Low,Low,breed-specific,breed-specific estimate,,,,
Cavalier King Charles Spaniel,England,11–14,2.0,6.0,1.5,4.5,2.0,6.0,1.5,4.5,"gentle, friendly",Low–Moderate (20–40 min/day),Easy,Short or long; varies,Low to High (breed-specific),dental disease;luxating patellas;tracheal collapse,"AKC, FCI",,8.0,Moderate,High (coat),breed-specific,breed-specific,,patellar exam; routine dental care; eye exam (CAER),Dental; Orthopedic; Ophthalmic,Companion/toy breeds: dental disease and patellar luxation common; several have hereditary eye risks.
Chihuahua,Mexico,14–16,2.0,6.0,1.5,4.5,2.0,6.0,1.5,4.5,alert;loyal,Low–Moderate (20–40 min/day),Easy,Short or long; varies,Low to High (breed-specific),dental disease;luxating patellas;tracheal collapse,"AKC, FCI",,9.0,Moderate,Varies,breed-specific,breed-specific,,patellar exam; routine dental care; eye exam (CAER),Dental; Orthopedic; Ophthalmic,Companion/toy breeds: dental disease and patellar luxation common; several have hereditary eye risks.
Cocker Spaniel,England,11–14,16.0,25.0,10.6,16.5,14.0,23.0,9.2,15.2,"merry, gentle",High (60–90 min/day),High,Medium feathered,Moderate–High,ear infections; hip dysplasia; eye issues; otitis externa (ear infections); hereditary eye disease (PRA/cataract risk),"AKC, FCI",,8.0,High,High (coat),breed-specific,breed-specific estimate,pattern-based (well-established risks),hips/elbows (OFA/FCI); ear care plan; skin/coat checks,Otic; Dermatologic; Orthopedic,Retrievers & spaniels: ear infections common; atopy/skin issues occur; orthopedic screening recommended.
Dachshund,Germany,12–14,7.0,12.0,4.6,7.9,6.0,11.0,4.5,8.2,"curious, lively",High (60–90 min/day),Moderate,Wire/broken or smooth,Moderate (hand-stripping for some),patellar luxation;skin issues;lens luxation,"AKC, FCI",,4.0,Moderate,Varies,breed-specific,breed-specific estimate,,,,
Dalmatian,Croatia,11–13,10.0,22.0,6.6,14.5,9.0,20.0,5.9,13.2,"energetic, outgoing",Moderate,Moderate,Varies,Low–Moderate,hip dysplasia;eye disorders,"AKC, FCI",,6.0,High,Low,breed-specific,breed-specific,,,,
French Bulldog,France,10–12,7.0,12.0,4.6,7.9,6.0,11.0,4.5,8.2,"affectionate, patient",Low–Moderate (20–40 min/day),Easy,Wire/broken or smooth,Moderate (hand-stripping for some),patellar luxation;skin issues;lens luxation,"AKC, FCI",,9.0,Low,Low,breed-specific,breed-specific estimate,,,,
German Shepherd,Germany,9–13,18.0,30.0,10.8,18.0,16.0,27.0,10.6,17.8,"confident, versatile","Very High (90–120+ min/day, mental work)",High,Double; medium,Moderate,hip dysplasia; CEA; MDR1 sensitivity; MDR1 (ABCB1) drug sensitivity (screening recommended); collie eye anomaly (CEA) in some lines,"AKC, FCI",,1.0,High,Moderate,breed-specific,breed-specific,pattern-based (well-established risks),hips (OFA/FCI); CEA/eye exam (CAER); MDR1 DNA test; eye exam (CAER),Pharmacogenetics; Ophthalmic,MDR1 drug sensitivity occurs in herding breeds; collie eye anomaly (CEA) in some lines.
Golden Retriever,Scotland,10–12,16.0,25.0,10.6,16.5,14.0,23.0,9.2,15.2,"friendly, intelligent",High (60–90 min/day),High,Medium feathered,Moderate–High,ear infections; hip dysplasia; eye issues; otitis externa (ear infections); hereditary eye disease (PRA/cataract risk),"AKC, FCI",,8.0,High,High (coat),breed-specific,breed-specific estimate,pattern-based (well-established risks),hips/elbows (OFA/FCI); ear care plan; skin/coat checks,Otic; Dermatologic; Orthopedic,Retrievers & spaniels: ear infections common; atopy/skin issues occur; orthopedic screening recommended.
Labrador Retriever,Canada (Newfoundland),10–14,16.0,25.0,10.6,16.5,14.0,23.0,9.2,15.2,"outgoing, active",High (60–90 min/day),High,Medium feathered,Moderate–High,ear infections; hip dysplasia; eye issues; otitis externa (ear infections); hereditary eye disease (PRA/cataract risk),"AKC, FCI",,8.0,High,Moderate,breed-specific,breed-specific estimate,pattern-based (well-established risks),hips/elbows (OFA/FCI); ear care plan; skin/coat checks,Otic; Dermatologic; Orthopedic,Retrievers & spaniels: ear infections common; atopy/skin issues occur; orthopedic screening recommended.
Poodle,Germany/France,12–15,10.0,22.0,6.6,14.5,9.0,20.0,5.9,13.2,"intelligent, active",Moderate,High,Varies,Low–Moderate,hip dysplasia;eye disorders,"AKC, FCI",,9.0,High,High (coat),breed-specific,breed-specific,,,,
Rottweiler,Germany,8–10,50.0,80.0,25.0,40.0,45.0,70.0,22.5,35.0,"loyal, confident",Moderate (45–60 min/day),Moderate,Short/medium,Low–Moderate,bloat;orthopedic disease;cardiomyopathy,"AKC, FCI",,2.0,Moderate,Low,breed-specific,breed-specific estimate,,hips/elbows (OFA/FCI); cardiac exam/echo as indicated; thyroid panel as indicated; eye exam (ectropion/entropion),Orthopedic; Ophthalmic; Cardiac; Endocrine,Large guardians: hip/elbow disease risk; ectropion/entropion in some; cardiomyopathy/thyroid issues reported in certain lines.
Siberian Husky,Russia (Siberia),12–14,18.0,30.0,10.8,18.0,16.0,27.0,10.6,17.8,"outgoing, mischievous","Very High (90–120+ min/day, mental work)",Moderate,Double; medium,Moderate,hip dysplasia;CEA;MDR1 sensitivity,FCI,,,High,Moderate,breed-specific,breed-specific estimate,,,,
Yorkshire Terrier,England,13–16,2.0,6.0,1.5,4.5,2.0,6.0,1.5,4.5,"bold, determined",Low–Moderate (20–40 min/day),Easy,Short or long; varies,Low to High (breed-specific),dental disease;luxating patellas;tracheal collapse,"AKC, FCI",,3.0,High,High (coat),breed-specific,breed-specific,,patellar exam; routine dental care; eye exam (CAER),Dental; Orthopedic; Ophthalmic,Companion/toy breeds: dental disease and patellar luxation common; several have hereditary eye risks.`;
    
    // Parse CSV data with proper handling of quoted values
    const lines = csvText.trim().split('\n');
    const headers = parseCSVLine(lines[0]);
    
    const breedData = lines.slice(1).map(line => {
      const values = parseCSVLine(line);
      const breed: any = {};
      
      headers.forEach((header, index) => {
        const value = values[index]?.trim() || null;
        
        // Skip empty values
        if (!value || value === '') return;
        
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
            breed.temperament = value ? value.split(';').map(t => t.trim()).filter(Boolean) : null;
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
            breed.common_health_issues = value ? value.split(';').map(h => h.trim()).filter(Boolean) : null;
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
            if (header === 'male_weight_adult_kg_min') breed.weight_kg.male.adult_min = numValue;
            if (header === 'male_weight_adult_kg_max') breed.weight_kg.male.adult_max = numValue;
            if (header === 'male_weight_6m_kg_min') breed.weight_kg.male.m6_min = numValue;
            if (header === 'male_weight_6m_kg_max') breed.weight_kg.male.m6_max = numValue;
            if (header === 'female_weight_adult_kg_min') breed.weight_kg.female.adult_min = numValue;
            if (header === 'female_weight_adult_kg_max') breed.weight_kg.female.adult_max = numValue;
            if (header === 'female_weight_6m_kg_min') breed.weight_kg.female.m6_min = numValue;
            if (header === 'female_weight_6m_kg_max') breed.weight_kg.female.m6_max = numValue;
            break;
        }
      });
      
      return breed;
    }).filter(breed => breed.breed); // Only include breeds with names
    
    console.log(\`Processing \${breedData.length} breeds...\`);

    // Insert breeds in batches to avoid timeout
    const batchSize = 50;
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
          { onConflict: 'breed', ignoreDuplicates: false }
        );

      if (error) {
        console.error(\`Error inserting batch \${i / batchSize + 1}:\`, error);
        skipped += batch.length;
      } else {
        inserted += batch.length;
        console.log(\`Inserted batch \${i / batchSize + 1}/\${Math.ceil(breedData.length / batchSize)}\`);
      }
    }

    // Get final count
    const { count } = await supabase
      .from('dog_breeds')
      .select('*', { count: 'exact', head: true });

    return new Response(
      JSON.stringify({
        success: true,
        message: \`Breed encyclopedia seeded successfully\`,
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