import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface HealthRecord {
  id: string;
  dog_id: string;
  record_type: string;
  title: string;
  description?: string;
  date: string;
  veterinarian?: string;
  vet_clinic_id?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface HealthNote {
  id: string;
  date: Date;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  category: 'behavior' | 'physical' | 'medication' | 'diet' | 'other';
  attachments?: {
    type: 'image' | 'video';
    url: string;
    name: string;
  }[];
  resolved?: boolean;
}

export function useHealthRecords(dogId?: string) {
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchHealthRecords = async () => {
    if (!user || !dogId || dogId.trim() === '') {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('health_records')
        .select('*')
        .eq('dog_id', dogId)
        .order('date', { ascending: false });

      if (error) throw error;
      setHealthRecords(data || []);
    } catch (error) {
      console.error('Error fetching health records:', error);
      toast({
        title: 'Error loading health records',
        description: 'Please try refreshing the page',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createHealthRecord = async (recordData: Omit<HealthRecord, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('health_records')
        .insert(recordData)
        .select()
        .single();

      if (error) throw error;

      const newRecord = data as HealthRecord;
      setHealthRecords(prev => [newRecord, ...prev]);
      
      toast({
        title: 'Health record added!',
        description: 'The record has been saved successfully',
      });

      return newRecord;
    } catch (error) {
      console.error('Error creating health record:', error);
      toast({
        title: 'Error adding health record',
        description: 'Please try again',
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateHealthRecord = async (id: string, updates: Partial<HealthRecord>) => {
    try {
      const { data, error } = await supabase
        .from('health_records')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedRecord = data as HealthRecord;
      setHealthRecords(prev => prev.map(record => 
        record.id === id ? updatedRecord : record
      ));
      
      toast({
        title: 'Health record updated!',
      });

      return updatedRecord;
    } catch (error) {
      console.error('Error updating health record:', error);
      toast({
        title: 'Error updating health record',
        description: 'Please try again',
        variant: 'destructive',
      });
      return null;
    }
  };

  const deleteHealthRecord = async (id: string) => {
    try {
      const { error } = await supabase
        .from('health_records')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setHealthRecords(prev => prev.filter(record => record.id !== id));
      
      toast({
        title: 'Health record deleted',
      });
    } catch (error) {
      console.error('Error deleting health record:', error);
      toast({
        title: 'Error deleting health record',
        description: 'Please try again',
        variant: 'destructive',
      });
    }
  };

  const uploadAttachment = async (dogId: string, file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random()}.${fileExt}`;
      const filePath = `${dogId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('health-records')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('health-records')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading attachment:', error);
      toast({
        title: 'Error uploading file',
        description: 'Please try again',
        variant: 'destructive',
      });
      return null;
    }
  };

  useEffect(() => {
    fetchHealthRecords();
  }, [user, dogId]);

  return {
    healthRecords,
    loading,
    createHealthRecord,
    updateHealthRecord,
    deleteHealthRecord,
    uploadAttachment,
    refetch: fetchHealthRecords,
  };
}