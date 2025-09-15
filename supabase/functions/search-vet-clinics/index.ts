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
  'veterinary surgery', 'veterinary clinic', 'small animal', 'companion animal',
  'animal emergency', 'pet emergency', 'animal medicine', 'veterinary practice'
];

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

// Helper function to calculate name relevance score
function calculateRelevanceScore(clinicName: string, searchQuery: string): number {
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
    // Check for exact word matches
    if (clinicWords.some(word => word === queryWord)) {
      exactWordMatches++;
      matchingWords++;
    }
    // Check for partial matches
    else if (clinicWords.some(word => word.includes(queryWord))) {
      matchingWords++;
    }
  }
  
  // Calculate score based on word matches
  const wordMatchRatio = matchingWords / queryWords.length;
  const exactMatchRatio = exactWordMatches / queryWords.length;
  
  // Bonus for exact word matches
  const baseScore = wordMatchRatio * 70;
  const exactBonus = exactMatchRatio * 20;
  
  // Check for query as substring
  const substringBonus = clinic.includes(query) ? 10 : 0;
  
  return baseScore + exactBonus + substringBonus;
}

// Helper function to extract services from OSM tags
function extractServices(tags: any): string[] {
  const services = [];
  
  if (tags.emergency === 'yes' || tags['emergency:veterinary'] === 'yes') {
    services.push('emergency');
  }
  if (tags.surgery === 'yes') {
    services.push('surgery');
  }
  if (tags.dentistry === 'yes') {
    services.push('dentistry');
  }
  if (tags['healthcare:speciality'] && tags['healthcare:speciality'].includes('veterinary')) {
    services.push('specialist');
  }
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
      // Build improved Nominatim query
        const nominatimBase = `https://nominatim.openstreetmap.org/search?format=json&limit=20&addressdetails=1&extratags=1&namedetails=1`;
        let nominatimUrl = nominatimBase;

        // Use different query strategies based on location availability
        let searchResults = [];
        
        if (latitude && longitude) {
          // First try: Location-based search with user's query
          const localSearchTerms = `${query} veterinary`.trim();
          const localUrl = nominatimUrl + `&q=${encodeURIComponent(localSearchTerms)}&` +
            `lat=${latitude}&lon=${longitude}&radius=10000`; // 10km radius first
          
          console.log('Trying local search:', localUrl);
          
          try {
            const localResponse = await fetch(localUrl, {
              headers: { 'User-Agent': 'PetCare App/1.0 (https://petcare.app)' }
            });
            
            if (localResponse.ok) {
              searchResults = await localResponse.json();
              console.log('Local search results:', searchResults.length);
            }
          } catch (e) {
            console.log('Local search failed, will try broader search');
          }
          
          // If no local results with specific query, try broader local search
          if (searchResults.length === 0) {
            const broadLocalUrl = nominatimUrl + `&q=${encodeURIComponent('veterinary')}&` +
              `lat=${latitude}&lon=${longitude}&radius=25000`; // 25km radius
              
            console.log('Trying broader local search:', broadLocalUrl);
            
            try {
              const broadResponse = await fetch(broadLocalUrl, {
                headers: { 'User-Agent': 'PetCare App/1.0 (https://petcare.app)' }
              });
              
              if (broadResponse.ok) {
                searchResults = await broadResponse.json();
                console.log('Broad local search results:', searchResults.length);
              }
            } catch (e) {
              console.log('Broad local search also failed');
            }
          }
        } else {
          // Text-based search with broader terms (no location)
          const searchTerms = `${query} veterinary animal hospital vet clinic animal care`.trim();
          nominatimUrl += `&q=${encodeURIComponent(searchTerms)}`;
        }

        console.log('Querying Nominatim:', searchResults.length > 0 ? 'Using search results' : nominatimUrl);
        
        // If we don't have search results yet (no location provided or previous attempts), fetch them
        if (searchResults.length === 0) {
          const response = await fetch(nominatimUrl, {
            headers: {
              'User-Agent': 'PetCare App/1.0 (https://petcare.app)'
            }
          });

          if (!response.ok) {
            throw new Error(`Nominatim API error: ${response.status}`);
          }

          searchResults = await response.json();
        }

        // Extra fallback: try exact name search without category terms
        if (searchResults.length === 0) {
          let nameOnlyUrl = nominatimBase + `&q=${encodeURIComponent(query)}`;
          if (latitude && longitude) {
            nameOnlyUrl += `&lat=${latitude}&lon=${longitude}&radius=25000`;
          }
          console.log('Trying name-only search fallback:', nameOnlyUrl);
          try {
            const nameOnlyResp = await fetch(nameOnlyUrl, {
              headers: { 'User-Agent': 'PetCare App/1.0 (https://petcare.app)' }
            });
            if (nameOnlyResp.ok) {
              const nameOnlyResults = await nameOnlyResp.json();
              if (Array.isArray(nameOnlyResults) && nameOnlyResults.length > 0) {
                searchResults = nameOnlyResults;
              }
            }
          } catch (e) {
            console.log('Name-only search fallback failed');
          }
        }
        console.log('OSM Results found:', searchResults.length);

        // Filter and process OSM results with comprehensive animal care facility detection
        const processedResults = searchResults
          .filter((place: any) => {
            const name = (place.display_name || '').toLowerCase();
            const tags = place.extratags || {};
            const placeName = (tags.name || place.name || '').toLowerCase();
            const type = (place.type || '').toLowerCase();
            const category = (place.category || '').toLowerCase();
            const placeClass = (place.class || '').toLowerCase();

            // Check for veterinary keywords in name, display name, or place name
            const hasVetKeyword = VET_KEYWORDS.some(keyword => 
              name.includes(keyword) || 
              placeName.includes(keyword) ||
              type.includes(keyword)
            );

            // Comprehensive animal care facility tag detection
            const hasAnimalCareTags = 
              // Primary veterinary tags
              tags.amenity === 'veterinary' ||
              tags.healthcare === 'veterinary' ||
              tags.healthcare === 'animal' ||
              // Animal care facilities
              tags.amenity === 'animal_shelter' ||
              tags.amenity === 'animal_boarding' ||
              tags.amenity === 'animal_training' ||
              // Pet services
              tags.shop === 'pet' ||
              tags.shop === 'pet_grooming' ||
              // Healthcare facilities (with animal context)
              tags.healthcare === 'clinic' ||
              tags.healthcare === 'centre' ||
              // Hospitals (need animal keyword in name)
              (tags.amenity === 'hospital' && hasVetKeyword);

            // Check for general categories that might contain animal facilities
            const isPotentialAnimalFacility = 
              (placeClass === 'amenity' && (category === 'amenity' || category === 'shop')) ||
              (placeClass === 'shop' && category === 'shop') ||
              (placeClass === 'healthcare' && category === 'healthcare') ||
              type.includes('hospital') ||
              type.includes('clinic');

            return hasVetKeyword || hasAnimalCareTags || (isPotentialAnimalFacility && hasVetKeyword);
          })

            // Check for general categories that might contain animal facilities
            const isPotentialAnimalFacility = 
              (placeClass === 'amenity' && (category === 'amenity' || category === 'shop')) ||
              (placeClass === 'shop' && category === 'shop') ||
              (placeClass === 'healthcare' && category === 'healthcare') ||
              type.includes('hospital') ||
              type.includes('clinic');

            return hasVetKeyword || hasAnimalCareTags || (isPotentialAnimalFacility && hasVetKeyword);
          })
          .slice(0, 10)
          .map((place: any) => {
            const tags = place.extratags || {};
            const name = place.display_name.split(',')[0].trim();
            
            return {
              id: `osm_${place.place_id}`,
              name: tags.name || name,
              address: place.display_name,
              latitude: parseFloat(place.lat),
              longitude: parseFloat(place.lon),
              osm_place_id: place.place_id?.toString(),
              osm_type: place.osm_type,
              phone: tags.phone || tags['contact:phone'],
              email: tags.email || tags['contact:email'],
              website: tags.website || tags['contact:website'],
              services: extractServices(tags),
              verified: false
            };
          });

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

    // Sort by relevance and distance with improved scoring
    results.sort((a, b) => {
      const aIsExisting = !a.id?.startsWith('osm_');
      const bIsExisting = !b.id?.startsWith('osm_');
      
      // Calculate relevance scores
      const aRelevance = calculateRelevanceScore(a.name, query);
      const bRelevance = calculateRelevanceScore(b.name, query);
      
      // High relevance matches (>80) get priority regardless of source
      if (aRelevance > 80 || bRelevance > 80) {
        if (aRelevance !== bRelevance) {
          return bRelevance - aRelevance; // Higher relevance first
        }
      }
      
      // For medium relevance (50-80), prefer existing clinics
      if (aRelevance >= 50 && bRelevance >= 50) {
        if (aIsExisting !== bIsExisting) {
          return aIsExisting ? -1 : 1;
        }
        // Both same source, sort by relevance
        if (aRelevance !== bRelevance) {
          return bRelevance - aRelevance;
        }
      } else {
        // Standard priority: existing clinics first for low relevance matches
        if (aIsExisting !== bIsExisting) {
          return aIsExisting ? -1 : 1;
        }
      }
      
      // If location is available, sort by distance
      if (latitude && longitude && a.latitude && a.longitude && b.latitude && b.longitude) {
        const aDistance = calculateDistance(latitude, longitude, a.latitude, a.longitude);
        const bDistance = calculateDistance(latitude, longitude, b.latitude, b.longitude);
        
        // For similar relevance scores, prioritize closer results
        if (Math.abs(aRelevance - bRelevance) < 10) {
          // Prioritize results within 15km, then by distance
          const aIsLocal = aDistance <= 15;
          const bIsLocal = bDistance <= 15;
          
          if (aIsLocal !== bIsLocal) {
            return aIsLocal ? -1 : 1;
          }
          
          return aDistance - bDistance;
        }
        
        // Different relevance scores, use relevance as primary
        return bRelevance - aRelevance;
      }
      
      // Fallback to relevance score
      if (aRelevance !== bRelevance) {
        return bRelevance - aRelevance;
      }
      
      // Final fallback to name comparison
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