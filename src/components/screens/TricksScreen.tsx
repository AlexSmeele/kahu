import { Award, Star, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const tricks = [
  {
    id: 1,
    name: "Sit",
    difficulty: 1,
    progress: 100,
    streak: 7,
    description: "The foundation command every dog should know",
    isCompleted: true
  },
  {
    id: 2,
    name: "Stay",
    difficulty: 2,
    progress: 75,
    streak: 3,
    description: "Build impulse control and patience",
    isCompleted: false
  },
  {
    id: 3,
    name: "Come",
    difficulty: 2,
    progress: 60,
    streak: 1,
    description: "Essential for safety and recall training",
    isCompleted: false
  },
  {
    id: 4,
    name: "Roll Over",
    difficulty: 3,
    progress: 30,
    streak: 0,
    description: "Fun trick that builds trust and coordination",
    isCompleted: false
  },
  {
    id: 5,
    name: "Play Dead",
    difficulty: 4,
    progress: 0,
    streak: 0,
    description: "Advanced trick for experienced dogs",
    isCompleted: false
  }
];

export function TricksScreen() {
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
              <p className="text-sm text-muted-foreground">Build skills step by step</p>
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
            <div className="text-2xl font-bold text-accent">1</div>
            <div className="text-muted-foreground">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">3</div>
            <div className="text-muted-foreground">In Progress</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-warning">7</div>
            <div className="text-muted-foreground">Day Streak</div>
          </div>
        </div>
      </div>

      {/* Tricks List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {tricks.map((trick) => (
          <div key={trick.id} className="card-soft p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-semibold text-foreground">{trick.name}</h3>
                  {trick.isCompleted && (
                    <CheckCircle2 className="w-5 h-5 text-success" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-2">{trick.description}</p>
                
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="outline" className="text-xs">
                    <Star className="w-3 h-3 mr-1" />
                    Level {trick.difficulty}
                  </Badge>
                  {trick.streak > 0 && (
                    <Badge variant="outline" className="text-xs">
                      <Clock className="w-3 h-3 mr-1" />
                      {trick.streak} day streak
                    </Badge>
                  )}
                </div>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Progress</span>
                    <span>{trick.progress}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-success to-success/80 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${trick.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1">
                View Steps
              </Button>
              {!trick.isCompleted && (
                <Button size="sm" className="btn-primary flex-1">
                  Practice Now
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}