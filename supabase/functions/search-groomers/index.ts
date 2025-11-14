import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GroomerSearchResult {
  id?: string;
  name: string;
  business_name?: string;
  address: string;
  phone?: string;
  email?: string;
  website?: string;
  services?: string[];
  specialties?: string[];
  latitude?: number;
  longitude?: number;
  google_place_id?: string;
  rating?: number;
  user_ratings_total?: number;
  verified: boolean;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { query, latitude, longitude } = await req.json();

    console.log('Searching for groomers:', { query, latitude, longitude });

    // Search existing groomers in database
    let dbQuery = supabase
      .from('groomers')
      .select('*')
      .ilike('name', `%${query}%`)
      .limit(10);

    const { data: dbGroomers, error: dbError } = await dbQuery;

    if (dbError) {
      console.error('Database search error:', dbError);
      throw dbError;
    }

    // TODO: Integrate with Google Places API
    // For now, return database results only
    // When Google Places API is integrated:
    // 1. Call Google Places Text Search API with "dog grooming" + query
    // 2. Filter by location if latitude/longitude provided
    // 3. Merge results with database results (dedupe by google_place_id)
    // 4. Return combined, sorted list

    const results: GroomerSearchResult[] = dbGroomers || [];

    console.log(`Found ${results.length} groomers`);

    return new Response(
      JSON.stringify({ results }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error searching groomers:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
