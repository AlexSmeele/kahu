import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Dog {
  id: string;
  name: string;
  breed?: string;
  age?: number;
  weight?: number;
  gender?: 'male' | 'female';
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export function useDogs() {
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchDogs = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('dogs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDogs((data as Dog[]) || []);
    } catch (error) {
      console.error('Error fetching dogs:', error);
      toast({
        title: 'Error loading dogs',
        description: 'Please try refreshing the page',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const addDog = async (dogData: Omit<Dog, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('dogs')
        .insert({
          ...dogData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      const newDog = data as Dog;
      setDogs(prev => [newDog, ...prev]);
      
      toast({
        title: 'Dog added successfully!',
        description: `${newDog.name} has been added to your pack`,
      });

      return newDog;
    } catch (error) {
      console.error('Error adding dog:', error);
      toast({
        title: 'Error adding dog',
        description: 'Please try again',
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateDog = async (id: string, updates: Partial<Omit<Dog, 'id' | 'created_at' | 'updated_at'>>) => {
    try {
      const { data, error } = await supabase
        .from('dogs')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedDog = data as Dog;
      setDogs(prev => prev.map(dog => dog.id === id ? updatedDog : dog));
      
      toast({
        title: 'Dog updated successfully!',
      });

      return updatedDog;
    } catch (error) {
      console.error('Error updating dog:', error);
      toast({
        title: 'Error updating dog',
        description: 'Please try again',
        variant: 'destructive',
      });
      return null;
    }
  };

  useEffect(() => {
    fetchDogs();
  }, [user]);

  return {
    dogs,
    loading,
    addDog,
    updateDog,
    refetch: fetchDogs,
  };
}