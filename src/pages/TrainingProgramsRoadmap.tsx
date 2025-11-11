import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { RoadmapContent } from '@/components/training/RoadmapContent';
import { useDogs } from '@/hooks/useDogs';

export default function TrainingProgramsRoadmap() {
  const navigate = useNavigate();
  const { dogs } = useDogs();
  const currentDog = dogs[0];

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/10">
      {/* Header */}
      <header className="safe-top p-4 bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex-shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-foreground">Training Programs</h1>
            <p className="text-xs text-muted-foreground">
              Your journey from puppy to well-trained companion
            </p>
          </div>
        </div>
      </header>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-6">
          <RoadmapContent selectedDogId={currentDog?.id || ''} />

          {/* Bottom padding for safe area */}
          <div className="h-20" />
        </div>
      </div>
    </div>
  );
}
