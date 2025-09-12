import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VetClinic {
  id?: string;
  name: string;
  address: string;
  phone?: string;
  email?: string;
  website?: string;
  latitude?: number;
  longitude?: number;
  osm_place_id?: string;
  osm_type?: string;
  services?: string[];
  verified: boolean;
}

// Expanded veterinary-related keywords for better OSM filtering
const VET_KEYWORDS = [
  'veterinary', 'veterinarian', 'vet', 'animal hospital', 'pet clinic', 
  'animal clinic', 'pet hospital', 'animal care', 'pet care', 'animal health',
  'veterinary surgery', 'veterinary clinic', 'small animal', 'companion animal'
];

// Helper function to log analytics
async function logSearchAnalytics(
  supabase: any,
  searchQuery: string,
  userLocationProvided: boolean,
  dbResults: number,
  osmResults: number,
  totalResults: number,
  errorMessage?: string,
  responseTimeMs?: number,
  userId?: string
) {
  try {
    await supabase.from('vet_search_analytics').insert({
      search_query: searchQuery,
      user_location_provided: userLocationProvided,
      database_results_count: dbResults,
      osm_results_count: osmResults,
      total_results_count: totalResults,
      error_message: errorMessage,
      response_time_ms: responseTimeMs,
      user_id: userId
    });
  } catch (error) {
    console.error('Failed to log analytics:', error);
  }
}

serve(async (req) => {
  const startTime = Date.now();
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, latitude, longitude, radius = 50 } = await req.json();
    
    console.log('Searching vet clinics:', { query, latitude, longitude, radius });
    
    if (!query || query.trim().length < 1) {
      return new Response(
        JSON.stringify({ error: 'Query must be at least 1 character long' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user ID from auth header if available
    const authHeader = req.headers.get('authorization');
    let userId: string | undefined;
    if (authHeader) {
      try {
        const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
        userId = user?.id;
      } catch (e) {
        // Ignore auth errors, continue as anonymous
      }
    }

    // Search existing database with improved similarity search
    console.log('Searching existing clinics in database');
    const { data: existingClinics, error: dbError } = await supabase
      .from('vet_clinics')
      .select('*')
      .or(`name.ilike.%${query}%,address.ilike.%${query}%`)
      .limit(10);

    if (dbError) {
      console.error('Database error:', dbError);
      await logSearchAnalytics(supabase, query, !!latitude, 0, 0, 0, `Database error: ${dbError.message}`, Date.now() - startTime, userId);
      return new Response(
        JSON.stringify({ error: 'Database search failed' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    let results: VetClinic[] = existingClinics?.map(clinic => ({
      id: clinic.id,
      name: clinic.name,
      address: clinic.address,
      phone: clinic.phone,
      email: clinic.email,
      website: clinic.website,
      latitude: clinic.latitude ? parseFloat(clinic.latitude) : undefined,
      longitude: clinic.longitude ? parseFloat(clinic.longitude) : undefined,
      osm_place_id: clinic.osm_place_id,
      osm_type: clinic.osm_type,
      services: clinic.services || [],
      verified: clinic.verified || false
    })) || [];

    let osmResultsCount = 0;

    // If we don't have enough results, query OpenStreetMap
    if (results.length < 5) {
      console.log('Searching OpenStreetMap Nominatim API');
      
      try {
        // Build Nominatim query with veterinary-specific search
        let nominatimUrl = `https://nominatim.openstreetmap.org/search?` +
          `q=${encodeURIComponent(query + ' veterinary vet animal hospital')}&` +
          `format=json&` +
          `limit=15&` +
          `addressdetails=1&` +
          `extratags=1&` +
          `namedetails=1`;

        // Add location bias if coordinates provided, but don't bound strictly
        if (latitude && longitude) {
          const buffer = 0.5; // Larger search area
          nominatimUrl += `&viewbox=${longitude - buffer},${latitude + buffer},${longitude + buffer},${latitude - buffer}`;
        }

        console.log('Querying Nominatim:', nominatimUrl);
        
        const response = await fetch(nominatimUrl, {
          headers: {
            'User-Agent': 'PetCare App/1.0 (https://petcare.app)'
          }
        });

        if (!response.ok) {
          throw new Error(`Nominatim API error: ${response.status}`);
        }

        const osmResults = await response.json();
        console.log('OSM Results found:', osmResults.length);

        // Filter and process OSM results with expanded criteria
        const processedResults = osmResults
          .filter((place: any) => {
            const name = (place.display_name || '').toLowerCase();
            const tags = place.extratags || {};
            const type = (place.type || '').toLowerCase();
            const category = (place.category || '').toLowerCase();

            // Check if it's veterinary-related with broader criteria
            const isVet = VET_KEYWORDS.some(keyword => 
              name.includes(keyword) || 
              type.includes(keyword)
            ) || 
            tags.amenity === 'veterinary' ||
            tags.shop === 'pet' ||
            tags.healthcare === 'veterinary' ||
            category === 'amenity' && tags.amenity === 'veterinary';

            return isVet;
          })
          .slice(0, 8)
          .map((place: any) => ({
            id: `osm_${place.place_id}`,
            name: place.display_name.split(',')[0].trim(),
            address: place.display_name,
            latitude: parseFloat(place.lat),
            longitude: parseFloat(place.lon),
            osm_place_id: place.place_id?.toString(),
            osm_type: place.osm_type,
            phone: place.extratags?.phone,
            email: place.extratags?.email,
            website: place.extratags?.website,
            services: [],
            verified: false
          }));

        osmResultsCount = processedResults.length;
        console.log('Processed OSM results:', osmResultsCount);

        // Remove duplicates and add OSM results
        const existingOsmIds = new Set(results.map(r => r.osm_place_id).filter(Boolean));
        const newOsmResults = processedResults.filter(result => 
          !existingOsmIds.has(result.osm_place_id)
        );

        results = [...results, ...newOsmResults].slice(0, 10);
        
      } catch (osmError) {
        console.error('OSM API error:', osmError);
        await logSearchAnalytics(supabase, query, !!latitude, results.length, 0, results.length, `OSM error: ${osmError.message}`, Date.now() - startTime, userId);
      }
    }

    // Sort by relevance (existing clinics first, then by name similarity)
    results.sort((a, b) => {
      const aIsExisting = !a.id?.startsWith('osm_');
      const bIsExisting = !b.id?.startsWith('osm_');
      
      if (aIsExisting !== bIsExisting) {
        return aIsExisting ? -1 : 1;
      }
      
      return a.name.localeCompare(b.name);
    });

    console.log(`Returning ${results.length} total results`);

    // Log successful search analytics
    await logSearchAnalytics(supabase, query, !!latitude, (existingClinics || []).length, osmResultsCount, results.length, undefined, Date.now() - startTime, userId);

    return new Response(
      JSON.stringify({ clinics: results.slice(0, 10) }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in search-vet-clinics function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});