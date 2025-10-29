import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { format, startOfDay, endOfDay } from 'date-fns';
import { MOCK_MEAL_RECORDS, isMockDogId } from '@/lib/mockData';

export interface MealRecord {
  id: string;
  dog_id: string;
  nutrition_plan_id: string;
  meal_time: string;
  meal_name: string;
  scheduled_date: string;
  completed_at?: string;
  amount_given?: number;
  notes?: string;
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

    // Return ALL mock data for dev mode (not just today, ignore nutrition_plan_id mismatch)
    if (isMockDogId(dogId)) {
      const mockRecords = MOCK_MEAL_RECORDS.filter(r => 
        r.dog_id === dogId
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
      setMealRecords(data || []);
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

  const markMealCompleted = async (mealTime: string, mealName: string, amountGiven?: number) => {
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
          })
          .eq('id', existingRecord.id)
          .select()
          .single();

        if (error) throw error;
        
        const updatedRecord = data as MealRecord;
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
          })
          .select()
          .single();

        if (error) throw error;

        const newRecord = data as MealRecord;
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

  const getTodayProgress = (mealSchedule: any[], mealRecords: MealRecord[], dailyAmount?: number) => {
    if (!mealSchedule || mealSchedule.length === 0) {
      return { consumed: 0, target: 480, percentage: 0 };
    }

    const completedMeals = mealRecords.filter(record => record.completed_at);
    const totalMeals = mealSchedule.length;
    const completedCount = completedMeals.length;
    
    const percentage = totalMeals > 0 ? Math.round((completedCount / totalMeals) * 100) : 0;
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
    getTodayProgress,
    generateTodayMeals,
    refetch: fetchMealRecords,
  };
}