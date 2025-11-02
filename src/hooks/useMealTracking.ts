import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { format, startOfDay, endOfDay } from 'date-fns';
import { MOCK_MEAL_RECORDS, isMockDogId } from '@/lib/mockData';

export interface MealComponent {
  name: string;
  brand?: string;
  amount: number;
  unit: string;
  category: string;
}

export interface MealRecord {
  id: string;
  dog_id: string;
  nutrition_plan_id: string;
  meal_time: string;
  meal_name: string;
  scheduled_date: string;
  completed_at?: string;
  amount_given?: number;
  amount_planned?: number;
  amount_consumed?: number;
  percentage_eaten?: number;
  eating_speed?: string;
  eating_behavior?: string;
  snubbed_items?: any;
  food_temperature?: string;
  fed_by?: string;
  bowl_cleaned_before?: boolean;
  vomited_after?: boolean;
  vomit_time_minutes?: number;
  energy_level_after?: string;
  begged_before?: boolean;
  begged_after?: boolean;
  notes?: string;
  meal_components?: MealComponent[];
  created_at: string;
  updated_at: string;
}

export interface TodayMeal {
  id: string;
  time: string;
  name: string;
  amount: number;
  reminder_enabled?: boolean;
  completed: boolean;
  meal_record?: MealRecord;
}

