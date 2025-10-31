import { Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface TrainingGoalBannerProps {
  nextTrick?: {
    name: string;
    total_sessions: number;
  };
  onActionClick: () => void;
}

export function TrainingGoalBanner({ 
  nextTrick, 
  onActionClick 
}: TrainingGoalBannerProps) {
  const hasActiveTrick = !!nextTrick;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/20 to-accent/20 border border-border p-4 animate-fade-in">
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center">
          <Target className="w-6 h-6 text-primary" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-muted-foreground mb-0.5">
            {hasActiveTrick ? "Today's Training Goal" : "Ready to Train?"}
          </h3>
          
          {hasActiveTrick ? (
            <div className="flex items-center gap-2">
              <p className="text-base font-semibold text-foreground truncate">
                {nextTrick.name}
              </p>
              <Badge variant="secondary" className="text-xs flex-shrink-0">
                Session {(nextTrick.total_sessions || 0) + 1}
              </Badge>
            </div>
          ) : (
            <p className="text-base font-semibold text-foreground">
              Choose a trick to start learning
            </p>
          )}
        </div>
        
        <Button 
          onClick={onActionClick}
          size="sm"
          className="flex-shrink-0"
        >
          {hasActiveTrick ? "Start Training" : "Browse Tricks"}
        </Button>
      </div>
    </div>
  );
}
