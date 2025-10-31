import { Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TrainingGoalCardProps {
  nextTrick?: {
    name: string;
    total_sessions: number;
  };
  onActionClick: () => void;
  className?: string;
}

export function TrainingGoalCard({ 
  nextTrick, 
  onActionClick,
  className = ""
}: TrainingGoalCardProps) {
  const hasActiveTrick = !!nextTrick;

  return (
    <button
      onClick={onActionClick}
      className={`rounded-2xl border bg-card p-4 hover:bg-accent transition-all hover:scale-[1.02] text-left w-full ${className}`}
    >
      <div className="flex flex-col justify-center min-h-[88px]">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Target className="w-4 h-4 text-primary" />
          </div>
          <h3 className="font-semibold text-base text-foreground">Training Goal</h3>
        </div>
        
        {hasActiveTrick ? (
          <>
            <p className="text-sm text-muted-foreground mb-1 truncate">
              {nextTrick.name}
            </p>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                Session {(nextTrick.total_sessions || 0) + 1}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Start training →
            </p>
          </>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-3">
              Choose a trick to start
            </p>
            <p className="text-xs text-muted-foreground">
              Browse tricks →
            </p>
          </>
        )}
      </div>
    </button>
  );
}
