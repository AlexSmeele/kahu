import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle2, Lock, ArrowUp, Plus, MapPin, Zap, Award, Star, Clock, Target, BookOpen } from 'lucide-react';
import { useSkillProgression } from '@/hooks/useSkillProgression';
import { useSkills } from "@/hooks/useSkills";
import { toast } from '@/hooks/use-toast';
import { PRACTICE_CONTEXTS, DISTRACTION_LEVELS } from '@/data/skillProgressionMap';

interface SkillProgressionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  skill: {
    id: string;
    name: string;
    category?: string;
    difficulty?: number;
    short_description?: string;
    long_description?: string;
    estimated_time_weeks?: number;
    prerequisites?: string[];
  };
  dogTrickId: string;
  dogId: string;
}

const categoryColors = {
  Foundation: 'bg-emerald-500',
  Obedience: 'bg-blue-500',
  Performance: 'bg-purple-500',
  'Body Control': 'bg-orange-500',
  'Prop Work': 'bg-rose-500',
  'Impulse Control': 'bg-indigo-500',
  Practical: 'bg-teal-500',
  Chain: 'bg-amber-500'
};

const categoryIcons = {
  Foundation: Target,
  Obedience: Award,
  Performance: Star,
  'Body Control': Zap,
  'Prop Work': Plus,
  'Impulse Control': Award,
  Practical: BookOpen,
  Chain: CheckCircle2
};

