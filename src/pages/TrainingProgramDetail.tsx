import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Circle, Lock, Play, Clock, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  useTrainingPrograms, 
  useProgramWeeks, 
  useWeekLessons,
  useUserProgress,
  useLessonCompletions 
} from '@/hooks/useTrainingPrograms';
import { useDogs } from '@/hooks/useDogs';
import { toast } from 'sonner';

export default function TrainingProgramDetail() {
  const { programId } = useParams<{ programId: string }>();
  const navigate = useNavigate();
  const { programs, loading: programsLoading } = useTrainingPrograms();
  const { weeks, loading: weeksLoading } = useProgramWeeks(programId!);
  const { dogs } = useDogs();
  const { progress, updateProgress } = useUserProgress(dogs[0]?.id || null);
  const { isLessonCompleted } = useLessonCompletions(dogs[0]?.id || null);
  const [selectedWeek, setSelectedWeek] = useState<string | null>(null);
  const { lessons, loading: lessonsLoading } = useWeekLessons(selectedWeek || '');

  const program = programs.find(p => p.id === programId);
  const userProgress = progress.find(p => p.program_id === programId);

  useEffect(() => {
    if (weeks.length > 0 && userProgress) {
      const currentWeek = weeks.find(w => w.week_number === userProgress.current_week);
      if (currentWeek) {
        setSelectedWeek(currentWeek.id);
      }
    } else if (weeks.length > 0) {
      setSelectedWeek(weeks[0].id);
    }
  }, [weeks, userProgress]);

  const handleWeekSelect = (weekId: string) => {
    setSelectedWeek(weekId);
  };

  const handleCompleteWeek = async (weekNumber: number) => {
    if (!userProgress) return;
    
    try {
      await updateProgress(userProgress.id, {
        current_week: weekNumber + 1,
        ...(weekNumber === weeks.length ? { status: 'completed', completed_at: new Date().toISOString() } : {})
      });
      
      if (weekNumber === weeks.length) {
        toast.success('Congratulations! Program completed!', {
          description: 'You\'ve finished the entire training program!'
        });
      } else {
        toast.success('Week completed!', {
          description: `Moving to week ${weekNumber + 1}`
        });
      }
    } catch (error) {
      toast.error('Failed to update progress');
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'foundation': return 'bg-blue-500/10 text-blue-500';
      case 'skill': return 'bg-purple-500/10 text-purple-500';
      case 'troubleshooting': return 'bg-orange-500/10 text-orange-500';
      default: return 'bg-gray-500/10 text-gray-500';
    }
  };

  const getLessonTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return '🎥';
      case 'article': return '📄';
      case 'exercise': return '🏋️';
      case 'interactive': return '🎮';
      default: return '📖';
    }
  };

  if (programsLoading || weeksLoading) {
    return (
      <div className="content-frame bg-background">
        <div className="p-6 space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="content-frame bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Program Not Found</h2>
          <Button onClick={() => navigate('/training-programs')}>
            View All Programs
          </Button>
        </div>
      </div>
    );
  }

  const selectedWeekData = weeks.find(w => w.id === selectedWeek);
  const completedLessons = lessons.filter(l => isLessonCompleted(l.id)).length;
  const totalLessons = lessons.length;
  const weekProgress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  return (
    <div className="content-frame bg-background">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
        <div className="p-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/training-programs')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            All Programs
          </Button>
          <h1 className="text-2xl font-bold mt-4">{program.name}</h1>
          {userProgress && (
            <div className="mt-3">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Overall Progress</span>
                <span className="font-medium">
                  Week {userProgress.current_week} of {program.duration_weeks}
                </span>
              </div>
              <Progress 
                value={(userProgress.current_week / program.duration_weeks) * 100} 
              />
            </div>
          )}
        </div>
      </header>

      <div className="p-6 space-y-6 pb-24">
        {/* Weeks Navigation */}
        <Card className="p-4">
          <h2 className="font-semibold mb-3">Program Weeks</h2>
          <div className="grid grid-cols-4 gap-2">
            {weeks.map((week) => {
              const isCurrentWeek = userProgress && week.week_number === userProgress.current_week;
              const isCompleted = userProgress && week.week_number < userProgress.current_week;
              const isLocked = userProgress && week.week_number > userProgress.current_week;

              return (
                <button
                  key={week.id}
                  onClick={() => !isLocked && handleWeekSelect(week.id)}
                  disabled={isLocked}
                  className={`
                    p-3 rounded-lg border-2 transition-all text-center
                    ${selectedWeek === week.id ? 'border-primary bg-primary/10' : 'border-border'}
                    ${isLocked ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary/50'}
                  `}
                >
                  <div className="text-lg font-semibold mb-1">
                    {week.week_number}
                  </div>
                  <div className="flex justify-center">
                    {isCompleted && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                    {isCurrentWeek && <Play className="w-4 h-4 text-primary" />}
                    {isLocked && <Lock className="w-4 h-4 text-muted-foreground" />}
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Selected Week Details */}
        {selectedWeekData && (
          <Card className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold mb-1">
                  Week {selectedWeekData.week_number}: {selectedWeekData.title}
                </h2>
                <p className="text-muted-foreground text-sm">
                  {selectedWeekData.description}
                </p>
              </div>
            </div>

            {selectedWeekData.focus_areas && selectedWeekData.focus_areas.length > 0 && (
              <div className="flex gap-2 mb-4">
                {selectedWeekData.focus_areas.map((area) => (
                  <Badge key={area} variant="secondary">
                    {area}
                  </Badge>
                ))}
              </div>
            )}

            {selectedWeekData.goals && selectedWeekData.goals.length > 0 && (
              <div className="mb-4">
                <h3 className="font-medium mb-2">Week Goals:</h3>
                <ul className="space-y-1">
                  {selectedWeekData.goals.map((goal, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <Circle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      <span>{goal}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Week Progress</span>
                <span className="font-medium">
                  {completedLessons} of {totalLessons} lessons
                </span>
              </div>
              <Progress value={weekProgress} />
            </div>

            {/* Lessons */}
            <div className="space-y-3">
              <h3 className="font-medium">Lessons:</h3>
              {lessonsLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : (
                <>
                  {lessons.map((lesson) => {
                    const completed = isLessonCompleted(lesson.id);
                    return (
                      <button
                        key={lesson.id}
                        onClick={() => navigate(`/training-lesson/${lesson.id}`)}
                        className="w-full text-left"
                      >
                        <Card className="p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-1">
                              {completed ? (
                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                              ) : (
                                <Circle className="w-5 h-5 text-muted-foreground" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-lg">{getLessonTypeIcon(lesson.lesson_type)}</span>
                                <Badge className={getCategoryColor(lesson.category)}>
                                  {lesson.category}
                                </Badge>
                              </div>
                              <h4 className="font-medium mb-1">{lesson.title}</h4>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  <span>{lesson.estimated_minutes} min</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <BookOpen className="w-3 h-3" />
                                  <span className="capitalize">{lesson.lesson_type}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Card>
                      </button>
                    );
                  })}
                </>
              )}
            </div>

            {weekProgress === 100 && userProgress && selectedWeekData.week_number === userProgress.current_week && (
              <Button 
                className="w-full mt-4"
                onClick={() => handleCompleteWeek(selectedWeekData.week_number)}
              >
                Complete Week {selectedWeekData.week_number}
              </Button>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
