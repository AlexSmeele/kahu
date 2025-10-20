import { useState, useEffect } from "react";
import { HomeScreen } from "@/components/screens/HomeScreen";
import { TricksScreen } from "@/components/screens/TricksScreen";
import { HealthScreen } from "@/components/screens/HealthScreen";
import { NutritionScreen } from "@/components/screens/NutritionScreen";
import { ProfileScreen } from "@/components/screens/ProfileScreen";
import { BottomNavigation, TabType } from "@/components/layout/BottomNavigation";
import { QuickActionModal } from "@/components/layout/QuickActionModal";
import { DogOnboarding } from "@/components/onboarding/DogOnboarding";
import { useDogs } from "@/hooks/useDogs";
import { useAuth } from "@/contexts/AuthContext";
import { logger } from "@/lib/logger";


const Index = () => {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);
  const [isUserTyping, setIsUserTyping] = useState(false);
  const [selectedDogId, setSelectedDogId] = useState<string>('');
  const { user, session } = useAuth();
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

  // Show onboarding if user has no dogs (disabled in Dev Mode bypass)
  const isDevSession = session?.access_token === 'mock-access-token' || user?.id === 'dev-user-mock-id' || user?.email === 'dev@example.com';
  if (!loading && dogs.length === 0 && !isDevSession) {
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
      case 'home':
        return <HomeScreen selectedDogId={selectedDogId} onDogChange={setSelectedDogId} onTabChange={setActiveTab} />;
      case 'tricks':
        return <TricksScreen selectedDogId={selectedDogId} onDogChange={setSelectedDogId} />;
      case 'health':
        return <HealthScreen selectedDogId={selectedDogId} onDogChange={setSelectedDogId} />;
      case 'nutrition':
        return <NutritionScreen selectedDogId={selectedDogId} onDogChange={setSelectedDogId} />;
      case 'profile':
        return <ProfileScreen />;
      default:
        logger.warn('Index: Unknown active tab, defaulting to home', { activeTab });
        return <HomeScreen selectedDogId={selectedDogId} onDogChange={setSelectedDogId} onTabChange={setActiveTab} />;
    }
  };

  return (
      <>
        {/* Main Content - Takes remaining space above nav */}
        <main className="content-frame">
          {renderActiveScreen()}
        </main>

        {/* Bottom Navigation - Natural flex item */}
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
          hideFab={false}
        />

        {/* Quick Action Modal */}
        <QuickActionModal
          isOpen={isQuickActionOpen}
          onClose={() => setIsQuickActionOpen(false)}
          onNavigateToTab={(tab) => setActiveTab(tab)}
          selectedDogId={selectedDogId}
          selectedDogName={dogs.find(dog => dog.id === selectedDogId)?.name}
        />
      </>
  );
};

export default Index;
