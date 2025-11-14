import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Groomer {
  id: string;
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
  created_at?: string;
  updated_at?: string;
}

export interface DogGroomer {
  id: string;
  dog_id: string;
  groomer_id: string;
  is_preferred: boolean;
  relationship_notes?: string;
  preferred_groomer_name?: string;
  created_at: string;
  updated_at: string;
  groomer: Groomer;
}

export function useGroomers(dogId?: string) {
  const [dogGroomers, setDogGroomers] = useState<DogGroomer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (dogId) {
      fetchDogGroomers(dogId);
    }
  }, [dogId]);

  const fetchDogGroomers = async (id: string) => {
    if (!id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await supabase
        .from('dog_groomers')
        .select(`
          id,
          dog_id,
          groomer_id,
          is_preferred,
          relationship_notes,
          preferred_groomer_name,
          created_at,
          updated_at,
          groomer:groomers (
            id,
            name,
            business_name,
            address,
            phone,
            email,
            website,
            services,
            specialties,
            latitude,
            longitude,
            google_place_id,
            rating,
            user_ratings_total,
            verified,
            created_at,
            updated_at
          )
        `)
        .eq('dog_id', id);

      if (fetchError) throw fetchError;

      setDogGroomers(data || []);
    } catch (err) {
      console.error('Error fetching dog groomers:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch groomers'));
    } finally {
      setIsLoading(false);
    }
  };

  const addGroomer = async (
    dogId: string,
    groomerData: Omit<Groomer, 'id' | 'created_at' | 'updated_at'>,
    isPreferred: boolean = false,
    relationshipNotes?: string
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      // First, insert or get the groomer
      const { data: groomer, error: groomerError } = await supabase
        .from('groomers')
        .upsert({
          name: groomerData.name,
          business_name: groomerData.business_name,
          address: groomerData.address,
          phone: groomerData.phone,
          email: groomerData.email,
          website: groomerData.website,
          services: groomerData.services,
          specialties: groomerData.specialties,
          latitude: groomerData.latitude,
          longitude: groomerData.longitude,
          google_place_id: groomerData.google_place_id,
          rating: groomerData.rating,
          user_ratings_total: groomerData.user_ratings_total,
          verified: groomerData.verified || false,
        })
        .select()
        .single();

      if (groomerError) throw groomerError;

      // If setting as preferred, unset other preferred groomers for this dog
      if (isPreferred) {
        await supabase
          .from('dog_groomers')
          .update({ is_preferred: false })
          .eq('dog_id', dogId);
      }

      // Create the relationship
      const { error: relationshipError } = await supabase
        .from('dog_groomers')
        .insert({
          dog_id: dogId,
          groomer_id: groomer.id,
          is_preferred: isPreferred,
          relationship_notes: relationshipNotes,
        });

      if (relationshipError) throw relationshipError;

      await fetchDogGroomers(dogId);
    } catch (err) {
      console.error('Error adding groomer:', err);
      setError(err instanceof Error ? err : new Error('Failed to add groomer'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateGroomerRelationship = async (
    relationshipId: string,
    updates: {
      is_preferred?: boolean;
      relationship_notes?: string;
      preferred_groomer_name?: string;
    }
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      // If setting as preferred, get the dog_id and unset others
      if (updates.is_preferred) {
        const { data: relationship } = await supabase
          .from('dog_groomers')
          .select('dog_id')
          .eq('id', relationshipId)
          .single();

        if (relationship) {
          await supabase
            .from('dog_groomers')
            .update({ is_preferred: false })
            .eq('dog_id', relationship.dog_id);
        }
      }

      const { error: updateError } = await supabase
        .from('dog_groomers')
        .update(updates)
        .eq('id', relationshipId);

      if (updateError) throw updateError;

      // Refresh the list
      const currentGroomer = dogGroomers.find(dg => dg.id === relationshipId);
      if (currentGroomer) {
        await fetchDogGroomers(currentGroomer.dog_id);
      }
    } catch (err) {
      console.error('Error updating groomer relationship:', err);
      setError(err instanceof Error ? err : new Error('Failed to update groomer relationship'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const removeGroomer = async (relationshipId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const currentGroomer = dogGroomers.find(dg => dg.id === relationshipId);
      
      const { error: deleteError } = await supabase
        .from('dog_groomers')
        .delete()
        .eq('id', relationshipId);

      if (deleteError) throw deleteError;

      if (currentGroomer) {
        await fetchDogGroomers(currentGroomer.dog_id);
      }
    } catch (err) {
      console.error('Error removing groomer:', err);
      setError(err instanceof Error ? err : new Error('Failed to remove groomer'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const searchGroomers = async (
    query: string,
    latitude?: number,
    longitude?: number
  ): Promise<Groomer[]> => {
    try {
      const { data, error } = await supabase.functions.invoke('search-groomers', {
        body: { query, latitude, longitude }
      });

      if (error) throw error;

      return data?.results || [];
    } catch (err) {
      console.error('Error searching groomers:', err);
      return [];
    }
  };

  const preferredGroomer = dogGroomers.find(dg => dg.is_preferred);

  return {
    dogGroomers,
    preferredGroomer,
    isLoading,
    error,
    fetchDogGroomers,
    addGroomer,
    updateGroomerRelationship,
    removeGroomer,
    searchGroomers,
  };
}
