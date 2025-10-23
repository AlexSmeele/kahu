import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface MedicalTreatment {
  id: string;
  dog_id: string;
  treatment_name: string;
  last_administered_date: string;
  frequency_weeks: number;
  next_due_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export const useMedicalTreatments = (dogId: string) => {
  const [treatments, setTreatments] = useState<MedicalTreatment[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchTreatments = async () => {
    if (!dogId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('medical_treatments')
        .select('*')
        .eq('dog_id', dogId)
        .order('next_due_date', { ascending: true });

      if (error) throw error;

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
