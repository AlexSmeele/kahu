import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface WeightRecord {
  id: string;
  dog_id: string;
  weight: number;
  date: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export function useWeightRecords(dogId: string) {
  const [weightRecords, setWeightRecords] = useState<WeightRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchWeightRecords = async () => {
    if (!dogId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('weight_records')
        .select('*')
        .eq('dog_id', dogId)
        .order('date', { ascending: false });

      if (error) throw error;
      setWeightRecords(data || []);
    } catch (error) {
      console.error('Error fetching weight records:', error);
      toast({
        title: "Error",
        description: "Failed to load weight records",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addWeightRecord = async (weight: number, date: string, notes?: string) => {
    try {
      const { data, error } = await supabase
        .from('weight_records')
        .insert({
          dog_id: dogId,
          weight,
          date,
          notes,
        })
        .select()
        .single();

      if (error) throw error;

      setWeightRecords(prev => [data, ...prev]);
      toast({
        title: "Success",
        description: "Weight record added successfully",
      });
      
      return data;
    } catch (error) {
      console.error('Error adding weight record:', error);
      toast({
        title: "Error",
        description: "Failed to add weight record",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateWeightRecord = async (id: string, weight: number, date: string, notes?: string) => {
    try {
      const { data, error } = await supabase
        .from('weight_records')
        .update({
          weight,
          date,
          notes,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setWeightRecords(prev => 
        prev.map(record => record.id === id ? data : record)
      );
      
      toast({
        title: "Success", 
        description: "Weight record updated successfully",
      });
      
      return data;
    } catch (error) {
      console.error('Error updating weight record:', error);
      toast({
        title: "Error",
        description: "Failed to update weight record",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteWeightRecord = async (id: string) => {
    try {
      const { error } = await supabase
        .from('weight_records')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setWeightRecords(prev => prev.filter(record => record.id !== id));
      toast({
        title: "Success",
        description: "Weight record deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting weight record:', error);
      toast({
        title: "Error",
        description: "Failed to delete weight record",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchWeightRecords();
  }, [dogId]);

  return {
    weightRecords,
    loading,
    addWeightRecord,
    updateWeightRecord,
    deleteWeightRecord,
    refetch: fetchWeightRecords,
  };
}