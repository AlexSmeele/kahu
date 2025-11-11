import { useMemo } from 'react';
import { ArrowLeft, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RoadmapStage } from '@/components/training/RoadmapStage';
import { TRAINING_ROADMAP } from '@/data/roadmapData';
import { useDogs } from '@/hooks/useDogs';
import { differenceInWeeks } from 'date-fns';

export default function TrainingProgramsRoadmap() {
  const navigate = useNavigate();
  const { dogs } = useDogs();
  const currentDog = dogs[0];

  // Calculate dog's age in weeks
  const dogAgeWeeks = useMemo(() => {
    if (!currentDog?.birthday) return 0;
    const birthDate = new Date(currentDog.birthday);
    const now = new Date();
    return Math.max(0, differenceInWeeks(now, birthDate));
  }, [currentDog?.birthday]);

  // Determine which stages are unlocked and which is active
  const stagesWithStatus = useMemo(() => {
    return TRAINING_ROADMAP.map((stage, index) => {
      // First stage (pre-puppy) is always unlocked
      if (index === 0) {
        return {
          ...stage,
          isUnlocked: true,
          isActive: dogAgeWeeks === 0,
        };
      }

      // Check if dog's age falls within this stage
      const isActive = 
        dogAgeWeeks >= stage.ageRangeWeeks.min &&
        (stage.ageRangeWeeks.max === null || dogAgeWeeks <= stage.ageRangeWeeks.max);

      // Unlock current and previous stages based on dog's age
      const isUnlocked = dogAgeWeeks >= stage.ageRangeWeeks.min;

      return {
        ...stage,
        isUnlocked,
        isActive,
      };
    });
  }, [dogAgeWeeks]);

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
          {/* Info card */}
          <Card className="p-4 bg-primary/5 border-primary/20">
            <div className="flex gap-3">
              <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-foreground leading-relaxed">
                  {currentDog?.name ? (
                    <>
                      <span className="font-semibold">{currentDog.name}</span> is{' '}
                      {dogAgeWeeks === 0 ? (
                        'not born yet or just arrived'
                      ) : (
                        <>
                          <span className="font-semibold">{dogAgeWeeks} weeks old</span>.
                        </>
                      )}
                      {' '}This roadmap shows age-appropriate training content. Complete stages to unlock the next ones!
                    </>
                  ) : (
                    'This roadmap guides you through raising a puppy from preparation through adulthood. Add your dog\'s birthday to see personalized content.'
                  )}
                </p>
              </div>
            </div>
          </Card>

          {/* Roadmap stages */}
          <div className="space-y-0">
            {stagesWithStatus.map((stage) => (
              <RoadmapStage
                key={stage.id}
                stage={stage}
                isUnlocked={stage.isUnlocked}
                isActive={stage.isActive}
              />
            ))}
          </div>

          {/* Bottom padding for safe area */}
          <div className="h-20" />
        </div>
      </div>
    </div>
  );
}
