import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MoreVertical, Clock, Star, Award, ChevronDown, ChevronUp, Target, Lightbulb, BookOpen, TrendingUp, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useSkills } from '@/hooks/useSkills';
import { useDogs } from '@/hooks/useDogs';
import { useSkillProgression } from '@/hooks/useSkillProgression';
import { cn } from '@/lib/utils';

// Helper to parse primary category from hierarchical categories like "Foundational / Focus / Engagement"
function parsePrimaryCategory(category: string | null | undefined): string {
  if (!category) return 'Foundation';
  const primary = category.split('/')[0].trim();
  // Normalize "Foundational" to "Foundation"
  if (primary === 'Foundational') return 'Foundation';
  return primary;
}

const categoryColors: Record<string, string> = {
  Foundation: 'bg-emerald-500',
  Obedience: 'bg-blue-500',
  Performance: 'bg-purple-500',
  'Body Control': 'bg-orange-500',
  'Prop Work': 'bg-rose-500',
  'Impulse Control': 'bg-indigo-500',
  Practical: 'bg-teal-500',
  Chain: 'bg-amber-500',
  Assistance: 'bg-cyan-500',
  Advanced: 'bg-indigo-600',
  Calmness: 'bg-teal-600',
  Focus: 'bg-blue-600',
  Engagement: 'bg-purple-600',
};

const categoryIcons: Record<string, any> = {
  Foundation: Award,
  Obedience: Target,
  Performance: Star,
  'Body Control': TrendingUp,
  'Prop Work': Target,
  'Impulse Control': Award,
  Practical: Lightbulb,
  Chain: TrendingUp,
  Assistance: Award,
  Advanced: TrendingUp,
  Calmness: Lightbulb,
  Focus: Target,
  Engagement: Award,
};

