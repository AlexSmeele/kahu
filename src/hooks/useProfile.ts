import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { CropData } from '@/components/modals/EditPhotoModal';

export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  role: string | null;
  timezone: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  country: string | null;
  created_at: string;
  updated_at: string;
}

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfile();
      
      // Set up real-time subscription for profile updates
      const channel = supabase
        .channel('profile-changes')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'profiles',
            filter: `id=eq.${user.id}`
          },
          (payload) => {
            console.log('Profile updated in real-time:', payload);
            setProfile(payload.new as Profile);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } else {
      setProfile(null);
      setLoading(false);
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    // Dev mode bypass - return mock profile
    if (user.id === '00000000-0000-0000-0000-000000000001') {
      setProfile({
        id: user.id,
        display_name: 'Sarah Chen',
        avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&q=80',
        role: 'owner',
        timezone: 'Pacific/Auckland',
        phone: '+64 21 234 5678',
        address: '142 Beach Road',
        city: 'Auckland Central',
        state: 'Auckland',
        zip_code: '1010',
        country: 'New Zealand',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: 'No user logged in' };

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating profile:', error);
        return { error: error.message };
      }

      setProfile(data);
      return { error: null };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { error: 'Failed to update profile' };
    }
  };

  const uploadAvatar = async (originalFile: File, croppedBlob: Blob, cropData: CropData) => {
    if (!user) return { error: 'No user logged in', url: null };

    try {
      // Delete existing avatar files if they exist
      if (profile?.avatar_url) {
        const oldPath = profile.avatar_url.split('/').pop();
        if (oldPath) {
          // Remove both cropped and original versions
          const baseName = oldPath.replace(/\.(jpg|jpeg|png|webp)$/i, '');
          await supabase.storage
            .from('profile-photos')
            .remove([
              `${user.id}/${oldPath}`,
              `${user.id}/original_${baseName}.${originalFile.name.split('.').pop()}`,
              `${user.id}/crop_data_${baseName}.json`
            ]);
        }
      }

      const timestamp = Date.now();
      const fileExt = originalFile.name.split('.').pop();
      const baseName = `avatar_${timestamp}`;
      
      // Upload original image
      const originalPath = `${user.id}/original_${baseName}.${fileExt}`;
      const { error: originalError } = await supabase.storage
        .from('profile-photos')
        .upload(originalPath, originalFile);

      if (originalError) {
        console.error('Error uploading original file:', originalError);
        return { error: originalError.message, url: null };
      }

      // Upload cropped image
      const croppedPath = `${user.id}/${baseName}.jpg`;
      const { error: croppedError } = await supabase.storage
        .from('profile-photos')
        .upload(croppedPath, croppedBlob);

      if (croppedError) {
        console.error('Error uploading cropped file:', croppedError);
        return { error: croppedError.message, url: null };
      }

      // Store crop data
      const cropDataPath = `${user.id}/crop_data_${baseName}.json`;
      const cropDataBlob = new Blob([JSON.stringify({ ...cropData, originalPath, croppedPath })], 
        { type: 'application/json' });
      
      await supabase.storage
        .from('profile-photos')
        .upload(cropDataPath, cropDataBlob);

      // Get public URL for cropped image
      const { data: { publicUrl } } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(croppedPath);

      // Update profile with new avatar URL
      const { error: updateError } = await updateProfile({ avatar_url: publicUrl });
      
      if (updateError) {
        return { error: updateError, url: null };
      }

      return { error: null, url: publicUrl, originalPath, cropData };
    } catch (error) {
      console.error('Error uploading avatar:', error);
      return { error: 'Failed to upload avatar', url: null };
    }
  };

  const getOriginalImageData = async (avatarUrl: string): Promise<{ originalUrl: string; cropData: CropData } | null> => {
    if (!user || !avatarUrl) return null;

    try {
      // Extract the cropped filename from the URL
      const croppedPath = avatarUrl.split('/').pop();
      if (!croppedPath) return null;

      // Get the base name without extension
      const baseName = croppedPath.replace(/\.(jpg|jpeg|png|webp)$/i, '');
      
      // Try to get the crop data
      const cropDataPath = `${user.id}/crop_data_${baseName}.json`;
      const { data: cropDataFile } = await supabase.storage
        .from('profile-photos')
        .download(cropDataPath);

      if (!cropDataFile) return null;

      const cropDataText = await cropDataFile.text();
      const { originalPath, ...cropData } = JSON.parse(cropDataText);

      // Get the original image URL
      const { data: { publicUrl: originalUrl } } = supabase.storage
        .from('profile-photos')
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

  return {
    profile,
    loading,
    updateProfile,
    uploadAvatar,
    getOriginalImageData,
    refetch: fetchProfile,
  };
}