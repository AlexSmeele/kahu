import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Clock, Award, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTrainingPrograms, useUserProgress } from '@/hooks/useTrainingPrograms';
import { useDogs } from '@/hooks/useDogs';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

export default function TrainingPrograms() {
  const navigate = useNavigate();
  const { programs, loading: programsLoading } = useTrainingPrograms();
  const { dogs } = useDogs();
  const { progress, startProgram, loading: progressLoading } = useUserProgress(dogs[0]?.id || null);
  const [startingProgram, setStartingProgram] = useState<string | null>(null);

  const handleStartProgram = async (programId: string) => {
    setStartingProgram(programId);
    try {
      await startProgram(programId, dogs[0]?.id || null);
      toast.success('Training program started!');
      navigate(`/training-program/${programId}`);
    } catch (error) {
      toast.error('Failed to start program');
    } finally {
      setStartingProgram(null);
    }
  };

  const getProgramProgress = (programId: string) => {
    return progress.find(p => p.program_id === programId);
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-500/10 text-green-500';
      case 'intermediate': return 'bg-yellow-500/10 text-yellow-500';
      case 'advanced': return 'bg-red-500/10 text-red-500';
      default: return 'bg-gray-500/10 text-gray-500';
    }
  };

  const getAgeGroupIcon = (ageGroup: string) => {
    switch (ageGroup) {
      case 'puppy': return '🐕';
      case 'adolescent': return '🐶';
      case 'adult': return '🦮';
      case 'senior': return '🐕‍🦺';
      default: return '🐾';
    }
  };

  if (programsLoading || progressLoading) {
    return (
      <div className="content-frame bg-background">
        <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
          <div className="p-4">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl font-bold mt-4">Training Programs</h1>
          </div>
        </header>

        <div className="p-6 space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="content-frame bg-background">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
        <div className="p-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold mt-4">Training Programs</h1>
          <p className="text-muted-foreground mt-1">
            Structured training curricula for every stage
          </p>
        </div>
      </header>

      <div className="p-6 space-y-6 pb-24">
        {programs.map((program) => {
          const programProgress = getProgramProgress(program.id);
          const isInProgress = programProgress && programProgress.status === 'in_progress';
          const isCompleted = programProgress && programProgress.status === 'completed';

          return (
            <Card key={program.id} className="overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{getAgeGroupIcon(program.age_group)}</span>
                      <Badge className={getDifficultyColor(program.difficulty_level)}>
                        {program.difficulty_level}
                      </Badge>
                      {isCompleted && (
                        <Badge variant="outline" className="bg-green-500/10 text-green-500">
                          <Award className="w-3 h-3 mr-1" />
                          Completed
                        </Badge>
                      )}
                      {isInProgress && (
                        <Badge variant="outline" className="bg-blue-500/10 text-blue-500">
                          In Progress
                        </Badge>
                      )}
                    </div>
                    <h2 className="text-xl font-semibold mb-2">{program.name}</h2>
                    <p className="text-muted-foreground text-sm mb-4">
                      {program.description}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 mb-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{program.duration_weeks} weeks</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span className="capitalize">{program.age_group}</span>
                    {program.min_age_weeks && program.max_age_weeks && (
                      <span className="text-xs">
                        ({program.min_age_weeks}-{program.max_age_weeks} weeks)
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    <span>Comprehensive curriculum</span>
                  </div>
                </div>

                {isInProgress && programProgress && (
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">
                        Week {programProgress.current_week} of {program.duration_weeks}
                      </span>
                      <span className="font-medium">
                        {Math.round((programProgress.current_week / program.duration_weeks) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ 
                          width: `${(programProgress.current_week / program.duration_weeks) * 100}%` 
                        }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  {isInProgress ? (
                    <Button 
                      className="flex-1"
                      onClick={() => navigate(`/training-program/${program.id}`)}
                    >
                      Continue Program
                    </Button>
                  ) : isCompleted ? (
                    <Button 
                      variant="outline"
                      className="flex-1"
                      onClick={() => navigate(`/training-program/${program.id}`)}
                    >
                      Review Program
                    </Button>
                  ) : (
                    <Button 
                      className="flex-1"
                      onClick={() => handleStartProgram(program.id)}
                      disabled={startingProgram === program.id}
                    >
                      {startingProgram === program.id ? 'Starting...' : 'Start Program'}
                    </Button>
                  )}
                  <Button 
                    variant="outline"
                    onClick={() => navigate(`/training-program/${program.id}/preview`)}
                  >
                    Preview
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}

        {programs.length === 0 && (
          <Card className="p-12 text-center">
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Programs Available</h3>
            <p className="text-muted-foreground">
              Training programs will appear here once they're published.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
