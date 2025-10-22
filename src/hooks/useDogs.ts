import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { CropData } from '@/components/modals/EditPhotoModal';
import { logger } from '@/lib/logger';

export interface Dog {
  id: string;
  name: string;
  breed_id?: string;
  custom_breed_id?: string; // Reference to custom_breeds table
  breed?: { breed: string }; // For joined queries
  birthday?: string;
  weight?: number;
  gender?: 'male' | 'female';
  avatar_url?: string;
  sort_order?: number;
  age_range?: string; // Age ranges: under_6m, 6_12m, 1_2y, 2_7y, over_7y
  known_commands?: string[]; // Commands the dog knows
  behavioral_goals?: string[]; // Behavioral issues to work on
  training_time_commitment?: string; // Daily training time: under_5min, 5_10min, 10_20min, over_20min
  is_shelter_dog?: boolean; // Whether adopted from shelter
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
    
    // Dev mode bypass - return mock dogs
    if (user.id === '00000000-0000-0000-0000-000000000001') {
      logger.info('useDogs: Dev mode detected, using mock dogs');
      const mockDogs: Dog[] = [
        {
          id: '00000000-0000-0000-0000-000000000011',
          name: 'Suki',
          breed_id: '4106b76f-4caa-49a7-b058-bddf343e3c91',
          breed: { breed: 'Mixed' },
          birthday: '2020-03-15',
          weight: 12,
          gender: 'female',
          avatar_url: 'https://bhkqdxhyceflfesxrztm.supabase.co/storage/v1/object/public/dog-photos/b197063d-9f5b-42c3-888e-3e85e8829141/b450a8fe-855c-4176-b9bc-8da19de0ec30_1757920194150.jpg',
          age_range: '2_7y',
          known_commands: ['Name', 'Sit', 'Stay', 'Come'],
          behavioral_goals: ['Barking', 'Jumping'],
          training_time_commitment: '10_20min',
          is_shelter_dog: true,
          sort_order: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '00000000-0000-0000-0000-000000000012',
          name: 'Jett',
          breed_id: '4106b76f-4caa-49a7-b058-bddf343e3c91',
          breed: { breed: 'Border Collie' },
          birthday: '2022-08-20',
          weight: 19.5,
          gender: 'male',
          avatar_url: 'https://bhkqdxhyceflfesxrztm.supabase.co/storage/v1/object/public/dog-photos/b197063d-9f5b-42c3-888e-3e85e8829141/00cec743-bb6f-4895-8f10-5c2adabf8d72_1757920215636.jpg',
          age_range: '1_2y',
          known_commands: ['Name', 'Sit', 'Down', 'Stay', 'Come', 'Leave it'],
          behavioral_goals: ['Pulling on leash'],
          training_time_commitment: '5_10min',
          is_shelter_dog: false,
          sort_order: 2,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];
      setGlobalDogsState(mockDogs);
      setGlobalLoadingState(false);
      return;
    }
    
    logger.info('useDogs: Fetching dogs for user', { userId: user.id });
    setGlobalLoadingState(true);
    
    try {
      logger.apiCall('GET', '/dogs');
      const { data, error } = await supabase
        .from('dogs')
        .select(`
          *,
          dog_breeds!breed_id(breed),
          custom_breeds!custom_breed_id(name)
        `)
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

  const addDog = async (dogData: Omit<Dog, 'id' | 'created_at' | 'updated_at' | 'breed'> & { 
    breed_id?: string;
    custom_breed_id?: string;
  }, photo?: File) => {
    if (!user) return null;

    // Ensure only one breed type is specified
    if (!dogData.breed_id && !dogData.custom_breed_id) {
      toast({
        title: 'Error adding dog',
        description: 'Please select a breed',
        variant: 'destructive',
      });
      return null;
    }

    if (dogData.breed_id && dogData.custom_breed_id) {
      toast({
        title: 'Error adding dog',
        description: 'Cannot specify both standard and custom breed',
        variant: 'destructive',
      });
      return null;
    }

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

      // Prepare the insert data with proper typing
      const insertData: any = {
        name: dogData.name,
        user_id: user.id,
        sort_order: nextSortOrder,
        birthday: dogData.birthday,
        weight: dogData.weight,
        gender: dogData.gender,
        avatar_url: dogData.avatar_url,
        age_range: dogData.age_range,
        known_commands: dogData.known_commands || [],
        behavioral_goals: dogData.behavioral_goals || [],
        training_time_commitment: dogData.training_time_commitment,
        is_shelter_dog: dogData.is_shelter_dog || false,
      };

      // Add the breed reference
      if (dogData.breed_id) {
        insertData.breed_id = dogData.breed_id;
      } else if (dogData.custom_breed_id) {
        insertData.custom_breed_id = dogData.custom_breed_id;
      }

      const { data, error } = await supabase
        .from('dogs')
        .insert(insertData)
        .select(`
          *,
          dog_breeds!breed_id(breed),
          custom_breeds!custom_breed_id(name)
        `)
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