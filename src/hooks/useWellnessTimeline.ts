import { useState, useEffect } from "react";
import { useHealthData } from "./useHealthData";
import { useActivity } from "./useActivity";
import { useMealTracking } from "./useMealTracking";
import { useNutrition } from "./useNutrition";
import { useGroomingSchedule } from "./useGroomingSchedule";
import { useVetVisits } from "./useVetVisits";
import { useVaccines } from "./useVaccines";
import { useHealthCheckups } from "./useHealthCheckups";
import { useMedicalTreatments } from "./useMedicalTreatments";
import { 
  Activity, 
  Apple, 
  Scale, 
  Scissors, 
  Stethoscope, 
  Syringe, 
  Pill,
  Calendar,
  LucideIcon
} from "lucide-react";

export interface TimelineEvent {
  id: string;
  type: 'activity' | 'meal' | 'weight' | 'grooming' | 'vet_visit' | 'vaccination' | 'checkup' | 'treatment';
  title: string;
  timestamp: Date;
  icon: LucideIcon;
  metrics?: { label: string; value: string; icon?: LucideIcon }[];
  status: 'completed' | 'upcoming' | 'overdue';
  details?: any;
  metadata?: {
    activityId?: string;
    [key: string]: any;
  };
}

export interface TimelineDay {
  date: Date;
  label: string;
  events: TimelineEvent[];
  isToday: boolean;
  isYesterday: boolean;
}

