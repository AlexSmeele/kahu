import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface VetClinic {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  phone?: string;
  website?: string;
  osm_place_id?: string;
  osm_type?: string;
  verified: boolean;
}

// Countries/regions to pre-seed (can be expanded)
const REGIONS = {
  'new-zealand': {
    name: 'New Zealand',
    bbox: [166.5, -47.3, 178.6, -34.4], // [min_lon, min_lat, max_lon, max_lat]
  },
  'australia': {
    name: 'Australia', 
    bbox: [113.3, -43.6, 153.6, -10.7],
  },
  'united-states': {
    name: 'United States',
    bbox: [-125.0, 25.0, -66.9, 49.0],
  },
  'united-kingdom': {
    name: 'United Kingdom',
    bbox: [-8.6, 49.9, 1.8, 60.8],
  }
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { region, limit = 100 } = await req.json();
    
    if (!region || !REGIONS[region as keyof typeof REGIONS]) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid region', 
          available_regions: Object.keys(REGIONS) 
        }),
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

    const regionConfig = REGIONS[region as keyof typeof REGIONS];
    const [minLon, minLat, maxLon, maxLat] = regionConfig.bbox;

    // Query Overpass API for veterinary amenities in the region
    const overpassQuery = `
      [out:json][timeout:25];
      (
        nwr["amenity"="veterinary"](${minLat},${minLon},${maxLat},${maxLon});
      );
      out center;
    `;

    console.log(`Fetching vet clinics for ${regionConfig.name}`);
    
    const overpassResponse = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: overpassQuery,
      headers: {
        'Content-Type': 'text/plain',
        'User-Agent': 'PetCare App/1.0 (https://petcare.app)'
      }
    });

    if (!overpassResponse.ok) {
      throw new Error(`Overpass API error: ${overpassResponse.status}`);
    }

    const overpassData = await overpassResponse.json();
    console.log(`Found ${overpassData.elements?.length || 0} veterinary facilities`);

    if (!overpassData.elements || overpassData.elements.length === 0) {
      return new Response(
        JSON.stringify({ 
          message: `No veterinary clinics found for ${regionConfig.name}`,
          imported: 0
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Process and prepare clinic data
    const clinics: VetClinic[] = overpassData.elements
      .filter((element: any) => element.tags?.name) // Only include named facilities
      .slice(0, limit)
      .map((element: any) => {
        const lat = element.lat || element.center?.lat;
        const lon = element.lon || element.center?.lon;
        
        return {
          name: element.tags.name,
          address: [
            element.tags['addr:street'],
            element.tags['addr:city'],
            element.tags['addr:postcode'],
            element.tags['addr:country']
          ].filter(Boolean).join(', ') || `${lat}, ${lon}`,
          latitude: lat,
          longitude: lon,
          phone: element.tags.phone,
          website: element.tags.website,
          osm_place_id: element.id?.toString(),
          osm_type: element.type,
          verified: false
        };
      })
      .filter(clinic => clinic.latitude && clinic.longitude);

    let importedCount = 0;
    let updatedCount = 0;
    let errors: string[] = [];

    // Upsert clinics one by one to handle conflicts
    for (const clinic of clinics) {
      try {
        // Check if clinic already exists by OSM ID
        const { data: existing } = await supabase
          .from('vet_clinics')
          .select('id')
          .eq('osm_place_id', clinic.osm_place_id)
          .maybeSingle();

        if (existing) {
          // Update existing clinic
          const { error: updateError } = await supabase
            .from('vet_clinics')
            .update(clinic)
            .eq('id', existing.id);
            
          if (updateError) {
            errors.push(`Update error for ${clinic.name}: ${updateError.message}`);
          } else {
            updatedCount++;
          }
        } else {
          // Insert new clinic
          const { error: insertError } = await supabase
            .from('vet_clinics')
            .insert(clinic);
            
          if (insertError) {
            errors.push(`Insert error for ${clinic.name}: ${insertError.message}`);
          } else {
            importedCount++;
          }
        }
      } catch (error) {
        errors.push(`Processing error for ${clinic.name}: ${error.message}`);
      }
    }

    console.log(`Import complete: ${importedCount} new, ${updatedCount} updated, ${errors.length} errors`);

    return new Response(
      JSON.stringify({
        region: regionConfig.name,
        imported: importedCount,
        updated: updatedCount,
        total_processed: clinics.length,
        errors: errors.slice(0, 10) // Limit error list
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Seeding error:', error);
    return new Response(
      JSON.stringify({ error: 'Seeding failed', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});