export function useMealTracking(dogId?: string, nutritionPlanId?: string) {
  const [mealRecords, setMealRecords] = useState<MealRecord[]>([]);
  const [todayMeals, setTodayMeals] = useState<TodayMeal[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchMealRecords = async (date?: Date) => {
    if (!user || !dogId || !nutritionPlanId) {
      setLoading(false);
      return;
    }

    // Filter mock data to today only
    if (isMockDogId(dogId)) {
      const targetDate = date || new Date();
      const dateString = format(targetDate, 'yyyy-MM-dd');
      const mockRecords = MOCK_MEAL_RECORDS.filter(r => 
        r.dog_id === dogId &&
        r.nutrition_plan_id === nutritionPlanId &&
        r.scheduled_date === dateString
      );
      setMealRecords(mockRecords);
      setLoading(false);
      return;
    }

    const targetDate = date || new Date();
    const dateString = format(targetDate, 'yyyy-MM-dd');

    try {
      const { data, error } = await supabase
        .from('meal_records')
        .select('*')
        .eq('dog_id', dogId)
        .eq('nutrition_plan_id', nutritionPlanId)
        .eq('scheduled_date', dateString)
        .order('meal_time');

      if (error) throw error;
      setMealRecords((data || []) as unknown as MealRecord[]);
    } catch (error) {
      console.error('Error fetching meal records:', error);
      toast({
        title: 'Error loading meal records',
        description: 'Please try refreshing the page',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Automatically create meal records for today based on meal schedule
  const ensureTodayMealRecords = async (mealSchedule: any[]) => {
    if (!dogId || !nutritionPlanId || !mealSchedule || mealSchedule.length === 0) return;
    if (isMockDogId(dogId)) return; // Skip for mock data

    const today = format(new Date(), 'yyyy-MM-dd');

    try {
      // Get existing meal records for today
      const { data: existingRecords } = await supabase
        .from('meal_records')
        .select('meal_time, meal_name')
        .eq('dog_id', dogId)
        .eq('nutrition_plan_id', nutritionPlanId)
        .eq('scheduled_date', today);

      // Find meals that don't have records yet
      const missingMeals = mealSchedule.filter(meal => {
        return !existingRecords?.some(record => 
          record.meal_time === meal.time && record.meal_name === meal.name
        );
      });

      // Create records for missing meals
      if (missingMeals.length > 0) {
        const newRecords = missingMeals.map(meal => ({
          dog_id: dogId,
          nutrition_plan_id: nutritionPlanId,
          meal_time: meal.time,
          meal_name: meal.name,
          scheduled_date: today,
          amount_planned: meal.amount || null,
        }));

        const { error } = await supabase
          .from('meal_records')
          .insert(newRecords);

        if (error) throw error;

        // Refresh meal records
        await fetchMealRecords();
      }
    } catch (error) {
      console.error('Error ensuring meal records:', error);
      // Silent fail - not critical enough to show toast
    }
  };

  const generateTodayMeals = (mealSchedule: any[], mealRecords: MealRecord[]) => {
    if (!mealSchedule || mealSchedule.length === 0) return [];

    return mealSchedule.map((meal: any, index: number) => {
      const existingRecord = mealRecords.find(record => 
        record.meal_time === meal.time && record.meal_name === meal.name
      );

      return {
        id: existingRecord?.id || `meal-${index}`,
        time: new Date(`2000-01-01T${meal.time}`).toLocaleTimeString([], { 
          hour: 'numeric', 
          minute: '2-digit' 
        }),
        name: meal.name || `Meal ${index + 1}`,
        amount: meal.amount || 1,
        reminder_enabled: meal.reminder_enabled || false,
        completed: !!existingRecord?.completed_at,
        meal_record: existingRecord,
      };
    });
  };

  const markMealCompleted = async (
    mealTime: string, 
    mealName: string, 
    amountGiven?: number,
    options?: { bowl_cleaned_before?: boolean; notes?: string; meal_components?: MealComponent[] }
  ) => {
    if (!dogId || !nutritionPlanId) return null;

    const today = format(new Date(), 'yyyy-MM-dd');

    try {
      // Check if record already exists
      const { data: existingRecord } = await supabase
        .from('meal_records')
        .select('*')
        .eq('dog_id', dogId)
        .eq('nutrition_plan_id', nutritionPlanId)
        .eq('scheduled_date', today)
        .eq('meal_time', mealTime)
        .eq('meal_name', mealName)
        .maybeSingle();

      if (existingRecord) {
        // Update existing record
        const { data, error } = await supabase
          .from('meal_records')
          .update({
            completed_at: new Date().toISOString(),
            amount_given: amountGiven,
            ...(options as any),
          })
          .eq('id', existingRecord.id)
          .select()
          .single();

        if (error) throw error;
        
        const updatedRecord = data as unknown as MealRecord;
        setMealRecords(prev => prev.map(record => 
          record.id === existingRecord.id ? updatedRecord : record
        ));

        toast({
          title: 'Meal marked as fed!',
          description: `${mealName} completed`,
        });

        return updatedRecord;
      } else {
        // Create new record
        const { data, error } = await supabase
          .from('meal_records')
          .insert({
            dog_id: dogId,
            nutrition_plan_id: nutritionPlanId,
            meal_time: mealTime,
            meal_name: mealName,
            scheduled_date: today,
            completed_at: new Date().toISOString(),
            amount_given: amountGiven,
            ...(options as any),
          } as any)
          .select()
          .single();

        if (error) throw error;

        const newRecord = data as unknown as MealRecord;
        setMealRecords(prev => [...prev, newRecord]);

        toast({
          title: 'Meal marked as fed!',
          description: `${mealName} completed`,
        });

        return newRecord;
      }
    } catch (error) {
      console.error('Error marking meal completed:', error);
      toast({
        title: 'Error marking meal as fed',
        description: 'Please try again',
        variant: 'destructive',
      });
      return null;
    }
  };

  const undoMealCompletion = async (mealId: string) => {
    try {
      const { error } = await supabase
        .from('meal_records')
        .update({
          completed_at: null,
          amount_given: null,
        })
        .eq('id', mealId);

      if (error) throw error;

      setMealRecords(prev => prev.map(record => 
        record.id === mealId 
          ? { ...record, completed_at: undefined, amount_given: undefined }
          : record
      ));

      toast({
        title: 'Meal marked as not fed',
      });
    } catch (error) {
      console.error('Error undoing meal completion:', error);
      toast({
        title: 'Error updating meal status',
        description: 'Please try again',
        variant: 'destructive',
      });
    }
  };

  const updateMealRecord = async (mealId: string, updates: Partial<MealRecord>) => {
    try {
      const { data, error } = await supabase
        .from('meal_records')
        .update(updates as any)
        .eq('id', mealId)
        .select()
        .single();

      if (error) throw error;

      setMealRecords(prev => prev.map(record => 
        record.id === mealId ? (data as unknown as MealRecord) : record
      ));

      toast({
        title: 'Meal updated successfully',
      });

      return true;
    } catch (error) {
      console.error('Error updating meal record:', error);
      toast({
        title: 'Error updating meal',
        description: 'Please try again',
        variant: 'destructive',
      });
      return false;
    }
  };

  const deleteMealRecord = async (mealId: string) => {
    try {
      const { error } = await supabase
        .from('meal_records')
        .delete()
        .eq('id', mealId);

      if (error) throw error;

      setMealRecords(prev => prev.filter(record => record.id !== mealId));

      toast({
        title: 'Meal deleted successfully',
      });

      return true;
    } catch (error) {
      console.error('Error deleting meal record:', error);
      toast({
        title: 'Error deleting meal',
        description: 'Please try again',
        variant: 'destructive',
      });
      return false;
    }
  };

  const getTodayProgress = (mealSchedule: any[], mealRecords: MealRecord[], dailyAmount?: number) => {
    if (!mealSchedule || mealSchedule.length === 0) {
      return { consumed: 0, target: 480, percentage: 0 };
    }

    // Filter to today's records only
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const todayRecords = mealRecords.filter(record => record.scheduled_date === todayStr);
    const completedMeals = todayRecords.filter(record => record.completed_at);
    const totalMeals = mealSchedule.length;
    const completedCount = completedMeals.length;
    
    // Clamp percentage between 0 and 100
    const percentage = totalMeals > 0 
      ? Math.min(100, Math.max(0, Math.round((completedCount / totalMeals) * 100)))
      : 0;
    const target = Math.round((dailyAmount || 2) * 240); // Rough calorie estimation
    const consumed = Math.round(target * (percentage / 100));

    return {
      consumed,
      target,
      percentage
    };
  };

  useEffect(() => {
    fetchMealRecords();
  }, [user, dogId, nutritionPlanId]);

  return {
    mealRecords,
    todayMeals,
    loading,
    markMealCompleted,
    undoMealCompletion,
    updateMealRecord,
    deleteMealRecord,
    getTodayProgress,
    generateTodayMeals,
    ensureTodayMealRecords,
    refetch: fetchMealRecords,
  };
}