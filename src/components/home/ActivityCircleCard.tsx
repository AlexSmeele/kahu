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
  const circumference = 2 * Math.PI * 45; // radius = 45
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getColor = () => {
    if (percentage >= 100) return "hsl(var(--success))";
    if (percentage >= 50) return "hsl(var(--primary))";
    return "hsl(var(--muted-foreground))";
  };

  return (
    <button
      onClick={onClick}
      className="rounded-2xl border bg-card p-4 hover:bg-accent/50 transition-all hover:scale-[1.02] text-left w-full"
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <Activity className="w-4 h-4 text-primary" />
        </div>
        <h3 className="font-semibold text-foreground">Activity</h3>
      </div>
      
      <div className="flex items-center justify-center my-4">
        <div className="relative w-28 h-28">
          <svg className="transform -rotate-90 w-28 h-28">
            <circle
              cx="56"
              cy="56"
              r="45"
              stroke="hsl(var(--muted))"
              strokeWidth="8"
              fill="none"
            />
            <circle
              cx="56"
              cy="56"
              r="45"
              stroke={getColor()}
              strokeWidth="8"
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
      
      <p className="text-xs text-center text-muted-foreground">
        {percentage >= 100 ? "Goal achieved! 🎉" : `${Math.round(percentage)}% complete`}
      </p>
    </button>
  );
}
