import { useState, useMemo } from "react";
import { Award, Star, Clock, CheckCircle2, Lock, Trophy, Target, Zap, Play, BookOpen, GraduationCap, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useDogs } from "@/hooks/useDogs";
import { useTricks, Trick } from "@/hooks/useTricks";
import { DogDropdown } from "@/components/dogs/DogDropdown";
import { PageLogo } from "@/components/layout/PageLogo";
import { ClickerButton } from "@/components/training/ClickerButton";
import { ClickerModal } from "@/components/training/ClickerModal";
import { TrickDetailModal } from "@/components/tricks/TrickDetailModal";

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
  'Prop Work': Play,
  'Impulse Control': Trophy,
  Practical: BookOpen,
  Chain: CheckCircle2
};

const difficultyRanges = {
  'Beginner': { min: 1, max: 2, color: 'bg-green-500', textColor: 'text-green-700' },
  'Intermediate': { min: 3, max: 4, color: 'bg-yellow-500', textColor: 'text-yellow-700' },
  'Advanced': { min: 5, max: 6, color: 'bg-orange-500', textColor: 'text-orange-700' },
  'Expert': { min: 7, max: 10, color: 'bg-red-500', textColor: 'text-red-700' }
};

function TrickCard({ trick, dogTrick, onStart, onPractice, onTrickClick, isLocked }: any) {
  const isCompleted = dogTrick?.status === 'mastered';
  const isInProgress = dogTrick && dogTrick.status !== 'not_started' && !isCompleted;
  const progress = isCompleted ? 100 : isInProgress ? Math.min((dogTrick.total_sessions / 10) * 100, 80) : 0;
  
  const CategoryIcon = categoryIcons[trick.category as keyof typeof categoryIcons] || Award;
  const categoryColor = categoryColors[trick.category as keyof typeof categoryColors] || 'bg-gray-500';

  if (isLocked) {
    return (
      <div className="relative bg-muted/50 rounded-2xl p-4 border-2 border-muted">
        <div className="absolute inset-0 bg-background/80 rounded-2xl flex items-center justify-center">
          <div className="text-center">
            <Lock className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground font-medium">Locked</p>
          </div>
        </div>
        <div className="opacity-30">
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-12 h-12 ${categoryColor} rounded-xl flex items-center justify-center`}>
              <CategoryIcon className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg text-foreground">{trick.name}</h3>
              <p className="text-sm text-muted-foreground">Level {trick.difficulty_level} • {trick.category}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      onClick={() => onTrickClick(trick)}
      className={`bg-card rounded-2xl p-4 border-2 transition-all duration-200 hover:scale-105 cursor-pointer ${
        isCompleted ? 'border-green-400 bg-green-50 dark:bg-green-950/20' : 
        isInProgress ? 'border-blue-400 bg-blue-50 dark:bg-blue-950/20' : 
        'border-border hover:border-primary/50'
      }`}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-12 h-12 ${categoryColor} rounded-xl flex items-center justify-center relative`}>
          <CategoryIcon className="w-6 h-6 text-white" />
          {isCompleted && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-3 h-3 text-white" />
            </div>
          )}
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-lg text-foreground">{trick.name}</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Level {trick.difficulty_level}</span>
            <span>•</span>
            <span>{trick.category}</span>
            {trick.estimated_time_weeks && (
              <>
                <span>•</span>
                <Clock className="w-3 h-3" />
                <span>{trick.estimated_time_weeks}w</span>
              </>
            )}
          </div>
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{trick.description}</p>

      {/* Progress Bar */}
      {(isInProgress || isCompleted) && (
        <div className="mb-3">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-muted-foreground">Progress</span>
            <span className={isCompleted ? 'text-green-600 font-bold' : 'text-blue-600'}>
              {isCompleted ? "Mastered!" : `${Math.round(progress)}%`}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
          {dogTrick && dogTrick.total_sessions > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              {dogTrick.total_sessions} practice sessions
            </p>
          )}
        </div>
      )}

      {/* Action Button */}
      <div className="space-y-2">
        {!dogTrick && (
          <Button 
            onClick={(e) => {
              e.stopPropagation();
              onStart(trick.id);
            }}
            className="w-full bg-gradient-to-r from-primary to-primary-hover hover:from-primary-hover hover:to-primary text-white font-bold py-3 rounded-xl"
          >
            Start Learning
          </Button>
        )}
        
        {isInProgress && (
          <Button 
            onClick={(e) => {
              e.stopPropagation();
              onPractice(trick.id);
            }}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-3 rounded-xl"
          >
            Continue Practice 🚀
          </Button>
        )}
        
        {isCompleted && (
          <Button 
            onClick={(e) => {
              e.stopPropagation();
              onPractice(trick.id);
            }}
            variant="outline"
            className="w-full border-2 border-green-400 text-green-700 hover:bg-green-50 dark:hover:bg-green-950/20 font-bold py-3 rounded-xl"
          >
            Review & Perfect ⭐
          </Button>
        )}
      </div>
    </div>
  );
}

