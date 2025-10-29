import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { isMockDogId } from "@/lib/mockData";
import { useHealthRecords } from "@/hooks/useHealthRecords";

export interface Injury {
  id: string;
  dog_id: string;
  record_type: 'injury';
  title: string;
  date: string;
  description?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export function useInjuries(dogId: string) {
  const [injuries, setInjuries] = useState<Injury[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { healthRecords } = useHealthRecords(dogId);

  useEffect(() => {
    if (isMockDogId(dogId)) {
      // Filter health records for injuries only
      const injuryRecords = healthRecords.filter((r: any) => r.record_type === 'injury').map((r: any) => ({
        ...r,
        record_type: 'injury' as const,
      }));
      setInjuries(injuryRecords);
      setLoading(false);
    } else {
      fetchInjuries();
    }
  }, [dogId, healthRecords]);

  const fetchInjuries = async () => {
    if (!dogId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('health_records')
        .select('*')
        .eq('dog_id', dogId)
        .eq('record_type', 'injury')
        .order('date', { ascending: false });

      if (error) throw error;
      const injuryData = (data || []).map(d => ({ ...d, record_type: 'injury' as const }));
      setInjuries(injuryData);
    } catch (error) {
      console.error('Error fetching injuries:', error);
      toast({
        title: "Error",
        description: "Failed to load injury records",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateInjury = async (id: string, updates: Partial<Injury>) => {
    try {
      const { data, error } = await supabase
        .from('health_records')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setInjuries(prev => 
        prev.map(injury => injury.id === id ? { ...data, record_type: 'injury' as const } : injury)
      );
      
      toast({
        title: "Success",
        description: "Injury record updated successfully",
      });
      
      return data;
    } catch (error) {
      console.error('Error updating injury:', error);
      toast({
        title: "Error",
        description: "Failed to update injury record",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteInjury = async (id: string) => {
    try {
      const { error } = await supabase
        .from('health_records')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setInjuries(prev => prev.filter(injury => injury.id !== id));
      toast({
        title: "Success",
        description: "Injury record deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting injury:', error);
      toast({
        title: "Error",
        description: "Failed to delete injury record",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    injuries,
    loading,
    updateInjury,
    deleteInjury,
    refetch: fetchInjuries,
  };
}
