import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Star, 
  Clock, 
  Award, 
  CheckCircle2, 
  Play, 
  Target, 
  Calendar,
  TrendingUp,
  BookOpen,
  Timer,
  Trophy,
  RotateCcw
} from "lucide-react";
import { Trick, DogTrick } from "@/hooks/useTricks";
import { format } from "date-fns";

interface TrickDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  trick: Trick | null;
  dogTrick?: DogTrick;
  onStartTrick: (trickId: string) => void;
  onPracticeSession: (dogTrickId: string) => void;
  onUpdateStatus: (dogTrickId: string, status: DogTrick['status']) => void;
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

const difficultyColors = {
  1: 'bg-green-500',
  2: 'bg-green-600', 
  3: 'bg-yellow-500',
  4: 'bg-yellow-600',
  5: 'bg-orange-500',
  6: 'bg-orange-600',
  7: 'bg-red-500',
  8: 'bg-red-600',
  9: 'bg-purple-500',
  10: 'bg-purple-600'
};

const getDifficultyLabel = (level: number) => {
  if (level <= 2) return 'Beginner';
  if (level <= 4) return 'Intermediate';
  if (level <= 6) return 'Advanced';
  return 'Expert';
};

export function TrickDetailModal({ 
  isOpen, 
  onClose, 
  trick, 
  dogTrick, 
  onStartTrick, 
  onPracticeSession,
  onUpdateStatus 
}: TrickDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'training' | 'progress'>('overview');

  if (!trick) return null;

  const isCompleted = dogTrick?.status === 'mastered';
  const isInProgress = dogTrick && dogTrick.status !== 'not_started' && !isCompleted;
  const progress = isCompleted ? 100 : isInProgress ? Math.min((dogTrick.total_sessions / 10) * 100, 80) : 0;
  
  const categoryColor = categoryColors[trick.category as keyof typeof categoryColors] || 'bg-gray-500';
  const difficultyColor = difficultyColors[trick.difficulty_level as keyof typeof difficultyColors] || 'bg-gray-500';

  // Parse training steps from instructions
  const trainingSteps = trick.instructions.split('\n').filter(step => step.trim().length > 0);

  // Enhanced training data with common problems and troubleshooting
  const getEnhancedTrainingData = (trickName: string) => {
    const commonProblems = {
      'Sit': [
        'Dog jumps up instead of sitting',
        'Dog only sits when treats are visible',
        'Dog sits but gets up immediately'
      ],
      'Stay': [
        'Dog breaks the stay too early',
        'Dog only stays for a few seconds',
        'Dog gets distracted easily'
      ],
      'Down': [
        'Dog won\'t lie down completely',
        'Dog sits instead of lying down',
        'Dog gets back up immediately'
      ],
      'Come': [
        'Dog ignores the command',
        'Dog comes but very slowly',
        'Dog runs in the opposite direction'
      ],
      'default': [
        'Dog shows no interest in training',
        'Dog gets distracted easily',
        'Dog performs inconsistently'
      ]
    };

    const troubleshooting = {
      'Sit': [
        'Hold treat above dog\'s head and slowly move it back - gravity will help',
        'Practice in a quiet area first, then gradually add distractions',
        'Use a release word like "OK" to let them know when they can get up',
        'Keep training sessions short (5-10 minutes) to maintain focus'
      ],
      'Stay': [
        'Start with very short durations (1-2 seconds) and gradually increase',
        'Use clear hand signal along with verbal command',
        'Practice the "wait" at doorways and meal times',
        'Don\'t call them to break the stay - always return to release them'
      ],
      'Down': [
        'Lure with treat from sitting position to the floor',
        'Try practicing on a comfortable surface first',
        'Be patient - some dogs take longer to feel comfortable lying down',
        'Reward the slightest movement toward the down position initially'
      ],
      'Come': [
        'Never call your dog to come for something they perceive as negative',
        'Practice in a secure, enclosed area first',
        'Use an excited, happy voice when calling',
        'Always reward generously when they come, even if it took a while'
      ],
      'default': [
        'Ensure your dog is not overstimulated or tired',
        'Use higher value treats (cheese, chicken) for difficult tricks',
        'Keep sessions short and end on a positive note',
        'Practice at consistent times when your dog is alert and focused'
      ]
    };

    return {
      problems: commonProblems[trickName as keyof typeof commonProblems] || commonProblems.default,
      solutions: troubleshooting[trickName as keyof typeof troubleshooting] || troubleshooting.default
    };
  };

  const enhancedData = getEnhancedTrainingData(trick.name);

  const handleStartTrick = () => {
    onStartTrick(trick.id);
    setActiveTab('training');
  };

  const handlePracticeSession = () => {
    if (dogTrick) {
      onPracticeSession(dogTrick.id);
    }
  };

  const handleMarkAsCompleted = () => {
    if (dogTrick) {
      onUpdateStatus(dogTrick.id, 'mastered');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[min(95vw,900px)] h-[85vh] flex flex-col p-0">
        {/* Header */}
        <DialogHeader className="p-4 pb-3 flex-shrink-0">
          <div className="flex flex-col items-center text-center">
            <div className={`w-14 h-14 ${categoryColor} rounded-xl flex items-center justify-center relative flex-shrink-0 mb-3`}>
              <Award className="w-7 h-7 text-white" />
              {isCompleted && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
            <div className="w-full">
              <DialogTitle className="text-xl font-bold text-foreground mb-2">
                {trick.name}
              </DialogTitle>
              <div className="flex items-center gap-2 flex-wrap justify-center">
                <Badge variant="secondary" className={`${difficultyColor} text-white text-xs`}>
                  Level {trick.difficulty_level} • {getDifficultyLabel(trick.difficulty_level)}
                </Badge>
                <Badge variant="outline" className="text-xs">{trick.category}</Badge>
                {trick.estimated_time_weeks && (
                  <Badge variant="outline" className="flex items-center gap-1 text-xs">
                    <Clock className="w-3 h-3" />
                    {trick.estimated_time_weeks} weeks
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Tab Navigation */}
        <div className="px-4 pb-3 flex-shrink-0">
          <div className="flex space-x-1 bg-muted p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'overview' 
                  ? 'bg-background text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('training')}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'training' 
                  ? 'bg-background text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Training Guide
            </button>
            <button
              onClick={() => setActiveTab('progress')}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'progress' 
                  ? 'bg-background text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Progress
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden px-4">
          <ScrollArea className="h-full">
            <div className="pr-4">
              {activeTab === 'overview' && (
                <div className="space-y-6 pb-6">
              {/* Trick Illustration Placeholder */}
              <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-8 text-center">
                <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-12 h-12 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Trick illustration coming soon! 🎨
                </p>
              </div>

              {/* Description */}
              <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  About This Trick
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {trick.description}
                </p>
              </div>

              {/* Prerequisites */}
              {trick.prerequisites && trick.prerequisites.length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    Prerequisites
                  </h3>
                  <div className="space-y-2">
                    {trick.prerequisites.map((prereq, index) => (
                      <div key={index} className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm font-medium">{prereq}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Current Status */}
              {dogTrick && (
                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Current Status
                  </h3>
                  <div className="p-4 bg-card border rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-muted-foreground">Progress</span>
                      <span className={`font-bold ${isCompleted ? 'text-green-600' : 'text-blue-600'}`}>
                        {isCompleted ? "Mastered!" : `${Math.round(progress)}%`}
                      </span>
                    </div>
                    <Progress value={progress} className="h-3 mb-3" />
                    <div className="text-sm text-muted-foreground">
                      {dogTrick.total_sessions} practice sessions completed
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'training' && (
            <div className="space-y-6 pb-6">
              <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Step-by-Step Training Guide
                </h3>
                <div className="space-y-4">
                  {trainingSteps.map((step, index) => (
                    <div key={index} className="flex gap-4 p-4 bg-card border rounded-xl">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">{index + 1}</span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm leading-relaxed">{step}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Training Tips */}
              <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-xl">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  Training Tips
                </h4>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• Keep training sessions short (5-10 minutes)</li>
                  <li>• Use high-value treats as rewards</li>
                  <li>• Practice in a quiet, distraction-free environment</li>
                  <li>• End on a positive note</li>
                  <li>• Be patient and consistent</li>
                </ul>
              </div>

              {/* Common Problems */}
              <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-xl">
                <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">
                  Common Problems
                </h4>
                <ul className="text-sm text-amber-800 dark:text-amber-200 space-y-1">
                  {enhancedData.problems.map((problem, index) => (
                    <li key={index}>• {problem}</li>
                  ))}
                </ul>
              </div>

              {/* Troubleshooting */}
              <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-xl">
                <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                  🔧 Troubleshooting Solutions
                </h4>
                <ul className="text-sm text-green-800 dark:text-green-200 space-y-1">
                  {enhancedData.solutions.map((solution, index) => (
                    <li key={index}>• {solution}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'progress' && (
            <div className="space-y-6 pb-6">
              {dogTrick ? (
                <>
                   {/* Overall Progress */}
                  <div className="p-4 bg-card border rounded-xl">
                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Overall Progress
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Completion</span>
                        <span className={`font-bold ${isCompleted ? 'text-green-600' : 'text-blue-600'}`}>
                          {isCompleted ? "Mastered!" : `${Math.round(progress)}%`}
                        </span>
                      </div>
                      <Progress value={progress} className="h-3" />
                      
                      <div className="grid grid-cols-3 gap-3 pt-2">
                        <div className="text-center p-2 bg-muted/50 rounded-lg">
                          <div className="text-lg font-bold text-blue-600">{dogTrick.total_sessions}</div>
                          <div className="text-xs text-muted-foreground mt-1">Sessions</div>
                        </div>
                        <div className="text-center p-2 bg-muted/50 rounded-lg">
                          <div className="text-lg font-bold text-green-600">
                            {dogTrick.started_at ? Math.ceil((new Date().getTime() - new Date(dogTrick.started_at).getTime()) / (1000 * 60 * 60 * 24)) : 0}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">Days</div>
                        </div>
                        <div className="text-center p-2 bg-muted/50 rounded-lg">
                          <div className="text-lg font-bold text-purple-600 leading-tight">
                            {getDifficultyLabel(trick.difficulty_level)}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">Level</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div>
                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Timeline
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <div className="flex-1">
                          <span className="text-sm font-medium">Started Learning</span>
                          <div className="text-xs text-muted-foreground">
                            {dogTrick.started_at && format(new Date(dogTrick.started_at), 'MMM dd, yyyy')}
                          </div>
                        </div>
                      </div>
                      
                      {isCompleted && dogTrick.mastered_at && (
                        <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <div className="flex-1">
                            <span className="text-sm font-medium text-green-700 dark:text-green-300">Mastered!</span>
                            <div className="text-xs text-green-600 dark:text-green-400">
                              {format(new Date(dogTrick.mastered_at), 'MMM dd, yyyy')}
                            </div>
                          </div>
                          <Trophy className="w-5 h-5 text-green-600" />
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <Target className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Ready to Start?</h3>
                  <p className="text-muted-foreground mb-4">
                    Begin your training journey with {trick.name}
                  </p>
                </div>
              )}
            </div>
          )}
            </div>
          </ScrollArea>
        </div>

        {/* Action Buttons */}
        <div className="p-4 pt-3 border-t flex-shrink-0">
          <div className="flex flex-col gap-2">
            {!dogTrick ? (
              <Button onClick={handleStartTrick} className="w-full">
                <Play className="w-4 h-4 mr-2" />
                Start Learning
              </Button>
            ) : isCompleted ? (
              <Button onClick={handlePracticeSession} variant="outline" className="w-full">
                <Trophy className="w-4 h-4 mr-2" />
                Practice & Perfect
              </Button>
            ) : (
              <>
                <Button onClick={handlePracticeSession} className="w-full">
                  <Timer className="w-4 h-4 mr-2" />
                  Practice Session
                </Button>
                {dogTrick.total_sessions >= 3 && (
                  <div className="flex gap-2">
                    <Button onClick={handleMarkAsCompleted} variant="outline" className="flex-1 text-sm">
                      <CheckCircle2 className="w-4 h-4 mr-1.5" />
                      Mark Complete
                    </Button>
                    <Button 
                      onClick={() => onUpdateStatus(dogTrick.id, 'learning')} 
                      variant="ghost" 
                      className="flex-1 text-sm text-muted-foreground hover:text-foreground"
                    >
                      <RotateCcw className="w-4 h-4 mr-1.5" />
                      Reset
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}