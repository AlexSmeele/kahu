import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DogDropdown } from "@/components/dogs/DogDropdown";
import { PageLogo } from "@/components/layout/PageLogo";
import { TrainingGoalCard } from "@/components/home/TrainingGoalCard";
import { UrgentAlertsBanner } from "@/components/home/UrgentAlertsBanner";
import { ActivityCircleCard } from "@/components/home/ActivityCircleCard";
import { QuickNoteTile } from "@/components/home/QuickNoteTile";
import { GetAdviceCard } from "@/components/home/GetAdviceCard";
import { AnalyticsCard } from "@/components/home/AnalyticsCard";
import { NutritionOverviewCard } from "@/components/home/NutritionOverviewCard";
import { HealthStatusCard } from "@/components/home/HealthStatusCard";
import { UpcomingEventsCard } from "@/components/home/UpcomingEventsCard";
import { TreatBudgetCard } from "@/components/home/TreatBudgetCard";
import { SocialCard } from "@/components/home/SocialCard";
import { MarketplaceCard } from "@/components/home/MarketplaceCard";
import { QuickNoteModal } from "@/components/home/QuickNoteModal";
import { useHomeData } from "@/hooks/useHomeData";
import { useWellnessTimeline } from "@/hooks/useWellnessTimeline";
import { useProfile } from "@/hooks/useProfile";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { User } from "lucide-react";
import type { TabType } from "@/components/layout/BottomNavigation";

interface HomeScreenProps {
  selectedDogId: string;
  onDogChange: (dogId: string) => void;
  onTabChange: (tab: TabType) => void;
}

export function HomeScreen({ selectedDogId, onDogChange, onTabChange }: HomeScreenProps) {
  const navigate = useNavigate();
  const [showNoteModal, setShowNoteModal] = useState(false);
  const { profile } = useProfile();
  
  const {
    loading,
    nextTrick
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
          
          {/* Profile Avatar */}
          <Avatar 
            className="absolute top-4 right-4 w-10 h-10 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => onTabChange('profile')}
          >
            <AvatarImage src={profile?.avatar_url || undefined} alt="Profile" />
            <AvatarFallback>
              {profile?.display_name 
                ? profile.display_name.charAt(0).toUpperCase()
                : <User className="w-5 h-5" />
              }
            </AvatarFallback>
          </Avatar>
        </div>

        {loading ? (
          <div className="container pt-4 space-y-4">
            <Skeleton className="h-24 w-full rounded-2xl" />
            <div className="grid grid-cols-2 gap-3">
              <Skeleton className="h-40 rounded-2xl" />
              <Skeleton className="h-40 rounded-2xl" />
              <Skeleton className="h-40 rounded-2xl" />
              <Skeleton className="h-40 rounded-2xl" />
            </div>
            <Skeleton className="h-16 w-full rounded-2xl" />
          </div>
        ) : (
          <>
            <div className="px-4 pt-4 mb-2">
              <h2 className="text-2xl font-semibold text-foreground">
                {getGreeting()}{profile?.display_name ? `, ${profile.display_name.split(' ')[0]}` : ''}!
              </h2>
            </div>

            <div className="container pt-2 space-y-4">
              {urgentAlerts.length > 0 && (
                <UrgentAlertsBanner alerts={urgentAlerts} dogId={selectedDogId} />
              )}

              <div className="grid grid-cols-2 gap-3">
                {/* Row 1 */}
                <ActivityCircleCard
                  completedMinutes={todayProgress?.minutes || 0}
                  targetMinutes={activityGoal?.target_minutes || 60}
                  distance={todayProgress?.distance}
                  calories={todayProgress?.calories}
                  onClick={() => navigate(`/record-activity?dogId=${selectedDogId}`)}
                  className="animate-fade-in [animation-delay:100ms]"
                />
                <TrainingGoalCard
                  nextTrick={nextTrick ? { name: nextTrick.trick?.name || 'Unknown', total_sessions: nextTrick.total_sessions } : undefined}
                  onActionClick={() => onTabChange('tricks')}
                  className="animate-fade-in [animation-delay:150ms]"
                />
                
                {/* Row 2 */}
                <GetAdviceCard className="animate-fade-in [animation-delay:200ms]" />
                <QuickNoteTile 
                  onClick={() => setShowNoteModal(true)} 
                  className="animate-fade-in [animation-delay:250ms]"
                />
                
                {/* Row 3 */}
                <NutritionOverviewCard 
                  dogId={selectedDogId}
                  className="animate-fade-in [animation-delay:300ms]"
                />
                <HealthStatusCard 
                  dogId={selectedDogId}
                  onTabChange={onTabChange}
                  className="animate-fade-in [animation-delay:350ms]"
                />
                
                {/* Row 4 */}
                <UpcomingEventsCard 
                  dogId={selectedDogId}
                  className="animate-fade-in [animation-delay:400ms]"
                />
                <TreatBudgetCard 
                  dogId={selectedDogId}
                  className="animate-fade-in [animation-delay:450ms]"
                />
              </div>

              {/* Future Features Section */}
              <div className="px-4 pt-6 pb-2">
                <h3 className="text-lg font-semibold text-muted-foreground">Future Features</h3>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <AnalyticsCard className="animate-fade-in [animation-delay:500ms]" />
                <SocialCard className="animate-fade-in [animation-delay:550ms]" />
                <MarketplaceCard className="animate-fade-in [animation-delay:600ms]" />
              </div>
            </div>
          </>
        )}
      </div>

      <QuickNoteModal dogId={selectedDogId} isOpen={showNoteModal} onClose={() => setShowNoteModal(false)} />
    </>
  );
}
