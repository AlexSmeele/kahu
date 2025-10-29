import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { MOCK_HEALTH_RECORDS, isMockDogId } from '@/lib/mockData';

export interface VetVisit {
  id: string;
  date: Date;
  type: 'routine' | 'emergency' | 'follow-up' | 'vaccination' | 'surgery';
  veterinarian: string;
  clinic: string;
  reason: string;
  diagnosis?: string;
  treatment?: string;
  notes?: string;
  followUpDate?: Date;
  cost?: number;
  title?: string;
}

export function useVetVisits(dogId?: string) {
  const [visits, setVisits] = useState<VetVisit[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchVetVisits = async () => {
    if (!user || !dogId) {
      setLoading(false);
      return;
    }

    // Return mock data for dev mode
    if (isMockDogId(dogId)) {
      const mockRecords = MOCK_HEALTH_RECORDS.filter(r => 
        r.dog_id === dogId && r.record_type === 'visit'
      );
      
      const convertedVisits: VetVisit[] = mockRecords.map(record => {
        const visitData = (() => { try { return record.notes ? JSON.parse(record.notes) : {}; } catch { return {}; } })();
        return {
          id: record.id,
          date: new Date(record.date),
          type: visitData.type || 'routine',
          veterinarian: record.veterinarian || visitData.veterinarian || '',
          clinic: visitData.clinic || '',
          reason: visitData.reason || record.title,
          diagnosis: record.description || visitData.diagnosis,
          treatment: visitData.treatment,
          notes: visitData.notes,
          followUpDate: visitData.followUpDate ? new Date(visitData.followUpDate) : undefined,
          cost: visitData.cost,
          title: record.title,
        };
      });
      
      setVisits(convertedVisits);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('health_records')
        .select('*')
        .eq('dog_id', dogId)
        .eq('record_type', 'visit')
        .order('date', { ascending: false });

      if (error) throw error;

      // Convert health records to vet visits format
      const convertedVisits: VetVisit[] = (data || []).map(record => {
        const visitData = (() => { try { return record.notes ? JSON.parse(record.notes) : {}; } catch { return {}; } })();
        return {
          id: record.id,
          date: new Date(record.date),
          type: visitData.type || 'routine',
          veterinarian: record.veterinarian || visitData.veterinarian || '',
          clinic: visitData.clinic || '',
          reason: visitData.reason || record.title,
          diagnosis: record.description || visitData.diagnosis,
          treatment: visitData.treatment,
          notes: visitData.notes,
          followUpDate: visitData.followUpDate ? new Date(visitData.followUpDate) : undefined,
          cost: visitData.cost,
          title: record.title,
        };
      });

      setVisits(convertedVisits);
    } catch (error) {
      console.error('Error fetching vet visits:', error);
      toast({
        title: 'Error loading vet visits',
        description: 'Please try refreshing the page',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createVetVisit = async (visitData: Omit<VetVisit, 'id'>) => {
    if (!user || !dogId) return null;

    try {
      const visitNotes = {
        type: visitData.type,
        veterinarian: visitData.veterinarian,
        clinic: visitData.clinic,
        reason: visitData.reason,
        diagnosis: visitData.diagnosis,
        treatment: visitData.treatment,
        notes: visitData.notes,
        followUpDate: visitData.followUpDate?.toISOString(),
        cost: visitData.cost,
      };

      const { data, error } = await supabase
        .from('health_records')
        .insert({
          dog_id: dogId,
          record_type: 'visit',
          title: visitData.reason,
          description: visitData.diagnosis,
          date: visitData.date.toISOString().split('T')[0],
          veterinarian: visitData.veterinarian,
          notes: JSON.stringify(visitNotes),
        })
        .select()
        .single();

      if (error) throw error;

      const newVisit: VetVisit = {
        ...visitData,
        id: data.id,
      };

      setVisits(prev => [newVisit, ...prev]);
      
      toast({
        title: 'Vet visit recorded!',
        description: 'The visit has been saved successfully',
      });

      return newVisit;
    } catch (error) {
      console.error('Error creating vet visit:', error);
      toast({
        title: 'Error recording vet visit',
        description: 'Please try again',
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateVetVisit = async (id: string, updates: Partial<VetVisit>) => {
    try {
      const existingVisit = visits.find(v => v.id === id);
      if (!existingVisit) return null;

      const updatedVisit = { ...existingVisit, ...updates };
      const visitNotes = {
        type: updatedVisit.type,
        veterinarian: updatedVisit.veterinarian,
        clinic: updatedVisit.clinic,
        reason: updatedVisit.reason,
        diagnosis: updatedVisit.diagnosis,
        treatment: updatedVisit.treatment,
        notes: updatedVisit.notes,
        followUpDate: updatedVisit.followUpDate?.toISOString(),
        cost: updatedVisit.cost,
      };

      const { data, error } = await supabase
        .from('health_records')
        .update({
          title: updatedVisit.reason,
          description: updatedVisit.diagnosis,
          date: updatedVisit.date.toISOString().split('T')[0],
          veterinarian: updatedVisit.veterinarian,
          notes: JSON.stringify(visitNotes),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setVisits(prev => prev.map(visit => 
        visit.id === id ? updatedVisit : visit
      ));
      
      toast({
        title: 'Vet visit updated!',
      });

      return updatedVisit;
    } catch (error) {
      console.error('Error updating vet visit:', error);
      toast({
        title: 'Error updating vet visit',
        description: 'Please try again',
        variant: 'destructive',
      });
      return null;
    }
  };

  const deleteVetVisit = async (id: string) => {
    try {
      const { error } = await supabase
        .from('health_records')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setVisits(prev => prev.filter(visit => visit.id !== id));
      
      toast({
        title: 'Vet visit deleted',
      });
    } catch (error) {
      console.error('Error deleting vet visit:', error);
      toast({
        title: 'Error deleting vet visit',
        description: 'Please try again',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchVetVisits();
  }, [user, dogId]);

  return {
    visits,
    loading,
    createVetVisit,
    updateVetVisit,
    deleteVetVisit,
    refetch: fetchVetVisits,
  };
}