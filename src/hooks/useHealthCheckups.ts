import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { MOCK_HEALTH_CHECKUPS, isMockDogId } from "@/lib/mockData";

export interface HealthCheckup {
  id: string;
  dog_id: string;
  checkup_date: string;
  body_condition_score: number | null;
  lumps_found: boolean;
  lump_notes: string | null;
  ear_condition: string | null;
  ear_notes: string | null;
  eye_condition: string | null;
  eye_notes: string | null;
  skin_condition: string | null;
  skin_notes: string | null;
  behavior_changes: string | null;
  overall_notes: string | null;
  created_at: string;
  updated_at: string;
}

export const useHealthCheckups = (dogId: string) => {
  const [checkups, setCheckups] = useState<HealthCheckup[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchCheckups = async () => {
    try {
      setLoading(true);

      // Dev mode bypass - return mock data
      if (isMockDogId(dogId)) {
        const mockCheckups = MOCK_HEALTH_CHECKUPS.filter(c => c.dog_id === dogId);
        setCheckups(mockCheckups);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("health_checkups")
        .select("*")
        .eq("dog_id", dogId)
        .order("checkup_date", { ascending: false });

      if (error) throw error;
      setCheckups(data || []);
    } catch (error: any) {
      console.error("Error fetching health checkups:", error);
      toast({
        title: "Error",
        description: "Failed to load health checkups",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addCheckup = async (checkupData: Omit<HealthCheckup, "id" | "dog_id" | "created_at" | "updated_at">) => {
    try {
      const { data, error } = await supabase
        .from("health_checkups")
        .insert({
          dog_id: dogId,
          ...checkupData,
        })
        .select()
        .single();

      if (error) throw error;

      setCheckups((prev) => [data, ...prev]);
      toast({
        title: "Success",
        description: "Health checkup recorded",
      });
      return data;
    } catch (error: any) {
      console.error("Error adding health checkup:", error);
      toast({
        title: "Error",
        description: "Failed to record health checkup",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateCheckup = async (
    checkupId: string,
    updates: Partial<HealthCheckup>
  ) => {
    try {
      const { data, error } = await supabase
        .from("health_checkups")
        .update(updates)
        .eq("id", checkupId)
        .select()
        .single();

      if (error) throw error;

      setCheckups((prev) =>
        prev.map((c) => (c.id === checkupId ? data : c))
      );

      toast({
        title: "Success",
        description: "Checkup updated",
      });
    } catch (error: any) {
      console.error("Error updating checkup:", error);
      toast({
        title: "Error",
        description: "Failed to update checkup",
        variant: "destructive",
      });
    }
  };

  const deleteCheckup = async (checkupId: string) => {
    try {
      const { error } = await supabase
        .from("health_checkups")
        .delete()
        .eq("id", checkupId);

      if (error) throw error;

      setCheckups((prev) => prev.filter((c) => c.id !== checkupId));
      toast({
        title: "Success",
        description: "Checkup deleted",
      });
    } catch (error: any) {
      console.error("Error deleting checkup:", error);
      toast({
        title: "Error",
        description: "Failed to delete checkup",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (dogId) {
      fetchCheckups();
    }
  }, [dogId]);

  return {
    checkups,
    loading,
    addCheckup,
    updateCheckup,
    deleteCheckup,
    refetch: fetchCheckups,
  };
};
