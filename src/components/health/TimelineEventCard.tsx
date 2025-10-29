import { ChevronRight } from "lucide-react";
import { TimelineEvent } from "@/hooks/useWellnessTimeline";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TimelineEventCardProps {
  event: TimelineEvent;
  onClick?: () => void;
  isLast?: boolean;
  isToday?: boolean;
}

export function TimelineEventCard({ event, onClick, isLast = false, isToday = false }: TimelineEventCardProps) {
  const Icon = event.icon;
  
  const getIconBgColor = () => {
    switch (event.status) {
      case 'completed':
        return 'bg-success/15';
      case 'upcoming':
        return 'bg-primary/15';
      case 'overdue':
        return 'bg-destructive/15';
      default:
        return 'bg-muted/30';
    }
  };

  const getIconColor = () => {
    switch (event.status) {
      case 'completed':
        return 'text-success';
      case 'upcoming':
        return 'text-primary';
      case 'overdue':
        return 'text-destructive';
      default:
        return 'text-muted-foreground';
    }
  };

  const getStatusDotColor = () => {
    switch (event.status) {
      case 'completed':
        return 'bg-success shadow-[0_0_8px_hsl(var(--success)/0.4)]';
      case 'upcoming':
        return 'bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.4)]';
      case 'overdue':
        return 'bg-destructive shadow-[0_0_8px_hsl(var(--destructive)/0.4)]';
      default:
        return 'bg-muted-foreground';
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div 
      className={cn(
        "relative pl-8 pb-3 cursor-pointer group",
        "before:absolute before:left-[11px] before:top-0 before:bottom-0 before:w-[3px]",
        "before:bg-gradient-to-b before:from-border before:to-border/40",
        isLast && "before:hidden"
      )}
      onClick={onClick}
    >
      {/* Timeline dot with glow effect */}
      <div className={cn(
        "absolute left-0 top-2 w-6 h-6 rounded-full border-[3px] border-background z-10",
        "transition-all duration-300 flex items-center justify-center",
        getStatusDotColor(),
        isToday && event.status === 'upcoming' && "animate-pulse",
        "group-hover:scale-125"
      )}>
        {event.status === 'upcoming' && (
          <div className="w-2 h-2 rounded-full bg-primary" />
        )}
      </div>

      {/* Event card - borderless with shadow only */}
      <div className={cn(
        "bg-card rounded-xl p-3 transition-all duration-200",
        "shadow-[0_1px_3px_rgba(0,0,0,0.08)]",
        "hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)] hover:scale-[1.01]",
        "active:scale-[0.99]"
      )}>
        <div className="flex items-start gap-3">
          {/* Icon with colored circle background */}
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
            "transition-all duration-200 group-hover:scale-110",
            getIconBgColor()
          )}>
            <Icon className={cn(
              "w-5 h-5",
              getIconColor()
            )} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-semibold text-[15px] text-foreground leading-tight">
                {event.title}
              </h4>
              <span className="text-[11px] text-muted-foreground/80 whitespace-nowrap font-medium">
                {formatTime(event.timestamp)}
              </span>
            </div>

            {/* Metrics - Horizontal compact layout */}
            {event.metrics && event.metrics.length > 0 && (
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs mt-2">
                {event.metrics.map((metric, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    {metric.icon && <metric.icon className="w-3.5 h-3.5 text-muted-foreground/60" />}
                    <span className="font-semibold text-foreground">{metric.value}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Status badge for upcoming/overdue - More compact */}
            {event.status !== 'completed' && (
              <Badge 
                variant="outline" 
                className={cn(
                  "mt-2 text-[10px] px-2 py-0.5 h-5",
                  event.status === 'upcoming' && "border-primary/30 text-primary bg-primary/5",
                  event.status === 'overdue' && "border-destructive/30 text-destructive bg-destructive/5"
                )}
              >
                {event.status === 'upcoming' ? 'Scheduled' : 'Overdue'}
              </Badge>
            )}
          </div>

          {/* Chevron - Subtle */}
          <ChevronRight className={cn(
            "w-4 h-4 text-muted-foreground/40 flex-shrink-0 transition-all duration-200",
            "group-hover:text-muted-foreground group-hover:translate-x-0.5"
          )} />
        </div>
      </div>
    </div>
  );
}
