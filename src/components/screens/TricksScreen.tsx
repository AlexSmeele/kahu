import { Award, Star, Clock, CheckCircle2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDogs } from "@/hooks/useDogs";
import { useTricks } from "@/hooks/useTricks";

export function TricksScreen() {
  const { dogs } = useDogs();
  const currentDog = dogs[0]; // For now, use the first dog
  const { tricks, dogTricks, loading, startTrick } = useTricks(currentDog?.id);

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <header className="safe-top p-4 bg-card border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-accent to-accent-hover rounded-full flex items-center justify-center">
              <Award className="w-6 h-6 text-accent-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">Tricks Library</h1>
              <p className="text-sm text-muted-foreground">Loading...</p>
            </div>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading tricks...</p>
          </div>
        </div>
      </div>
    );
  }

  // Create a map of learned tricks for quick lookup
  const learnedTricksMap = new Map(
    dogTricks.map(dt => [dt.trick_id, dt])
  );

  // Calculate progress stats
  const completedCount = dogTricks.filter(dt => dt.status === 'mastered').length;
  const inProgressCount = dogTricks.filter(dt => dt.status !== 'not_started' && dt.status !== 'mastered').length;
  const bestStreak = Math.max(...dogTricks.map(dt => dt.total_sessions), 0);
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="safe-top p-4 bg-card border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-accent to-accent-hover rounded-full flex items-center justify-center">
              <Award className="w-6 h-6 text-accent-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">Tricks Library</h1>
              <p className="text-sm text-muted-foreground">
                {currentDog ? `Training ${currentDog.name}` : 'Build skills step by step'}
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm">
            Filter
          </Button>
        </div>
      </header>

      {/* Progress Summary */}
      <div className="p-4 bg-gradient-to-r from-accent/10 to-accent-hover/10 border-b border-border">
        <div className="flex items-center justify-between text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-accent">{completedCount}</div>
            <div className="text-muted-foreground">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{inProgressCount}</div>
            <div className="text-muted-foreground">In Progress</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-warning">{bestStreak}</div>
            <div className="text-muted-foreground">Best Streak</div>
          </div>
        </div>
      </div>

      {/* Tricks List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {tricks.map((trick) => {
          const dogTrick = learnedTricksMap.get(trick.id);
          const isCompleted = dogTrick?.status === 'mastered';
          const isLearning = dogTrick && dogTrick.status !== 'not_started' && !isCompleted;
          const progress = isCompleted ? 100 : isLearning ? 50 : 0;

          return (
            <div key={trick.id} className="card-soft p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-foreground">{trick.name}</h3>
                    {isCompleted && (
                      <CheckCircle2 className="w-5 h-5 text-success" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{trick.description}</p>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline" className="text-xs">
                      <Star className="w-3 h-3 mr-1" />
                      Level {trick.difficulty_level}
                    </Badge>
                    {dogTrick && dogTrick.total_sessions > 0 && (
                      <Badge variant="outline" className="text-xs">
                        <Clock className="w-3 h-3 mr-1" />
                        {dogTrick.total_sessions} sessions
                      </Badge>
                    )}
                    {dogTrick?.status && (
                      <Badge 
                        variant={isCompleted ? "default" : "secondary"} 
                        className="text-xs"
                      >
                        {dogTrick.status.replace('_', ' ')}
                      </Badge>
                    )}
                    {trick.category && (
                      <Badge variant="outline" className="text-xs">
                        {trick.category}
                      </Badge>
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Progress</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-success to-success/80 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  View Guide
                </Button>
                {!dogTrick && (
                  <Button 
                    size="sm" 
                    className="btn-primary flex-1"
                    onClick={() => startTrick(trick.id)}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Start Learning
                  </Button>
                )}
                {dogTrick && !isCompleted && (
                  <Button size="sm" className="btn-primary flex-1">
                    Practice Now
                  </Button>
                )}
                {isCompleted && (
                  <Button size="sm" variant="outline" className="flex-1">
                    Review ✨
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}