import { useState, useEffect, useMemo } from "react";
import { useHealthData } from "./useHealthData";
import { useActivity } from "./useActivity";
import { useMealTracking } from "./useMealTracking";
import { useNutrition } from "./useNutrition";
import { useGroomingSchedule } from "./useGroomingSchedule";
import { useVetVisits } from "./useVetVisits";
import { useVaccines } from "./useVaccines";
import { useHealthCheckups } from "./useHealthCheckups";
import { useMedicalTreatments } from "./useMedicalTreatments";
import { useTreatTracking } from "./useTreatTracking";
import { 
  Activity, 
  Apple, 
  Scale, 
  Scissors, 
  Stethoscope, 
  Syringe, 
  Pill,
  Droplet,
  Calendar,
  Cookie,
  LucideIcon
} from "lucide-react";

export interface TimelineEvent {
  id: string;
  type: 'activity' | 'meal' | 'weight' | 'grooming' | 'vet_visit' | 'vaccination' | 'checkup' | 'treatment' | 'treat' | 'bowl_cleaning' | 'injury';
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

// Helper function to normalize dates to start of day for accurate comparison
const normalizeToStartOfDay = (date: Date): Date => {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
};

export function useWellnessTimeline(dogId: string) {
  const [timelineData, setTimelineData] = useState<TimelineDay[]>([]);
  const [allEvents, setAllEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFullTimeline, setShowFullTimeline] = useState(false);

  const { records: activityRecords, goal } = useActivity(dogId);
  const { nutritionPlan } = useNutrition(dogId);
  const { mealRecords } = useMealTracking(dogId, nutritionPlan?.id);
  const { weightData, recentRecords } = useHealthData(dogId);
  const { schedules: groomingSchedules } = useGroomingSchedule(dogId);
  const { visits: vetVisits } = useVetVisits(dogId);
  const { vaccinationRecords } = useVaccines(dogId);
  const { checkups } = useHealthCheckups(dogId);
  const { treatments } = useMedicalTreatments(dogId);
  const { treatLogs } = useTreatTracking(dogId, nutritionPlan?.id);

  useEffect(() => {
    const generateTimeline = () => {
      setLoading(true);
      const events: TimelineEvent[] = [];

      // Activity records
      activityRecords?.forEach((record: any) => {
        const start = new Date(record.start_time);
        // Skip future-dated activities; only past activities are considered completed
        if (start > new Date()) return;
        events.push({
          id: `activity-${record.id}`,
          type: 'activity',
          title: record.activity_type?.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) || 'Activity',
          timestamp: start,
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

      // Meal records - show completed and upcoming (next 24 hours)
      const currentTime = new Date();
      const twentyFourHoursFromNow = new Date(currentTime.getTime() + 24 * 60 * 60 * 1000);
      
      mealRecords?.forEach((record: any) => {
        // Show completed meals (only if completed_at is in the past)
        if (record.completed_at) {
          const completedTime = new Date(record.completed_at);
          
          // Only show as completed if the time has actually passed
          if (completedTime <= currentTime) {
            const metrics = [];
            if (record.amount_given) metrics.push({ label: 'Given', value: `${Number(record.amount_given).toFixed(1)} cups` });
            if (record.amount_consumed) metrics.push({ label: 'Consumed', value: `${Number(record.amount_consumed).toFixed(1)} cups` });
            if (record.percentage_eaten) metrics.push({ label: 'Eaten', value: `${record.percentage_eaten}%` });
            
            events.push({
              id: `meal-${record.id}`,
              type: 'meal',
              title: record.meal_name,
              timestamp: completedTime,
              icon: Apple,
              status: 'completed',
              metrics: metrics.length > 0 ? metrics : undefined,
              details: record,
            });
          }
        } else {
          // Show scheduled meals in next 24 hours
          try {
            const scheduledDateTime = new Date(`${record.scheduled_date}T${record.meal_time}`);
            
            if (scheduledDateTime >= currentTime && scheduledDateTime <= twentyFourHoursFromNow) {
              events.push({
                id: `meal-${record.id}-scheduled`,
                type: 'meal',
                title: record.meal_name,
                timestamp: scheduledDateTime,
                icon: Apple,
                status: scheduledDateTime < currentTime ? 'overdue' : 'upcoming',
                metrics: record.amount_planned 
                  ? [{ label: 'Planned', value: `${Number(record.amount_planned).toFixed(1)} cups` }]
                  : undefined,
                details: record,
              });
            }
          } catch (e) {
            console.error('Error parsing meal schedule:', e);
          }
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
            title: schedule.grooming_type,
            timestamp: new Date(schedule.last_completed_at),
            icon: Scissors,
            status: 'completed',
            details: schedule,
          });
        }
        if (schedule.next_due_date) {
          const dueDate = new Date(schedule.next_due_date);
          const now = new Date();
          const normalizedDue = normalizeToStartOfDay(dueDate);
          const normalizedNow = normalizeToStartOfDay(now);
          events.push({
            id: `grooming-${schedule.id}-due`,
            type: 'grooming',
            title: schedule.grooming_type,
            timestamp: dueDate,
            icon: Scissors,
            status: normalizedDue < normalizedNow ? 'overdue' : 'upcoming',
            details: schedule,
          });
        }
      });

      // Vet visits
      vetVisits?.forEach((visit: any) => {
        const visitDate = new Date(visit.date);
        const now = new Date();
        const normalizedVisit = normalizeToStartOfDay(visitDate);
        const normalizedNow = normalizeToStartOfDay(now);
        events.push({
          id: `vet-${visit.id}`,
          type: 'vet_visit',
          title: visit.title || 'Vet Visit',
          timestamp: visitDate,
          icon: Stethoscope,
          status: normalizedVisit > normalizedNow ? 'upcoming' : 'completed',
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
          const normalizedDue = normalizeToStartOfDay(dueDate);
          const normalizedNow = normalizeToStartOfDay(now);
          if (normalizedDue >= normalizedNow) {
            events.push({
              id: `vaccine-${record.id}-due`,
              type: 'vaccination',
              title: record.vaccine?.name || 'Vaccination',
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
          const normalizedDue = normalizeToStartOfDay(dueDate);
          const normalizedNow = normalizeToStartOfDay(now);
          events.push({
            id: `treatment-${treatment.id}-due`,
            type: 'treatment',
            title: treatment.treatment_name,
            timestamp: dueDate,
            icon: Pill,
            status: normalizedDue < normalizedNow ? 'overdue' : 'upcoming',
            details: treatment,
          });
        }
      });

      // Bowl cleaning events
      if (nutritionPlan?.bowl_last_cleaned) {
        events.push({
          id: `food-bowl-cleaned-${nutritionPlan.bowl_last_cleaned}`,
          type: 'bowl_cleaning',
          title: 'Food Bowl Cleaned',
          timestamp: new Date(nutritionPlan.bowl_last_cleaned),
          icon: Droplet,
          status: 'completed',
        });
      }

      if (nutritionPlan?.water_bowl_last_cleaned) {
        events.push({
          id: `water-bowl-cleaned-${nutritionPlan.water_bowl_last_cleaned}`,
          type: 'bowl_cleaning',
          title: 'Water Bowl Cleaned',
          timestamp: new Date(nutritionPlan.water_bowl_last_cleaned),
          icon: Droplet,
          status: 'completed',
        });
      }

      // Treat logs
      treatLogs?.forEach((treat: any) => {
        events.push({
          id: `treat-${treat.id}`,
          type: 'treat',
          title: treat.treat_name,
          timestamp: new Date(treat.given_at),
          icon: Cookie,
          status: 'completed',
          metrics: [
            { label: 'Amount', value: `${treat.amount} ${treat.unit}` },
            ...(treat.calories ? [{ label: 'Calories', value: `${treat.calories} cal` }] : []),
          ],
          details: treat,
        });
      });

      // Store all events before applying any limits (for urgent alerts)
      setAllEvents(events);

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

      // Sort events within each day (newest to oldest)
      groupedEvents.forEach((events) => {
        events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
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
    treatLogs,
    showFullTimeline
  ]);

  const urgentAlerts = useMemo(() => {
    const alerts: Array<{ 
      type: string; 
      title: string; 
      description: string;
      eventId?: string;
      metadata?: any;
    }> = [];
    const now = new Date();
    
    // Filter only overdue events from ALL events (not just the limited timeline display)
    const overdueEvents = allEvents.filter(event => event.status === 'overdue');
    
    // Transform to alert format
    overdueEvents.forEach(event => {
      const daysOverdue = Math.floor((now.getTime() - event.timestamp.getTime()) / (1000 * 60 * 60 * 24));
      
      // Get the ID based on event type
      const eventId = event.type === 'activity' 
        ? event.metadata?.activityId 
        : event.details?.id;
      
      alerts.push({
        type: event.type,
        title: event.title,
        description: daysOverdue === 0 ? 'Due today' : `${daysOverdue} days overdue`,
        eventId,
        metadata: event.metadata
      });
    });
    
    // Sort by priority (vaccination/treatment > grooming > checkup > meal)
    const priorityOrder: Record<string, number> = {
      vaccination: 0,
      treatment: 1,
      grooming: 2,
      checkup: 3,
      meal: 4
    };
    
    return alerts.sort((a, b) => {
      const priorityDiff = (priorityOrder[a.type] || 99) - (priorityOrder[b.type] || 99);
      if (priorityDiff !== 0) return priorityDiff;
      
      // If same priority, sort by days overdue (most overdue first)
      const aMatch = a.description.match(/(\d+) days overdue/);
      const bMatch = b.description.match(/(\d+) days overdue/);
      const aDays = aMatch ? parseInt(aMatch[1]) : 0;
      const bDays = bMatch ? parseInt(bMatch[1]) : 0;
      return bDays - aDays;
    });
  }, [allEvents]);

  // Calculate today's activity progress from the same timeline data
  const todayProgress = useMemo(() => {
    // Filter today's completed activity events from timeline
    const todayActivities = timelineData
      .filter(day => day.isToday)
      .flatMap(day => day.events)
      .filter(event => event.type === 'activity' && event.status === 'completed');
    
    // Calculate totals from the same data displayed in timeline
    const totalMinutes = todayActivities.reduce((sum, event) => {
      const minutes = event.metrics?.find(m => m.label === 'Duration')?.value;
      return sum + (minutes ? parseInt(minutes) : 0);
    }, 0);
    
    const totalDistance = todayActivities.reduce((sum, event) => {
      const distance = event.metrics?.find(m => m.label === 'Distance')?.value;
      return sum + (distance ? parseFloat(distance) : 0);
    }, 0);
    
    const totalCalories = todayActivities.reduce((sum, event) => {
      const calories = event.metrics?.find(m => m.label === 'Calories')?.value;
      return sum + (calories ? parseInt(calories) : 0);
    }, 0);
    
    return {
      minutes: totalMinutes,
      distance: totalDistance,
      calories: totalCalories
    };
  }, [timelineData]);

  return {
    timelineData,
    loading,
    showFullTimeline,
    setShowFullTimeline,
    urgentAlerts,
    todayProgress,
    activityGoal: goal,
  };
}
