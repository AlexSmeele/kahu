import { useMemo } from 'react';
import { Info } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { RoadmapStage } from '@/components/training/RoadmapStage';
import { TRAINING_ROADMAP } from '@/data/roadmapData';
import { useDogs } from '@/hooks/useDogs';
import { differenceInWeeks } from 'date-fns';

interface RoadmapContentProps {
  selectedDogId: string;
}

export function RoadmapContent({ selectedDogId }: RoadmapContentProps) {
  const { dogs } = useDogs();
  const currentDog = dogs.find(dog => dog.id === selectedDogId) || dogs[0];

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
    <div className="space-y-6">
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
    </div>
  );
}
