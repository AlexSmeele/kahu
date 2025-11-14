import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WalkerSearchResult {
  id?: string;
  name: string;
  business_name?: string;
  phone?: string;
  email?: string;
  website?: string;
  services?: string[];
  availability?: string;
  service_area?: string;
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

    const { query, service_area } = await req.json();

    console.log('Searching for dog walkers:', { query, service_area });

    // Search existing walkers in database
    let dbQuery = supabase
      .from('walkers')
      .select('*')
      .ilike('name', `%${query}%`)
      .limit(10);

    if (service_area) {
      dbQuery = dbQuery.ilike('service_area', `%${service_area}%`);
    }

    const { data: dbWalkers, error: dbError } = await dbQuery;

    if (dbError) {
      console.error('Database search error:', dbError);
      throw dbError;
    }

    // TODO: Integrate with Google Places API
    // For now, return database results only
    // When Google Places API is integrated:
    // 1. Call Google Places Text Search API with "dog walking service" + query
    // 2. Filter by service_area if provided
    // 3. Merge results with database results
    // 4. Return combined, sorted list

    const results: WalkerSearchResult[] = dbWalkers || [];

    console.log(`Found ${results.length} dog walkers`);

    return new Response(
      JSON.stringify({ results }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error searching dog walkers:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
