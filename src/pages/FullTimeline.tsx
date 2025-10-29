import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useWellnessTimeline } from "@/hooks/useWellnessTimeline";
import { TimelineEventCard } from "@/components/health/TimelineEventCard";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function FullTimeline() {
  const navigate = useNavigate();
  const { dogId } = useParams<{ dogId: string }>();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { timelineData: rawTimelineData, loading } = useWellnessTimeline(dogId || '');
  
  // Reverse timeline data so past dates are on the left
  const timelineData = [...rawTimelineData].reverse();
  
  // Find today's index or the closest past date
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const todayIndex = timelineData.findIndex(day => {
    const dayDate = new Date(day.date);
    dayDate.setHours(0, 0, 0, 0);
    return dayDate.getTime() === now.getTime();
  });
  
  // If today not found, find the most recent past date
  const defaultIndex = todayIndex >= 0 ? todayIndex : 
    timelineData.findIndex(day => new Date(day.date) <= now);
  
  const [selectedDayIndex, setSelectedDayIndex] = useState(
    defaultIndex >= 0 ? defaultIndex : timelineData.length - 1
  );

  // Auto-scroll to selected day
  useEffect(() => {
    if (scrollContainerRef.current && selectedDayIndex >= 0) {
      const dayElements = scrollContainerRef.current.querySelectorAll('[data-day-index]');
      const targetElement = dayElements[selectedDayIndex] as HTMLElement;
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, [selectedDayIndex]);

  const handlePrevDay = () => {
    if (selectedDayIndex > 0) {
      setSelectedDayIndex(selectedDayIndex - 1);
    }
  };

  const handleNextDay = () => {
    if (selectedDayIndex < timelineData.length - 1) {
      setSelectedDayIndex(selectedDayIndex + 1);
    }
  };

  return (
    <div className="flex flex-col h-full safe-top bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="flex items-center gap-3 p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-semibold">Full Timeline</h1>
            <p className="text-sm text-muted-foreground">
              {timelineData.length} days • {timelineData.reduce((sum, day) => sum + day.events.length, 0)} events
            </p>
          </div>
        </div>

        {/* Horizontal Day Selector */}
        <div className="relative px-4 pb-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrevDay}
            disabled={selectedDayIndex === 0}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>

          <ScrollArea className="w-full" ref={scrollContainerRef}>
            <div className="flex gap-2 px-8">
              {timelineData.map((day, index) => {
                const isSelected = index === selectedDayIndex;
                
                return (
                  <button
                    key={day.date.toISOString()}
                    data-day-index={index}
                    onClick={() => setSelectedDayIndex(index)}
                    className={cn(
                      "flex-shrink-0 px-4 py-3 rounded-lg border-2 transition-all min-w-[120px]",
                      isSelected 
                        ? "border-primary bg-primary/10 shadow-sm" 
                        : "border-border bg-card hover:bg-accent"
                    )}
                  >
                    <div className="text-center">
                      <p className={cn(
                        "text-sm font-semibold mb-1",
                        isSelected ? "text-primary" : "text-foreground"
                      )}>
                        {day.label}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {day.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "mt-2 text-xs",
                          isSelected && "border-primary/30"
                        )}
                      >
                        {day.events.length} {day.events.length === 1 ? 'event' : 'events'}
                      </Badge>
                    </div>
                  </button>
                );
              })}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleNextDay}
            disabled={selectedDayIndex === timelineData.length - 1}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Timeline Content - Vertical Scroll */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, idx) => (
                <div key={idx} className="relative pl-6">
                  <div className="absolute left-0 top-1 w-4 h-4 rounded-full bg-muted animate-pulse" />
                  <div className="card-soft p-4 animate-pulse">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-muted" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-3/4" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : timelineData.length > 0 ? (
            <div className="space-y-6">
              {timelineData.slice(0, selectedDayIndex + 1).reverse().map((day) => (
                <div key={day.date.toISOString()}>
                  <div className="flex items-center gap-3 mb-4 sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-2 z-10">
                    <h3 className="text-base font-semibold">
                      {day.label}
                    </h3>
                    <Badge 
                      variant="outline" 
                      className="text-xs"
                    >
                      {day.events.length} {day.events.length === 1 ? 'event' : 'events'}
                    </Badge>
                  </div>

                  <div className="space-y-0">
                    {day.events.map((event) => (
                      <TimelineEventCard 
                        key={event.id} 
                        event={event}
                        onClick={() => {
                          if (event.type === 'activity' && event.metadata?.activityId) {
                            navigate(`/activity/${event.metadata.activityId}`);
                          }
                        }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No timeline data available</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
