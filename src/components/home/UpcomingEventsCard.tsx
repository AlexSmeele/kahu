import { Calendar } from "lucide-react";
import { useWellnessTimeline } from "@/hooks/useWellnessTimeline";
import { useNavigate } from "react-router-dom";

interface UpcomingEventsCardProps {
  dogId: string;
  className?: string;
}

export function UpcomingEventsCard({ dogId, className = "" }: UpcomingEventsCardProps) {
  const navigate = useNavigate();
  const { timelineData } = useWellnessTimeline(dogId);
  
  const now = new Date();
  const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  // Get all upcoming events in next 7 days, excluding meals (covered in Nutrition card)
  const upcomingEvents = timelineData
    .flatMap(day => day.events)
    .filter(e => 
      e.status === 'upcoming' && 
      e.type !== 'meal' && 
      e.timestamp > now && 
      e.timestamp <= oneWeekFromNow
    )
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  
  const nextEvent = upcomingEvents[0];
  const eventCount = upcomingEvents.length;
  
  const getTimeLabel = (date: Date) => {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === now.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };
  
  return (
    <button
      onClick={() => navigate(`/full-timeline/${dogId}`, { state: { from: 'home' } })}
      className={`rounded-2xl border bg-card p-4 hover:bg-accent transition-all hover:scale-[1.02] text-left w-full ${className}`}
    >
      <div className="flex flex-col justify-between h-full">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Calendar className="w-4 h-4 text-primary" />
          </div>
          <h3 className="font-semibold text-base">Upcoming</h3>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col justify-center items-center my-4">
          {eventCount === 0 ? (
            <p className="text-base text-muted-foreground text-center">
              No scheduled events
            </p>
          ) : (
            <>
              <p className="text-lg font-semibold text-center mb-2">
                {eventCount} event{eventCount > 1 ? 's' : ''}
              </p>
              <p className="text-sm text-muted-foreground mb-3">
                this week
              </p>
              {nextEvent && (
                <>
                  <p className="text-sm font-medium text-center">
                    Next: {nextEvent.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {getTimeLabel(nextEvent.timestamp)}
                  </p>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </button>
  );
}
