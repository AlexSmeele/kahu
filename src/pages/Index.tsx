import { useState } from "react";
import { TrainerScreenVariantSelector } from "@/components/screens/TrainerScreenVariantSelector";
import { TricksScreen } from "@/components/screens/TricksScreen";
import { HealthScreen } from "@/components/screens/HealthScreen";
import { NutritionScreen } from "@/components/screens/NutritionScreen";
import { ProfileScreen } from "@/components/screens/ProfileScreen";
import { BottomNavigation, TabType } from "@/components/layout/BottomNavigation";
import { QuickActionModal } from "@/components/layout/QuickActionModal";
import { DogOnboarding } from "@/components/onboarding/DogOnboarding";
import { useDogs } from "@/hooks/useDogs";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const [activeTab, setActiveTab] = useState<TabType>('trainer');
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);
  const [isUserTyping, setIsUserTyping] = useState(false);
  const { user } = useAuth();
  const { dogs, loading } = useDogs();

  // Show onboarding if user has no dogs
  if (!loading && dogs.length === 0) {
    return <DogOnboarding onComplete={() => {
      // Dogs list will automatically update via the useDogs hook
      // No need to reload the page
    }} />;
  }

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'trainer':
        return <TrainerScreenVariantSelector onTypingChange={setIsUserTyping} />;
      case 'tricks':
        return <TricksScreen />;
      case 'health':
        return <HealthScreen />;
      case 'nutrition':
        return <NutritionScreen />;
      case 'profile':
        return <ProfileScreen />;
      default:
        return <TrainerScreenVariantSelector onTypingChange={setIsUserTyping} />;
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Main Content - Flex grows to fill available space */}
      <main className="flex-1 min-h-0 overflow-hidden">
        {renderActiveScreen()}
      </main>

      {/* Bottom Navigation - Fixed height in document flow */}
      <BottomNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onQuickAction={() => setIsQuickActionOpen(true)}
        hideFab={activeTab === 'trainer' && isUserTyping}
      />

      {/* Quick Action Modal */}
      <QuickActionModal
        isOpen={isQuickActionOpen}
        onClose={() => setIsQuickActionOpen(false)}
      />
    </div>
  );
};

export default Index;
