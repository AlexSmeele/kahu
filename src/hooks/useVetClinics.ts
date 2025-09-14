import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

  // Fetch vet clinics for a specific dog
  const fetchDogVetClinics = async (id: string) => {
    if (!id) return;
    
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
            osm_place_id,
            services,
            verified
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

  // Search for vet clinics with automatic geolocation
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

      const { data, error: searchError } = await supabase.functions.invoke('search-vet-clinics', {
        body: { 
          query,
          latitude: searchLatitude,
          longitude: searchLongitude
        }
      });

      if (searchError) {
        throw searchError;
      }

      return data?.clinics || [];
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