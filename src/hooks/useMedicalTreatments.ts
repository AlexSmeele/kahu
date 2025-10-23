import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

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
  const { user } = useAuth();

  const fetchTreatments = async () => {
    if (!dogId) {
      setLoading(false);
      return;
    }

    // Dev mode: provide mock Cytopoint treatment so UI shows warning
    if (user?.id === '00000000-0000-0000-0000-000000000001') {
      const now = new Date();
      const last = new Date(now.getTime() - 10 * 7 * 24 * 60 * 60 * 1000); // 10 weeks ago
      const nextDue = new Date(last.getTime() + 8 * 7 * 24 * 60 * 60 * 1000); // 8-week cycle
      const mock: MedicalTreatment[] = [
        {
          id: 'mock-cytopoint',
          dog_id: dogId,
          treatment_name: 'Cytopoint Injection',
          last_administered_date: last.toISOString(),
          frequency_weeks: 8,
          next_due_date: nextDue.toISOString(),
          notes: 'Allergy treatment - administered every 8 weeks',
          created_at: now.toISOString(),
          updated_at: now.toISOString(),
        },
      ];
      console.log('Dev mode: using mock medical treatments', mock);
      setTreatments(mock);
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching medical treatments for dog:', dogId);
      const { data, error } = await supabase
        .from('medical_treatments')
        .select('*')
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
