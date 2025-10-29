import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useWellnessTimeline } from "@/hooks/useWellnessTimeline";
import { TimelineEventCard } from "@/components/health/TimelineEventCard";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface FullTimelineProps {
  selectedDogId: string;
}

export default function FullTimeline({ selectedDogId }: FullTimelineProps) {
  const navigate = useNavigate();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const { timelineData, loading } = useWellnessTimeline(selectedDogId);

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

  const now = new Date();
  const pastDays = timelineData.filter(day => day.date <= now);
  const upcomingDays = timelineData.filter(day => day.date > now);

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

  const selectedDay = timelineData[selectedDayIndex];

  return (
    <div className="flex flex-col h-full safe-top bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="flex items-center gap-3 p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
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
                const isPast = day.date < now;
                
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
          ) : selectedDay ? (
            <div className="space-y-0">
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-1">{selectedDay.label}</h2>
                <p className="text-sm text-muted-foreground">
                  {selectedDay.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </div>

              {selectedDay.events.length > 0 ? (
                selectedDay.events.map((event) => (
                  <TimelineEventCard 
                    key={event.id} 
                    event={event}
                    onClick={() => {
                      if (event.type === 'activity' && event.metadata?.activityId) {
                        navigate(`/activity/${event.metadata.activityId}`);
                      }
                    }}
                  />
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No events for this day</p>
                </div>
              )}
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
