import { useState } from 'react';
import { DogSwitcher } from "@/components/dogs/DogSwitcher";
import { ActivityProgressCard } from "@/components/home/ActivityProgressCard";
import { TrainingScheduleCard } from "@/components/home/TrainingScheduleCard";
import { HealthAlertsCard } from "@/components/home/HealthAlertsCard";
import { UpcomingEventsCard } from "@/components/home/UpcomingEventsCard";
import { QuickStatsCard } from "@/components/home/QuickStatsCard";
import { GetAdviceCard } from "@/components/home/GetAdviceCard";
import { useHomeData } from "@/hooks/useHomeData";
import { Skeleton } from "@/components/ui/skeleton";
import { ActivityMonitor } from "@/components/health/ActivityMonitor";
import { TrainerScreenVariantSelector } from "@/components/screens/TrainerScreenVariantSelector";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { TabType } from "@/components/layout/BottomNavigation";

interface HomeScreenProps {
  selectedDogId: string;
  onDogChange: (dogId: string) => void;
  onTabChange: (tab: TabType) => void;
}

export function HomeScreen({ selectedDogId, onDogChange, onTabChange }: HomeScreenProps) {
  const [showActivityMonitor, setShowActivityMonitor] = useState(false);
  const [showTrainer, setShowTrainer] = useState(false);
  
  const {
    loading,
    activityGoal,
    activityProgress,
    nextTrick,
    healthAlerts,
    upcomingEvents,
    quickStats
  } = useHomeData(selectedDogId);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="container py-3">
            <DogSwitcher selectedDogId={selectedDogId} onDogChange={onDogChange} />
          </div>
        </div>
        
        <div className="container py-6 space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-background pb-20">
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="container py-3">
            <DogSwitcher selectedDogId={selectedDogId} onDogChange={onDogChange} />
          </div>
        </div>

        <div className="container py-6 space-y-4">
          <div>
            <h1 className="text-2xl font-bold">
              {getGreeting()}!
            </h1>
            <p className="text-sm text-muted-foreground">Here's your daily overview</p>
          </div>

          {/* Activity Progress */}
          {activityGoal && (
            <ActivityProgressCard
              targetMinutes={activityGoal.target_minutes}
              completedMinutes={activityProgress.minutes}
              targetDistance={activityGoal.target_distance_km}
              completedDistance={activityProgress.distance}
              onLogActivity={() => setShowActivityMonitor(true)}
            />
          )}

          {/* Next Training Session */}
          {nextTrick && (
            <TrainingScheduleCard
              trickName={nextTrick.trick?.name || 'Unknown'}
              totalSessions={nextTrick.total_sessions}
              difficulty={nextTrick.trick?.difficulty_level || 1}
              onPracticeNow={() => onTabChange('tricks')}
              onClick={() => onTabChange('tricks')}
            />
          )}

          {/* Health Alerts */}
          <HealthAlertsCard
            alerts={healthAlerts}
            onClick={() => onTabChange('health')}
          />

          {/* Upcoming Events */}
          <UpcomingEventsCard
            events={upcomingEvents}
            onClick={() => onTabChange('health')}
          />

          {/* Get Advice */}
          <GetAdviceCard onClick={() => setShowTrainer(true)} />

          {/* Quick Stats */}
          <QuickStatsCard
            currentWeight={quickStats.currentWeight}
            weightTrend={quickStats.weightTrend as 'up' | 'down' | 'stable' | undefined}
            masteredTricks={quickStats.masteredTricks}
            onClick={() => onTabChange('health')}
          />
        </div>
      </div>

      <Dialog open={showActivityMonitor} onOpenChange={setShowActivityMonitor}>
        <DialogContent className="max-w-[min(95vw,900px)] max-h-[85vh] overflow-y-auto">
          <ActivityMonitor dogId={selectedDogId} />
        </DialogContent>
      </Dialog>

      <Dialog open={showTrainer} onOpenChange={setShowTrainer}>
        <DialogContent className="max-w-[min(95vw,900px)] h-[85vh] max-h-[85vh] p-0 flex flex-col overflow-hidden">
          <TrainerScreenVariantSelector />
        </DialogContent>
      </Dialog>
    </>
  );
}
