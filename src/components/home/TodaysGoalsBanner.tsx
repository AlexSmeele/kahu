import { Target, Calendar, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TodaysGoalsBannerProps {
  nextTrick?: {
    name: string;
    total_sessions: number;
  };
  isRestDay?: boolean;
  upcomingEvent?: {
    type: string;
    title: string;
    date: string;
  };
  onActionClick: () => void;
}

export function TodaysGoalsBanner({ 
  nextTrick, 
  isRestDay, 
  upcomingEvent, 
  onActionClick 
}: TodaysGoalsBannerProps) {
  // Determine what to display
  const getContent = () => {
    if (upcomingEvent) {
      return {
        icon: Calendar,
        title: "Upcoming",
        description: upcomingEvent.title,
        action: "View Details",
        gradient: "from-blue-500/20 to-purple-500/20"
      };
    }
    
    if (isRestDay) {
      return {
        icon: Trophy,
        title: "Rest Day",
        description: "Great job this week! Take it easy today.",
        action: "View Progress",
        gradient: "from-emerald-500/20 to-teal-500/20"
      };
    }
    
    if (nextTrick) {
      return {
        icon: Target,
        title: "Today's Goal",
        description: `Practice "${nextTrick.name}"`,
        action: "Start",
        gradient: "from-primary/20 to-accent/20"
      };
    }
    
    return {
      icon: Target,
      title: "Today's Goal",
      description: "Set a new training goal",
      action: "Get Started",
      gradient: "from-primary/20 to-accent/20"
    };
  };

  const content = getContent();
  const Icon = content.icon;

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${content.gradient} border border-border p-4 animate-fade-in`}>
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center">
          <Icon className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-muted-foreground mb-0.5">
            {content.title}
          </h3>
          <p className="text-base font-semibold text-foreground truncate">
            {content.description}
          </p>
        </div>
        <Button 
          onClick={onActionClick}
          size="sm"
          className="flex-shrink-0"
        >
          {content.action}
        </Button>
      </div>
    </div>
  );
}
