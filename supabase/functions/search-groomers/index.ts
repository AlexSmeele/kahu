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
  distance?: number;
  source?: 'database' | 'google';
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

async function searchGooglePlaces(query: string, latitude?: number, longitude?: number, apiKey?: string): Promise<GroomerSearchResult[]> {
  if (!apiKey) {
    console.log('Google Maps API key not configured, skipping Google Places search');
    return [];
  }

  try {
    const searchQuery = `dog grooming ${query}`;
    let url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchQuery)}&key=${apiKey}`;
    
    if (latitude && longitude) {
      url += `&location=${latitude},${longitude}&radius=25000`;
    }

    console.log('Calling Google Places API for groomers');
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error('Google Places API error:', data.status, data.error_message);
      return [];
    }

    if (!data.results || data.results.length === 0) {
      console.log('No results from Google Places');
      return [];
    }

    const results: GroomerSearchResult[] = data.results.map((place: any) => ({
      name: place.name,
      business_name: place.name,
      address: place.formatted_address || place.vicinity,
      latitude: place.geometry?.location?.lat,
      longitude: place.geometry?.location?.lng,
      google_place_id: place.place_id,
      rating: place.rating,
      user_ratings_total: place.user_ratings_total,
      verified: true,
      source: 'google' as const,
      distance: latitude && longitude && place.geometry?.location
        ? calculateDistance(latitude, longitude, place.geometry.location.lat, place.geometry.location.lng)
        : undefined,
    }));

    console.log(`Found ${results.length} groomers from Google Places`);
    return results;
  } catch (error) {
    console.error('Error calling Google Places API:', error);
    return [];
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const googleApiKey = Deno.env.get('GOOGLE_MAPS_API_KEY');
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

    // Mark database results and calculate distance if location provided
    const dbResults: GroomerSearchResult[] = (dbGroomers || []).map((groomer: any) => ({
      ...groomer,
      source: 'database' as const,
      distance: latitude && longitude && groomer.latitude && groomer.longitude
        ? calculateDistance(latitude, longitude, groomer.latitude, groomer.longitude)
        : undefined,
    }));

    // Search Google Places
    const googleResults = await searchGooglePlaces(query, latitude, longitude, googleApiKey);

    // Merge and deduplicate results
    const allResults = [...dbResults];
    const existingPlaceIds = new Set(dbResults.map(r => r.google_place_id).filter(Boolean));

    for (const googleResult of googleResults) {
      if (!googleResult.google_place_id || !existingPlaceIds.has(googleResult.google_place_id)) {
        allResults.push(googleResult);
      }
    }

    // Sort results: distance first (if available), then by rating
    allResults.sort((a, b) => {
      // Prioritize by distance when available
      if (a.distance !== undefined && b.distance !== undefined) {
        const distDiff = a.distance - b.distance;
        if (distDiff !== 0) return distDiff;
      }
      // If one has distance and other doesn't, prioritize the one with distance
      if (a.distance !== undefined && b.distance === undefined) return -1;
      if (b.distance !== undefined && a.distance === undefined) return 1;
      
      // Tie-breaker: rating
      if (a.rating && b.rating) {
        return b.rating - a.rating;
      }
      return 0;
    });

    console.log(`Found ${allResults.length} total groomers (${dbResults.length} database, ${googleResults.length} Google)`);

    return new Response(
      JSON.stringify({ results: allResults }),
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
