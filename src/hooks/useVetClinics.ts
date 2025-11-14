import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';

interface VetClinic {
  id: string;
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
  has_contact_access?: boolean;
}

interface DogVetClinic {
  id: string;
  dog_id: string;
  vet_clinic_id: string;
  is_primary: boolean;
  relationship_notes?: string;
  vet_clinic: VetClinic;
}

export function useVetClinics(dogId?: string) {
  const [dogVetClinics, setDogVetClinics] = useState<DogVetClinic[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Get user profile for country filtering
  const { user } = useAuth();
  const { profile } = useProfile();

  // Fetch vet clinics for a specific dog
  const fetchDogVetClinics = async (id: string) => {
    if (!id) return;
    
    // Dev mode bypass - return empty mock data for now
    if (id === '00000000-0000-0000-0000-000000000011' || id === '00000000-0000-0000-0000-000000000012') {
      setDogVetClinics([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await supabase
        .from('dog_vet_clinics')
        .select(`
          id,
          dog_id,
          vet_clinic_id,
          is_primary,
          relationship_notes,
          vet_clinic:vet_clinics (
            id,
            name,
            address,
            phone,
            email,
            website,
            latitude,
            longitude,
            google_place_id,
            google_types,
            services,
            verified,
            rating,
            user_ratings_total,
            opening_hours
          )
        `)
        .eq('dog_id', id);

      if (fetchError) {
        throw fetchError;
      }

      setDogVetClinics(data || []);
    } catch (err) {
      console.error('Error fetching dog vet clinics:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch vet clinics');
    } finally {
      setIsLoading(false);
    }
  };

  // Add a vet clinic for a dog
  const addVetClinic = async (
    dogId: string, 
    clinicData: Omit<VetClinic, 'id'>, 
    isPrimary = false,
    relationshipNotes?: string
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: upsertError } = await supabase.functions.invoke('upsert-vet-clinic', {
        body: {
          clinicData,
          dogId,
          isPrimary,
          relationshipNotes
        }
      });

      if (upsertError) {
        throw upsertError;
      }

      // Refresh the list
      await fetchDogVetClinics(dogId);
      
      return data;
    } catch (err) {
      console.error('Error adding vet clinic:', err);
      setError(err instanceof Error ? err.message : 'Failed to add vet clinic');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Update clinic relationship (set as primary, update notes)
  const updateClinicRelationship = async (
    relationshipId: string,
    updates: { is_primary?: boolean; relationship_notes?: string }
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      // If setting as primary, unset other primary clinics for this dog first
      if (updates.is_primary) {
        const relationship = dogVetClinics.find(r => r.id === relationshipId);
        if (relationship) {
          await supabase
            .from('dog_vet_clinics')
            .update({ is_primary: false })
            .eq('dog_id', relationship.dog_id)
            .neq('id', relationshipId);
        }
      }

      const { error: updateError } = await supabase
        .from('dog_vet_clinics')
        .update(updates)
        .eq('id', relationshipId);

      if (updateError) {
        throw updateError;
      }

      // Refresh the list
      if (dogId) {
        await fetchDogVetClinics(dogId);
      }
    } catch (err) {
      console.error('Error updating clinic relationship:', err);
      setError(err instanceof Error ? err.message : 'Failed to update clinic relationship');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Remove vet clinic relationship
  const removeVetClinic = async (relationshipId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { error: deleteError } = await supabase
        .from('dog_vet_clinics')
        .delete()
        .eq('id', relationshipId);

      if (deleteError) {
        throw deleteError;
      }

      // Refresh the list
      if (dogId) {
        await fetchDogVetClinics(dogId);
      }
    } catch (err) {
      console.error('Error removing vet clinic:', err);
      setError(err instanceof Error ? err.message : 'Failed to remove vet clinic');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Search for vet clinics with automatic geolocation and secure access control
  const searchVetClinics = async (
    query: string,
    latitude?: number,
    longitude?: number
  ): Promise<VetClinic[]> => {
    if (!query.trim() || query.length < 2) {
      return [];
    }

    try {
      // If no location provided, try to get user location
      let searchLatitude = latitude;
      let searchLongitude = longitude;
      
      if (!latitude && !longitude && navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              timeout: 3000,
              enableHighAccuracy: false
            });
          });
          
          searchLatitude = position.coords.latitude;
          searchLongitude = position.coords.longitude;
        } catch (geoError) {
          // Continue without location if geolocation fails
          console.log('Geolocation unavailable for vet search');
        }
      }

      // First, try to get results from the secure database function
      // This will show masked contact info for clinics not associated with user's dogs
      let secureResults: VetClinic[] = [];
      try {
        const { data: secureData, error: secureError } = await supabase.rpc('get_accessible_vet_clinics', {
          search_query: query,
          include_contact_info: false // Don't show full contact info in search results
        });

        if (!secureError && secureData) {
          secureResults = secureData;
        }
      } catch (secureErr) {
        console.log('Secure search not available, falling back to edge function');
      }

      // Also search via edge function for broader OSM results
      const { data: edgeData, error: searchError } = await supabase.functions.invoke('search-vet-clinics', {
        body: { 
          query,
          latitude: searchLatitude,
          longitude: searchLongitude,
          country: profile?.country || null
        }
      });

      if (searchError) {
        // If edge function fails, return secure results only
        if (secureResults.length > 0) {
          return secureResults;
        }
        throw searchError;
      }

      const edgeFunctionClinics = edgeData?.clinics || [];
      
      // Combine results, prioritizing secure results (which may have full contact access)
      const combinedResults = [...secureResults, ...edgeFunctionClinics];
      
      // Remove duplicates based on Google place ID or name+address combination
      const uniqueResults = combinedResults.reduce((acc: VetClinic[], clinic) => {
        const isDuplicate = acc.some(existing => 
          (clinic.google_place_id && existing.google_place_id === clinic.google_place_id) ||
          (existing.name === clinic.name && existing.address === clinic.address)
        );
        
        if (!isDuplicate) {
          acc.push(clinic);
        }
        
        return acc;
      }, []);

      return uniqueResults.slice(0, 10);
    } catch (err) {
      console.error('Error searching vet clinics:', err);
      setError(err instanceof Error ? err.message : 'Failed to search vet clinics');
      return [];
    }
  };

  // Load data when dogId changes
  useEffect(() => {
    if (dogId) {
      fetchDogVetClinics(dogId);
    }
  }, [dogId]);

  // Get primary clinic
  const primaryClinic = dogVetClinics.find(r => r.is_primary);

  return {
    dogVetClinics,
    primaryClinic,
    isLoading,
    error,
    addVetClinic,
    updateClinicRelationship,
    removeVetClinic,
    searchVetClinics,
    refetch: () => dogId ? fetchDogVetClinics(dogId) : Promise.resolve()
  };
}