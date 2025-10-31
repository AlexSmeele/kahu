import { Target } from "lucide-react";

interface TrainingTileProps {
  trickName?: string;
  totalSessions?: number;
  onClick: () => void;
  className?: string;
}

export function TrainingTile({ trickName, totalSessions, onClick, className = "" }: TrainingTileProps) {
  return (
    <button
      onClick={onClick}
      className={`rounded-2xl border bg-card p-4 hover:bg-accent transition-all hover:scale-[1.02] text-left w-full ${className}`}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Target className="w-4 h-4 text-primary" />
        </div>
        <h3 className="font-semibold text-base text-foreground">Training</h3>
      </div>
      
      <div className="flex flex-col items-center justify-center my-3 min-h-[88px]">
        {trickName ? (
          <>
            <p className="text-2xl font-bold text-foreground mb-1">
              {trickName}
            </p>
            <p className="text-sm text-muted-foreground mb-3">
              Session {(totalSessions || 0) + 1}
            </p>
            <p className="text-xs text-muted-foreground">
              Continue →
            </p>
          </>
        ) : (
          <>
            <p className="text-sm font-semibold text-foreground mb-1">
              No tricks in progress
            </p>
            <p className="text-xs text-muted-foreground mb-3">
              Choose a trick to learn
            </p>
            <p className="text-xs text-muted-foreground">
              Tap to begin
            </p>
          </>
        )}
      </div>
    </button>
  );
}
