import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Vaccine {
  id: string;
  name: string;
  vaccine_type: string;
  protects_against: string;
  schedule_info: string;
  notes?: string;
  frequency_months?: number;
  puppy_start_weeks?: number;
  booster_required: boolean;
  lifestyle_factors?: string[];
}

export interface VaccinationRecord {
  id: string;
  dog_id: string;
  vaccine_id: string;
  administered_date: string;
  due_date?: string;
  veterinarian?: string;
  batch_number?: string;
  notes?: string;
  vaccine?: Vaccine;
}

export function useVaccines(dogId: string) {
  const [vaccines, setVaccines] = useState<Vaccine[]>([]);
  const [vaccinationRecords, setVaccinationRecords] = useState<VaccinationRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchVaccines = async () => {
    try {
      const { data, error } = await supabase
        .from('vaccines')
        .select('*')
        .order('vaccine_type', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      setVaccines(data as Vaccine[] || []);
    } catch (error) {
      console.error('Error fetching vaccines:', error);
      toast({
        title: "Error",
        description: "Failed to load vaccine information",
        variant: "destructive",
      });
    }
  };

  const fetchVaccinationRecords = async () => {
    if (!dogId) return;

    // Dev mode bypass - return empty mock data for now
    if (dogId === '00000000-0000-0000-0000-000000000011' || dogId === '00000000-0000-0000-0000-000000000012') {
      setVaccinationRecords([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('vaccination_records')
        .select(`
          *,
          vaccine:vaccines(*)
        `)
        .eq('dog_id', dogId)
        .order('administered_date', { ascending: false });

      if (error) throw error;
      setVaccinationRecords(data as VaccinationRecord[] || []);
    } catch (error) {
      console.error('Error fetching vaccination records:', error);
      toast({
        title: "Error",
        description: "Failed to load vaccination records",
        variant: "destructive",
      });
    }
  };

  const addVaccinationRecord = async (
    vaccineId: string,
    administeredDate: string,
    dueDate?: string,
    veterinarian?: string,
    batchNumber?: string,
    notes?: string
  ) => {
    try {
      const { data, error } = await supabase
        .from('vaccination_records')
        .insert({
          dog_id: dogId,
          vaccine_id: vaccineId,
          administered_date: administeredDate,
          due_date: dueDate,
          veterinarian,
          batch_number: batchNumber,
          notes,
        })
        .select(`
          *,
          vaccine:vaccines(*)
        `)
        .single();

      if (error) throw error;

      setVaccinationRecords(prev => [data, ...prev] as VaccinationRecord[]);
      toast({
        title: "Success",
        description: "Vaccination record added successfully",
      });

      return data;
    } catch (error) {
      console.error('Error adding vaccination record:', error);
      toast({
        title: "Error",
        description: "Failed to add vaccination record",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateVaccinationRecord = async (
    id: string,
    administeredDate: string,
    dueDate?: string,
    veterinarian?: string,
    batchNumber?: string,
    notes?: string
  ) => {
    try {
      const { data, error } = await supabase
        .from('vaccination_records')
        .update({
          administered_date: administeredDate,
          due_date: dueDate,
          veterinarian,
          batch_number: batchNumber,
          notes,
        })
        .eq('id', id)
        .select(`
          *,
          vaccine:vaccines(*)
        `)
        .single();

      if (error) throw error;

        setVaccinationRecords(prev =>
          prev.map(record => record.id === id ? data as VaccinationRecord : record)
        );

      toast({
        title: "Success",
        description: "Vaccination record updated successfully",
      });

      return data;
    } catch (error) {
      console.error('Error updating vaccination record:', error);
      toast({
        title: "Error",
        description: "Failed to update vaccination record",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteVaccinationRecord = async (id: string) => {
    try {
      const { error } = await supabase
        .from('vaccination_records')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setVaccinationRecords(prev => prev.filter(record => record.id !== id));
      toast({
        title: "Success",
        description: "Vaccination record deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting vaccination record:', error);
      toast({
        title: "Error",
        description: "Failed to delete vaccination record",
        variant: "destructive",
      });
      throw error;
    }
  };

  const getCoreVaccines = () => vaccines.filter(v => v.vaccine_type === 'core');
  const getLifestyleVaccines = () => vaccines.filter(v => v.vaccine_type === 'lifestyle');
  const getRegionalVaccines = () => vaccines.filter(v => v.vaccine_type === 'regional');
  const getInjectableTherapies = () => vaccines.filter(v => v.vaccine_type === 'injectable_therapy');

  const getVaccinationStatus = (vaccineId: string) => {
    const records = vaccinationRecords.filter(r => r.vaccine_id === vaccineId);
    if (records.length === 0) return 'not_given';
    
    const latestRecord = records[0]; // Already sorted by date desc
    const vaccine = vaccines.find(v => v.id === vaccineId);
    
    if (!vaccine?.booster_required) return 'up_to_date';
    
    if (latestRecord.due_date) {
      const dueDate = new Date(latestRecord.due_date);
      const now = new Date();
      
      if (dueDate < now) return 'overdue';
      if (dueDate.getTime() - now.getTime() < 30 * 24 * 60 * 60 * 1000) return 'due_soon'; // Due within 30 days
    }
    
    return 'up_to_date';
  };

  const getDueVaccinesCount = () => {
    return vaccines.filter(vaccine => {
      const status = getVaccinationStatus(vaccine.id);
      return status === 'overdue' || status === 'due_soon';
    }).length;
  };

  useEffect(() => {
    fetchVaccines();
  }, []);

  useEffect(() => {
    fetchVaccinationRecords();
  }, [dogId]);

  return {
    vaccines,
    vaccinationRecords,
    loading,
    addVaccinationRecord,
    updateVaccinationRecord,
    deleteVaccinationRecord,
    getCoreVaccines,
    getLifestyleVaccines,
    getRegionalVaccines,
    getInjectableTherapies,
    getVaccinationStatus,
    getDueVaccinesCount,
    refetch: () => {
      fetchVaccines();
      fetchVaccinationRecords();
    },
  };
}