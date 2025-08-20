import { useState } from "react";
import { TrainerScreen } from "@/components/screens/TrainerScreen";
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
  const { user } = useAuth();
  const { dogs, loading } = useDogs();

  // Show onboarding if user has no dogs
  if (!loading && dogs.length === 0) {
    return <DogOnboarding onComplete={() => window.location.reload()} />;
  }

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'trainer':
        return <TrainerScreen />;
      case 'tricks':
        return <TricksScreen />;
      case 'health':
        return <HealthScreen />;
      case 'nutrition':
        return <NutritionScreen />;
      case 'profile':
        return <ProfileScreen />;
      default:
        return <TrainerScreen />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <main className="pb-20">
        {renderActiveScreen()}
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onQuickAction={() => setIsQuickActionOpen(true)}
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
