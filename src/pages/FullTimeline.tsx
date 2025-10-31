import { useState, useRef, useEffect, Fragment } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight, Activity, Heart, Utensils, Weight, Scissors, Stethoscope, Syringe, ClipboardCheck, Pill, Filter } from "lucide-react";
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
  const location = window.location;
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const verticalScrollRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const { timelineData: rawTimelineData, loading, setShowFullTimeline } = useWellnessTimeline(dogId || '');
  
  // Filter state
  const [selectedFilters, setSelectedFilters] = useState<Set<string>>(new Set(['all']));
  
  // Enable full timeline view (no 12-entry cap)
  useEffect(() => {
    setShowFullTimeline(true);
  }, [setShowFullTimeline]);
  
  // Reverse timeline data so past dates are on the left in horizontal scroll
  const reversedData = [...rawTimelineData].reverse();
  
  // Generate complete date range including future dates
  const generateDateRange = () => {
    if (reversedData.length === 0) return [];
    
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    // Find earliest date
    const dates = reversedData.map(d => d.date.getTime());
    const earliest = new Date(Math.min(...dates));
    earliest.setHours(0, 0, 0, 0);
    
    // Add 30 days into future
    const futureEnd = new Date(now);
    futureEnd.setDate(futureEnd.getDate() + 30);
    
    // Generate all dates in range
    const allDates: any[] = [];
    const current = new Date(earliest);
    
    while (current <= futureEnd) {
      const currentDateStr = current.toDateString();
      const existingDay = reversedData.find(d => 
        d.date.toDateString() === currentDateStr
      );
      
      const isFuture = current > now;
      const isToday = current.toDateString() === now.toDateString();
      const isEmpty = !existingDay || existingDay.events.length === 0;
      
      if (existingDay) {
        allDates.push({
          ...existingDay,
          isFuture,
          isEmpty: false
        });
      } else if (isFuture || isToday) {
        // Add empty future dates and today even if it has no events
        allDates.push({
          date: new Date(current),
          label: isToday ? 'Today' : current.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          events: [],
          isToday,
          isYesterday: false,
          isFuture: isFuture,
          isEmpty: true
        });
      }
      
      current.setDate(current.getDate() + 1);
    }
    
    return allDates;
  };
  
  const timelineData = generateDateRange();
  
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
  
  // Initialize selectedDayIndex from sessionStorage if available
  const getInitialDayIndex = () => {
    const savedPosition = sessionStorage.getItem(`timeline-position-${dogId}`);
    if (savedPosition !== null) {
      const savedIndex = parseInt(savedPosition, 10);
      if (savedIndex >= 0 && savedIndex < timelineData.length) {
        return savedIndex;
      }
    }
    return defaultIndex;
  };
  
  const [selectedDayIndex, setSelectedDayIndex] = useState(getInitialDayIndex());

  // Re-sync selectedDayIndex when data loads
  useEffect(() => {
    if (timelineData.length === 0) return;
    if (selectedDayIndex < 0 || selectedDayIndex >= timelineData.length) {
      setSelectedDayIndex(defaultIndex);
    }
  }, [timelineData.length, defaultIndex]);

  // Auto-scroll to selected day in horizontal scroll - center it
  useEffect(() => {
    if (scrollContainerRef.current && selectedDayIndex >= 0 && timelineData.length > 0) {
      // Use requestAnimationFrame to ensure layout is complete
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const viewport = scrollContainerRef.current?.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement;
          const dayElements = scrollContainerRef.current?.querySelectorAll('[data-day-index]');
          const targetElement = dayElements?.[selectedDayIndex] as HTMLElement;
          
          if (targetElement && viewport) {
            // Calculate precise scroll position using getBoundingClientRect
            const viewportRect = viewport.getBoundingClientRect();
            const targetRect = targetElement.getBoundingClientRect();
            const offsetWithinViewport = targetRect.left - viewportRect.left;
            const scrollLeft = viewport.scrollLeft + offsetWithinViewport - (viewportRect.width / 2) + (targetRect.width / 2);
            
            viewport.scrollTo({ left: scrollLeft, behavior: 'smooth' });
          }
        });
      });
    }
  }, [selectedDayIndex, timelineData.length]);

  // Auto-scroll to selected date in vertical scroll
  useEffect(() => {
    if (verticalScrollRef.current && selectedDayIndex >= 0 && timelineData.length > 0) {
      // Add a small delay to ensure DOM is fully rendered
      const timeoutId = setTimeout(() => {
        const selectedDateElement = verticalScrollRef.current?.querySelector(
          `[data-vertical-day-index="${selectedDayIndex}"]`
        ) as HTMLElement;
        if (selectedDateElement) {
          selectedDateElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [selectedDayIndex, timelineData.length]);

  // IntersectionObserver to sync horizontal scroller with vertical scroll position
  useEffect(() => {
    if (!verticalScrollRef.current || timelineData.length === 0) return;
    
    const viewport = verticalScrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
    if (!viewport) return;
    
    // Cleanup existing observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (isScrollingRef.current) return; // Ignore during horizontal pill clicks
        
        // Find the most visible day header in the top threshold
        const visibleEntries = entries
          .filter(e => e.isIntersecting && e.intersectionRatio > 0)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        
        if (visibleEntries.length > 0) {
          const topEntry = visibleEntries[0];
          const dayIndex = parseInt(topEntry.target.getAttribute('data-vertical-day-index') || '-1');
          if (dayIndex >= 0 && dayIndex !== selectedDayIndex) {
            setSelectedDayIndex(dayIndex);
            sessionStorage.setItem(`timeline-position-${dogId}`, dayIndex.toString());
          }
        }
      },
      {
        root: viewport,
        rootMargin: '-20% 0px -70% 0px', // Top 30% of viewport
        threshold: [0, 0.25, 0.5, 0.75, 1]
      }
    );
    
    // Observe all day headers
    const dayHeaders = verticalScrollRef.current.querySelectorAll('[data-vertical-day-index]');
    dayHeaders.forEach(header => observer.observe(header));
    
    observerRef.current = observer;
    
    return () => observer.disconnect();
  }, [timelineData.length, selectedDayIndex]);

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

  const handleBackClick = () => {
    // Clear saved position when navigating back to home
    sessionStorage.removeItem(`timeline-position-${dogId}`);
    navigate('/?tab=wellness');
  };
  
  // Filter toggle
  const toggleFilter = (filter: string) => {
    setSelectedFilters(prev => {
      const newFilters = new Set(prev);
      if (filter === 'all') {
        return new Set(['all']);
      }
      newFilters.delete('all');
      if (newFilters.has(filter)) {
        newFilters.delete(filter);
      } else {
        newFilters.add(filter);
      }
      return newFilters.size === 0 ? new Set(['all']) : newFilters;
    });
  };
  
  // Apply filters to timeline data
  const filteredTimelineData = timelineData.map(day => {
    if (selectedFilters.has('all')) return day;
    
    const filteredEvents = day.events.filter(event => 
      selectedFilters.has(event.type)
    );
    
    return {
      ...day,
      events: filteredEvents
    };
  });
  
  // Count events by type
  const eventCounts = {
    all: timelineData.reduce((sum, day) => sum + day.events.length, 0),
    activity: timelineData.reduce((sum, day) => sum + day.events.filter(e => e.type === 'activity').length, 0),
    meal: timelineData.reduce((sum, day) => sum + day.events.filter(e => e.type === 'meal').length, 0),
    weight: timelineData.reduce((sum, day) => sum + day.events.filter(e => e.type === 'weight').length, 0),
    grooming: timelineData.reduce((sum, day) => sum + day.events.filter(e => e.type === 'grooming').length, 0),
    'vet-visit': timelineData.reduce((sum, day) => sum + day.events.filter(e => e.type === 'vet-visit').length, 0),
    vaccination: timelineData.reduce((sum, day) => sum + day.events.filter(e => e.type === 'vaccination').length, 0),
    checkup: timelineData.reduce((sum, day) => sum + day.events.filter(e => e.type === 'checkup').length, 0),
    treatment: timelineData.reduce((sum, day) => sum + day.events.filter(e => e.type === 'treatment').length, 0),
  };
  
  const getTimeOfDay = (date: Date) => {
    const hour = date.getHours();
    if (hour < 6) return 'Night';
    if (hour < 12) return 'Morning';
    if (hour < 18) return 'Afternoon';
    return 'Evening';
  };

  // Group events by time of day and sort with latest first
  const groupEventsByTimeOfDay = (events: any[]) => {
    const groups: Record<string, any[]> = {};
    events.forEach(event => {
      const timeOfDay = getTimeOfDay(event.timestamp);
      if (!groups[timeOfDay]) {
        groups[timeOfDay] = [];
      }
      groups[timeOfDay].push(event);
    });
    
    // Sort events within each group with latest first
    Object.keys(groups).forEach(key => {
      groups[key].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    });
    
    return groups;
  };

  const totalDistance = filteredTimelineData.reduce((sum, day) => {
    return sum + day.events.reduce((daySum, event) => {
      const distance = event.metrics?.find(m => m.label.includes('km'));
      return daySum + (distance ? parseFloat(distance.value) : 0);
    }, 0);
  }, 0);

  const totalActivities = filteredTimelineData.reduce((sum, day) => 
    sum + day.events.filter(e => e.type === 'activity').length, 0
  );
  
  const totalEvents = filteredTimelineData.reduce((sum, day) => sum + day.events.length, 0);

  return (
    <div className="flex flex-col h-full safe-top bg-background">
      {/* Header with Glass Morphism */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70 border-b shadow-sm">
        <div className="flex items-center gap-3 p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBackClick}
            className="shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Timeline</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {totalEvents} events
            </p>
          </div>
        </div>
        
        {/* Filter Section */}
        {!loading && timelineData.length > 0 && (
          <div className="px-4 pb-3">
            <ScrollArea className="w-full">
              <div className="flex gap-2">
                <Button
                  variant={selectedFilters.has('all') ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleFilter('all')}
                  className="h-8 shrink-0"
                >
                  All
                  <Badge variant="secondary" className="ml-1.5 px-1.5 min-w-[20px] justify-center">
                    {eventCounts.all}
                  </Badge>
                </Button>
                {eventCounts.activity > 0 && (
                  <Button
                    variant={selectedFilters.has('activity') ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleFilter('activity')}
                    className="h-8 shrink-0"
                  >
                    <Activity className="w-3 h-3 mr-1" />
                    Activity
                    <Badge variant="secondary" className="ml-1.5 px-1.5 min-w-[20px] justify-center">
                      {eventCounts.activity}
                    </Badge>
                  </Button>
                )}
                {eventCounts.meal > 0 && (
                  <Button
                    variant={selectedFilters.has('meal') ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleFilter('meal')}
                    className="h-8 shrink-0"
                  >
                    <Utensils className="w-3 h-3 mr-1" />
                    Meal
                    <Badge variant="secondary" className="ml-1.5 px-1.5 min-w-[20px] justify-center">
                      {eventCounts.meal}
                    </Badge>
                  </Button>
                )}
                {eventCounts.weight > 0 && (
                  <Button
                    variant={selectedFilters.has('weight') ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleFilter('weight')}
                    className="h-8 shrink-0"
                  >
                    <Weight className="w-3 h-3 mr-1" />
                    Weight
                    <Badge variant="secondary" className="ml-1.5 px-1.5 min-w-[20px] justify-center">
                      {eventCounts.weight}
                    </Badge>
                  </Button>
                )}
                {eventCounts.grooming > 0 && (
                  <Button
                    variant={selectedFilters.has('grooming') ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleFilter('grooming')}
                    className="h-8 shrink-0"
                  >
                    <Scissors className="w-3 h-3 mr-1" />
                    Grooming
                    <Badge variant="secondary" className="ml-1.5 px-1.5 min-w-[20px] justify-center">
                      {eventCounts.grooming}
                    </Badge>
                  </Button>
                )}
                {eventCounts['vet-visit'] > 0 && (
                  <Button
                    variant={selectedFilters.has('vet-visit') ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleFilter('vet-visit')}
                    className="h-8 shrink-0"
                  >
                    <Stethoscope className="w-3 h-3 mr-1" />
                    Vet Visit
                    <Badge variant="secondary" className="ml-1.5 px-1.5 min-w-[20px] justify-center">
                      {eventCounts['vet-visit']}
                    </Badge>
                  </Button>
                )}
                {eventCounts.vaccination > 0 && (
                  <Button
                    variant={selectedFilters.has('vaccination') ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleFilter('vaccination')}
                    className="h-8 shrink-0"
                  >
                    <Syringe className="w-3 h-3 mr-1" />
                    Vaccination
                    <Badge variant="secondary" className="ml-1.5 px-1.5 min-w-[20px] justify-center">
                      {eventCounts.vaccination}
                    </Badge>
                  </Button>
                )}
                {eventCounts.checkup > 0 && (
                  <Button
                    variant={selectedFilters.has('checkup') ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleFilter('checkup')}
                    className="h-8 shrink-0"
                  >
                    <ClipboardCheck className="w-3 h-3 mr-1" />
                    Checkup
                    <Badge variant="secondary" className="ml-1.5 px-1.5 min-w-[20px] justify-center">
                      {eventCounts.checkup}
                    </Badge>
                  </Button>
                )}
                {eventCounts.treatment > 0 && (
                  <Button
                    variant={selectedFilters.has('treatment') ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleFilter('treatment')}
                    className="h-8 shrink-0"
                  >
                    <Pill className="w-3 h-3 mr-1" />
                    Treatment
                    <Badge variant="secondary" className="ml-1.5 px-1.5 min-w-[20px] justify-center">
                      {eventCounts.treatment}
                    </Badge>
                  </Button>
                )}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
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
                const isFuture = day.isFuture;
                const isEmpty = day.isEmpty;
                const dayOfWeek = day.date.toLocaleDateString('en-US', { weekday: 'short' });
                
                // Check if this is the first day of a month
                const isFirstOfMonth = day.date.getDate() === 1;
                const monthLabel = day.date.toLocaleDateString('en-US', { month: 'short' });
                const key = day.date.toISOString();
                
                return (
                  <Fragment key={key}>
                    {isFirstOfMonth && (
                      <div className="flex items-center justify-center px-2 min-w-[60px]">
                        <div className="text-xs font-semibold text-primary uppercase tracking-wider">
                          {monthLabel}
                        </div>
                      </div>
                    )}
                    <button
                      data-day-index={index}
                      onClick={() => {
                        if (!isEmpty) {
                          isScrollingRef.current = true;
                          setSelectedDayIndex(index);
                          // Reset after scroll completes
                          setTimeout(() => {
                            isScrollingRef.current = false;
                          }, 600);
                        }
                      }}
                      disabled={isEmpty}
                      className={cn(
                        "timeline-date-pill flex-shrink-0 px-3 py-2 rounded-full transition-all duration-200",
                        !isEmpty && "hover:scale-105 active:scale-95",
                        isSelected 
                          ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-110" 
                          : isToday
                          ? "bg-primary/10 border-2 border-primary/30 text-primary"
                          : isEmpty
                          ? "opacity-40 cursor-not-allowed bg-muted border border-border/50"
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
                  </Fragment>
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
              {[...filteredTimelineData].reverse().map((day, reverseIndex) => {
                const originalIndex = filteredTimelineData.length - 1 - reverseIndex;
                const isSelectedDate = originalIndex === selectedDayIndex;
                
                // Skip days with no events (always filter empty dates in vertical scroll)
                if (day.events.length === 0) {
                  return null;
                }
                
                const eventGroups = groupEventsByTimeOfDay(day.events);
                const timeOrder = ['Night', 'Evening', 'Afternoon', 'Morning'];
                
                return (
                  <div 
                    key={day.date.toISOString()}
                    data-vertical-day-index={originalIndex}
                    className="animate-fade-in"
                  >
                    {/* Day Header */}
                    <div className={cn(
                      "flex items-center gap-3 mb-3 sticky top-0 py-2.5 px-3 -mx-3 z-20 rounded-lg",
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
                                     // Save current scroll position before navigating
                                     sessionStorage.setItem(`timeline-position-${dogId}`, originalIndex.toString());
                                     
                                     const routeMap: Record<string, string> = {
                                       'activity': `/activity/${event.metadata?.activityId}`,
                                       'meal': `/meal/${event.details?.id}`,
                                       'vet-visit': `/vet-visit/${event.details?.id}`,
                                       'grooming': `/grooming/${event.details?.id}`,
                                       'vaccination': `/vaccination/${event.details?.id}`,
                                       'checkup': `/checkup/${event.details?.id}`,
                                       'weight': `/weight/${event.details?.id}`,
                                       'treatment': `/treatment/${event.details?.id}`,
                                       'injury': `/injury/${event.details?.id}`,
                                     };
                                     const route = routeMap[event.type];
                                     if (route) {
                                       navigate(route, { state: { dogId, from: `/full-timeline/${dogId}` } });
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
          ) : !loading && selectedFilters.size > 0 && !selectedFilters.has('all') ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mb-4">
                <Activity className="w-8 h-8 text-muted-foreground/50" />
              </div>
              <h3 className="text-lg font-semibold mb-1">No {Array.from(selectedFilters).join(', ')} Events</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                Try selecting a different filter or "All" to see your timeline
              </p>
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
