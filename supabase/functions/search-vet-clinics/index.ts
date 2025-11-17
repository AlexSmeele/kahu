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
  google_place_id?: string;
  google_types?: string[];
  services?: string[];
  verified: boolean;
  rating?: number;
  user_ratings_total?: number;
  opening_hours?: string;
  business_status?: string;
}

// Helper function to calculate distance between two points
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in km
}

// Helper function to calculate relevance score (now includes rating)
function calculateRelevanceScore(clinicName: string, searchQuery: string, rating?: number): number {
  const clinic = clinicName.toLowerCase();
  const query = searchQuery.toLowerCase();
  
  // Exact match gets highest score
  if (clinic === query) return 100;
  
  // Check if query is at start of clinic name
  if (clinic.startsWith(query)) return 90;
  
  // Check if all query words are in clinic name
  const queryWords = query.split(' ').filter(word => word.length > 0);
  const clinicWords = clinic.split(' ');
  
  let matchingWords = 0;
  let exactWordMatches = 0;
  
  for (const queryWord of queryWords) {
    if (clinicWords.some(word => word === queryWord)) {
      exactWordMatches++;
      matchingWords++;
    } else if (clinicWords.some(word => word.includes(queryWord))) {
      matchingWords++;
    }
  }
  
  const wordMatchRatio = matchingWords / queryWords.length;
  const exactMatchRatio = exactWordMatches / queryWords.length;
  
  const baseScore = wordMatchRatio * 70;
  const exactBonus = exactMatchRatio * 20;
  const substringBonus = clinic.includes(query) ? 10 : 0;
  
  // Add rating bonus (up to 10 points for 5-star rating)
  const ratingBonus = rating ? (rating / 5) * 10 : 0;
  
  return baseScore + exactBonus + substringBonus + ratingBonus;
}

// Helper function to extract services from Google types
function extractServicesFromTypes(types: string[]): string[] {
  const services = [];
  
  if (types.includes('veterinary_care')) services.push('general-care');
  if (types.includes('pet_store')) services.push('pet-supplies');
  if (types.includes('pharmacy')) services.push('pharmacy');
  
  if (services.length === 0) {
    services.push('general-care');
  }
  
  return services;
}

