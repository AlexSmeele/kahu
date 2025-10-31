import { Activity } from "lucide-react";

interface ActivityCircleCardProps {
  completedMinutes: number;
  targetMinutes: number;
  distance?: number;
  calories?: number;
  onClick: () => void;
  className?: string;
}

export function ActivityCircleCard({ 
  completedMinutes, 
  targetMinutes, 
  distance,
  calories,
  onClick,
  className = ""
}: ActivityCircleCardProps) {
  const percentage = Math.min((completedMinutes / targetMinutes) * 100, 100);
  const circumference = 2 * Math.PI * 40; // radius = 40
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getColor = () => {
    if (percentage >= 100) return "hsl(var(--success))";
    if (percentage >= 50) return "hsl(var(--primary))";
    return "hsl(var(--muted-foreground))";
  };

  return (
    <button
      onClick={onClick}
      className={`rounded-2xl border bg-card p-4 hover:bg-accent transition-all hover:scale-[1.02] text-left w-full ${className}`}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Activity className="w-4 h-4 text-primary" />
        </div>
        <h3 className="font-semibold text-base text-foreground">Activity</h3>
      </div>
      
      <div className="flex items-center justify-center my-3">
        <div className="relative w-24 h-24">
          <svg className="transform -rotate-90 w-24 h-24">
            <circle
              cx="48"
              cy="48"
              r="40"
              stroke="hsl(var(--muted))"
              strokeWidth="7"
              fill="none"
            />
            <circle
              cx="48"
              cy="48"
              r="40"
              stroke={getColor()}
              strokeWidth="7"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-500"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {completedMinutes === 0 ? (
              <>
                <span className="text-lg font-bold text-muted-foreground">Start</span>
                <span className="text-xs text-muted-foreground">today</span>
              </>
            ) : (
              <>
                <span className="text-2xl font-bold text-foreground">{completedMinutes}</span>
                <span className="text-xs text-muted-foreground">/ {targetMinutes} min</span>
              </>
            )}
          </div>
        </div>
      </div>
      
      {((distance && distance > 0) || (calories && calories > 0)) && (
        <div className="flex items-center justify-center gap-3 mt-2 pt-2 border-t border-border">
          {distance && distance > 0 && (
            <div className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">{distance.toFixed(1)}</span> km
            </div>
          )}
          {calories && calories > 0 && (
            <div className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">{calories}</span> kcal
            </div>
          )}
        </div>
      )}
    </button>
  );
}
