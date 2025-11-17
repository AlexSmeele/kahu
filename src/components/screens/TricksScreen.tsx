import { useState, useMemo, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Award, Star, Clock, CheckCircle2, Lock, Trophy, Target, Zap, Play, BookOpen, GraduationCap, AlertCircle, ChevronDown, ChevronUp, Users, X, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TopicCard } from "@/components/training/TopicCard";
import { RoadmapContent } from "@/components/training/RoadmapContent";
import { useDogs } from "@/hooks/useDogs";
import { useSkills, Skill } from "@/hooks/useSkills";
import { HeaderBar } from "@/components/headers/HeaderBar";
import { DogDropdown } from "@/components/dogs/DogDropdown";
import { ClickerButton } from "@/components/training/ClickerButton";
import { ClickerModal } from "@/components/training/ClickerModal";
import { MOCK_FOUNDATION_TOPICS, MOCK_TROUBLESHOOTING_TOPICS, type FoundationTopic, isMockDogId } from "@/lib/mockData";
import { QuickActionFAB, type QuickAction } from "@/components/QuickActionFAB";

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
  
  // Render difficulty paws
  const renderPaws = () => {
    const paws = [];
    for (let i = 0; i < 5; i++) {
      paws.push(
        <span 
          key={i} 
          className={`text-sm ${i < trick.difficulty_level ? 'opacity-100' : 'opacity-30'}`}
        >
          🐾
        </span>
      );
    }
    return paws;
  };

  const CategoryIcon = categoryIcons[trick.category as keyof typeof categoryIcons] || Award;
  const categoryColor = categoryColors[trick.category as keyof typeof categoryColors] || 'bg-gray-500';

  return (
    <div 
      onClick={() => onTrickClick(trick)}
      className="relative aspect-[3/4] bg-card border border-border rounded-xl overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] flex flex-col"
    >
      {/* Header with category color bar */}
      <div className={`${categoryColor} h-2 w-full`} />

      {/* Card Content */}
      <div className="flex-1 flex flex-col p-3">
        {/* Icon Section */}
        <div className="flex-1 flex items-center justify-center py-2">
          <div className={`w-20 h-20 ${categoryColor} rounded-2xl flex items-center justify-center shadow-sm`}>
            <CategoryIcon className="w-10 h-10 text-white" />
          </div>
        </div>

        {/* Info Section */}
        <div className="space-y-1.5 text-center pb-1">
          <h3 className="font-bold text-base leading-tight line-clamp-2 min-h-[2.5rem]">{trick.name}</h3>
          
          {/* Difficulty and Category */}
          <div className="flex items-center justify-center gap-2">
            <div className="flex gap-0.5">
              {renderPaws()}
            </div>
          </div>
          
          {/* Category Badge */}
          <div className="flex justify-center">
            <Badge variant="secondary" className="text-xs">
              {trick.category}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}

interface TricksScreenProps {
  selectedDogId: string;
  onDogChange: (dogId: string) => void;
}

export function TricksScreen({ selectedDogId, onDogChange }: TricksScreenProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { dogs } = useDogs();
  const currentDog = dogs.find(dog => dog.id === selectedDogId);
  const { skills, dogSkills, loading, startSkill, addPracticeSession, updateSkillStatus, refetch } = useSkills(currentDog?.id);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [isClickerOpen, setIsClickerOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState<'program' | 'foundations' | 'skills' | 'troubleshooting'>('program');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    program: false,
    foundations: false,
    skills: false,
    troubleshooting: false
  });

  // Handle section query parameter on mount
  useEffect(() => {
    const section = searchParams.get('section');
    if (section === 'foundations' || section === 'troubleshooting' || section === 'skills' || section === 'program') {
      setSelectedSection(section);
    }
  }, [searchParams]);

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
    navigate(`/training/skill/${trick.id}/detail`);
  };

  const handlePracticeSession = (dogTrickId: string) => {
    addPracticeSession(dogTrickId);
  };

  const handleUpdateStatus = (dogTrickId: string, status: any) => {
    updateTrickStatus(dogTrickId, status);
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/10 overflow-hidden relative">
      <HeaderBar
        transparent={false}
        elevated={false}
        leftSlot={
          <DogDropdown 
            selectedDogId={selectedDogId} 
            onDogChange={onDogChange}
            variant="inline"
          />
        }
        rightSlot={
          <ClickerButton onClick={() => setIsClickerOpen(true)} />
        }
      />
      
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
                  Follow a chronological roadmap from preparing for your puppy through raising them into a well-trained adult dog. Each stage unlocks age-appropriate training content.
                </p>
              )}
            </div>

            {/* Embedded Roadmap */}
            <RoadmapContent selectedDogId={selectedDogId} />
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
                <div key={level} className="space-y-3">
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
                  <div className="grid grid-cols-2 gap-4 p-4">
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

            {/* Foundation Topics Gallery */}
            <div className="grid grid-cols-2 gap-3">
              {foundationTopics.map((topic) => (
                <TopicCard key={topic.id} topic={topic} type="foundation" />
              ))}
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

            {/* Troubleshooting Topics Gallery */}
            <div className="grid grid-cols-2 gap-3">
              {troubleshootingTopics.map((topic) => (
                <TopicCard key={topic.id} topic={topic} type="troubleshooting" />
              ))}
            </div>

          </div>
        )}
      </div>

      {/* Modals */}
      <ClickerModal isOpen={isClickerOpen} onClose={() => setIsClickerOpen(false)} />
      
      <QuickActionFAB
        theme="dark"
        actions={[
          {
            icon: Play,
            label: 'Start Training',
            onClick: () => {
              if (currentDog) {
                navigate(`/training-session?dogId=${currentDog.id}`);
              }
            },
            gradient: 'from-emerald-500 to-emerald-600'
          },
          {
            icon: Trophy,
            label: 'View Roadmap',
            onClick: () => {
              navigate(`/?tab=tricks&section=program`);
            },
            gradient: 'from-amber-500 to-amber-600'
          },
          {
            icon: Target,
            label: 'Foundations',
            onClick: () => {
              navigate(`/?tab=tricks&section=foundations`);
            },
            gradient: 'from-blue-500 to-blue-600'
          }
        ]}
      />
    </div>
  );
}
