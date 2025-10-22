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
      className="rounded-2xl border bg-card p-4 hover:bg-accent transition-all hover:scale-[1.02] text-left w-full h-full"
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
          <Target className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="font-semibold text-foreground">Training</h3>
      </div>
      
      {trickName ? (
        <>
          <p className="text-sm font-medium text-foreground mb-1">
            {trickName}
          </p>
          <p className="text-xs text-muted-foreground">
            Session {(totalSessions || 0) + 1}
          </p>
          <div className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400">
            Continue →
          </div>
        </>
      ) : (
        <p className="text-sm text-muted-foreground">
          Start your first training session
        </p>
      )}
    </button>
  );
}
