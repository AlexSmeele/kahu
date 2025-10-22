import { Target } from "lucide-react";

interface TrainingTileProps {
  trickName?: string;
  totalSessions?: number;
  onClick: () => void;
}

export function TrainingTile({ trickName, totalSessions, onClick }: TrainingTileProps) {
  return (
    <button
      onClick={onClick}
      className="rounded-2xl border bg-card p-4 hover:bg-accent transition-all hover:scale-[1.02] text-left w-full"
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <Target className="w-4 h-4 text-primary" />
        </div>
        <h3 className="font-semibold text-foreground">Training</h3>
      </div>
      
      <div className="flex items-center justify-center my-4 min-h-[112px]">
        <div className="text-center">
          {trickName ? (
            <>
              <p className="text-2xl font-bold text-foreground mb-1">
                {trickName}
              </p>
              <p className="text-xs text-muted-foreground">
                Session {(totalSessions || 0) + 1}
              </p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Start your first training session
            </p>
          )}
        </div>
      </div>
      
      <p className="text-xs text-center text-muted-foreground">
        {trickName ? "Continue →" : "Tap to begin"}
      </p>
    </button>
  );
}
