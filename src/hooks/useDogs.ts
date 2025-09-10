import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { CropData } from '@/components/modals/EditPhotoModal';
import { logger } from '@/lib/logger';

export interface Dog {
  id: string;
  name: string;
  breed?: string;
  birthday?: string;
  weight?: number;
  gender?: 'male' | 'female';
  avatar_url?: string;
  sort_order?: number;
  created_at: string;
  updated_at: string;
}

// Utility function to calculate age from birthday
export function calculateAge(birthday: string): string {
  const birthDate = new Date(birthday);
  const today = new Date();
  
  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();
  
  if (months < 0) {
    years--;
    months += 12;
  } else if (months === 0 && today.getDate() < birthDate.getDate()) {
    years--;
    months = 11;
  } else if (today.getDate() < birthDate.getDate()) {
    months--;
  }
  
  if (years === 0) {
    return `${months} ${months === 1 ? 'month' : 'months'}`;
  } else if (months === 0) {
    return `${years} ${years === 1 ? 'year' : 'years'}`;
  } else {
    return `${years} ${years === 1 ? 'year' : 'years'}, ${months} ${months === 1 ? 'month' : 'months'}`;
  }
}

// Global state management for dogs to ensure all components stay in sync
let globalDogsState: Dog[] = [];
let globalLoadingState = false;
const subscribers = new Set<() => void>();

const notifySubscribers = () => {
  logger.debug('useDogs: Notifying subscribers of state change', { subscriberCount: subscribers.size });
  subscribers.forEach(callback => callback());
};

const setGlobalDogsState = (dogs: Dog[]) => {
  logger.stateChange('useDogs', 'dogsUpdated', { dogCount: dogs.length });
  globalDogsState = dogs;
  notifySubscribers();
};

const setGlobalLoadingState = (loading: boolean) => {
  logger.stateChange('useDogs', 'loadingUpdated', { loading });
  globalLoadingState = loading;
  notifySubscribers();
};

