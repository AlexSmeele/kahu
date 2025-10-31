import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { MOCK_NUTRITION_PLANS, isMockDogId } from '@/lib/mockData';

export interface NutritionPlan {
  id: string;
  dog_id: string;
  food_type: string;
  brand?: string;
  daily_amount?: number;
  feeding_times: number;
  meal_schedule?: any;
  is_active: boolean;
  special_instructions?: string;
  bowl_last_cleaned?: string;
  water_bowl_last_cleaned?: string;
  calorie_target_daily?: number;
  created_at: string;
  updated_at: string;
}

export interface MealTime {
  time: string;
  amount: number;
  food_type: string;
  reminder_enabled?: boolean;
}

export function useNutrition(dogId?: string) {
  const [nutritionPlan, setNutritionPlan] = useState<NutritionPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchNutritionPlan = async () => {
    if (!user || !dogId) {
      setLoading(false);
      return;
    }
    
    // Return mock data for dev mode
    if (isMockDogId(dogId)) {
      const mockPlan = MOCK_NUTRITION_PLANS.find(p => p.dog_id === dogId);
      setNutritionPlan(mockPlan || null);
      setLoading(false);
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('nutrition_plans')
        .select('*')
        .eq('dog_id', dogId)
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;
      setNutritionPlan(data);
    } catch (error) {
      console.error('Error fetching nutrition plan:', error);
      toast({
        title: 'Error loading nutrition plan',
        description: 'Please try refreshing the page',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createNutritionPlan = async (planData: Omit<NutritionPlan, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user) return null;

    try {
      // Deactivate existing plans
      await supabase
        .from('nutrition_plans')
        .update({ is_active: false })
        .eq('dog_id', planData.dog_id);

      const { data, error } = await supabase
        .from('nutrition_plans')
        .insert(planData)
        .select()
        .single();

      if (error) throw error;

      const newPlan = data as NutritionPlan;
      setNutritionPlan(newPlan);
      
      toast({
        title: 'Nutrition plan created!',
        description: 'Diet plan has been set up successfully',
      });

      return newPlan;
    } catch (error) {
      console.error('Error creating nutrition plan:', error);
      toast({
        title: 'Error creating nutrition plan',
        description: 'Please try again',
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateNutritionPlan = async (id: string, updates: Partial<NutritionPlan>) => {
    try {
      const { data, error } = await supabase
        .from('nutrition_plans')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedPlan = data as NutritionPlan;
      setNutritionPlan(updatedPlan);
      
      toast({
        title: 'Nutrition plan updated!',
      });

      return updatedPlan;
    } catch (error) {
      console.error('Error updating nutrition plan:', error);
      toast({
        title: 'Error updating nutrition plan',
        description: 'Please try again',
        variant: 'destructive',
      });
      return null;
    }
  };

  const markFoodBowlCleaned = async () => {
    if (!nutritionPlan?.id) return null;

    try {
      const { data, error } = await supabase
        .from('nutrition_plans')
        .update({ bowl_last_cleaned: new Date().toISOString() })
        .eq('id', nutritionPlan.id)
        .select()
        .single();

      if (error) throw error;

      setNutritionPlan(data as NutritionPlan);
      toast({
        title: 'Food bowl marked as cleaned!',
      });

      return data;
    } catch (error) {
      console.error('Error marking food bowl cleaned:', error);
      toast({
        title: 'Error updating bowl status',
        variant: 'destructive',
      });
      return null;
    }
  };

  const markWaterBowlCleaned = async () => {
    if (!nutritionPlan?.id) return null;

    try {
      const { data, error } = await supabase
        .from('nutrition_plans')
        .update({ water_bowl_last_cleaned: new Date().toISOString() })
        .eq('id', nutritionPlan.id)
        .select()
        .single();

      if (error) throw error;

      setNutritionPlan(data as NutritionPlan);
      toast({
        title: 'Water bowl marked as cleaned!',
      });

      return data;
    } catch (error) {
      console.error('Error marking water bowl cleaned:', error);
      toast({
        title: 'Error updating bowl status',
        variant: 'destructive',
      });
      return null;
    }
  };

  useEffect(() => {
    fetchNutritionPlan();
  }, [user, dogId]);

  return {
    nutritionPlan,
    loading,
    createNutritionPlan,
    updateNutritionPlan,
    markFoodBowlCleaned,
    markWaterBowlCleaned,
    refetch: fetchNutritionPlan,
  };
}