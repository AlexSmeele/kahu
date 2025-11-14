import { useState } from 'react';

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

// STUB IMPLEMENTATION - Will be activated after database migration is approved
export function useGroomers(dogId?: string) {
  const [dogGroomers] = useState<DogGroomer[]>([]);
  const [isLoading] = useState(false);
  const [error] = useState<Error | null>(null);

  const fetchDogGroomers = async (id: string) => {
    console.log('useGroomers: Waiting for database migration to be approved', id);
    // Will be implemented after migration
  };

  const addGroomer = async (
    dogId: string,
    groomerData: Omit<Groomer, 'id' | 'created_at' | 'updated_at'>,
    isPreferred: boolean = false,
    relationshipNotes?: string
  ) => {
    console.log('useGroomers: Waiting for database migration to be approved', { dogId, groomerData, isPreferred, relationshipNotes });
    throw new Error('Please approve the database migration to enable groomer management');
  };

  const updateGroomerRelationship = async (
    relationshipId: string,
    updates: {
      is_preferred?: boolean;
      relationship_notes?: string;
      preferred_groomer_name?: string;
    }
  ) => {
    console.log('useGroomers: Waiting for database migration to be approved', { relationshipId, updates });
    throw new Error('Please approve the database migration to enable groomer management');
  };

  const removeGroomer = async (relationshipId: string) => {
    console.log('useGroomers: Waiting for database migration to be approved', relationshipId);
    throw new Error('Please approve the database migration to enable groomer management');
  };

  const searchGroomers = async (
    query: string,
    latitude?: number,
    longitude?: number
  ): Promise<Groomer[]> => {
    console.log('useGroomers: Waiting for database migration to be approved', { query, latitude, longitude });
    return [];
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
