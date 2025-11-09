import { useState, useMemo } from "react";
import { Award, Star, Clock, CheckCircle2, Lock, Trophy, Target, Zap, Play, BookOpen, GraduationCap, AlertCircle, ChevronDown, ChevronUp, Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useDogs } from "@/hooks/useDogs";
import { useTricks, Trick } from "@/hooks/useTricks";
import { DogDropdown } from "@/components/dogs/DogDropdown";
import { PageLogo } from "@/components/layout/PageLogo";
import { ClickerButton } from "@/components/training/ClickerButton";
import { ClickerModal } from "@/components/training/ClickerModal";
import { TrickDetailModal } from "@/components/tricks/TrickDetailModal";
import { MOCK_FOUNDATION_TOPICS, MOCK_TROUBLESHOOTING_TOPICS, type FoundationTopic, type FoundationSubSession, isMockDogId } from "@/lib/mockData";

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

function TrickCard({ trick, dogTrick, onStart, onPractice, onTrickClick, hasUnmetPrerequisites, unmetPrerequisites }: any) {
  const isCompleted = dogTrick?.status === 'mastered';
  const isInProgress = dogTrick && dogTrick.status !== 'not_started' && !isCompleted;
  const progress = isCompleted ? 100 : isInProgress ? Math.min((dogTrick.total_sessions / 10) * 100, 80) : 0;
  
  const CategoryIcon = categoryIcons[trick.category as keyof typeof categoryIcons] || Award;
  const categoryColor = categoryColors[trick.category as keyof typeof categoryColors] || 'bg-gray-500';

  return (
    <div 
      onClick={() => onTrickClick(trick)}
      className={`bg-card rounded-xl p-3 border-2 transition-all duration-200 hover:scale-[1.02] cursor-pointer flex flex-col ${
        isCompleted ? 'border-green-400 bg-green-50 dark:bg-green-950/20' : 
        isInProgress ? 'border-blue-400 bg-blue-50 dark:bg-blue-950/20' : 
        'border-border hover:border-primary/50'
      }`}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <div className={`w-9 h-9 ${categoryColor} rounded-lg flex items-center justify-center relative flex-shrink-0`}>
          <CategoryIcon className="w-4.5 h-4.5 text-white" />
          {isCompleted && (
            <div className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-2.5 h-2.5 text-white" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-sm text-foreground leading-tight">{trick.name}</h3>
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <span>Level {trick.difficulty_level}</span>
            <span>•</span>
            <span>{trick.category}</span>
            {trick.estimated_time_weeks && (
              <>
                <span>•</span>
                <Clock className="w-2.5 h-2.5" />
                <span>{trick.estimated_time_weeks}w</span>
              </>
            )}
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{trick.description}</p>

      {/* Prerequisites Warning */}
      {hasUnmetPrerequisites && (
        <div className="mb-2 p-2 bg-amber-50 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-700 rounded-lg">
          <div className="flex items-start gap-1.5">
            <AlertCircle className="w-3 h-3 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-medium text-amber-800 dark:text-amber-300 mb-0.5">Prerequisites Required</p>
              <p className="text-[9px] text-amber-700 dark:text-amber-400">
                Master: {unmetPrerequisites.join(', ')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      {(isInProgress || isCompleted) && (
        <div className="mb-2">
          <div className="flex justify-between text-[10px] mb-0.5">
            <span className="text-muted-foreground">Progress</span>
            <span className={isCompleted ? 'text-green-600 font-bold' : 'text-blue-600'}>
              {isCompleted ? "Mastered!" : `${Math.round(progress)}%`}
            </span>
          </div>
          <Progress value={progress} className="h-1.5" />
          {dogTrick && dogTrick.total_sessions > 0 && (
            <p className="text-[9px] text-muted-foreground mt-0.5">
              {dogTrick.total_sessions} sessions
            </p>
          )}
        </div>
      )}

      {/* Action Button */}
      <div>
        {!dogTrick && (
          <Button 
            onClick={(e) => {
              e.stopPropagation();
              onStart(trick.id);
            }}
            className="w-full bg-gradient-to-r from-primary to-primary-hover hover:from-primary-hover hover:to-primary text-white font-semibold py-2 rounded-lg h-8 text-xs"
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
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-2 rounded-lg h-8 text-xs"
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
            className="w-full border-2 border-green-400 text-green-700 hover:bg-green-50 dark:hover:bg-green-950/20 font-semibold py-2 rounded-lg h-8 text-xs"
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
  const [selectedSection, setSelectedSection] = useState<'program' | 'foundations' | 'skills' | 'troubleshooting'>('program');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    program: false,
    foundations: false,
    skills: false,
    troubleshooting: false
  });
  const [expandedFoundations, setExpandedFoundations] = useState<Record<string, boolean>>({});
  const [expandedTroubleshooting, setExpandedTroubleshooting] = useState<Record<string, boolean>>({});
  const [selectedSubSession, setSelectedSubSession] = useState<FoundationSubSession | null>(null);
  const [isSubSessionModalOpen, setIsSubSessionModalOpen] = useState(false);

  // Load foundation topics for mock dogs
  const foundationTopics = isMockDogId(currentDog?.id || '') ? MOCK_FOUNDATION_TOPICS : [];
  const troubleshootingTopics = isMockDogId(currentDog?.id || '') ? MOCK_TROUBLESHOOTING_TOPICS : [];

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

  // Check for unmet prerequisites
  const getUnmetPrerequisites = (trick: any) => {
    if (!trick.prerequisites || trick.prerequisites.length === 0) return [];
    return trick.prerequisites.filter((prereq: string) => {
      const prereqTrick = tricks.find(t => t.name === prereq);
      if (!prereqTrick) return false;
      const prereqDogTrick = learnedTricksMap.get(prereqTrick.id);
      return prereqDogTrick?.status !== 'mastered';
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
      <div className="bg-white/80 dark:bg-card/80 backdrop-blur-sm border-b p-2.5 flex-shrink-0">
        {/* Overall Progress */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="font-medium">Overall Progress</span>
            <span className="text-primary font-bold">{Math.round(overallProgress)}%</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </div>

        {/* Quick Stats */}
        <div className="flex justify-between mt-2 text-center">
          <div className="flex-1">
            <div className="text-base font-bold text-green-600">{completedCount}</div>
            <div className="text-[10px] text-muted-foreground">Completed</div>
          </div>
          <div className="flex-1">
            <div className="text-base font-bold text-blue-600">{inProgressCount}</div>
            <div className="text-[10px] text-muted-foreground">In Progress</div>
          </div>
          <div className="flex-1">
            <div className="text-base font-bold text-gray-600">{totalTricks - completedCount - inProgressCount}</div>
            <div className="text-[10px] text-muted-foreground">Remaining</div>
          </div>
        </div>
      </div>

      {/* Button Navigation */}
      <div className="bg-white/80 dark:bg-card/80 backdrop-blur-sm border-b px-4 py-3 flex-shrink-0">
        <div className="space-y-2">
          {/* Main Button - Training Program */}
          <Button
            onClick={() => setSelectedSection('program')}
            variant={selectedSection === 'program' ? 'default' : 'outline'}
            className={`w-full h-11 rounded-2xl flex items-center justify-center gap-2.5 text-base font-bold transition-all ${
              selectedSection === 'program' 
                ? 'bg-gradient-to-r from-primary to-primary-hover shadow-lg scale-105' 
                : 'hover:bg-accent'
            }`}
          >
            <Trophy className="w-5 h-5" />
            <span>Training Program</span>
          </Button>

          {/* Three Buttons Row */}
          <div className="grid grid-cols-3 gap-2">
            <Button
              onClick={() => setSelectedSection('foundations')}
              variant={selectedSection === 'foundations' ? 'default' : 'outline'}
              className={`h-14 rounded-2xl flex flex-col items-center justify-center gap-1.5 font-semibold transition-all ${
                selectedSection === 'foundations'
                  ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg scale-105'
                  : 'hover:bg-accent'
              }`}
            >
              <GraduationCap className="w-5 h-5" />
              <span className="text-xs">Foundations</span>
            </Button>

            <Button
              onClick={() => setSelectedSection('skills')}
              variant={selectedSection === 'skills' ? 'default' : 'outline'}
              className={`h-14 rounded-2xl flex flex-col items-center justify-center gap-1.5 font-semibold transition-all ${
                selectedSection === 'skills'
                  ? 'bg-gradient-to-br from-primary to-primary-hover shadow-lg scale-105'
                  : 'hover:bg-accent'
              }`}
            >
              <Award className="w-5 h-5" />
              <span className="text-xs">Skills</span>
            </Button>

            <Button
              onClick={() => setSelectedSection('troubleshooting')}
              variant={selectedSection === 'troubleshooting' ? 'default' : 'outline'}
              className={`h-14 rounded-2xl flex flex-col items-center justify-center gap-1.5 font-semibold transition-all ${
                selectedSection === 'troubleshooting'
                  ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg scale-105'
                  : 'hover:bg-accent'
              }`}
            >
              <AlertCircle className="w-5 h-5" />
              <span className="text-xs">Troubleshooting</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {/* Training Program Content */}
        {selectedSection === 'program' && (
          <div className="p-4 space-y-4">
            <div className="bg-card rounded-xl p-3 border border-primary/20">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-hover rounded-lg flex items-center justify-center flex-shrink-0">
                  <Trophy className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-base font-bold leading-tight">Training Program</h2>
                  <p className="text-xs text-muted-foreground">Structured learning path</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setExpandedSections(prev => ({ ...prev, program: !prev.program }))}
                  className="flex items-center gap-0.5 h-auto py-1 px-2 flex-shrink-0"
                >
                  <span className="text-xs">{expandedSections.program ? 'Less' : 'More'}</span>
                  {expandedSections.program ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </Button>
              </div>
              {expandedSections.program && (
                <p className="text-xs text-muted-foreground mt-2 pl-10">
                  Your personalized training program will appear here. This section will guide you through a structured curriculum tailored to your dog's level and needs.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Skills Content */}
        {selectedSection === 'skills' && (
          <div className="p-4 space-y-6 pb-8">
            {/* Skills Description Header */}
            <div className="bg-card rounded-xl p-3 border border-primary/20">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-hover rounded-lg flex items-center justify-center flex-shrink-0">
                  <Award className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-base font-bold leading-tight">Skills Library</h2>
                  <p className="text-xs text-muted-foreground">Browse all available tricks</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setExpandedSections(prev => ({ ...prev, skills: !prev.skills }))}
                  className="flex items-center gap-0.5 h-auto py-1 px-2 flex-shrink-0"
                >
                  <span className="text-xs">{expandedSections.skills ? 'Less' : 'More'}</span>
                  {expandedSections.skills ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </Button>
              </div>
              {expandedSections.skills && (
                <p className="text-xs text-muted-foreground mt-2 pl-10">
                  Explore our complete collection of tricks organized by difficulty level. Start with beginner tricks to build foundation skills, then progress to more advanced techniques as you and your dog master the basics.
                </p>
              )}
            </div>

            {tricksByDifficulty.map(({ level, color, textColor, tricks: levelTricks }) => {
              // Filter out Foundation category tricks from Skills section
              const skillsTricks = levelTricks.filter(t => t.category !== 'Foundation');
              if (skillsTricks.length === 0) return null;
              
              const levelCompleted = skillsTricks.filter(t => learnedTricksMap.get(t.id)?.status === 'mastered').length;
              const levelProgress = (levelCompleted / skillsTricks.length) * 100;

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
                          {levelCompleted}/{skillsTricks.length}
                        </span>
                      </div>
                      <Progress value={levelProgress} className="h-2 mt-1" />
                    </div>
                  </div>

                  {/* Tricks Grid */}
                  <div className="grid grid-cols-2 gap-3">
                  {skillsTricks.map((trick) => {
                      const unmetPrereqs = getUnmetPrerequisites(trick);
                      return (
                        <TrickCard
                          key={trick.id}
                          trick={trick}
                          dogTrick={learnedTricksMap.get(trick.id)}
                          onStart={handleStart}
                          onPractice={handlePractice}
                          onTrickClick={handleTrickClick}
                          hasUnmetPrerequisites={unmetPrereqs.length > 0}
                          unmetPrerequisites={unmetPrereqs}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Foundations Content */}
        {selectedSection === 'foundations' && (
          <div className="p-4 space-y-4 pb-8">
            <div className="bg-card rounded-xl p-3 border border-emerald-500/30">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <GraduationCap className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-base font-bold leading-tight">Foundations</h2>
                  <p className="text-xs text-muted-foreground">Core training principles</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setExpandedSections(prev => ({ ...prev, foundations: !prev.foundations }))}
                  className="flex items-center gap-0.5 h-auto py-1 px-2 flex-shrink-0"
                >
                  <span className="text-xs">{expandedSections.foundations ? 'Less' : 'More'}</span>
                  {expandedSections.foundations ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </Button>
              </div>
              {expandedSections.foundations && (
                <p className="text-xs text-muted-foreground mt-2 pl-10">
                  Learn the fundamental principles of dog training. This section covers essential concepts, techniques, and building blocks for successful training.
                </p>
              )}
            </div>

            {/* Foundation Topics with Sub-Sessions */}
            <div className="space-y-4">
              {foundationTopics.map((topic) => {
                const isExpanded = expandedFoundations[topic.id];
                const completedSessions = 0; // TODO: Track completed sub-sessions
                const totalSessions = topic.subSessions.length;
                const progress = (completedSessions / totalSessions) * 100;

                return (
                  <div key={topic.id} className="bg-card rounded-xl border-2 border-border overflow-hidden">
                    {/* Topic Header */}
                    <button
                      onClick={() => setExpandedFoundations(prev => ({ ...prev, [topic.id]: !prev[topic.id] }))}
                      className="w-full p-4 flex items-center gap-3 hover:bg-accent/50 transition-colors"
                    >
                      <div className={`w-12 h-12 bg-gradient-to-br ${topic.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <h3 className="font-bold text-lg text-foreground">{topic.name}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-1">{topic.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Progress value={progress} className="h-1.5 flex-1" />
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {completedSessions}/{totalSessions}
                          </span>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                    </button>

                    {/* Sub-Sessions */}
                    {isExpanded && (
                      <div className="border-t border-border bg-accent/20">
                        <div className="p-3 space-y-2">
                          {topic.subSessions
                            .sort((a, b) => a.order - b.order)
                            .map((subSession, index) => {
                              const isCompleted = false; // TODO: Track completed state
                              
                              return (
                                <div
                                  key={subSession.id}
                                  onClick={() => {
                                    setSelectedSubSession(subSession);
                                    setIsSubSessionModalOpen(true);
                                  }}
                                  className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${
                                    isCompleted
                                      ? 'border-green-400 bg-green-50 dark:bg-green-950/20'
                                      : 'border-border bg-card hover:border-primary/50 hover:scale-[1.02]'
                                  }`}
                                >
                                  <div className="flex items-start gap-3">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                      isCompleted ? 'bg-green-500' : 'bg-primary'
                                    }`}>
                                      {isCompleted ? (
                                        <CheckCircle2 className="w-4 h-4 text-white" />
                                      ) : (
                                        <span className="text-sm font-bold text-white">{index + 1}</span>
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h4 className="font-semibold text-sm text-foreground">{subSession.name}</h4>
                                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                                        {subSession.description}
                                      </p>
                                      {subSession.estimated_time_weeks && (
                                        <div className="flex items-center gap-1 mt-1 text-[10px] text-muted-foreground">
                                          <Clock className="w-3 h-3" />
                                          <span>{subSession.estimated_time_weeks} weeks</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* Troubleshooting Content */}
        {selectedSection === 'troubleshooting' && (
          <div className="p-4 space-y-4 pb-8">
            <div className="bg-card rounded-xl p-3 border border-orange-500/30">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-base font-bold leading-tight">Troubleshooting</h2>
                  <p className="text-xs text-muted-foreground">Solve common behavior issues</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setExpandedSections(prev => ({ ...prev, troubleshooting: !prev.troubleshooting }))}
                  className="flex items-center gap-0.5 h-auto py-1 px-2 flex-shrink-0"
                >
                  <span className="text-xs">{expandedSections.troubleshooting ? 'Less' : 'More'}</span>
                  {expandedSections.troubleshooting ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </Button>
              </div>
              {expandedSections.troubleshooting && (
                <p className="text-xs text-muted-foreground mt-2 pl-10">
                  Address common behavioral challenges with proven training techniques. Each lesson provides step-by-step guidance to help you understand and modify problem behaviors effectively and humanely.
                </p>
              )}
            </div>

            {/* Troubleshooting Topics with Sub-Sessions */}
            <div className="space-y-4">
              {troubleshootingTopics.map((topic) => {
                const isExpanded = expandedTroubleshooting[topic.id];
                const completedSessions = 0; // TODO: Track completed sub-sessions
                const totalSessions = topic.subSessions.length;
                const progress = (completedSessions / totalSessions) * 100;

                return (
                  <div key={topic.id} className="bg-card rounded-xl border-2 border-border overflow-hidden">
                    {/* Topic Header */}
                    <button
                      onClick={() => setExpandedTroubleshooting(prev => ({ ...prev, [topic.id]: !prev[topic.id] }))}
                      className="w-full p-4 flex items-center gap-3 hover:bg-accent/50 transition-colors"
                    >
                      <div className={`w-12 h-12 bg-gradient-to-br ${topic.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                        <AlertCircle className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <h3 className="font-bold text-lg text-foreground">{topic.name}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-1">{topic.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Progress value={progress} className="h-1.5 flex-1" />
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {completedSessions}/{totalSessions}
                          </span>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                    </button>

                    {/* Sub-Sessions */}
                    {isExpanded && (
                      <div className="border-t border-border bg-accent/20">
                        <div className="p-3 space-y-2">
                          {topic.subSessions
                            .sort((a, b) => a.order - b.order)
                            .map((subSession, index) => {
                              const isCompleted = false; // TODO: Track completed state
                              
                              return (
                                <div
                                  key={subSession.id}
                                  onClick={() => {
                                    setSelectedSubSession(subSession);
                                    setIsSubSessionModalOpen(true);
                                  }}
                                  className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${
                                    isCompleted
                                      ? 'border-green-400 bg-green-50 dark:bg-green-950/20'
                                      : 'border-border bg-card hover:border-primary/50 hover:scale-[1.02]'
                                  }`}
                                >
                                  <div className="flex items-start gap-3">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                      isCompleted ? 'bg-green-500' : 'bg-orange-500'
                                    }`}>
                                      {isCompleted ? (
                                        <CheckCircle2 className="w-4 h-4 text-white" />
                                      ) : (
                                        <span className="text-sm font-bold text-white">{index + 1}</span>
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h4 className="font-semibold text-sm text-foreground">{subSession.name}</h4>
                                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                                        {subSession.description}
                                      </p>
                                      {subSession.estimated_time_weeks && (
                                        <div className="flex items-center gap-1 mt-1 text-[10px] text-muted-foreground">
                                          <Clock className="w-3 h-3" />
                                          <span>{subSession.estimated_time_weeks} weeks</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

          </div>
        )}
      </div>

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

      {/* Sub-Session Detail Modal */}
      {selectedSubSession && isSubSessionModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center"
          onClick={() => setIsSubSessionModalOpen(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
          
          {/* Modal Content */}
          <div 
            className="relative z-[101] w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-card rounded-t-3xl border-t border-border shadow-xl">
              {/* Modal Header */}
              <div className="sticky top-0 bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 rounded-t-3xl">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-white mb-2">
                      {selectedSubSession.name}
                    </h2>
                    <p className="text-sm text-white/90">
                      {selectedSubSession.description}
                    </p>
                    {selectedSubSession.estimated_time_weeks && (
                      <div className="flex items-center gap-2 mt-3 text-white/90">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">Estimated: {selectedSubSession.estimated_time_weeks} weeks</span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => setIsSubSessionModalOpen(false)}
                    className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center flex-shrink-0 transition-colors"
                    aria-label="Close"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Instructions */}
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    Training Guide
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                    {selectedSubSession.instructions}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 pt-4">
                  <Button
                    className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-6 rounded-xl text-base"
                    onClick={() => {
                      // TODO: Track as started/completed
                      setIsSubSessionModalOpen(false);
                    }}
                  >
                    Start Training Session
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full py-6 rounded-xl text-base"
                    onClick={() => setIsSubSessionModalOpen(false)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
