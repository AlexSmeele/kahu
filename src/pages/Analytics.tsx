import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DogDropdown } from '@/components/dogs/DogDropdown';
import { PageLogo } from '@/components/layout/PageLogo';
import { AIInsightsCard } from '@/components/analytics/AIInsightsCard';
import { CostAnalysisDashboard } from '@/components/analytics/CostAnalysisDashboard';
import { SmartShoppingList } from '@/components/analytics/SmartShoppingList';
import { useDogs } from '@/hooks/useDogs';

export default function Analytics() {
  const navigate = useNavigate();
  const { dogs } = useDogs();
  const [selectedDogId, setSelectedDogId] = useState(dogs[0]?.id || '');
  const currentDog = dogs.find(dog => dog.id === selectedDogId) || dogs[0];

  return (
    <div className="flex flex-col h-full safe-top relative">
      <div className="pt-16 border-b">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="absolute left-4 top-4"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        <DogDropdown selectedDogId={selectedDogId} onDogChange={setSelectedDogId} />
        <PageLogo />
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Analytics & Insights</h1>
          </div>

          {/* AI Insights */}
          <AIInsightsCard dogId={selectedDogId} dogName={currentDog?.name || 'Your Dog'} />

          {/* Cost Analysis */}
          <CostAnalysisDashboard dogId={selectedDogId} />

          {/* Smart Shopping List */}
          <SmartShoppingList dogId={selectedDogId} />
        </div>
      </div>
    </div>
  );
}