// Helper function to log analytics
async function logSearchAnalytics(
  supabase: any,
  searchQuery: string,
  userLocationProvided: boolean,
  dbResults: number,
  googleResults: number,
  totalResults: number,
  errorMessage?: string,
  responseTimeMs?: number,
  userId?: string
) {
  try {
    await supabase.from('vet_search_analytics').insert({
      user_id: userId || null,
      search_query: searchQuery,
      user_location_provided: userLocationProvided,
      database_results_count: dbResults,
      osm_results_count: googleResults, // Reusing column name for Google results
      total_results_count: totalResults,
      error_message: errorMessage || null,
      response_time_ms: responseTimeMs || null,
    });
  } catch (analyticsError) {
    console.error('Failed to log search analytics:', analyticsError);
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
  const googleMapsKey = Deno.env.get('GOOGLE_MAPS_API_KEY');

  if (!googleMapsKey) {
    console.error('GOOGLE_MAPS_API_KEY not configured');
    return new Response(
      JSON.stringify({ error: 'Google Maps API not configured' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      headers: {
        Authorization: req.headers.get('Authorization') || '',
      },
    },
  });

  // Get user ID from the authorization header
  const authHeader = req.headers.get('Authorization');
  let userId: string | undefined;
  
  if (authHeader) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id;
    } catch (error) {
      console.error('Error getting user:', error);
    }
  }

  try {
    const { query, latitude, longitude, radius = 50, country } = await req.json();

    console.log('Search request:', { query, hasLocation: !!(latitude && longitude), radius, country });

    if (!query || query.trim() === '') {
      return new Response(
        JSON.stringify({ error: 'Query parameter is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const hasLocation = latitude && longitude;

    // Step 1: Query database for existing clinics
    console.log('Searching database...');
    const { data: dbClinics, error: dbError } = await supabase
      .rpc('get_accessible_vet_clinics', {
        search_query: query,
        include_contact_info: false
      });

    if (dbError) {
      console.error('Database search error:', dbError);
    }

    const dbResults = (dbClinics || []).map((clinic: any) => ({
      ...clinic,
      distance: hasLocation ? calculateDistance(latitude, longitude, clinic.latitude, clinic.longitude) : undefined
    }));

    console.log(`Found ${dbResults.length} results in database`);

    // Step 2: Query Google Places API
    console.log('Searching Google Places API...');
    let googleClinics: VetClinic[] = [];
    let googleError: string | undefined;

    try {
      let googleUrl: string;

      if (hasLocation) {
        // Use Nearby Search for location-based queries
        googleUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?` +
          `location=${latitude},${longitude}&` +
          `radius=${radius * 1000}&` + // Convert km to meters
          `type=veterinary_care&` +
          `keyword=${encodeURIComponent(query)}&` +
          `key=${googleMapsKey}`;
      } else {
        // Use Text Search for general queries
        let searchQuery = query;
        if (country) {
          searchQuery += ` veterinary clinic in ${country}`;
        } else {
          searchQuery += ' veterinary clinic';
        }
        
        googleUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?` +
          `query=${encodeURIComponent(searchQuery)}&` +
          `key=${googleMapsKey}`;
      }

      console.log('Google Places API request:', googleUrl.replace(googleMapsKey, 'REDACTED'));
      const googleResponse = await fetch(googleUrl);
      const googleData = await googleResponse.json();

      if (googleData.status === 'OK' && googleData.results) {
        console.log(`Found ${googleData.results.length} results from Google Places`);
        
        googleClinics = googleData.results
          .filter((place: any) => 
            place.business_status === 'OPERATIONAL' || !place.business_status
          )
          .map((place: any) => {
            const clinic: VetClinic = {
              name: place.name,
              address: place.vicinity || place.formatted_address || '',
              latitude: place.geometry?.location?.lat,
              longitude: place.geometry?.location?.lng,
              google_place_id: place.place_id,
              google_types: place.types || [],
              services: extractServicesFromTypes(place.types || []),
              verified: true,
              rating: place.rating,
              user_ratings_total: place.user_ratings_total,
              opening_hours: place.opening_hours?.open_now !== undefined 
                ? (place.opening_hours.open_now ? 'Open Now' : 'Closed') 
                : undefined,
              business_status: place.business_status,
            };

            // Calculate distance if user location is available
            if (hasLocation && clinic.latitude && clinic.longitude) {
              (clinic as any).distance = calculateDistance(
                latitude, 
                longitude, 
                clinic.latitude, 
                clinic.longitude
              );
            }

            return clinic;
          });
      } else if (googleData.status === 'ZERO_RESULTS') {
        console.log('Google Places returned zero results');
      } else {
        console.error('Google Places API error:', googleData.status, googleData.error_message);
        googleError = googleData.error_message || 'Google Places API error';
      }
    } catch (error) {
      console.error('Error fetching from Google Places:', error);
      googleError = 'Failed to search Google Places';
    }

    // Step 3: Combine and deduplicate results
    const combinedClinics = [...dbResults];
    const existingNames = new Set(dbResults.map((c: any) => c.name.toLowerCase()));
    const existingPlaceIds = new Set(
      dbResults
        .filter((c: any) => c.google_place_id)
        .map((c: any) => c.google_place_id)
    );

    for (const googleClinic of googleClinics) {
      // Skip if already in database
      if (existingPlaceIds.has(googleClinic.google_place_id) || 
          existingNames.has(googleClinic.name.toLowerCase())) {
        continue;
      }

      combinedClinics.push(googleClinic);
    }

    // Step 4: Sort results by distance first (if location available), then relevance
    combinedClinics.sort((a: any, b: any) => {
      // When location is provided, prioritize distance
      if (hasLocation) {
        const distA = a.distance ?? Infinity;
        const distB = b.distance ?? Infinity;
        if (distA !== distB) return distA - distB;
      }

      // Calculate relevance scores as tie-breaker
      const scoreA = calculateRelevanceScore(a.name, query, a.rating);
      const scoreB = calculateRelevanceScore(b.name, query, b.rating);
      if (scoreA !== scoreB) return scoreB - scoreA;

      // Final tie-breaker: verified status
      if (a.verified && !b.verified) return -1;
      if (!a.verified && b.verified) return 1;

      // Last resort: rating
      return (b.rating ?? 0) - (a.rating ?? 0);
    });

    // Return top 10 results
    const finalResults = combinedClinics.slice(0, 10);

    const responseTime = Date.now() - startTime;
    console.log(`Search completed in ${responseTime}ms with ${finalResults.length} results`);

    // Log analytics
    await logSearchAnalytics(
      supabase,
      query,
      hasLocation,
      dbResults.length,
      googleClinics.length,
      finalResults.length,
      googleError,
      responseTime,
      userId
    );

    return new Response(
      JSON.stringify({
        clinics: finalResults,
        sources: {
          database: dbResults.length,
          google: googleClinics.length,
          total: finalResults.length
        }
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Search error:', error);
    
    const responseTime = Date.now() - startTime;
    await logSearchAnalytics(
      supabase,
      '',
      false,
      0,
      0,
      0,
      error.message,
      responseTime,
      userId
    );

    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
