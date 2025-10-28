import { useState } from 'react';
import { DogDropdown } from "@/components/dogs/DogDropdown";
import { PageLogo } from "@/components/layout/PageLogo";
import { TodaysGoalsBanner } from "@/components/home/TodaysGoalsBanner";
import { UrgentAlertsBanner } from "@/components/home/UrgentAlertsBanner";
import { ActivityCircleCard } from "@/components/home/ActivityCircleCard";
import { TrainingTile } from "@/components/home/TrainingTile";
import { QuickNoteTile } from "@/components/home/QuickNoteTile";
import { GetAdviceCard } from "@/components/home/GetAdviceCard";
import { ActivityRecordModal } from "@/components/home/ActivityRecordModal";
import { QuickNoteModal } from "@/components/home/QuickNoteModal";
import { EditActivityGoalModal } from "@/components/home/EditActivityGoalModal";
import { useHomeData } from "@/hooks/useHomeData";
import { useActivity } from "@/hooks/useActivity";
import { Skeleton } from "@/components/ui/skeleton";
import type { TabType } from "@/components/layout/BottomNavigation";

interface HomeScreenProps {
  selectedDogId: string;
  onDogChange: (dogId: string) => void;
  onTabChange: (tab: TabType) => void;
}

export function HomeScreen({ selectedDogId, onDogChange, onTabChange }: HomeScreenProps) {
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showEditGoalModal, setShowEditGoalModal] = useState(false);
  
  const {
    loading,
    activityGoal,
    activityProgress,
    nextTrick,
    healthAlerts,
    upcomingEvents,
    quickStats
  } = useHomeData(selectedDogId);

  const { updateGoal } = useActivity(selectedDogId);

  const handleUpdateGoal = async (targetMinutes: number) => {
    return await updateGoal({ target_minutes: targetMinutes });
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const urgentAlerts = healthAlerts.filter(a => a.priority === 'high').slice(0, 1);

  return (
    <>
      <div className="min-h-screen bg-background pb-20 pt-4 safe-top relative">
        <div className="pt-16">
          <DogDropdown selectedDogId={selectedDogId} onDogChange={onDogChange} />
          <PageLogo />
        </div>

          <div className="container py-4 space-y-4">
          <TodaysGoalsBanner
            nextTrick={nextTrick ? { name: nextTrick.trick?.name || 'Unknown', total_sessions: nextTrick.total_sessions } : undefined}
            onActionClick={() => nextTrick ? onTabChange('tricks') : onTabChange('tricks')}
          />

          {urgentAlerts.length > 0 && (
            <UrgentAlertsBanner alerts={urgentAlerts} onClick={() => onTabChange('health')} />
          )}

          <div className="grid grid-cols-2 gap-4">
            <ActivityCircleCard
              completedMinutes={activityProgress.minutes}
              targetMinutes={activityGoal?.target_minutes || 60}
              onClick={() => setShowActivityModal(true)}
              onEditGoal={() => setShowEditGoalModal(true)}
            />
            <TrainingTile
              trickName={nextTrick?.trick?.name}
              totalSessions={nextTrick?.total_sessions}
              onClick={() => onTabChange('tricks')}
            />
            <QuickNoteTile onClick={() => setShowNoteModal(true)} />
            <GetAdviceCard />
          </div>
        </div>
      </div>

      <ActivityRecordModal dogId={selectedDogId} isOpen={showActivityModal} onClose={() => setShowActivityModal(false)} />
      <QuickNoteModal dogId={selectedDogId} isOpen={showNoteModal} onClose={() => setShowNoteModal(false)} />
      <EditActivityGoalModal 
        dogId={selectedDogId}
        isOpen={showEditGoalModal}
        onClose={() => setShowEditGoalModal(false)}
        currentGoal={activityGoal}
        onSave={handleUpdateGoal}
      />
    </>
  );
}
