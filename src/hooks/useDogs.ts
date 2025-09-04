import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Dog {
  id: string;
  name: string;
  breed?: string;
  birthday?: string;
  weight?: number;
  gender?: 'male' | 'female';
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

// Utility function to calculate age from birthday
export function calculateAge(birthday: string): number {
  const birthDate = new Date(birthday);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
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

  const uploadDogPhoto = async (file: File, dogId: string): Promise<string | null> => {
    if (!user) return null;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${dogId}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('dog-photos')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('dog-photos')
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast({
        title: 'Error uploading photo',
        description: 'Please try again',
        variant: 'destructive',
      });
      return null;
    }
  };

  const addDog = async (dogData: Omit<Dog, 'id' | 'created_at' | 'updated_at'>, photo?: File) => {
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

      // Upload photo if provided
      if (photo) {
        const photoUrl = await uploadDogPhoto(photo, newDog.id);
        if (photoUrl) {
          const { data: updatedData, error: updateError } = await supabase
            .from('dogs')
            .update({ avatar_url: photoUrl })
            .eq('id', newDog.id)
            .select()
            .single();

          if (updateError) throw updateError;
          newDog.avatar_url = updatedData.avatar_url;
        }
      }

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