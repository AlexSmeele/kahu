import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { MOCK_MEDICAL_TREATMENTS, isMockDogId } from '@/lib/mockData';

export interface MedicalTreatment {
  id: string;
  dog_id: string;
  treatment_name: string;
  last_administered_date: string;
  frequency_weeks: number;
  next_due_date: string | null;
  notes: string | null;
  vet_clinic_id: string | null;
  created_at: string;
  updated_at: string;
}

export const useMedicalTreatments = (dogId: string) => {
  const [treatments, setTreatments] = useState<MedicalTreatment[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchTreatments = async () => {
    if (!dogId) {
      setLoading(false);
      return;
    }

    // Use mock data for mock dog IDs
    if (isMockDogId(dogId)) {
      const mockTreatments = MOCK_MEDICAL_TREATMENTS.filter(t => t.dog_id === dogId);
      console.log('Using mock medical treatments for dog:', dogId, mockTreatments);
      setTreatments(mockTreatments);
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching medical treatments for dog:', dogId);
      const { data, error } = await supabase
        .from('medical_treatments')
        .select(`
          *,
          vet_clinic:vet_clinics(id, name, address, phone)
        `)
        .eq('dog_id', dogId)
        .order('next_due_date', { ascending: true });

      if (error) throw error;

      console.log('Medical treatments fetched:', data);
      setTreatments(data || []);
    } catch (error: any) {
      console.error('Error fetching medical treatments:', error);
      toast({
        title: 'Error loading treatments',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTreatments();
  }, [dogId]);

  const addTreatment = async (treatment: Omit<MedicalTreatment, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('medical_treatments')
        .insert([treatment])
        .select()
        .single();

      if (error) throw error;

      setTreatments(prev => [...prev, data]);
      toast({
        title: 'Treatment added',
        description: `${treatment.treatment_name} has been added`,
      });

      return true;
    } catch (error: any) {
      console.error('Error adding treatment:', error);
      toast({
        title: 'Error adding treatment',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }
  };

  const updateTreatment = async (id: string, updates: Partial<MedicalTreatment>) => {
    try {
      const { data, error } = await supabase
        .from('medical_treatments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setTreatments(prev => prev.map(t => t.id === id ? data : t));
      toast({
        title: 'Treatment updated',
        description: 'Treatment has been updated successfully',
      });

      return true;
    } catch (error: any) {
      console.error('Error updating treatment:', error);
      toast({
        title: 'Error updating treatment',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }
  };

  const deleteTreatment = async (id: string) => {
    try {
      const { error } = await supabase
        .from('medical_treatments')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTreatments(prev => prev.filter(t => t.id !== id));
      toast({
        title: 'Treatment deleted',
        description: 'Treatment has been removed',
      });

      return true;
    } catch (error: any) {
      console.error('Error deleting treatment:', error);
      toast({
        title: 'Error deleting treatment',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    treatments,
    loading,
    addTreatment,
    updateTreatment,
    deleteTreatment,
    refetch: fetchTreatments,
  };
};
