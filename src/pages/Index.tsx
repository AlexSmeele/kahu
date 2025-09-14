import { useState, useEffect } from "react";
import { TrainerScreenVariantSelector } from "@/components/screens/TrainerScreenVariantSelector";
import { TricksScreen } from "@/components/screens/TricksScreen";
import { HealthScreen } from "@/components/screens/HealthScreen";
import { NutritionScreen } from "@/components/screens/NutritionScreen";
import { ProfileScreen } from "@/components/screens/ProfileScreen";
import { MarketplaceScreen } from "@/components/screens/MarketplaceScreen";
import { BottomNavigation, TabType } from "@/components/layout/BottomNavigation";
import { QuickActionModal } from "@/components/layout/QuickActionModal";
import { DogOnboarding } from "@/components/onboarding/DogOnboarding";
import { useDogs } from "@/hooks/useDogs";
import { useAuth } from "@/contexts/AuthContext";
import { logger } from "@/lib/logger";

const Index = () => {
  const [activeTab, setActiveTab] = useState<TabType>('trainer');
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);
  const [isUserTyping, setIsUserTyping] = useState(false);
  const [selectedDogId, setSelectedDogId] = useState<string>('');
  const { user } = useAuth();
  const { dogs, loading } = useDogs();

  logger.info('Index: Component rendered', { 
    activeTab, 
    dogCount: dogs.length, 
    loading, 
    selectedDogId,
    userId: user?.id 
  });

  // Update selected dog when dogs load
  useEffect(() => {
    if (dogs.length > 0 && !selectedDogId) {
      logger.info('Index: Auto-selecting first dog', { dogId: dogs[0].id, dogName: dogs[0].name });
      setSelectedDogId(dogs[0].id);
    }
  }, [dogs, selectedDogId]);

  // Show onboarding if user has no dogs
  if (!loading && dogs.length === 0) {
    logger.info('Index: Showing dog onboarding - no dogs found');
    return <DogOnboarding onComplete={() => {
      logger.info('Index: Dog onboarding completed');
      // Dogs list will automatically update via the useDogs hook
      // No need to reload the page
    }} />;
  }

  const renderActiveScreen = () => {
    logger.debug('Index: Rendering screen', { activeTab, selectedDogId });
    
    switch (activeTab) {
      case 'trainer':
        return <TrainerScreenVariantSelector onTypingChange={setIsUserTyping} />;
      case 'tricks':
        return <TricksScreen selectedDogId={selectedDogId} onDogChange={setSelectedDogId} />;
      case 'health':
        return <HealthScreen selectedDogId={selectedDogId} onDogChange={setSelectedDogId} />;
      case 'nutrition':
        return <NutritionScreen selectedDogId={selectedDogId} onDogChange={setSelectedDogId} />;
      case 'marketplace':
        return <MarketplaceScreen />;
      case 'profile':
        return <ProfileScreen />;
      default:
        logger.warn('Index: Unknown active tab, defaulting to trainer', { activeTab });
        return <TrainerScreenVariantSelector onTypingChange={setIsUserTyping} />;
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Main Content - Account for fixed bottom navigation */}
      <main className="flex-1 min-h-0 pb-16">
        {renderActiveScreen()}
      </main>

      {/* Bottom Navigation - Fixed at bottom */}
      <BottomNavigation
        activeTab={activeTab}
        onTabChange={(tab: TabType) => {
          logger.userAction('tabChange', { from: activeTab, to: tab });
          setActiveTab(tab);
        }}
        onQuickAction={() => {
          logger.userAction('quickActionOpen');
          setIsQuickActionOpen(true);
        }}
        hideFab={activeTab === 'trainer' && isUserTyping}
      />

      {/* Quick Action Modal */}
      <QuickActionModal
        isOpen={isQuickActionOpen}
        onClose={() => setIsQuickActionOpen(false)}
        selectedDogId={selectedDogId}
        selectedDogName={dogs.find(dog => dog.id === selectedDogId)?.name}
      />
    </div>
  );
};

export default Index;
