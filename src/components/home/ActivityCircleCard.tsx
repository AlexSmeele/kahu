import { Activity } from "lucide-react";

interface ActivityCircleCardProps {
  completedMinutes: number;
  targetMinutes: number;
  onClick: () => void;
}

export function ActivityCircleCard({ 
  completedMinutes, 
  targetMinutes, 
  onClick
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
      className="rounded-2xl border bg-card p-3 hover:bg-accent transition-all hover:scale-[1.02] text-left w-full"
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <Activity className="w-4 h-4 text-primary" />
        </div>
        <h3 className="font-semibold text-foreground">Activity</h3>
      </div>
      
      <div className="flex items-center justify-center my-2">
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
            <span className="text-2xl font-bold text-foreground">{completedMinutes}</span>
            <span className="text-xs text-muted-foreground">/ {targetMinutes} min</span>
          </div>
        </div>
      </div>
    </button>
  );
}