interface TricksScreenProps {
  selectedDogId: string;
  onDogChange: (dogId: string) => void;
}

export function TricksScreen({ selectedDogId, onDogChange }: TricksScreenProps) {
  const { dogs } = useDogs();
  const currentDog = dogs.find(dog => dog.id === selectedDogId) || dogs[0];
  const { tricks, dogTricks, loading, startTrick, addPracticeSession, updateTrickStatus } = useTricks(currentDog?.id);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedTrick, setSelectedTrick] = useState<Trick | null>(null);
  const [isTrickModalOpen, setIsTrickModalOpen] = useState(false);
  const [isClickerOpen, setIsClickerOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/10">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-primary to-primary-hover rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Award className="w-8 h-8 text-white" />
            </div>
            <p className="text-muted-foreground">Loading your training journey...</p>
          </div>
        </div>
      </div>
    );
  }

  // Create a map of learned tricks for quick lookup
  const learnedTricksMap = new Map(dogTricks.map(dt => [dt.trick_id, dt]));

  // Calculate stats
  const totalTricks = tricks.length;
  const completedCount = dogTricks.filter(dt => dt.status === 'mastered').length;
  const inProgressCount = dogTricks.filter(dt => dt.status !== 'not_started' && dt.status !== 'mastered').length;
  const overallProgress = totalTricks > 0 ? (completedCount / totalTricks) * 100 : 0;

  // Group tricks by difficulty level
  const tricksByDifficulty = Object.entries(difficultyRanges).map(([level, range]) => ({
    level,
    ...range,
    tricks: tricks.filter(t => t.difficulty_level >= range.min && t.difficulty_level <= range.max)
  }));

  // Check if prerequisites are met
  const isUnlocked = (trick: any) => {
    if (!trick.prerequisites || trick.prerequisites.length === 0) return true;
    return trick.prerequisites.every((prereq: string) => {
      const prereqTrick = tricks.find(t => t.name === prereq);
      if (!prereqTrick) return false;
      const prereqDogTrick = learnedTricksMap.get(prereqTrick.id);
      return prereqDogTrick?.status === 'mastered';
    });
  };

  const handleStart = (trickId: string) => {
    startTrick(trickId);
  };

  const handlePractice = (trickId: string) => {
    // Find the dogTrick for this trick
    const dogTrick = learnedTricksMap.get(trickId);
    if (dogTrick) {
      addPracticeSession(dogTrick.id);
    }
  };

  const handleTrickClick = (trick: Trick) => {
    setSelectedTrick(trick);
    setIsTrickModalOpen(true);
  };

  const handlePracticeSession = (dogTrickId: string) => {
    addPracticeSession(dogTrickId);
  };

  const handleUpdateStatus = (dogTrickId: string, status: any) => {
    updateTrickStatus(dogTrickId, status);
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/10 overflow-hidden safe-top relative">
      <div className="pt-24 pb-2">
        <DogDropdown selectedDogId={selectedDogId} onDogChange={onDogChange} />
        <PageLogo />
        <ClickerButton onClick={() => setIsClickerOpen(true)} />
      </div>
      
      {/* Stats Header */}
      <div className="bg-white/80 dark:bg-card/80 backdrop-blur-sm border-b p-4 flex-shrink-0">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Overall Progress</span>
            <span className="text-primary font-bold">{Math.round(overallProgress)}%</span>
          </div>
          <Progress value={overallProgress} className="h-3" />
        </div>

        {/* Quick Stats */}
        <div className="flex justify-between mt-4 text-center">
          <div className="flex-1">
            <div className="text-lg font-bold text-green-600">{completedCount}</div>
            <div className="text-xs text-muted-foreground">Completed</div>
          </div>
          <div className="flex-1">
            <div className="text-lg font-bold text-blue-600">{inProgressCount}</div>
            <div className="text-xs text-muted-foreground">In Progress</div>
          </div>
          <div className="flex-1">
            <div className="text-lg font-bold text-gray-600">{totalTricks - completedCount - inProgressCount}</div>
            <div className="text-xs text-muted-foreground">Remaining</div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs defaultValue="program" className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white/80 dark:bg-card/80 backdrop-blur-sm border-b px-4 pt-4 flex-shrink-0">
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="program" className="flex items-center gap-1">
              <Trophy className="w-4 h-4" />
              <span className="hidden sm:inline">Program</span>
            </TabsTrigger>
            <TabsTrigger value="skills" className="flex items-center gap-1">
              <Award className="w-4 h-4" />
              <span className="hidden sm:inline">Skills</span>
            </TabsTrigger>
            <TabsTrigger value="foundations" className="flex items-center gap-1">
              <GraduationCap className="w-4 h-4" />
              <span className="hidden sm:inline">Foundations</span>
            </TabsTrigger>
            <TabsTrigger value="troubleshooting" className="flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Troubleshooting</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Training Program Tab */}
        <TabsContent value="program" className="flex-1 overflow-y-auto min-h-0 m-0">
          <div className="p-4 space-y-4">
            <div className="bg-card rounded-2xl p-6 border-2 border-primary/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-hover rounded-xl flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Training Program</h2>
                  <p className="text-sm text-muted-foreground">Structured learning path</p>
                </div>
              </div>
              <p className="text-muted-foreground">
                Your personalized training program will appear here. This section will guide you through a structured curriculum tailored to your dog's level and needs.
              </p>
            </div>
          </div>
        </TabsContent>

        {/* Skills Tab - Current Tricks List */}
        <TabsContent value="skills" className="flex-1 overflow-y-auto min-h-0 m-0">
          <div className="p-4 space-y-6 pb-8">
            {tricksByDifficulty.map(({ level, color, textColor, tricks: levelTricks }) => {
              if (levelTricks.length === 0) return null;
              
              const levelCompleted = levelTricks.filter(t => learnedTricksMap.get(t.id)?.status === 'mastered').length;
              const levelProgress = (levelCompleted / levelTricks.length) * 100;

              return (
                <div key={level} className="space-y-4">
                  {/* Level Header */}
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 ${color} rounded-lg flex items-center justify-center`}>
                      <span className="text-white text-sm font-bold">{level[0]}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h2 className={`text-xl font-bold ${textColor}`}>{level}</h2>
                        <span className="text-sm text-muted-foreground">
                          {levelCompleted}/{levelTricks.length}
                        </span>
                      </div>
                      <Progress value={levelProgress} className="h-2 mt-1" />
                    </div>
                  </div>

                  {/* Tricks Grid */}
                  <div className="grid gap-4">
                    {levelTricks.map((trick) => (
                      <TrickCard
                        key={trick.id}
                        trick={trick}
                        dogTrick={learnedTricksMap.get(trick.id)}
                        onStart={handleStart}
                        onPractice={handlePractice}
                        onTrickClick={handleTrickClick}
                        isLocked={!isUnlocked(trick)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        {/* Foundations Tab */}
        <TabsContent value="foundations" className="flex-1 overflow-y-auto min-h-0 m-0">
          <div className="p-4 space-y-4">
            <div className="bg-card rounded-2xl p-6 border-2 border-emerald-500/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Foundations</h2>
                  <p className="text-sm text-muted-foreground">Core training principles</p>
                </div>
              </div>
              <p className="text-muted-foreground">
                Learn the fundamental principles of dog training. This section covers essential concepts, techniques, and building blocks for successful training.
              </p>
            </div>
          </div>
        </TabsContent>

        {/* Troubleshooting Tab */}
        <TabsContent value="troubleshooting" className="flex-1 overflow-y-auto min-h-0 m-0">
          <div className="p-4 space-y-6 pb-8">
            <div className="space-y-4">
              {/* Section Header */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-bold">B</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-orange-700">Behavior Issues</h2>
                    <span className="text-sm text-muted-foreground">
                      0/9
                    </span>
                  </div>
                  <Progress value={0} className="h-2 mt-1" />
                </div>
              </div>

              {/* Lessons Grid */}
              <div className="grid gap-4">
                {[
                  { name: 'Hyperactivity', description: 'Learn techniques to manage and reduce hyperactive behavior in your dog.' },
                  { name: 'Phobias', description: 'Address fears and phobias with systematic desensitization methods.' },
                  { name: 'Excessive submission', description: 'Build confidence in overly submissive dogs through positive reinforcement.' },
                  { name: 'Dog-to-dog aggression', description: 'Manage and modify aggressive behavior towards other dogs safely.' },
                  { name: 'Human-oriented aggression', description: 'Address aggression towards people with professional guidance.' },
                  { name: 'Barking', description: 'Control excessive barking and teach appropriate vocalization.' },
                  { name: 'Separation distress', description: 'Help your dog feel secure when left alone.' },
                  { name: 'House training', description: 'Master effective house training techniques for all ages.' },
                  { name: 'Destructive behaviour and bite inhibition', description: 'Prevent destructive behaviors and teach gentle mouth control.' }
                ].map((lesson, index) => (
                  <div
                    key={index}
                    className="bg-card rounded-2xl p-4 border-2 border-border hover:border-orange-500/50 transition-all duration-200 hover:scale-105 cursor-pointer"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                        <AlertCircle className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-foreground">{lesson.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>Behavioral</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{lesson.description}</p>

                    {/* Action Button */}
                    <Button 
                      className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-3 rounded-xl"
                    >
                      Start Lesson
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <ClickerModal isOpen={isClickerOpen} onClose={() => setIsClickerOpen(false)} />
      
      <TrickDetailModal
        isOpen={isTrickModalOpen}
        onClose={() => setIsTrickModalOpen(false)}
        trick={selectedTrick}
        dogTrick={selectedTrick ? learnedTricksMap.get(selectedTrick.id) : undefined}
        onStartTrick={handleStart}
        onPracticeSession={handlePracticeSession}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
}