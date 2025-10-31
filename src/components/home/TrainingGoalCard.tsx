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
      <div className="flex flex-col justify-between h-full">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Target className="w-4 h-4 text-primary" />
          </div>
          <h3 className="font-semibold text-base text-foreground">Training</h3>
        </div>
        
        {hasActiveTrick ? (
          <>
            {/* Main Content - Centered and Expanded */}
            <div className="flex-1 flex flex-col justify-center items-center my-4">
              <p className="text-lg font-semibold text-center mb-3">
                {nextTrick.name}
              </p>
              <Badge variant="secondary" className="text-sm px-3 py-1">
                Session {(nextTrick.total_sessions || 0) + 1}
              </Badge>
            </div>
            
            {/* Footer */}
            <div className="text-xs text-muted-foreground text-center">
              Start training →
            </div>
          </>
        ) : (
          <>
            {/* Main Content - Centered and Expanded */}
            <div className="flex-1 flex flex-col justify-center items-center my-4">
              <p className="text-base text-muted-foreground text-center">
                Choose a trick to start training
              </p>
            </div>
            
            {/* Footer */}
            <div className="text-xs text-muted-foreground text-center">
              Browse tricks →
            </div>
          </>
        )}
      </div>
    </button>
  );
}
