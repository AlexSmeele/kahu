import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { WeightRecord } from "./useWeightRecords";
import { formatDistanceToNow } from "date-fns";

export interface HealthRecord {
  id: string;
  dog_id: string;
  record_type: string;
  title: string;
  description?: string;
  date: string;
  veterinarian?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface TrainingSession {
  id: string;
  dog_id: string;
  trick_id: string;
  session_date: string;
  duration_minutes?: number;
  progress_status?: string;
  success_rating?: number;
  notes?: string;
  created_at: string;
}

export interface RecentRecord {
  id: string;
  type: 'weight' | 'health' | 'training';
  title: string;
  value: string;
  date: string;
  formattedDate: string;
  icon: any;
  color: string;
}

export interface WeightData {
  current: number;
  trend: string;
  lastUpdated: string;
  change: number;
}

export function useHealthData(dogId: string) {
  const [weightData, setWeightData] = useState<WeightData | null>(null);
  const [recentRecords, setRecentRecords] = useState<RecentRecord[]>([]);
  const [healthRecordsCount, setHealthRecordsCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchWeightData = async () => {
    if (!dogId) return;

    try {
      const { data: weightRecords, error } = await supabase
        .from('weight_records')
        .select('*')
        .eq('dog_id', dogId)
        .order('date', { ascending: false })
        .limit(2);

      if (error) throw error;

      if (weightRecords && weightRecords.length > 0) {
        const latest = weightRecords[0];
        const previous = weightRecords[1];
        
        const change = previous ? latest.weight - previous.weight : 0;
        const trend = change > 0 ? `+${change.toFixed(1)}` : change < 0 ? change.toFixed(1) : '0';
        
        setWeightData({
          current: latest.weight,
          change,
          trend: `${trend} kg`,
          lastUpdated: formatDistanceToNow(new Date(latest.date), { addSuffix: true }),
        });
      }
    } catch (error) {
      console.error('Error fetching weight data:', error);
    }
  };

  const fetchRecentRecords = async () => {
    if (!dogId) return;

    try {
      const records: RecentRecord[] = [];

      // Fetch recent weight records
      const { data: weightRecords } = await supabase
        .from('weight_records')
        .select('*')
        .eq('dog_id', dogId)
        .order('date', { ascending: false })
        .limit(3);

      if (weightRecords) {
        weightRecords.forEach((record) => {
          records.push({
            id: record.id,
            type: 'weight',
            title: 'Weight Check',
            value: `${record.weight} kg`,
            date: record.date,
            formattedDate: formatDistanceToNow(new Date(record.date), { addSuffix: true }),
            icon: 'TrendingUp',
            color: 'text-success',
          });
        });
      }

      // Fetch recent health records
      const { data: healthRecords } = await supabase
        .from('health_records')
        .select('*')
        .eq('dog_id', dogId)
        .order('date', { ascending: false })
        .limit(3);

      if (healthRecords) {
        healthRecords.forEach((record) => {
          records.push({
            id: record.id,
            type: 'health',
            title: record.title,
            value: record.record_type === 'vaccination' ? 'Completed' : 
                   record.record_type === 'vet_visit' ? 'Visit' : 'Note',
            date: record.date,
            formattedDate: formatDistanceToNow(new Date(record.date), { addSuffix: true }),
            icon: record.record_type === 'vaccination' ? 'Calendar' : 
                  record.record_type === 'vet_visit' ? 'Heart' : 'AlertCircle',
            color: record.record_type === 'vaccination' ? 'text-primary' : 
                   record.record_type === 'vet_visit' ? 'text-destructive' : 'text-warning',
          });
        });
        setHealthRecordsCount(healthRecords.length);
      }

      // Fetch recent training sessions
      const { data: trainingSessions } = await supabase
        .from('training_sessions')
        .select('*')
        .eq('dog_id', dogId)
        .order('session_date', { ascending: false })
        .limit(2);

      if (trainingSessions) {
        trainingSessions.forEach((session) => {
          records.push({
            id: session.id,
            type: 'training',
            title: 'Training Session',
            value: session.progress_status || 'Practiced',
            date: session.session_date,
            formattedDate: formatDistanceToNow(new Date(session.session_date), { addSuffix: true }),
            icon: 'Award',
            color: 'text-primary',
          });
        });
      }

      // Sort all records by date and take the most recent 5
      records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setRecentRecords(records.slice(0, 5));

    } catch (error) {
      console.error('Error fetching recent records:', error);
      toast({
        title: "Error",
        description: "Failed to load recent records",
        variant: "destructive",
      });
    }
  };

  const fetchHealthRecordsCount = async () => {
    if (!dogId) return;

    try {
      const { count, error } = await supabase
        .from('health_records')
        .select('*', { count: 'exact', head: true })
        .eq('dog_id', dogId);

      if (error) throw error;
      setHealthRecordsCount(count || 0);
    } catch (error) {
      console.error('Error fetching health records count:', error);
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchWeightData(),
        fetchRecentRecords(),
        fetchHealthRecordsCount(),
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [dogId]);

  return {
    weightData,
    recentRecords,
    healthRecordsCount,
    loading,
    refetch: fetchAllData,
  };
}