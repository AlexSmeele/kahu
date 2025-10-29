import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight, Activity, Heart, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useWellnessTimeline } from "@/hooks/useWellnessTimeline";
import { TimelineEventCard } from "@/components/health/TimelineEventCard";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function FullTimeline() {
  const navigate = useNavigate();
  const { dogId } = useParams<{ dogId: string }>();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const verticalScrollRef = useRef<HTMLDivElement>(null);
  const { timelineData: rawTimelineData, loading } = useWellnessTimeline(dogId || '');
  
  // Reverse timeline data so past dates are on the left in horizontal scroll
  const timelineData = [...rawTimelineData].reverse();
  
  // Find today's index or the closest date
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  
  const todayIndex = timelineData.findIndex(day => {
    const dayDate = new Date(day.date);
    dayDate.setHours(0, 0, 0, 0);
    return dayDate.getTime() === now.getTime();
  });
  
  // Default to today if it exists, otherwise the last date (most recent)
  const defaultIndex = todayIndex >= 0 ? todayIndex : timelineData.length - 1;
  
  const [selectedDayIndex, setSelectedDayIndex] = useState(defaultIndex);

  // Auto-scroll to selected day in horizontal scroll
  useEffect(() => {
    if (scrollContainerRef.current && selectedDayIndex >= 0) {
      const dayElements = scrollContainerRef.current.querySelectorAll('[data-day-index]');
      const targetElement = dayElements[selectedDayIndex] as HTMLElement;
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, [selectedDayIndex]);

  // Auto-scroll to selected date in vertical scroll
  useEffect(() => {
    if (verticalScrollRef.current && selectedDayIndex >= 0 && timelineData.length > 0) {
      const selectedDateElement = verticalScrollRef.current.querySelector(
        `[data-vertical-day-index="${selectedDayIndex}"]`
      ) as HTMLElement;
      if (selectedDateElement) {
        selectedDateElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [selectedDayIndex, timelineData.length]);

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

  // Helper to get time of day group
  const getTimeOfDay = (date: Date) => {
    const hour = date.getHours();
    if (hour < 6) return 'Night';
    if (hour < 12) return 'Morning';
    if (hour < 18) return 'Afternoon';
    return 'Evening';
  };

  // Group events by time of day
  const groupEventsByTimeOfDay = (events: any[]) => {
    const groups: Record<string, any[]> = {};
    events.forEach(event => {
      const timeOfDay = getTimeOfDay(event.timestamp);
      if (!groups[timeOfDay]) {
        groups[timeOfDay] = [];
      }
      groups[timeOfDay].push(event);
    });
    return groups;
  };

  const totalDistance = timelineData.reduce((sum, day) => {
    return sum + day.events.reduce((daySum, event) => {
      const distance = event.metrics?.find(m => m.label.includes('km'));
      return daySum + (distance ? parseFloat(distance.value) : 0);
    }, 0);
  }, 0);

  const totalActivities = timelineData.reduce((sum, day) => 
    sum + day.events.filter(e => e.type === 'activity').length, 0
  );

  return (
    <div className="flex flex-col h-full safe-top bg-background">
      {/* Header with Glass Morphism */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70 border-b shadow-sm">
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
            <h1 className="text-2xl font-bold">Wellness Timeline</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Last {timelineData.length} days
            </p>
          </div>
        </div>

        {/* Summary Stats */}
        {!loading && timelineData.length > 0 && (
          <div className="flex gap-2 px-4 pb-3 overflow-x-auto">
            <div className="flex-shrink-0 bg-primary/5 rounded-lg px-3 py-2 border border-primary/20">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Activities</p>
                  <p className="text-sm font-bold text-primary">{totalActivities}</p>
                </div>
              </div>
            </div>
            <div className="flex-shrink-0 bg-success/5 rounded-lg px-3 py-2 border border-success/20">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-success" />
                <div>
                  <p className="text-xs text-muted-foreground">Distance</p>
                  <p className="text-sm font-bold text-success">{totalDistance.toFixed(1)} km</p>
                </div>
              </div>
            </div>
            <div className="flex-shrink-0 bg-secondary/5 rounded-lg px-3 py-2 border border-secondary/20">
              <div className="flex items-center gap-2">
                <Utensils className="w-4 h-4 text-secondary" />
                <div>
                  <p className="text-xs text-muted-foreground">Events</p>
                  <p className="text-sm font-bold text-secondary">
                    {timelineData.reduce((sum, day) => sum + day.events.length, 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Horizontal Day Selector - Compact Pills */}
        <div className="relative px-2 pb-3">
          {/* Gradient fade masks */}
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-background/80 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-background/80 to-transparent z-10 pointer-events-none" />
          
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrevDay}
            disabled={selectedDayIndex === 0}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-background/90 backdrop-blur-sm shadow-sm h-8 w-8"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <ScrollArea className="w-full" ref={scrollContainerRef}>
            {/* Connector line */}
            <div className="absolute top-1/2 left-8 right-8 h-[2px] bg-border -translate-y-1/2 -z-10" />
            
            <div className="flex gap-1.5 px-10 py-2">
              {timelineData.map((day, index) => {
                const isSelected = index === selectedDayIndex;
                const isToday = index === todayIndex;
                const dayOfWeek = day.date.toLocaleDateString('en-US', { weekday: 'short' });
                
                return (
                  <button
                    key={day.date.toISOString()}
                    data-day-index={index}
                    onClick={() => setSelectedDayIndex(index)}
                    className={cn(
                      "timeline-date-pill flex-shrink-0 px-3 py-2 rounded-full transition-all duration-200",
                      "hover:scale-105 active:scale-95",
                      isSelected 
                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-110" 
                        : isToday
                        ? "bg-primary/10 border-2 border-primary/30 text-primary"
                        : "bg-card border border-border hover:bg-accent hover:border-primary/20"
                    )}
                  >
                    <div className="text-center">
                      <p className="text-[10px] font-medium opacity-70 uppercase tracking-wide">
                        {dayOfWeek}
                      </p>
                      <p className={cn(
                        "text-sm font-bold",
                        isSelected && "text-primary-foreground"
                      )}>
                        {day.date.getDate()}
                      </p>
                      {isToday && !isSelected && (
                        <div className="w-1 h-1 rounded-full bg-primary mx-auto mt-0.5" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
            <ScrollBar orientation="horizontal" className="hidden" />
          </ScrollArea>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleNextDay}
            disabled={selectedDayIndex === timelineData.length - 1}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-background/90 backdrop-blur-sm shadow-sm h-8 w-8"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Timeline Content - Vertical Scroll */}
      <ScrollArea className="flex-1" ref={verticalScrollRef}>
        <div className="px-4 py-2">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 8 }).map((_, idx) => (
                <div key={idx} className="relative pl-8">
                  <Skeleton className="absolute left-0 top-2 w-6 h-6 rounded-full" />
                  <div className="bg-card rounded-xl p-3 shadow-sm">
                    <div className="flex items-start gap-3">
                      <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : timelineData.length > 0 ? (
            <div className="space-y-8">
              {[...timelineData].reverse().map((day, reverseIndex) => {
                const originalIndex = timelineData.length - 1 - reverseIndex;
                const isSelectedDate = originalIndex === selectedDayIndex;
                const eventGroups = groupEventsByTimeOfDay(day.events);
                const timeOrder = ['Morning', 'Afternoon', 'Evening', 'Night'];
                
                return (
                  <div 
                    key={day.date.toISOString()}
                    data-vertical-day-index={originalIndex}
                    className="animate-fade-in"
                  >
                    {/* Day Header */}
                    <div className={cn(
                      "flex items-center gap-3 mb-3 sticky top-0 py-2.5 px-3 -mx-3 z-10 rounded-lg",
                      "bg-background/90 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80",
                      "border-l-4 transition-all duration-200",
                      isSelectedDate 
                        ? "border-l-primary bg-primary/5 shadow-sm" 
                        : "border-l-transparent"
                    )}>
                      <div className="flex-1">
                        <h3 className={cn(
                          "text-lg font-bold transition-colors",
                          isSelectedDate && "text-primary"
                        )}>
                          {day.label}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {day.date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                      <Badge 
                        variant={isSelectedDate ? "default" : "outline"}
                        className={cn(
                          "text-xs font-semibold",
                          isSelectedDate && "animate-pulse"
                        )}
                      >
                        {day.events.length}
                      </Badge>
                    </div>

                    {/* Events grouped by time of day */}
                    <div className="space-y-6">
                      {timeOrder.map(timeOfDay => {
                        const events = eventGroups[timeOfDay];
                        if (!events || events.length === 0) return null;

                        return (
                          <div key={timeOfDay} className="relative">
                            {/* Time of day badge */}
                            <div className="flex items-center gap-2 mb-3 pl-8">
                              <Badge 
                                variant="outline" 
                                className="text-[10px] uppercase tracking-wider bg-muted/50 border-muted-foreground/20"
                              >
                                {timeOfDay}
                              </Badge>
                              <div className="flex-1 h-[1px] bg-gradient-to-r from-border to-transparent" />
                            </div>

                            {/* Events */}
                            <div className="space-y-0">
                              {events.map((event, eventIdx) => (
                                <TimelineEventCard 
                                  key={event.id} 
                                  event={event}
                                  isLast={eventIdx === events.length - 1 && timeOfDay === timeOrder[timeOrder.length - 1]}
                                  isToday={originalIndex === todayIndex}
                                  onClick={() => {
                                    if (event.type === 'activity' && event.metadata?.activityId) {
                                      navigate(`/activity/${event.metadata.activityId}`);
                                    }
                                  }}
                                />
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mb-4">
                <Activity className="w-8 h-8 text-muted-foreground/50" />
              </div>
              <h3 className="text-lg font-semibold mb-1">No Timeline Data</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                Start tracking activities and events to see your wellness timeline
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
