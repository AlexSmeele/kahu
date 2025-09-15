import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/lib/logger";

export interface ActivityGoal {
  id: string;
  dog_id: string;
  target_minutes: number;
  target_distance_km: number;
  activity_level: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ActivityRecord {
  id: string;
  dog_id: string;
  activity_type: string;
  duration_minutes?: number;
  distance_km?: number;
  calories_burned?: number;
  start_time: string;
  end_time?: string;
  notes?: string;
  tracking_method: string;
  gps_data?: any;
  created_at: string;
  updated_at: string;
}

export const useActivity = (dogId: string) => {
  const [goal, setGoal] = useState<ActivityGoal | null>(null);
  const [records, setRecords] = useState<ActivityRecord[]>([]);
  const [todayProgress, setTodayProgress] = useState({ minutes: 0, distance: 0 });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Calculate default goal based on dog characteristics
  const calculateDefaultGoal = async (dogId: string): Promise<Partial<ActivityGoal>> => {
    const { data: dog } = await supabase
      .from('dogs')
      .select(`
        birthday,
        dog_breeds!breed_id(breed)
      `)
      .eq('id', dogId)
      .single();

    if (!dog) return { target_minutes: 60, activity_level: 'moderate' };

    // Basic algorithm - can be enhanced with breed-specific data
    const age = dog.birthday ? 
      Math.floor((Date.now() - new Date(dog.birthday).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : 3;

    let minutes = 60;
    let level: 'low' | 'moderate' | 'high' = 'moderate';

    if (age < 1) {
      minutes = 30; // Puppies need less intense exercise
      level = 'low';
    } else if (age > 8) {
      minutes = 45; // Senior dogs need gentler exercise
      level = 'low';
    } else {
      // Working breeds typically need more exercise
      const highEnergyBreeds = ['border collie', 'australian cattle dog', 'jack russell', 'husky'];
      const breedName = (dog as any).dog_breeds?.breed?.toLowerCase() || '';
      const isHighEnergy = highEnergyBreeds.some(breed => 
        breedName.includes(breed)
      );
      
      if (isHighEnergy) {
        minutes = 90;
        level = 'high';
      }
    }

    return { target_minutes: minutes, activity_level: level };
  };

  const fetchGoal = async () => {
    logger.info('useActivity: Fetching activity goal', { dogId });
    const { data, error } = await supabase
      .from('activity_goals')
      .select('*')
      .eq('dog_id', dogId)
      .eq('is_active', true)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      logger.error('useActivity: Error fetching activity goal', error, { dogId });
      toast({ title: "Error loading activity goal", variant: "destructive" });
      return;
    }

    if (data) {
      logger.info('useActivity: Found existing goal', { goalId: data.id, targetMinutes: data.target_minutes });
      setGoal(data);
    } else {
      logger.info('useActivity: No goal found, creating default', { dogId });
      // Create default goal
      const defaults = await calculateDefaultGoal(dogId);
      const { data: newGoal } = await supabase
        .from('activity_goals')
        .insert([{
          dog_id: dogId,
          target_minutes: defaults.target_minutes || 60,
          activity_level: defaults.activity_level || 'moderate'
        }])
        .select()
        .single();

      if (newGoal) {
        logger.info('useActivity: Created default goal', { goalId: newGoal.id, targetMinutes: newGoal.target_minutes });
        setGoal(newGoal);
      }
    }
  };

  const fetchTodayRecords = async () => {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('activity_records')
      .select('*')
      .eq('dog_id', dogId)
      .gte('start_time', `${today}T00:00:00Z`)
      .lt('start_time', `${today}T23:59:59Z`)
      .order('start_time', { ascending: false });

    if (error) {
      toast({ title: "Error loading today's activities", variant: "destructive" });
      return;
    }

    setRecords(data || []);

    // Calculate progress
    const totalMinutes = data?.reduce((sum, record) => sum + (record.duration_minutes || 0), 0) || 0;
    const totalDistance = data?.reduce((sum, record) => sum + (record.distance_km || 0), 0) || 0;
    
    setTodayProgress({ minutes: totalMinutes, distance: totalDistance });
  };

  const addActivity = async (activity: Omit<ActivityRecord, 'id' | 'dog_id' | 'created_at' | 'updated_at'>) => {
    logger.info('useActivity: Adding activity', { dogId, activityType: activity.activity_type, duration: activity.duration_minutes });
    const { error } = await supabase
      .from('activity_records')
      .insert([{ ...activity, dog_id: dogId }]);

    if (error) {
      logger.error('useActivity: Error adding activity', error, { dogId, activityType: activity.activity_type });
      toast({ title: "Error adding activity", variant: "destructive" });
      return false;
    }

    logger.info('useActivity: Successfully added activity', { dogId, activityType: activity.activity_type });
    toast({ title: "Activity added successfully!" });
    await fetchTodayRecords();
    return true;
  };

  const updateActivity = async (id: string, updates: Partial<ActivityRecord>) => {
    const { error } = await supabase
      .from('activity_records')
      .update(updates)
      .eq('id', id);

    if (error) {
      toast({ title: "Error updating activity", variant: "destructive" });
      return false;
    }

    toast({ title: "Activity updated successfully!" });
    await fetchTodayRecords();
    return true;
  };

  const deleteActivity = async (id: string) => {
    const { error } = await supabase
      .from('activity_records')
      .delete()
      .eq('id', id);

    if (error) {
      toast({ title: "Error deleting activity", variant: "destructive" });
      return false;
    }

    toast({ title: "Activity deleted successfully!" });
    await fetchTodayRecords();
    return true;
  };

  const updateGoal = async (updates: Partial<ActivityGoal>) => {
    if (!goal) return false;

    const { error } = await supabase
      .from('activity_goals')
      .update(updates)
      .eq('id', goal.id);

    if (error) {
      toast({ title: "Error updating goal", variant: "destructive" });
      return false;
    }

    setGoal({ ...goal, ...updates });
    toast({ title: "Goal updated successfully!" });
    return true;
  };

  useEffect(() => {
    if (dogId) {
      logger.info('useActivity: Hook initialized', { dogId });
      setLoading(true);
      Promise.all([fetchGoal(), fetchTodayRecords()]).finally(() => {
        logger.info('useActivity: Data loading completed', { dogId });
        setLoading(false);
      });
    }
  }, [dogId]);

  return {
    goal,
    records,
    todayProgress,
    loading,
    addActivity,
    updateActivity,
    deleteActivity,
    updateGoal,
    refetch: () => Promise.all([fetchGoal(), fetchTodayRecords()])
  };
};