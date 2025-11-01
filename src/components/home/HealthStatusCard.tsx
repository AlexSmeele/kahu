import { Heart, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useWellnessTimeline } from "@/hooks/useWellnessTimeline";
import { Badge } from "@/components/ui/badge";
import type { TabType } from "@/components/layout/BottomNavigation";

interface HealthStatusCardProps {
  dogId: string;
  onTabChange: (tab: TabType) => void;
  className?: string;
}

export function HealthStatusCard({ dogId, onTabChange, className = "" }: HealthStatusCardProps) {
  const navigate = useNavigate();
  const { timelineData, urgentAlerts } = useWellnessTimeline(dogId);
  
  // Get next upcoming health event
  const now = new Date();
  const upcomingHealthEvents = timelineData
    .flatMap(day => day.events)
    .filter(e => 
      ['vaccination', 'vet_visit', 'grooming', 'checkup', 'treatment'].includes(e.type) &&
      e.status === 'upcoming' &&
      e.timestamp > now
    )
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  
  const nextEvent = upcomingHealthEvents[0];
  const hasAlerts = urgentAlerts.length > 0;
  const allClear = !hasAlerts && !nextEvent;
  
  // Calculate days until next event
  const getDaysUntil = (date: Date) => {
    const days = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    return `In ${days} days`;
  };
  
  const handleClick = () => {
    if (hasAlerts) {
      // Navigate to timeline with overdue filter
      navigate(`/full-timeline/${dogId}?filter=overdue`);
    } else {
      // Navigate to wellness tab
      onTabChange('wellness');
    }
  };
  
  return (
    <button
      onClick={handleClick}
      className={`rounded-2xl border bg-card p-4 hover:bg-accent transition-all hover:scale-[1.02] text-left w-full ${className}`}
    >
      <div className="flex flex-col justify-between h-full">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Heart className="w-4 h-4 text-primary" />
          </div>
          <h3 className="font-semibold text-base">Health</h3>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col justify-center items-center my-4">
          {allClear ? (
            <>
              <p className="text-lg font-semibold text-center text-green-600 mb-2">
                All up to date! ✓
              </p>
              <p className="text-sm text-muted-foreground">
                No upcoming events
              </p>
            </>
          ) : (
            <>
              {nextEvent && (
                <>
                  <p className="text-lg font-semibold text-center mb-1">
                    {nextEvent.title}
                  </p>
                  <p className="text-sm text-muted-foreground mb-3">
                    {getDaysUntil(nextEvent.timestamp)}
                  </p>
                </>
              )}
              {hasAlerts && (
                <Badge variant="destructive" className="gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {urgentAlerts.length} overdue
                </Badge>
              )}
            </>
          )}
        </div>
      </div>
    </button>
  );
}
