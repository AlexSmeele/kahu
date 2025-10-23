import { useMemo } from 'react';
import { useHealthData } from './useHealthData';
import { useActivity } from './useActivity';
import { useTricks } from './useTricks';
import { useGroomingSchedule } from './useGroomingSchedule';
import { useHealthCheckups } from './useHealthCheckups';
import { useVaccines } from './useVaccines';
import { useMedicalTreatments } from './useMedicalTreatments';

export interface HealthAlert {
  id: string;
  type: 'grooming' | 'checkup' | 'vaccination' | 'injury' | 'treatment';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  dueDate?: Date;
}

export interface UpcomingEvent {
  id: string;
  type: 'vet_visit' | 'vaccination' | 'grooming';
  title: string;
  date: Date;
  description?: string;
}

export const useHomeData = (dogId: string) => {
  const { weightData, vaccinationData, vetVisitData, loading: healthLoading } = useHealthData(dogId);
  const { goal, todayProgress, loading: activityLoading } = useActivity(dogId);
  const { dogTricks, loading: tricksLoading } = useTricks(dogId);
  const { schedules: groomingSchedules, loading: groomingLoading } = useGroomingSchedule(dogId);
  const { checkups, loading: checkupsLoading } = useHealthCheckups(dogId);
  const { vaccinationRecords, loading: vaccinesLoading } = useVaccines(dogId);
  const { treatments, loading: treatmentsLoading } = useMedicalTreatments(dogId);

  const loading = healthLoading || activityLoading || tricksLoading || groomingLoading || checkupsLoading || vaccinesLoading || treatmentsLoading;

  // Get next trick to practice
  const nextTrick = useMemo(() => {
    const learningTricks = dogTricks.filter(dt => dt.status === 'learning' || dt.status === 'practicing');
    return learningTricks.length > 0 ? learningTricks[0] : null;
  }, [dogTricks]);

  // Calculate health alerts
  const healthAlerts = useMemo((): HealthAlert[] => {
    const alerts: HealthAlert[] = [];
    const now = new Date();

    // Check grooming schedules
    groomingSchedules.forEach(schedule => {
      if (schedule.next_due_date) {
        const dueDate = new Date(schedule.next_due_date);
        const daysUntilDue = Math.floor((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysUntilDue < 0) {
          alerts.push({
            id: `grooming-${schedule.id}`,
            type: 'grooming',
            title: `${schedule.grooming_type} Overdue`,
            description: `${Math.abs(daysUntilDue)} days overdue`,
            priority: 'high',
            dueDate
          });
        } else if (daysUntilDue <= 3) {
          alerts.push({
            id: `grooming-${schedule.id}`,
            type: 'grooming',
            title: `${schedule.grooming_type} Due Soon`,
            description: `Due in ${daysUntilDue} days`,
            priority: 'medium',
            dueDate
          });
        }
      }
    });

    // Check if checkup is overdue (4+ weeks since last checkup)
    if (checkups.length > 0) {
      const lastCheckup = new Date(checkups[0].checkup_date);
      const daysSinceCheckup = Math.floor((now.getTime() - lastCheckup.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysSinceCheckup > 28) {
        alerts.push({
          id: 'checkup-overdue',
          type: 'checkup',
          title: 'Weekly Checkup Overdue',
          description: `${Math.floor(daysSinceCheckup / 7)} weeks since last checkup`,
          priority: 'medium'
        });
      }
    } else {
      alerts.push({
        id: 'checkup-needed',
        type: 'checkup',
        title: 'First Checkup Needed',
        description: 'No checkups recorded yet',
        priority: 'low'
      });
    }

    // Check vaccinations
    vaccinationRecords.forEach(vax => {
      if (vax.due_date) {
        const dueDate = new Date(vax.due_date);
        const daysUntilDue = Math.floor((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysUntilDue < 0) {
          alerts.push({
            id: `vaccine-${vax.id}`,
            type: 'vaccination',
            title: `Vaccination Overdue`,
            description: `${Math.abs(daysUntilDue)} days overdue`,
            priority: 'high',
            dueDate
          });
        }
      }
    });

    // Check medical treatments (like Cytopoint injections)
    treatments.forEach(treatment => {
      if (treatment.next_due_date) {
        const dueDate = new Date(treatment.next_due_date);
        const daysUntilDue = Math.floor((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysUntilDue < 0) {
          alerts.push({
            id: `treatment-${treatment.id}`,
            type: 'treatment',
            title: `${treatment.treatment_name} Overdue`,
            description: `${Math.abs(daysUntilDue)} days overdue`,
            priority: 'high',
            dueDate
          });
        } else if (daysUntilDue <= 7) {
          alerts.push({
            id: `treatment-${treatment.id}`,
            type: 'treatment',
            title: `${treatment.treatment_name} Due Soon`,
            description: `Due in ${daysUntilDue} days`,
            priority: 'medium',
            dueDate
          });
        }
      }
    });

    // Sort by priority
    return alerts.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }, [groomingSchedules, checkups, vaccinationRecords, treatments]);

  // Get upcoming events
  const upcomingEvents = useMemo((): UpcomingEvent[] => {
    const events: UpcomingEvent[] = [];
    const now = new Date();

    // Add upcoming vaccinations
    vaccinationRecords.forEach(vax => {
      if (vax.due_date) {
        const dueDate = new Date(vax.due_date);
        const daysUntilDue = Math.floor((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysUntilDue >= 0 && daysUntilDue <= 30) {
          events.push({
            id: `vaccine-${vax.id}`,
            type: 'vaccination',
            title: 'Vaccination',
            date: dueDate,
            description: 'Vaccination due'
          });
        }
      }
    });

    // Add upcoming grooming
    groomingSchedules.forEach(schedule => {
      if (schedule.next_due_date) {
        const dueDate = new Date(schedule.next_due_date);
        const daysUntilDue = Math.floor((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysUntilDue >= 0 && daysUntilDue <= 7) {
          events.push({
            id: `grooming-${schedule.id}`,
            type: 'grooming',
            title: schedule.grooming_type,
            date: dueDate,
            description: 'Grooming scheduled'
          });
        }
      }
    });

    // Sort by date
    return events.sort((a, b) => a.date.getTime() - b.date.getTime()).slice(0, 5);
  }, [vaccinationRecords, groomingSchedules]);

  // Calculate quick stats
  const quickStats = useMemo(() => {
    const masteredTricks = dogTricks.filter(dt => dt.status === 'mastered').length;
    const currentWeight = weightData?.current;
    const weightTrend = weightData?.trend || 'stable';

    return {
      currentWeight,
      weightTrend,
      masteredTricks
    };
  }, [dogTricks, weightData]);

  return {
    loading,
    activityGoal: goal,
    activityProgress: todayProgress,
    nextTrick,
    healthAlerts,
    upcomingEvents,
    quickStats
  };
};
