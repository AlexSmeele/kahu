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

    // Load the breed encyclopedia JSON
    const breedDataResponse = await fetch('https://raw.githubusercontent.com/lovablelabs/lovable-frontend/main/src/data/dog_breeds_encyclopedia.json');
    
    if (!breedDataResponse.ok) {
      // Fallback: try to read from local file if available
      throw new Error('Could not load breed encyclopedia data');
    }

    const breedData = await breedDataResponse.json();
    
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
            temperament: breed.temperament,
            exercise_needs: breed.exercise_needs,
            trainability: breed.trainability,
            coat: breed.coat,
            grooming: breed.grooming,
            common_health_issues: breed.common_health_issues,
            registries: breed.registries,
            weight_kg: breed.weight_kg
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