export function useDogs() {
  const [dogs, setDogs] = useState<Dog[]>(globalDogsState);
  const [loading, setLoading] = useState(globalLoadingState);
  const { user } = useAuth();
  const { toast } = useToast();

  // Subscribe to global state changes
  useEffect(() => {
    const callback = () => {
      setDogs([...globalDogsState]);
      setLoading(globalLoadingState);
    };
    
    subscribers.add(callback);
    
    return () => {
      subscribers.delete(callback);
    };
  }, []);

  const fetchDogs = useCallback(async () => {
    if (!user) {
      logger.debug('useDogs: No user, clearing dogs state');
      setGlobalDogsState([]);
      setGlobalLoadingState(false);
      return;
    }
    
    logger.info('useDogs: Fetching dogs for user', { userId: user.id });
    setGlobalLoadingState(true);
    
    try {
      logger.apiCall('GET', '/dogs');
      const { data, error } = await supabase
        .from('dogs')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const dogs = (data as Dog[]) || [];
      logger.apiResponse('GET', '/dogs', 200, { dogCount: dogs.length });
      setGlobalDogsState(dogs);
    } catch (error) {
      logger.error('useDogs: Error fetching dogs', error, { userId: user.id });
      toast({
        title: 'Error loading dogs',
        description: 'Please try refreshing the page',
        variant: 'destructive',
      });
    } finally {
      setGlobalLoadingState(false);
    }
  }, [user, toast]);

  const uploadDogPhoto = async (originalFile: File, croppedBlob: Blob, cropData: CropData, dogId: string): Promise<string | null> => {
    if (!user) return null;

    try {
      // Delete existing files if they exist
      const existingDog = globalDogsState.find(dog => dog.id === dogId);
      if (existingDog?.avatar_url) {
        const oldPath = existingDog.avatar_url.split('/').pop();
        if (oldPath) {
          const baseName = oldPath.replace(/\.(jpg|jpeg|png|webp)$/i, '');
          await supabase.storage
            .from('dog-photos')
            .remove([
              `${user.id}/${oldPath}`,
              `${user.id}/original_${baseName}.${originalFile.name.split('.').pop()}`,
              `${user.id}/crop_data_${baseName}.json`
            ]);
        }
      }

      const timestamp = Date.now();
      const fileExt = originalFile.name.split('.').pop();
      const baseName = `${dogId}_${timestamp}`;
      
      // Upload original image
      const originalPath = `${user.id}/original_${baseName}.${fileExt}`;
      const { error: originalError } = await supabase.storage
        .from('dog-photos')
        .upload(originalPath, originalFile);

      if (originalError) throw originalError;

      // Upload cropped image
      const croppedPath = `${user.id}/${baseName}.jpg`;
      const { error: croppedError } = await supabase.storage
        .from('dog-photos')
        .upload(croppedPath, croppedBlob);

      if (croppedError) throw croppedError;

      // Store crop data
      const cropDataPath = `${user.id}/crop_data_${baseName}.json`;
      const cropDataBlob = new Blob([JSON.stringify({ ...cropData, originalPath, croppedPath })], 
        { type: 'application/json' });
      
      await supabase.storage
        .from('dog-photos')
        .upload(cropDataPath, cropDataBlob);

      // Get public URL for cropped image
      const { data } = supabase.storage
        .from('dog-photos')
        .getPublicUrl(croppedPath);

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

  const getDogOriginalImageData = async (avatarUrl: string): Promise<{ originalUrl: string; cropData: CropData } | null> => {
    if (!user || !avatarUrl) return null;

    try {
      const croppedPath = avatarUrl.split('/').pop();
      if (!croppedPath) return null;

      const baseName = croppedPath.replace(/\.(jpg|jpeg|png|webp)$/i, '');
      
      const cropDataPath = `${user.id}/crop_data_${baseName}.json`;
      const { data: cropDataFile } = await supabase.storage
        .from('dog-photos')
        .download(cropDataPath);

      if (!cropDataFile) return null;

      const cropDataText = await cropDataFile.text();
      const { originalPath, ...cropData } = JSON.parse(cropDataText);

      const { data: { publicUrl: originalUrl } } = supabase.storage
        .from('dog-photos')
        .getPublicUrl(originalPath);

      return {
        originalUrl,
        cropData: { x: cropData.x, y: cropData.y, scale: cropData.scale } as CropData
      };
    } catch (error) {
      console.error('Error getting original image data:', error);
      return null;
    }
  };

  const addDog = async (dogData: Omit<Dog, 'id' | 'created_at' | 'updated_at'>, photo?: File) => {
    if (!user) return null;

    logger.info('useDogs: Adding new dog', { dogName: dogData.name, userId: user.id });
    try {
      // Get the next sort_order value for this user
      const { data: existingDogs } = await supabase
        .from('dogs')
        .select('sort_order')
        .order('sort_order', { ascending: false })
        .limit(1);
      
      const nextSortOrder = existingDogs && existingDogs.length > 0 
        ? (existingDogs[0].sort_order || 0) + 1 
        : 1;

      const { data, error } = await supabase
        .from('dogs')
        .insert({
          ...dogData,
          user_id: user.id,
          sort_order: nextSortOrder,
        })
        .select()
        .single();

      if (error) throw error;

      const newDog = data as Dog;

      // Note: Photo upload will be handled by the EditPhotoModal separately

      // Add initial weight record if weight is provided
      if (dogData.weight) {
        const { error: weightError } = await supabase
          .from('weight_records')
          .insert({
            dog_id: newDog.id,
            weight: dogData.weight,
            date: new Date().toISOString(),
            notes: 'Initial weight recorded during profile creation',
          });

        if (weightError) {
          console.error('Error adding initial weight record:', weightError);
          // Don't fail the dog creation if weight record fails
        }
      }

      // Update global state instead of local state
      setGlobalDogsState([newDog, ...globalDogsState]);
      
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
      // Update global state instead of local state
      setGlobalDogsState(globalDogsState.map(dog => dog.id === id ? updatedDog : dog));
      
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

  const updateDogPhoto = async (dogId: string, originalFile: File, croppedBlob: Blob, cropData: CropData) => {
    try {
      const photoUrl = await uploadDogPhoto(originalFile, croppedBlob, cropData, dogId);
      if (photoUrl) {
        return await updateDog(dogId, { avatar_url: photoUrl });
      }
      return null;
    } catch (error) {
      console.error('Error updating dog photo:', error);
      return null;
    }
  };

  useEffect(() => {
    fetchDogs();
  }, [fetchDogs]);

  const deleteDog = async (id: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('dogs')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Update global state instead of local state
      setGlobalDogsState(globalDogsState.filter(dog => dog.id !== id));
      
      toast({
        title: 'Dog removed',
        description: 'Dog profile has been deleted',
      });

      return true;
    } catch (error) {
      console.error('Error deleting dog:', error);
      toast({
        title: 'Error deleting dog',
        description: 'Please try again',
        variant: 'destructive',
      });
      return false;
    }
  };

  const reorderDogs = async (reorderedDogs: Dog[]): Promise<boolean> => {
    if (!user) return false;

    try {
      // Update sort_order for all dogs
      const updates = reorderedDogs.map((dog, index) => ({
        id: dog.id,
        sort_order: index + 1,
      }));

      // Use Promise.all to update all dogs concurrently
      await Promise.all(
        updates.map(update =>
          supabase
            .from('dogs')
            .update({ sort_order: update.sort_order })
            .eq('id', update.id)
        )
      );

      // Update global state with new order
      setGlobalDogsState(reorderedDogs);
      
      toast({
        title: 'Order updated',
        description: 'Dog profiles have been reordered',
      });

      return true;
    } catch (error) {
      console.error('Error reordering dogs:', error);
      toast({
        title: 'Error reordering dogs',
        description: 'Please try again',
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    dogs,
    loading,
    addDog,
    updateDog,
    updateDogPhoto,
    getDogOriginalImageData,
    deleteDog,
    reorderDogs,
    refetch: fetchDogs,
  };
}