export function SkillProgressionModal({ 
  open, 
  onOpenChange, 
  skill, 
  dogTrickId,
  dogId
}: SkillProgressionModalProps) {
  const { skill: skillData, dogTrickId: dtId, dogId: dId } = { skill, dogTrickId, dogId };

  if (!skill) return null;
  const { progressData, requirements, loading } = useSkillProgression(dogTrickId);
  const { levelUpSkill, recordPracticeSession } = useSkills(dogId);
  
  const [showPracticeForm, setShowPracticeForm] = useState(false);
  const [practiceContext, setPracticeContext] = useState('');
  const [distractionLevel, setDistractionLevel] = useState('');
  const [successRate, setSuccessRate] = useState([80]);
  const [notes, setNotes] = useState('');

  const currentLevel = progressData?.nextRequirements?.proficiency_level || 'basic';
  
  const levelConfig = {
    basic: {
      label: 'Basic',
      icon: MapPin,
      color: 'text-blue-500',
      description: 'Learning the skill in a controlled environment with minimal distractions.'
    },
    generalized: {
      label: 'Generalized',
      icon: Zap,
      color: 'text-purple-500',
      description: 'Performing consistently across different contexts, locations, and with different people.'
    },
    proofed: {
      label: 'Proofed',
      icon: Award,
      color: 'text-amber-500',
      description: 'Reliable performance even with significant distractions present.'
    }
  };

  const handleRecordPractice = async () => {
    if (!practiceContext || !distractionLevel) {
      toast({
        title: 'Missing information',
        description: 'Please select both context and distraction level',
        variant: 'destructive',
      });
      return;
    }

    try {
      await recordPracticeSession(dogTrickId, {
        context: practiceContext,
        distraction_level: distractionLevel as 'none' | 'mild' | 'moderate' | 'high',
        success_rate: successRate[0],
        duration_minutes: 5,
        notes: ''
      });

      toast({
        title: 'Practice recorded',
        description: `Great work practicing ${skill.name}!`,
      });

      // Reset form
      setPracticeContext('');
      setDistractionLevel('');
      setSuccessRate([80]);
      setNotes('');
      setShowPracticeForm(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to record practice session',
        variant: 'destructive',
      });
    }
  };

  const handleLevelUp = async (newLevel: 'generalized' | 'proofed') => {
    try {
      await levelUpSkill(dogTrickId, newLevel);
      toast({
        title: 'Level up!',
        description: `${skill.name} advanced to ${levelConfig[newLevel].label} level`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to level up skill',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return null;
  }

  const currentReq = requirements.find(r => r.proficiency_level === currentLevel);
  const sessionsProgress = progressData ? (progressData.sessionsCompleted / (currentReq?.min_sessions_required || 1)) * 100 : 0;
  const contextsProgress = progressData && currentReq 
    ? (progressData.contextsCompleted.length / currentReq.contexts_required.length) * 100 
    : 0;

  const categoryColor = categoryColors[skill.category as keyof typeof categoryColors] || 'bg-primary';
  const CategoryIcon = categoryIcons[skill.category as keyof typeof categoryIcons] || Award;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          {/* Visual header with icon */}
          <div className="flex flex-col items-center text-center mb-2">
            <div className={`w-14 h-14 ${categoryColor} rounded-xl flex items-center justify-center mb-3`}>
              <CategoryIcon className="w-7 h-7 text-white" />
            </div>
            <DialogTitle className="text-xl">{skill.name}</DialogTitle>
            <div className="flex items-center gap-2 mt-2 flex-wrap justify-center">
              {skill.category && (
                <Badge variant="outline" className="text-xs">{skill.category}</Badge>
              )}
              {skill.difficulty && (
                <Badge variant="secondary" className="text-xs">
                  Level {skill.difficulty}
                </Badge>
              )}
              {skill.estimated_time_weeks && (
                <Badge variant="outline" className="flex items-center gap-1 text-xs">
                  <Clock className="w-3 h-3" />
                  {skill.estimated_time_weeks} weeks
                </Badge>
              )}
            </div>
          </div>
          <p className="text-sm text-muted-foreground text-center">Track your progression through proficiency levels</p>
        </DialogHeader>

        <Tabs defaultValue={currentLevel} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            {(['basic', 'generalized', 'proofed'] as const).map((level) => {
              const LevelIcon = levelConfig[level].icon;
              const isComplete = progressData?.canLevelUp && currentLevel === level;
              const isLocked = level !== 'basic' && currentLevel !== level;
              
              return (
                <TabsTrigger 
                  key={level} 
                  value={level}
                  disabled={isLocked && !isComplete}
                  className="relative"
                >
                  <LevelIcon className={`w-4 h-4 mr-1 ${levelConfig[level].color}`} />
                  {levelConfig[level].label}
                  {isComplete && <CheckCircle2 className="w-3 h-3 ml-1 text-green-500" />}
                  {isLocked && <Lock className="w-3 h-3 ml-1" />}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {(['basic', 'generalized', 'proofed'] as const).map((level) => {
            const LevelIcon = levelConfig[level].icon;
            const req = requirements.find(r => r.proficiency_level === level);
            const isCurrent = currentLevel === level;
            
            return (
              <TabsContent key={level} value={level} className="space-y-4 mt-4">
                {/* Overview section for first-time viewers */}
                {isCurrent && progressData && progressData.sessionsCompleted === 0 && skill && (
                  <Card className="p-4 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      About This Skill
                    </h4>
                    <p className="text-sm text-muted-foreground mb-3">{skill.short_description || skill.long_description}</p>
                    
                    {/* Prerequisites */}
                    {skill.prerequisites && skill.prerequisites.length > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-xs font-medium mb-2">Prerequisites:</p>
                        <div className="space-y-1">
                          {skill.prerequisites.map((prereq, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-xs">
                              <Star className="w-3 h-3 text-yellow-500" />
                              <span>{prereq}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </Card>
                )}

                {/* Level description */}
                <Card className="p-4 bg-muted/50">
                  <div className="flex items-start gap-3">
                    <LevelIcon className={`w-5 h-5 ${levelConfig[level].color} flex-shrink-0 mt-0.5`} />
                    <div>
                      <h4 className="font-semibold mb-1">{levelConfig[level].label} Level</h4>
                      <p className="text-sm text-muted-foreground">{levelConfig[level].description}</p>
                    </div>
                  </div>
                </Card>

                {isCurrent && req && progressData && (
                  <>
                    {/* Requirements progress */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm">Requirements</h4>
                      
                      {/* Sessions */}
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Practice Sessions</span>
                          <span className="text-muted-foreground">
                            {progressData.sessionsCompleted}/{req.min_sessions_required}
                          </span>
                        </div>
                        <Progress value={sessionsProgress} className="h-2" />
                      </div>

                      {/* Contexts */}
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Practice Contexts</span>
                          <span className="text-muted-foreground">
                            {progressData.contextsCompleted.length}/{req.contexts_required.length}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {req.contexts_required.map((ctx) => (
                            <div 
                              key={ctx}
                              className={`text-xs p-2 rounded-md border ${
                                progressData.contextsCompleted.includes(ctx)
                                  ? 'bg-green-50 border-green-200 text-green-700'
                                  : 'bg-muted border-border text-muted-foreground'
                              }`}
                            >
                              {progressData.contextsCompleted.includes(ctx) && (
                                <CheckCircle2 className="w-3 h-3 inline mr-1" />
                              )}
                              {PRACTICE_CONTEXTS[ctx] || ctx}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Success Rate */}
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Average Success Rate</span>
                          <span className={`font-medium ${
                            progressData.averageSuccessRate >= 70 ? 'text-green-600' : 'text-muted-foreground'
                          }`}>
                            {progressData.averageSuccessRate.toFixed(0)}%
                          </span>
                        </div>
                        <Progress 
                          value={progressData.averageSuccessRate} 
                          className="h-2"
                        />
                        <p className="text-xs text-muted-foreground mt-1">Minimum 70% required</p>
                      </div>
                    </div>

                    {/* Practice form */}
                    {!showPracticeForm ? (
                      <Button onClick={() => setShowPracticeForm(true)} className="w-full" variant="outline">
                        <Plus className="w-4 h-4 mr-2" />
                        Record Practice Session
                      </Button>
                    ) : (
                      <Card className="p-4 space-y-3">
                        <h4 className="font-semibold text-sm">Record Practice</h4>
                        
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">Context</label>
                          <Select value={practiceContext} onValueChange={setPracticeContext}>
                            <SelectTrigger>
                              <SelectValue placeholder="Where did you practice?" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(PRACTICE_CONTEXTS).map(([key, label]) => (
                                <SelectItem key={key} value={key}>{label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">Distraction Level</label>
                          <Select value={distractionLevel} onValueChange={setDistractionLevel}>
                            <SelectTrigger>
                              <SelectValue placeholder="How distracting was it?" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(DISTRACTION_LEVELS).map(([key, label]) => (
                                <SelectItem key={key} value={key}>{label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">
                            Success Rate: {successRate[0]}%
                          </label>
                          <Slider
                            value={successRate}
                            onValueChange={setSuccessRate}
                            min={0}
                            max={100}
                            step={5}
                          />
                        </div>

                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">Notes (optional)</label>
                          <Textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Any observations or challenges..."
                            rows={2}
                          />
                        </div>

                        <div className="flex gap-2">
                          <Button onClick={handleRecordPractice} className="flex-1">
                            Save Session
                          </Button>
                          <Button 
                            onClick={() => setShowPracticeForm(false)} 
                            variant="outline"
                          >
                            Cancel
                          </Button>
                        </div>
                      </Card>
                    )}

                    {/* Level up button */}
                    {progressData.canLevelUp && level !== 'proofed' && (
                      <Button 
                        onClick={() => handleLevelUp(level === 'basic' ? 'generalized' : 'proofed')}
                        className="w-full"
                        size="lg"
                      >
                        <ArrowUp className="w-4 h-4 mr-2" />
                        Level Up to {level === 'basic' ? 'Generalized' : 'Proofed'}
                      </Button>
                    )}
                  </>
                )}

                {!isCurrent && req && (
                  <>
                    <Card className="p-4 bg-muted/30">
                      <p className="text-sm text-muted-foreground mb-3">{req.description}</p>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{req.min_sessions_required} sessions</Badge>
                          <span className="text-muted-foreground">required</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{req.contexts_required.length} contexts</Badge>
                          <span className="text-muted-foreground">to practice in</span>
                        </div>
                      </div>
                    </Card>

                    {/* Training tips for future levels */}
                    <Card className="p-3 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
                      <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                        Training Tips for {levelConfig[level].label}
                      </h4>
                      <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
                        <li>• Practice consistently across different scenarios</li>
                        <li>• Use high-value rewards for difficult contexts</li>
                        <li>• Keep sessions short and positive</li>
                        <li>• Gradually increase difficulty over time</li>
                      </ul>
                    </Card>
                  </>
                )}
              </TabsContent>
            );
          })}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
