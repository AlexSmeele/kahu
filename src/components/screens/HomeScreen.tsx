import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeaderBar } from "@/components/headers/HeaderBar";
import { DogDropdown } from "@/components/dogs/DogDropdown";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { User } from "lucide-react";
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
import { CareTipsCard } from "@/components/home/CareTipsCard";
import { PrePurchaseGuideCard } from "@/components/home/PrePurchaseGuideCard";
import { SocialCard } from "@/components/home/SocialCard";
import { MarketplaceCard } from "@/components/home/MarketplaceCard";
import { InsuranceCard } from "@/components/home/InsuranceCard";
import { ServicesCard } from "@/components/home/ServicesCard";
import { RelaxationCard } from "@/components/home/RelaxationCard";
import { QuickNoteModal } from "@/components/home/QuickNoteModal";
import { useHomeData } from "@/hooks/useHomeData";
import { useWellnessTimeline } from "@/hooks/useWellnessTimeline";
import { useProfile } from "@/hooks/useProfile";
import { Skeleton } from "@/components/ui/skeleton";
import type { TabType } from "@/components/layout/BottomNavigation";
import { QuickActionFAB } from "@/components/QuickActionFAB";
import { EmergencyModal } from "@/components/health/EmergencyModal";
import { WeightTracker } from "@/components/health/WeightTracker";
import { MealLogModal } from "@/components/nutrition/MealLogModal";
import { HealthNotesModal } from "@/components/health/HealthNotesModal";
import { useNutrition } from "@/hooks/useNutrition";
import { useDogs } from "@/hooks/useDogs";

interface HomeScreenProps {
  selectedDogId: string;
  onDogChange: (dogId: string) => void;
  onTabChange: (tab: TabType) => void;
}

export function HomeScreen({ selectedDogId, onDogChange, onTabChange }: HomeScreenProps) {
  const navigate = useNavigate();
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [showMealModal, setShowMealModal] = useState(false);
  const [showHealthNotesModal, setShowHealthNotesModal] = useState(false);
  const { profile } = useProfile();
  const { dogs } = useDogs();
  const { nutritionPlan } = useNutrition(selectedDogId);
  
  const currentDog = dogs.find(dog => dog.id === selectedDogId);
  
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
      <div className="bg-background pb-20 relative">
        <HeaderBar
          transparent={false}
          elevated={false}
          leftSlot={
            <DogDropdown 
              selectedDogId={selectedDogId} 
              onDogChange={onDogChange}
              variant="inline"
            />
          }
          rightSlot={
            <Avatar 
              className="w-10 h-10 cursor-pointer" 
              onClick={() => onTabChange('profile')}
            >
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback>
                <User className="w-5 h-5" />
              </AvatarFallback>
            </Avatar>
          }
        />

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
                <CareTipsCard 
                  className="animate-fade-in [animation-delay:450ms]"
                />
              </div>

              {/* Pre-Purchase Education Guide */}
              <div className="col-span-2">
                <PrePurchaseGuideCard />
              </div>

              {/* Future Features Section */}
              <div className="px-4 pt-6 pb-2">
                <h3 className="text-lg font-semibold text-muted-foreground">Future Features</h3>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <AnalyticsCard className="animate-fade-in [animation-delay:500ms]" />
                <SocialCard className="animate-fade-in [animation-delay:550ms]" />
                <MarketplaceCard className="animate-fade-in [animation-delay:600ms]" />
                <InsuranceCard className="animate-fade-in [animation-delay:650ms]" />
                <ServicesCard className="animate-fade-in [animation-delay:700ms]" />
                <RelaxationCard className="animate-fade-in [animation-delay:750ms]" />
                <TreatBudgetCard 
                  dogId={selectedDogId}
                  className="animate-fade-in [animation-delay:800ms]"
                />
              </div>
            </div>
          </>
        )}
      </div>

      <QuickNoteModal dogId={selectedDogId} isOpen={showNoteModal} onClose={() => setShowNoteModal(false)} />
      
      <EmergencyModal
        isOpen={showEmergencyModal}
        onClose={() => setShowEmergencyModal(false)}
        dogId={selectedDogId}
        dogName={currentDog?.name}
      />
      
      <WeightTracker
        isOpen={showWeightModal}
        onClose={() => setShowWeightModal(false)}
        dogId={selectedDogId}
        dogName={currentDog?.name || 'Your Dog'}
        currentWeight={currentDog?.weight || 0}
      />
      
      <MealLogModal
        isOpen={showMealModal}
        onClose={() => setShowMealModal(false)}
        dogId={selectedDogId}
        dogName={currentDog?.name}
        nutritionPlanId={nutritionPlan?.id}
      />
      
      <HealthNotesModal
        isOpen={showHealthNotesModal}
        onClose={() => setShowHealthNotesModal(false)}
        dogId={selectedDogId}
        dogName={currentDog?.name}
      />
      
      <QuickActionFAB
        theme="dark"
        onEmergency={() => setShowEmergencyModal(true)}
        onLogWeight={() => setShowWeightModal(true)}
        onLogMeal={() => setShowMealModal(true)}
        onHealthNote={() => setShowHealthNotesModal(true)}
        onAskAI={() => navigate('/ai-chat')}
        onTakePhoto={() => {}}
      />
    </>
  );
}