export default function SkillDetailPage() {
  const { trickId } = useParams<{ trickId: string }>();
  const navigate = useNavigate();
  const { dogs } = useDogs();
  const { skills, dogSkills, startSkill, refetch } = useSkills(dogs[0]?.id);
  const [seeMoreOpen, setSeeMoreOpen] = useState(false);
  const [dogTrickId, setDogTrickId] = useState<string | null>(null);
  const [isStartingTrick, setIsStartingTrick] = useState(false);

  const skill = skills.find(s => s.id === trickId);
  const primaryCategory = parsePrimaryCategory(skill?.category);
  const CategoryIcon = categoryIcons[primaryCategory] || Award;

  // Create local map for quick lookup
  const learnedSkillsMap = new Map(dogSkills.map(ds => [ds.skill_id, ds]));

  // Get or create dog_skill record
  useEffect(() => {
    if (!skill || !dogs[0]) return;

    const existingDogSkill = learnedSkillsMap.get(skill.id);
    if (existingDogSkill) {
      setDogTrickId(existingDogSkill.id);
      setIsStartingTrick(false);
    } else if (!isStartingTrick) {
      // Auto-start the skill to create a tracking record
      setIsStartingTrick(true);
      startSkill(skill.id).then(async () => {
        // Refetch to ensure we have the latest data
        await refetch();
        setIsStartingTrick(false);
      });
    }
  }, [skill, dogs, learnedSkillsMap, startSkill, dogSkills, refetch, isStartingTrick]);

  const { progressData, loading } = useSkillProgression(dogTrickId);

  if (!skill) {
    return (
      <div className="flex items-center justify-center h-full bg-background">
        <p className="text-muted-foreground">Skill not found</p>
      </div>
    );
  }

  const difficultyStars = Math.min(Math.max(skill.difficulty_level || 1, 1), 5);
  const progressPercentage = progressData 
    ? Math.round((progressData.sessionsCompleted / (progressData.nextRequirements?.min_sessions_required || 20)) * 100)
    : 0;

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/10">
      {/* Header - Sticky */}
      <header className="safe-top p-4 bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex-shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-bold text-foreground flex-1 text-center px-2 truncate">
            {skill.name}
          </h1>
          <Button variant="ghost" size="sm" className="flex-shrink-0">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          {/* Hero Section */}
          <Card className="p-6 space-y-4">
            {/* Category Badge with Icon */}
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center text-white",
                categoryColors[primaryCategory] || 'bg-muted'
              )}>
                <CategoryIcon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-foreground">{skill.name}</h2>
              </div>
            </div>

            {/* Metadata Badges */}
            <div className="flex flex-wrap gap-2">
              {/* Difficulty */}
              <Badge variant="secondary" className="flex items-center gap-1">
                {Array.from({ length: difficultyStars }).map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-current" />
                ))}
                <span className="ml-1">Difficulty</span>
              </Badge>

              {/* Category */}
              {skill.category && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <CategoryIcon className="w-3 h-3" />
                  {skill.category}
                </Badge>
              )}

              {/* Estimated Time */}
              {skill.estimated_time_weeks && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {skill.estimated_time_weeks} {skill.estimated_time_weeks === 1 ? 'week' : 'weeks'}
                </Badge>
              )}
            </div>
          </Card>

          {/* Progress Section */}
          {!loading && progressData && (
            <Card className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground">Your Progress</h3>
                <Badge variant="default">
                  {dogSkills.find(ds => ds.id === dogTrickId)?.proficiency_level || 'basic'}
                </Badge>
              </div>
              <Progress value={progressPercentage} className="h-2" />
              <p className="text-sm text-muted-foreground">
                {progressData.sessionsCompleted} {progressData.sessionsCompleted === 1 ? 'session' : 'sessions'} completed
                {progressData.nextRequirements && ` • ${progressData.nextRequirements.min_sessions_required - progressData.sessionsCompleted} more to level up`}
              </p>
            </Card>
          )}

          {/* Description */}
          <Card className="p-4">
            <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              About This Skill
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
              {skill.short_description || skill.long_description || 'A valuable skill for your dog\'s training journey.'}
            </p>
          </Card>

          {/* Training Steps - Brief Instructions */}
          {skill.brief_instructions && Array.isArray(skill.brief_instructions) && skill.brief_instructions.filter((step: any) => step?.title || step?.content).length > 0 && (
            <Card className="p-4">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Training Steps
              </h3>
              <div className="space-y-3">
                {skill.brief_instructions.filter((step: any) => step?.title || step?.content).map((step: any, idx: number) => (
                  <div key={idx} className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">
                      {step.number || idx + 1}
                    </div>
                    <div className="flex-1 space-y-1">
                      {step.title && (
                        <p className="font-medium text-sm text-foreground">{step.title}</p>
                      )}
                      {step.content && (
                        <p className="text-sm text-muted-foreground whitespace-pre-line">{step.content}</p>
                      )}
                      {step.tip && (
                        <p className="text-xs text-primary/80 italic">💡 {step.tip}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Prerequisites */}
          {skill.prerequisites && skill.prerequisites.length > 0 && (
            <Card className="p-4">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Prerequisites
              </h3>
              <div className="space-y-2">
                {skill.prerequisites.map((prereqId, idx) => {
                  const prereqSkill = skills.find(s => s.id === prereqId);
                  const prereqDogSkill = learnedSkillsMap.get(prereqId);
                  const isCompleted = prereqDogSkill?.status === 'mastered';

                  return (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <div className={cn(
                        "w-5 h-5 rounded-full flex items-center justify-center text-white text-xs",
                        isCompleted ? "bg-success" : "bg-muted-foreground"
                      )}>
                        {isCompleted ? '✓' : '○'}
                      </div>
                      <span className={cn(
                        isCompleted ? "text-foreground" : "text-muted-foreground"
                      )}>
                        {prereqSkill?.name || `Skill ${idx + 1}`}
                        {prereqDogSkill && !isCompleted && (
                          <span className="text-xs ml-1">(In Progress)</span>
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Collapsible "See More" Section */}
          <Collapsible open={seeMoreOpen} onOpenChange={setSeeMoreOpen}>
            <Card className="overflow-hidden">
              <CollapsibleTrigger asChild>
                <button className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                  <span className="font-semibold text-foreground">See More Details</span>
                  {seeMoreOpen ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="p-4 pt-0 space-y-4">
                  {/* What This Skill Unlocks */}
                  {skill.progressions && (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-foreground flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-primary" />
                        What This Skill Unlocks
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                        {skill.progressions}
                      </p>
                    </div>
                  )}

                  {/* Preparation Tips */}
                  {skill.preparation_tips && (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-foreground flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-warning" />
                        Preparation Tips
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                        {skill.preparation_tips}
                      </p>
                    </div>
                  )}

                  {/* General Tips */}
                  {skill.general_tips && (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-foreground flex items-center gap-2">
                        <Star className="w-4 h-4 text-warning" />
                        General Tips
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                        {skill.general_tips}
                      </p>
                    </div>
                  )}

                  {/* Troubleshooting */}
                  {skill.troubleshooting && (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-foreground flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-destructive" />
                        Troubleshooting
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                        {skill.troubleshooting}
                      </p>
                    </div>
                  )}

                  {/* Training Insights */}
                  {skill.training_insights && (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-foreground flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-accent" />
                        Training Insights
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                        {skill.training_insights}
                      </p>
                    </div>
                  )}

                  {/* Proficiency Levels Overview */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-foreground flex items-center gap-2">
                      <Award className="w-4 h-4 text-success" />
                      Proficiency Levels
                    </h4>
                    <div className="space-y-2">
                      <div className="bg-muted/50 p-3 rounded-lg">
                        <p className="font-medium text-sm text-foreground">Basic</p>
                        <p className="text-xs text-muted-foreground mt-1 whitespace-pre-line">
                          {skill.achievement_levels?.level1 || 'Initial learning in a familiar, distraction-free environment'}
                        </p>
                      </div>
                      <div className="bg-muted/50 p-3 rounded-lg">
                        <p className="font-medium text-sm text-foreground">Generalized</p>
                        <p className="text-xs text-muted-foreground mt-1 whitespace-pre-line">
                          {skill.achievement_levels?.level2 || 'Performing consistently across different contexts and locations'}
                        </p>
                      </div>
                      <div className="bg-muted/50 p-3 rounded-lg">
                        <p className="font-medium text-sm text-foreground">Proofed</p>
                        <p className="text-xs text-muted-foreground mt-1 whitespace-pre-line">
                          {skill.achievement_levels?.level3 || 'Reliable performance even with distractions present'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Mastery Criteria */}
                  {(skill.pass_criteria || skill.fail_criteria || skill.mastery_criteria) && (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-foreground flex items-center gap-2">
                        <Award className="w-4 h-4 text-success" />
                        Mastery Criteria
                      </h4>
                      <div className="space-y-3">
                        {skill.pass_criteria && (
                          <div className="bg-success/10 border border-success/20 p-3 rounded-lg">
                            <p className="font-medium text-xs text-success mb-1">✓ Pass Criteria</p>
                            <p className="text-xs text-muted-foreground whitespace-pre-line">{skill.pass_criteria}</p>
                          </div>
                        )}
                        {skill.mastery_criteria && (
                          <div className="bg-primary/10 border border-primary/20 p-3 rounded-lg">
                            <p className="font-medium text-xs text-primary mb-1">⭐ Mastery Criteria</p>
                            <p className="text-xs text-muted-foreground whitespace-pre-line">{skill.mastery_criteria}</p>
                          </div>
                        )}
                        {skill.fail_criteria && (
                          <div className="bg-destructive/10 border border-destructive/20 p-3 rounded-lg">
                            <p className="font-medium text-xs text-destructive mb-1">✗ Common Pitfalls</p>
                            <p className="text-xs text-muted-foreground whitespace-pre-line">{skill.fail_criteria}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Bottom spacing for fixed footer */}
          <div className="h-24" />
        </div>
      </div>

      {/* Fixed Footer with Action Buttons */}
      <div className="safe-bottom p-4 bg-card border-t border-border sticky bottom-0 z-10 space-y-2">
        <Button 
          className="w-full gap-2" 
          variant="outline"
          onClick={() => navigate(`/training/skill/${trickId}/instructional`)}
        >
          <BookOpen className="w-4 h-4" />
          Begin Instructional
        </Button>
        <Button 
          className="w-full gap-2"
          onClick={() => navigate(`/training/skill/${trickId}/session`)}
          disabled={!dogTrickId || loading || isStartingTrick}
        >
          <Target className="w-4 h-4" />
          {isStartingTrick ? 'Preparing...' : 'Begin Training Session'}
        </Button>
      </div>
    </div>
  );
}
