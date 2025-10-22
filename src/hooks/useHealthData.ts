import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { WeightRecord } from "./useWeightRecords";
import { formatDistanceToNow } from "date-fns";
import { logger } from "@/lib/logger";
import { MOCK_WEIGHT_RECORDS, MOCK_HEALTH_RECORDS, MOCK_GROOMING_SCHEDULES, MOCK_HEALTH_CHECKUPS, MOCK_VACCINATION_RECORDS, MOCK_TRAINING_SESSIONS, isMockDogId } from "@/lib/mockData";

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

export interface VaccinationData {
  dueCount: number;
  upcoming?: string;
  total: number;
}

export interface VetVisitData {
  lastVisit?: string;
  total: number;
}

export interface GroomingData {
  overdue: number;
  nextDue?: string;
  total: number;
}

export interface CheckupData {
  lastCheckup?: string;
  weeksSinceCheckup: number;
  total: number;
}

export function useHealthData(dogId: string) {
  const [weightData, setWeightData] = useState<WeightData | null>(null);
  const [recentRecords, setRecentRecords] = useState<RecentRecord[]>([]);
  const [healthRecordsCount, setHealthRecordsCount] = useState(0);
  const [vaccinationData, setVaccinationData] = useState<VaccinationData | null>(null);
  const [vetVisitData, setVetVisitData] = useState<VetVisitData | null>(null);
  const [groomingData, setGroomingData] = useState<GroomingData | null>(null);
  const [checkupData, setCheckupData] = useState<CheckupData | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchWeightData = async () => {
    if (!dogId) return;

    // Return mock data for dev mode
    if (isMockDogId(dogId)) {
      const weightRecords = MOCK_WEIGHT_RECORDS.filter(r => r.dog_id === dogId).slice(0, 2);
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
      return;
    }

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
      } else {
        setWeightData(null);
      }
    } catch (error) {
      console.error('Error fetching weight data:', error);
    }
  };

  const fetchRecentRecords = async () => {
    if (!dogId) return;

    // Return mock data for dev mode
    if (isMockDogId(dogId)) {
      const records: RecentRecord[] = [];
      const weightRecords = MOCK_WEIGHT_RECORDS.filter(r => r.dog_id === dogId).slice(0, 3);
      const healthRecords = MOCK_HEALTH_RECORDS.filter(r => r.dog_id === dogId).slice(0, 3);
      
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
      
      records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setRecentRecords(records.slice(0, 5));
      return;
    }

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
      }

      // Fetch recent training sessions
      const { data: trainingSessions } = isMockDogId(dogId) 
        ? { data: MOCK_TRAINING_SESSIONS.filter(s => s.dog_id === dogId).slice(0, 2) }
        : await supabase
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

    // Return mock data for dev mode
    if (isMockDogId(dogId)) {
      const count = MOCK_HEALTH_RECORDS.filter(r => r.dog_id === dogId).length;
      setHealthRecordsCount(count);
      return;
    }

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

  const fetchVaccinationData = async () => {
    if (!dogId) return;

    // Return mock data for dev mode
    if (isMockDogId(dogId)) {
      const vaccinationRecords = MOCK_VACCINATION_RECORDS.filter(r => r.dog_id === dogId);
      if (vaccinationRecords && vaccinationRecords.length > 0) {
        let dueCount = 0;
        vaccinationRecords.forEach(record => {
          if (record.due_date) {
            const dueDate = new Date(record.due_date);
            const now = new Date();
            if (dueDate < now) {
              dueCount++;
            }
          }
        });
        
        setVaccinationData({
          dueCount,
          total: vaccinationRecords.length,
          upcoming: dueCount > 0 ? 'Review schedule' : 'Up to date'
        });
      } else {
        setVaccinationData({ dueCount: 0, total: 0, upcoming: 'Up to date' });
      }
      return;
    }

    try {
      const { data: vaccinationRecords, error } = await supabase
        .from('vaccination_records')
        .select(`
          *,
          vaccine:vaccines(*)
        `)
        .eq('dog_id', dogId)
        .order('administered_date', { ascending: false });

      if (error) throw error;

      if (vaccinationRecords && vaccinationRecords.length > 0) {
        // Count vaccines that might be due
        let dueCount = 0;
        let nextVaccine = '';
        
        // Get core vaccines that should be given
        const { data: coreVaccines } = await supabase
          .from('vaccines')
          .select('*')
          .eq('vaccine_type', 'core');

        if (coreVaccines) {
          // Check if core vaccines are up to date
          for (const vaccine of coreVaccines) {
            const latestRecord = vaccinationRecords
              .filter(r => r.vaccine_id === vaccine.id)
              .sort((a, b) => new Date(b.administered_date).getTime() - new Date(a.administered_date).getTime())[0];
            
            if (!latestRecord) {
              dueCount++;
              if (!nextVaccine) nextVaccine = vaccine.name;
            } else if (latestRecord.due_date) {
              const dueDate = new Date(latestRecord.due_date);
              const now = new Date();
              if (dueDate < now) {
                dueCount++;
                if (!nextVaccine) nextVaccine = vaccine.name;
              }
            }
          }
        }

        setVaccinationData({
          dueCount,
          total: vaccinationRecords.length,
          upcoming: dueCount > 0 ? `${nextVaccine} - Review schedule` : 'Up to date'
        });
      } else {
        // No vaccination records, assume core vaccines are needed
        setVaccinationData({
          dueCount: 2, // Rabies and DHPP are typically core
          total: 0,
          upcoming: 'Core vaccines needed'
        });
      }
    } catch (error) {
      console.error('Error fetching vaccination data:', error);
      setVaccinationData({
        dueCount: 0,
        total: 0,
        upcoming: undefined
      });
    }
  };

  const fetchVetVisitData = async () => {
    if (!dogId) return;

    // Return mock data for dev mode
    if (isMockDogId(dogId)) {
      const vetVisits = MOCK_HEALTH_RECORDS.filter(r => r.dog_id === dogId && r.record_type === 'vet_visit');
      if (vetVisits && vetVisits.length > 0) {
        const lastVisit = vetVisits[0];
        setVetVisitData({
          lastVisit: formatDistanceToNow(new Date(lastVisit.date), { addSuffix: true }),
          total: vetVisits.length
        });
      } else {
        setVetVisitData({ total: 0 });
      }
      return;
    }

    try {
      const { data: vetVisits, error } = await supabase
        .from('health_records')
        .select('*')
        .eq('dog_id', dogId)
        .eq('record_type', 'vet_visit')
        .order('date', { ascending: false })
        .limit(1);

      if (error) throw error;

      if (vetVisits && vetVisits.length > 0) {
        const lastVisit = vetVisits[0];
        setVetVisitData({
          lastVisit: formatDistanceToNow(new Date(lastVisit.date), { addSuffix: true }),
          total: 1 // We'd count all visits in a real implementation
        });
      } else {
        setVetVisitData({
          total: 0
        });
      }
    } catch (error) {
      console.error('Error fetching vet visit data:', error);
    }
  };

  const fetchGroomingData = async () => {
    if (!dogId) return;

    // Return mock data for dev mode
    if (isMockDogId(dogId)) {
      const schedules = MOCK_GROOMING_SCHEDULES.filter(s => s.dog_id === dogId);
      if (schedules && schedules.length > 0) {
        const now = new Date();
        let overdueCount = 0;
        let nextDue: Date | null = null;

        schedules.forEach(schedule => {
          if (schedule.next_due_date) {
            const dueDate = new Date(schedule.next_due_date);
            if (dueDate < now) {
              overdueCount++;
            } else if (!nextDue || dueDate < nextDue) {
              nextDue = dueDate;
            }
          }
        });

        setGroomingData({
          overdue: overdueCount,
          nextDue: nextDue ? formatDistanceToNow(nextDue, { addSuffix: true }) : undefined,
          total: schedules.length
        });
      } else {
        setGroomingData({ overdue: 0, total: 0 });
      }
      return;
    }

    try {
      const { data: schedules, error } = await supabase
        .from('grooming_schedules')
        .select('*')
        .eq('dog_id', dogId);

      if (error) throw error;

      if (schedules && schedules.length > 0) {
        const now = new Date();
        let overdueCount = 0;
        let nextDue: Date | null = null;

        schedules.forEach(schedule => {
          if (schedule.next_due_date) {
            const dueDate = new Date(schedule.next_due_date);
            if (dueDate < now) {
              overdueCount++;
            } else if (!nextDue || dueDate < nextDue) {
              nextDue = dueDate;
            }
          }
        });

        setGroomingData({
          overdue: overdueCount,
          nextDue: nextDue ? formatDistanceToNow(nextDue, { addSuffix: true }) : undefined,
          total: schedules.length
        });
      } else {
        setGroomingData({
          overdue: 0,
          total: 0
        });
      }
    } catch (error) {
      console.error('Error fetching grooming data:', error);
    }
  };

  const fetchCheckupData = async () => {
    if (!dogId) return;

    // Return mock data for dev mode
    if (isMockDogId(dogId)) {
      const checkups = MOCK_HEALTH_CHECKUPS.filter(c => c.dog_id === dogId);
      if (checkups && checkups.length > 0) {
        const lastCheckup = checkups[0];
        const lastDate = new Date(lastCheckup.checkup_date);
        const now = new Date();
        const weeksSince = Math.floor((now.getTime() - lastDate.getTime()) / (7 * 24 * 60 * 60 * 1000));

        setCheckupData({
          lastCheckup: formatDistanceToNow(lastDate, { addSuffix: true }),
          weeksSinceCheckup: weeksSince,
          total: checkups.length
        });
      } else {
        setCheckupData({
          weeksSinceCheckup: 999,
          total: 0
        });
      }
      return;
    }

    try {
      const { data: checkups, error } = await supabase
        .from('health_checkups')
        .select('*')
        .eq('dog_id', dogId)
        .order('checkup_date', { ascending: false })
        .limit(1);

      if (error) throw error;

      if (checkups && checkups.length > 0) {
        const lastCheckup = checkups[0];
        const lastDate = new Date(lastCheckup.checkup_date);
        const now = new Date();
        const weeksSince = Math.floor((now.getTime() - lastDate.getTime()) / (7 * 24 * 60 * 60 * 1000));

        setCheckupData({
          lastCheckup: formatDistanceToNow(lastDate, { addSuffix: true }),
          weeksSinceCheckup: weeksSince,
          total: checkups.length
        });
      } else {
        setCheckupData({
          weeksSinceCheckup: 999, // Large number to indicate never done
          total: 0
        });
      }
    } catch (error) {
      console.error('Error fetching checkup data:', error);
    }
  };

  const fetchAllData = async () => {
    logger.info('useHealthData: Fetching all health data', { dogId });
    setLoading(true);
    try {
      await Promise.all([
        fetchWeightData(),
        fetchRecentRecords(),
        fetchHealthRecordsCount(),
        fetchVaccinationData(),
        fetchVetVisitData(),
        fetchGroomingData(),
        fetchCheckupData(),
      ]);
      logger.info('useHealthData: Successfully fetched all health data', { dogId });
    } catch (error) {
      logger.error('useHealthData: Error fetching health data', error, { dogId });
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
    vaccinationData,
    vetVisitData,
    groomingData,
    checkupData,
    loading,
    refetch: fetchAllData,
  };
}