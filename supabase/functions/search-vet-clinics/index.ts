import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VetClinic {
  id: string;
  name: string;
  address: string;
  phone?: string;
  email?: string;
  website?: string;
  latitude?: number;
  longitude?: number;
  osm_place_id?: string;
  services?: string[];
  verified: boolean;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, latitude, longitude, radius = 50000 } = await req.json();
    
    console.log('Searching vet clinics:', { query, latitude, longitude, radius });
    
    if (!query || query.trim().length < 2) {
      return new Response(
        JSON.stringify({ error: 'Query must be at least 2 characters' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // First, search existing clinics in our database
    console.log('Searching existing clinics in database');
    const { data: existingClinics, error: dbError } = await supabase
      .from('vet_clinics')
      .select('*')
      .ilike('name', `%${query}%`)
      .limit(10);

    if (dbError) {
      console.error('Database search error:', dbError);
    }

    const results: VetClinic[] = existingClinics || [];

    // If we have fewer than 5 results, search OSM
    if (results.length < 5) {
      console.log('Searching OpenStreetMap Nominatim API');
      
      // Build search query for veterinary services
      const searchQuery = encodeURIComponent(`${query} veterinary clinic`);
      let nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${searchQuery}&limit=10&addressdetails=1&extratags=1`;
      
      // Add location bias if coordinates provided
      if (latitude && longitude) {
        nominatimUrl += `&lat=${latitude}&lon=${longitude}&bounded=1&viewbox=${longitude - 0.1},${latitude + 0.1},${longitude + 0.1},${latitude - 0.1}`;
      }

      console.log('Nominatim URL:', nominatimUrl);

      const osmResponse = await fetch(nominatimUrl, {
        headers: {
          'User-Agent': 'PawPal Dog Care App/1.0 (contact@pawpal.app)'
        }
      });

      if (osmResponse.ok) {
        const osmResults = await osmResponse.json();
        console.log(`Found ${osmResults.length} OSM results`);

        // Process OSM results
        for (const place of osmResults) {
          // Skip if we already have this place
          const existingPlace = results.find(r => r.osm_place_id === place.place_id.toString());
          if (existingPlace) continue;

          // Filter for veterinary-related places
          const isVetRelated = 
            place.type === 'veterinary' ||
            place.class === 'amenity' && place.type === 'veterinary' ||
            (place.display_name && place.display_name.toLowerCase().includes('vet')) ||
            (place.display_name && place.display_name.toLowerCase().includes('animal')) ||
            (place.extratags && (
              place.extratags.amenity === 'veterinary' ||
              place.extratags.healthcare === 'veterinary'
            ));

          if (isVetRelated) {
            const clinic: VetClinic = {
              id: `osm_${place.place_id}`,
              name: place.display_name.split(',')[0].trim(),
              address: place.display_name,
              latitude: parseFloat(place.lat),
              longitude: parseFloat(place.lon),
              osm_place_id: place.place_id.toString(),
              verified: false,
              services: []
            };

            // Extract phone from extratags if available
            if (place.extratags?.phone) {
              clinic.phone = place.extratags.phone;
            }
            if (place.extratags?.website) {
              clinic.website = place.extratags.website;
            }
            if (place.extratags?.email) {
              clinic.email = place.extratags.email;
            }

            results.push(clinic);
          }
        }
      } else {
        console.error('OSM API error:', osmResponse.status, await osmResponse.text());
      }
    }

    // Sort by relevance (existing clinics first, then by name similarity)
    results.sort((a, b) => {
      const aIsExisting = !a.id.startsWith('osm_');
      const bIsExisting = !b.id.startsWith('osm_');
      
      if (aIsExisting !== bIsExisting) {
        return aIsExisting ? -1 : 1;
      }
      
      return a.name.localeCompare(b.name);
    });

    console.log(`Returning ${results.length} total results`);

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