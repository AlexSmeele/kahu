import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfDay, endOfDay } from 'date-fns';
import { toast } from 'sonner';

export interface TreatLog {
  id: string;
  dog_id: string;
  nutrition_plan_id: string | null;
  treat_type: string;
  treat_name: string;
  amount: number;
  unit: string;
  calories: number | null;
  given_at: string;
  given_by: string | null;
  reason: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface TreatSummary {
  totalTreats: number;
  totalCalories: number;
  treatsByType: Record<string, number>;
}

const isMockDogId = (id: string) => id.startsWith('mock-');

export function useTreatTracking(dogId: string | undefined, nutritionPlanId: string | undefined) {
  const [treatLogs, setTreatLogs] = useState<TreatLog[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTreatLogs = useCallback(async (startDate?: Date, endDate?: Date) => {
    if (!dogId) return;
    if (isMockDogId(dogId)) {
      setTreatLogs([]);
      return;
    }

    setLoading(true);
    try {
      let query = supabase
        .from('treat_logs')
        .select('*')
        .eq('dog_id', dogId)
        .order('given_at', { ascending: false });

      if (startDate) {
        query = query.gte('given_at', startOfDay(startDate).toISOString());
      }
      if (endDate) {
        query = query.lte('given_at', endOfDay(endDate).toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;
      setTreatLogs(data || []);
    } catch (error) {
      console.error('Error fetching treat logs:', error);
      toast.error('Failed to load treat logs');
    } finally {
      setLoading(false);
    }
  }, [dogId]);

  useEffect(() => {
    fetchTreatLogs();
  }, [fetchTreatLogs]);

  const addTreat = async (treatData: {
    treat_type: string;
    treat_name: string;
    amount: number;
    unit: string;
    calories?: number;
    given_at?: Date;
    reason?: string;
    notes?: string;
  }) => {
    if (!dogId) return;
    if (isMockDogId(dogId)) {
      toast.error('Cannot add treats for mock data');
      return;
    }

    try {
      const { data: userData } = await supabase.auth.getUser();
      
      const { error } = await supabase.from('treat_logs').insert({
        dog_id: dogId,
        nutrition_plan_id: nutritionPlanId || null,
        treat_type: treatData.treat_type,
        treat_name: treatData.treat_name,
        amount: treatData.amount,
        unit: treatData.unit,
        calories: treatData.calories || null,
        given_at: treatData.given_at?.toISOString() || new Date().toISOString(),
        given_by: userData.user?.id || null,
        reason: treatData.reason || null,
        notes: treatData.notes || null,
      });

      if (error) throw error;

      toast.success('Treat logged successfully');
      await fetchTreatLogs();
    } catch (error) {
      console.error('Error adding treat:', error);
      toast.error('Failed to log treat');
    }
  };

  const deleteTreat = async (treatId: string) => {
    if (!dogId || isMockDogId(dogId)) return;

    try {
      const { error } = await supabase
        .from('treat_logs')
        .delete()
        .eq('id', treatId);

      if (error) throw error;

      toast.success('Treat deleted');
      await fetchTreatLogs();
    } catch (error) {
      console.error('Error deleting treat:', error);
      toast.error('Failed to delete treat');
    }
  };

  const getTodayTreats = useCallback((): TreatLog[] => {
    const today = format(new Date(), 'yyyy-MM-dd');
    return treatLogs.filter(log => 
      format(new Date(log.given_at), 'yyyy-MM-dd') === today
    );
  }, [treatLogs]);

  const getTodaySummary = useCallback((): TreatSummary => {
    const todayTreats = getTodayTreats();
    
    const treatsByType = todayTreats.reduce((acc, treat) => {
      acc[treat.treat_type] = (acc[treat.treat_type] || 0) + treat.amount;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalTreats: todayTreats.length,
      totalCalories: todayTreats.reduce((sum, treat) => sum + (treat.calories || 0), 0),
      treatsByType,
    };
  }, [getTodayTreats]);

  const calculateTreatBudget = useCallback((dailyCalorieTarget?: number): {
    budgetCalories: number;
    usedCalories: number;
    remainingCalories: number;
    percentageUsed: number;
  } => {
    // Treats should be max 10% of daily calorie intake
    const budgetCalories = dailyCalorieTarget ? Math.round(dailyCalorieTarget * 0.1) : 0;
    const todaySummary = getTodaySummary();
    const usedCalories = todaySummary.totalCalories;
    const remainingCalories = Math.max(0, budgetCalories - usedCalories);
    const percentageUsed = budgetCalories > 0 ? (usedCalories / budgetCalories) * 100 : 0;

    return {
      budgetCalories,
      usedCalories,
      remainingCalories,
      percentageUsed: Math.min(100, percentageUsed),
    };
  }, [getTodaySummary]);

  return {
    treatLogs,
    loading,
    addTreat,
    deleteTreat,
    getTodayTreats,
    getTodaySummary,
    calculateTreatBudget,
    refetch: fetchTreatLogs,
  };
}
