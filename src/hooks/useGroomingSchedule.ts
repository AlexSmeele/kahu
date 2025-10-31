import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { MOCK_GROOMING_SCHEDULES, isMockDogId } from "@/lib/mockData";

export interface GroomingSchedule {
  id: string;
  dog_id: string;
  grooming_type: string;
  frequency_days: number;
  last_completed_at: string | null;
  next_due_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface GroomingCompletion {
  id: string;
  schedule_id: string;
  dog_id: string;
  completed_at: string;
  notes: string | null;
  photos: string[] | null;
  created_at: string;
}

export const useGroomingSchedule = (dogId: string) => {
  const [schedules, setSchedules] = useState<GroomingSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSchedules = async () => {
    try {
      setLoading(true);

      // Dev mode bypass - return mock data
      if (isMockDogId(dogId)) {
        const mockSchedules = MOCK_GROOMING_SCHEDULES.filter(s => s.dog_id === dogId);
        setSchedules(mockSchedules);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("grooming_schedules")
        .select("*")
        .eq("dog_id", dogId)
        .order("grooming_type");

      if (error) throw error;
      setSchedules(data || []);
    } catch (error: any) {
      console.error("Error fetching grooming schedules:", error);
      toast({
        title: "Error",
        description: "Failed to load grooming schedules",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addSchedule = async (
    groomingType: string,
    frequencyDays: number,
    notes?: string
  ) => {
    try {
      const { data, error } = await supabase
        .from("grooming_schedules")
        .insert({
          dog_id: dogId,
          grooming_type: groomingType,
          frequency_days: frequencyDays,
          notes,
        })
        .select()
        .single();

      if (error) throw error;

      setSchedules((prev) => [...prev, data]);
      toast({
        title: "Success",
        description: "Grooming schedule added",
      });
      return data;
    } catch (error: any) {
      console.error("Error adding grooming schedule:", error);
      toast({
        title: "Error",
        description: "Failed to add grooming schedule",
        variant: "destructive",
      });
      throw error;
    }
  };

  const completeGrooming = async (
    scheduleId: string,
    notes?: string,
    photos?: string[]
  ) => {
    try {
      const schedule = schedules.find((s) => s.id === scheduleId);
      if (!schedule) return;

      const now = new Date();
      const nextDue = new Date(now);
      nextDue.setDate(nextDue.getDate() + schedule.frequency_days);

      // Create completion record
      const { error: completionError } = await supabase
        .from("grooming_completions")
        .insert({
          schedule_id: scheduleId,
          dog_id: schedule.dog_id,
          completed_at: now.toISOString(),
          notes,
          photos,
        });

      if (completionError) throw completionError;

      // Update schedule
      const { data, error } = await supabase
        .from("grooming_schedules")
        .update({
          last_completed_at: now.toISOString(),
          next_due_date: nextDue.toISOString().split("T")[0],
        })
        .eq("id", scheduleId)
        .select()
        .single();

      if (error) throw error;

      setSchedules((prev) =>
        prev.map((s) => (s.id === scheduleId ? data : s))
      );

      toast({
        title: "Success",
        description: "Grooming completed",
      });
    } catch (error: any) {
      console.error("Error completing grooming:", error);
      toast({
        title: "Error",
        description: "Failed to complete grooming",
        variant: "destructive",
      });
      throw error;
    }
  };

  const fetchCompletions = async (scheduleId: string): Promise<GroomingCompletion[]> => {
    try {
      const { data, error } = await supabase
        .from("grooming_completions")
        .select("*")
        .eq("schedule_id", scheduleId)
        .order("completed_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error("Error fetching grooming completions:", error);
      return [];
    }
  };

  const updateSchedule = async (
    scheduleId: string,
    updates: Partial<GroomingSchedule>
  ) => {
    try {
      const { data, error } = await supabase
        .from("grooming_schedules")
        .update(updates)
        .eq("id", scheduleId)
        .select()
        .single();

      if (error) throw error;

      setSchedules((prev) =>
        prev.map((s) => (s.id === scheduleId ? data : s))
      );

      toast({
        title: "Success",
        description: "Schedule updated",
      });
    } catch (error: any) {
      console.error("Error updating schedule:", error);
      toast({
        title: "Error",
        description: "Failed to update schedule",
        variant: "destructive",
      });
    }
  };

  const deleteSchedule = async (scheduleId: string) => {
    try {
      const { error } = await supabase
        .from("grooming_schedules")
        .delete()
        .eq("id", scheduleId);

      if (error) throw error;

      setSchedules((prev) => prev.filter((s) => s.id !== scheduleId));
      toast({
        title: "Success",
        description: "Schedule deleted",
      });
    } catch (error: any) {
      console.error("Error deleting schedule:", error);
      toast({
        title: "Error",
        description: "Failed to delete schedule",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (dogId) {
      fetchSchedules();
    }
  }, [dogId]);

  return {
    schedules,
    loading,
    addSchedule,
    completeGrooming,
    updateSchedule,
    deleteSchedule,
    refetch: fetchSchedules,
    fetchCompletions,
  };
};