export function useWellnessTimeline(dogId: string) {
  const [timelineData, setTimelineData] = useState<TimelineDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFullTimeline, setShowFullTimeline] = useState(false);

  const { records: activityRecords } = useActivity(dogId);
  const { nutritionPlan } = useNutrition(dogId);
  const { mealRecords } = useMealTracking(dogId, nutritionPlan?.id);
  const { weightData, recentRecords } = useHealthData(dogId);
  const { schedules: groomingSchedules } = useGroomingSchedule(dogId);
  const { visits: vetVisits } = useVetVisits(dogId);
  const { vaccinationRecords } = useVaccines(dogId);
  const { checkups } = useHealthCheckups(dogId);
  const { treatments } = useMedicalTreatments(dogId);

  useEffect(() => {
    const generateTimeline = () => {
      setLoading(true);
      const events: TimelineEvent[] = [];

      // Activity records
      activityRecords?.forEach((record: any) => {
        events.push({
          id: `activity-${record.id}`,
          type: 'activity',
          title: record.activity_type?.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) || 'Activity',
          timestamp: new Date(record.start_time),
          icon: Activity,
          status: 'completed',
          metrics: [
            { label: 'Duration', value: `${record.duration_minutes || 0}m` },
            ...(record.distance_km ? [{ label: 'Distance', value: `${record.distance_km} km` }] : []),
            ...(record.calories_burned ? [{ label: 'Calories', value: `${record.calories_burned} Cal` }] : []),
          ],
          details: record,
          metadata: {
            activityId: record.id,
          },
        });
      });

      // Meal records
      mealRecords?.forEach((record: any) => {
        if (record.completed_at) {
          events.push({
            id: `meal-${record.id}`,
            type: 'meal',
            title: record.meal_name,
            timestamp: new Date(record.completed_at),
            icon: Apple,
            status: 'completed',
            metrics: record.amount_given ? [{ label: 'Amount', value: `${record.amount_given} cups` }] : undefined,
            details: record,
          });
        }
      });

      // Weight records (from recent records)
      recentRecords?.filter(r => r.type === 'weight').forEach((record: any) => {
        events.push({
          id: `weight-${record.id}`,
          type: 'weight',
          title: 'Weight Recorded',
          timestamp: new Date(record.date),
          icon: Scale,
          status: 'completed',
          metrics: [{ label: 'Weight', value: record.value }],
          details: record,
        });
      });

      // Grooming schedules
      groomingSchedules?.forEach((schedule: any) => {
        if (schedule.last_completed_at) {
          events.push({
            id: `grooming-${schedule.id}-completed`,
            type: 'grooming',
            title: `${schedule.grooming_type} Grooming`,
            timestamp: new Date(schedule.last_completed_at),
            icon: Scissors,
            status: 'completed',
            details: schedule,
          });
        }
        if (schedule.next_due_date) {
          const dueDate = new Date(schedule.next_due_date);
          const now = new Date();
          events.push({
            id: `grooming-${schedule.id}-due`,
            type: 'grooming',
            title: `${schedule.grooming_type} Grooming Due`,
            timestamp: dueDate,
            icon: Scissors,
            status: dueDate < now ? 'overdue' : 'upcoming',
            details: schedule,
          });
        }
      });

      // Vet visits
      vetVisits?.forEach((visit: any) => {
        events.push({
          id: `vet-${visit.id}`,
          type: 'vet_visit',
          title: visit.title || 'Vet Visit',
          timestamp: new Date(visit.date),
          icon: Stethoscope,
          status: new Date(visit.date) > new Date() ? 'upcoming' : 'completed',
          metrics: visit.veterinarian ? [{ label: 'Vet', value: visit.veterinarian }] : undefined,
          details: visit,
        });
      });

      // Vaccinations
      vaccinationRecords?.forEach((record: any) => {
        events.push({
          id: `vaccine-${record.id}`,
          type: 'vaccination',
          title: record.vaccine?.name || 'Vaccination',
          timestamp: new Date(record.administered_date),
          icon: Syringe,
          status: 'completed',
          details: record,
        });
        if (record.due_date) {
          const dueDate = new Date(record.due_date);
          const now = new Date();
          if (dueDate >= now) {
            events.push({
              id: `vaccine-${record.id}-due`,
              type: 'vaccination',
              title: `${record.vaccine?.name || 'Vaccination'} Due`,
              timestamp: dueDate,
              icon: Syringe,
              status: 'upcoming',
              details: record,
            });
          }
        }
      });

      // Health checkups
      checkups?.forEach((checkup: any) => {
        events.push({
          id: `checkup-${checkup.id}`,
          type: 'checkup',
          title: 'Health Checkup',
          timestamp: new Date(checkup.checkup_date),
          icon: Stethoscope,
          status: 'completed',
          metrics: checkup.body_condition_score ? [{ label: 'BCS', value: `${checkup.body_condition_score}/9` }] : undefined,
          details: checkup,
        });
      });

      // Medical treatments
      treatments?.forEach((treatment: any) => {
        events.push({
          id: `treatment-${treatment.id}`,
          type: 'treatment',
          title: treatment.treatment_name,
          timestamp: new Date(treatment.last_administered_date),
          icon: Pill,
          status: 'completed',
          details: treatment,
        });
        if (treatment.next_due_date) {
          const dueDate = new Date(treatment.next_due_date);
          const now = new Date();
          events.push({
            id: `treatment-${treatment.id}-due`,
            type: 'treatment',
            title: `${treatment.treatment_name} Due`,
            timestamp: dueDate,
            icon: Pill,
            status: dueDate < now ? 'overdue' : 'upcoming',
            details: treatment,
          });
        }
      });

      // Sort events by timestamp (newest first for past, earliest first for future)
      const now = new Date();
      const pastEvents = events.filter(e => e.timestamp <= now).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      const futureEvents = events.filter(e => e.timestamp > now).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

      // Group events by day
      const groupedEvents = new Map<string, TimelineEvent[]>();
      
      [...pastEvents, ...futureEvents].forEach(event => {
        const dateKey = event.timestamp.toDateString();
        if (!groupedEvents.has(dateKey)) {
          groupedEvents.set(dateKey, []);
        }
        groupedEvents.get(dateKey)!.push(event);
      });

      // Create timeline days
      const timelineDays: TimelineDay[] = [];
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      groupedEvents.forEach((events, dateKey) => {
        const date = new Date(dateKey);
        const isToday = date.toDateString() === today.toDateString();
        const isYesterday = date.toDateString() === yesterday.toDateString();

        let label = '';
        if (isToday) {
          label = 'Today';
        } else if (isYesterday) {
          label = 'Yesterday';
        } else if (date > today) {
          const daysUntil = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          label = daysUntil === 1 ? 'Tomorrow' : `In ${daysUntil} days`;
        } else {
          label = date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
        }

        timelineDays.push({
          date,
          label,
          events,
          isToday,
          isYesterday,
        });
      });

      // Limit to 12 entries (whichever comes first) if not showing full timeline
      let filteredDays = timelineDays;
      if (!showFullTimeline) {
        filteredDays = [];
        let entriesCount = 0;
        
        for (const day of timelineDays) {
          const remainingSlots = 12 - entriesCount;
          if (remainingSlots <= 0) break;
          
          if (day.events.length <= remainingSlots) {
            filteredDays.push(day);
            entriesCount += day.events.length;
          } else {
            // Add partial day with remaining slots
            filteredDays.push({
              ...day,
              events: day.events.slice(0, remainingSlots)
            });
            entriesCount += remainingSlots;
          }
        }
      }

      setTimelineData(filteredDays);
      setLoading(false);
    };

    generateTimeline();
  }, [
    dogId, 
    activityRecords, 
    mealRecords, 
    weightData,
    recentRecords, 
    groomingSchedules, 
    vetVisits, 
    vaccinationRecords, 
    checkups, 
    treatments,
    showFullTimeline
  ]);

  return {
    timelineData,
    loading,
    showFullTimeline,
    setShowFullTimeline,
  };
}
