import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import * as LucideIcons from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TopicCard } from './TopicCard';
import { SkillCard } from './SkillCard';
import { RoadmapStage as RoadmapStageType } from '@/data/roadmapData';
import { MOCK_FOUNDATION_TOPICS, MOCK_TROUBLESHOOTING_TOPICS } from '@/lib/mockData';
import { useTricks } from '@/hooks/useTricks';
import { getSkillProgression } from '@/data/skillProgressionMap';

interface RoadmapStageProps {
  stage: RoadmapStageType;
  isUnlocked: boolean;
  isActive: boolean;
  selectedDogId: string;
  unlockedSkills: Set<string>;
}

export function RoadmapStage({ stage, isUnlocked, isActive, selectedDogId, unlockedSkills }: RoadmapStageProps) {
  const navigate = useNavigate();
  const IconComponent = (LucideIcons as any)[stage.icon] || LucideIcons.MapPin;
  const { tricks, dogTricks } = useTricks(selectedDogId);

  // Get topic data from mock data
  const getTopicData = (topicId: string, type: 'foundation' | 'troubleshooting' | 'skill') => {
    if (type === 'foundation') {
      return MOCK_FOUNDATION_TOPICS.find(t => t.id === topicId);
    } else if (type === 'troubleshooting') {
      return MOCK_TROUBLESHOOTING_TOPICS.find(t => t.id === topicId);
    } else if (type === 'skill') {
      return tricks.find(t => t.id === topicId);
    }
    return null;
  };

  const ageDisplay = stage.ageRangeWeeks.max 
    ? `Weeks ${stage.ageRangeWeeks.min}-${stage.ageRangeWeeks.max}`
    : stage.ageRangeWeeks.min === 0
    ? 'Before arrival'
    : `Week ${stage.ageRangeWeeks.min}+`;

  return (
    <div className="relative">
      {/* Timeline connector line */}
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border -z-10" />

      <div className="flex gap-4 pb-8">
        {/* Timeline node */}
        <div className="flex-shrink-0 relative">
          <div 
            className={`w-12 h-12 rounded-full bg-gradient-to-br ${stage.color} flex items-center justify-center shadow-lg transition-all ${
              isActive ? 'ring-4 ring-primary/30 scale-110' : ''
            } ${
              !isUnlocked ? 'opacity-40 grayscale' : ''
            }`}
          >
            <IconComponent className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Stage content */}
        <div className="flex-1 pt-1">
          {/* Stage header */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-1">
              <h3 className={`font-bold text-lg ${!isUnlocked ? 'text-muted-foreground' : 'text-foreground'}`}>
                {stage.title}
              </h3>
              {!isUnlocked && (
                <Badge variant="secondary" className="text-xs">
                  <LucideIcons.Lock className="w-3 h-3 mr-1" />
                  Locked
                </Badge>
              )}
              {isActive && (
                <Badge variant="default" className="text-xs">
                  Current Stage
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mb-1">{stage.description}</p>
            <p className="text-xs text-muted-foreground font-medium">{ageDisplay}</p>
          </div>

          {/* Topics grid */}
          {isUnlocked ? (
            <div className="grid grid-cols-2 gap-3">
              {stage.topics.map((topicRef) => {
                const topic = getTopicData(topicRef.id, topicRef.type);
                if (!topic) return null;
                
                // Render skill card for skills
                if (topicRef.type === 'skill') {
                  const dogTrick = dogTricks.find(dt => dt.trick_id === topicRef.id);
                  const isSkillUnlocked = unlockedSkills.has(`${topicRef.id}-${topicRef.level || 'basic'}`);
                  
                  // Look up prerequisite name from skill progression map
                  let prerequisiteName: string | undefined;
                  const skillProgression = getSkillProgression(topicRef.id, topicRef.level || 'basic');
                  if (skillProgression?.prerequisite) {
                    const prerequisiteTrick = tricks.find(t => t.id === skillProgression.prerequisite?.trickId);
                    if (prerequisiteTrick && skillProgression.prerequisite.level) {
                      const levelLabel = skillProgression.prerequisite.level.charAt(0).toUpperCase() + skillProgression.prerequisite.level.slice(1);
                      prerequisiteName = `${prerequisiteTrick.name} (${levelLabel})`;
                    }
                  }
                  
                  return (
                    <SkillCard
                      key={`${topic.id}-${topicRef.level || 'basic'}`}
                      skill={topic as any}
                      proficiencyLevel={topicRef.level || 'basic'}
                      isUnlocked={isSkillUnlocked}
                      prerequisiteName={prerequisiteName}
                      minAgeWeeks={stage.ageRangeWeeks.min}
                      dogTrick={dogTrick}
                      onClick={() => navigate(`/training/skill/${topicRef.id}/detail`)}
                    />
                  );
                }
                
                // Render topic card for foundations/troubleshooting
                return (
                  <TopicCard 
                    key={topic.id} 
                    topic={topic as any} 
                    type={topicRef.type as 'foundation' | 'troubleshooting'}
                    source="program"
                  />
                );
              })}
            </div>
          ) : (
            <Card className="p-6 text-center bg-muted/50">
              <LucideIcons.Lock className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Complete previous stages to unlock
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
