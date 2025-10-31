import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DogDropdown } from "@/components/dogs/DogDropdown";
import { PageLogo } from "@/components/layout/PageLogo";
import { TodaysGoalsBanner } from "@/components/home/TodaysGoalsBanner";
import { UrgentAlertsBanner } from "@/components/home/UrgentAlertsBanner";
import { ActivityCircleCard } from "@/components/home/ActivityCircleCard";
import { TrainingTile } from "@/components/home/TrainingTile";
import { QuickNoteTile } from "@/components/home/QuickNoteTile";
import { GetAdviceCard } from "@/components/home/GetAdviceCard";
import { AnalyticsCard } from "@/components/home/AnalyticsCard";
import { QuickNoteModal } from "@/components/home/QuickNoteModal";
import { useHomeData } from "@/hooks/useHomeData";
import { useWellnessTimeline } from "@/hooks/useWellnessTimeline";
import { Skeleton } from "@/components/ui/skeleton";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TabType } from "@/components/layout/BottomNavigation";

interface HomeScreenProps {
  selectedDogId: string;
  onDogChange: (dogId: string) => void;
  onTabChange: (tab: TabType) => void;
}

export function HomeScreen({ selectedDogId, onDogChange, onTabChange }: HomeScreenProps) {
  const navigate = useNavigate();
  const [showNoteModal, setShowNoteModal] = useState(false);
  
  const {
    loading,
    nextTrick,
    healthAlerts,
    upcomingEvents,
    quickStats
  } = useHomeData(selectedDogId);

  const { urgentAlerts, todayProgress, activityGoal } = useWellnessTimeline(selectedDogId);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <>
      <div className="bg-background pb-20 pt-4 safe-top relative">
        <div className="pt-16">
          <DogDropdown selectedDogId={selectedDogId} onDogChange={onDogChange} />
          <PageLogo />
          
          {/* Profile Icon */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onTabChange('profile')}
            className="absolute top-4 right-4 rounded-full w-10 h-10"
            aria-label="Profile"
          >
            <User className="w-5 h-5" />
          </Button>
        </div>

          <div className="container pt-4 space-y-4">
          <TodaysGoalsBanner
            nextTrick={nextTrick ? { name: nextTrick.trick?.name || 'Unknown', total_sessions: nextTrick.total_sessions } : undefined}
            onActionClick={() => nextTrick ? onTabChange('tricks') : onTabChange('tricks')}
          />

          {urgentAlerts.length > 0 && (
            <UrgentAlertsBanner alerts={urgentAlerts} onClick={() => onTabChange('wellness')} />
          )}

          <div className="grid grid-cols-2 gap-3">
            <ActivityCircleCard
              completedMinutes={todayProgress?.minutes || 0}
              targetMinutes={activityGoal?.target_minutes || 60}
              onClick={() => navigate(`/record-activity?dogId=${selectedDogId}`)}
            />
            <TrainingTile
              trickName={nextTrick?.trick?.name}
              totalSessions={nextTrick?.total_sessions}
              onClick={() => onTabChange('tricks')}
            />
            <QuickNoteTile onClick={() => setShowNoteModal(true)} />
            <AnalyticsCard />
          </div>
          
          <GetAdviceCard />
        </div>
      </div>

      <QuickNoteModal dogId={selectedDogId} isOpen={showNoteModal} onClose={() => setShowNoteModal(false)} />
    </>
  );
}
