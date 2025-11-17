import { useMemo } from 'react';
import { Info } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { RoadmapStage } from '@/components/training/RoadmapStage';
import { TRAINING_ROADMAP } from '@/data/roadmapData';
import { SKILL_PROGRESSION_MAP } from '@/data/skillProgressionMap';
import { useDogs } from '@/hooks/useDogs';
import { useSkills } from '@/hooks/useSkills';
import { differenceInWeeks } from 'date-fns';

interface RoadmapContentProps {
  selectedDogId: string;
}

export function RoadmapContent({ selectedDogId }: RoadmapContentProps) {
  const { dogs } = useDogs();
  const { skills, dogSkills } = useSkills(selectedDogId);
  const currentDog = dogs.find(dog => dog.id === selectedDogId);

  // Calculate dog's age in weeks
  const dogAgeWeeks = useMemo(() => {
    if (!currentDog?.birthday) return 0;
    const birthDate = new Date(currentDog.birthday);
    const now = new Date();
    return Math.max(0, differenceInWeeks(now, birthDate));
  }, [currentDog?.birthday]);

  // Determine which skills are unlocked based on prerequisites and age
  const unlockedSkills = useMemo(() => {
    const unlocked = new Set<string>();
    
    // Check each skill in the progression map
    Object.entries(SKILL_PROGRESSION_MAP).forEach(([skillKey, progression]) => {
      const skill = skills.find(s => s.id === progression.skillId);
      if (!skill) return;
      
      // Find the stage that contains this skill
      const stage = TRAINING_ROADMAP.find(s => s.id === progression.stage);
      const meetsAgeRequirement = stage ? dogAgeWeeks >= stage.ageRangeWeeks.min : false;
      
      // Check prerequisite requirement
      let meetsPrerequisite = true;
      if (progression.prerequisite) {
        const prereqDogSkill = dogSkills.find(ds => ds.skill_id === progression.prerequisite?.skillId);
        const requiredLevel = progression.prerequisite.level;
        
        if (!prereqDogSkill) {
          meetsPrerequisite = false;
        } else if (requiredLevel === 'basic') {
          meetsPrerequisite = !!prereqDogSkill.basic_completed_at;
        } else if (requiredLevel === 'generalized') {
          meetsPrerequisite = !!prereqDogSkill.generalized_completed_at;
        } else if (requiredLevel === 'proofed') {
          meetsPrerequisite = !!prereqDogSkill.proofed_completed_at;
        }
      }
      
      if (meetsAgeRequirement && meetsPrerequisite) {
        unlocked.add(skillKey);
      }
    });
    
    return unlocked;
  }, [dogAgeWeeks, dogTricks, tricks]);

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
            selectedDogId={selectedDogId}
            unlockedSkills={unlockedSkills}
          />
        ))}
      </div>
    </div>
  );
}
