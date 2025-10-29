import { ChevronRight } from "lucide-react";
import { TimelineEvent } from "@/hooks/useWellnessTimeline";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TimelineEventCardProps {
  event: TimelineEvent;
  onClick?: () => void;
}

export function TimelineEventCard({ event, onClick }: TimelineEventCardProps) {
  const Icon = event.icon;
  
  const getStatusColor = () => {
    switch (event.status) {
      case 'completed':
        return 'bg-success/10 border-success/20';
      case 'upcoming':
        return 'bg-primary/10 border-primary/20';
      case 'overdue':
        return 'bg-destructive/10 border-destructive/20';
      default:
        return 'bg-muted';
    }
  };

  const getStatusDotColor = () => {
    switch (event.status) {
      case 'completed':
        return 'bg-success';
      case 'upcoming':
        return 'bg-primary';
      case 'overdue':
        return 'bg-destructive';
      default:
        return 'bg-muted';
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
        "relative pl-6 pb-6 cursor-pointer group",
        "before:absolute before:left-[7px] before:top-0 before:bottom-0 before:w-[2px] before:bg-border",
        "last:before:hidden"
      )}
      onClick={onClick}
    >
      {/* Timeline dot */}
      <div className={cn(
        "absolute left-0 top-1 w-4 h-4 rounded-full border-2 border-background z-10",
        getStatusDotColor(),
        event.status === 'upcoming' && "bg-transparent border-4"
      )} />

      {/* Event card */}
      <div className={cn(
        "card-soft p-4 transition-all duration-200",
        "group-hover:shadow-md group-hover:scale-[1.01]",
        getStatusColor()
      )}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* Icon */}
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
              event.status === 'completed' && "bg-success/20",
              event.status === 'upcoming' && "bg-primary/20",
              event.status === 'overdue' && "bg-destructive/20"
            )}>
              <Icon className={cn(
                "w-5 h-5",
                event.status === 'completed' && "text-success",
                event.status === 'upcoming' && "text-primary",
                event.status === 'overdue' && "text-destructive"
              )} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h4 className="font-semibold text-foreground truncate">{event.title}</h4>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatTime(event.timestamp)}
                </span>
              </div>

              {/* Metrics */}
              {event.metrics && event.metrics.length > 0 && (
                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mt-2">
                  {event.metrics.map((metric, idx) => (
                    <div key={idx} className="flex items-center gap-1">
                      {metric.icon && <metric.icon className="w-4 h-4" />}
                      <span className="font-medium text-foreground">{metric.value}</span>
                      <span className="text-muted-foreground">{metric.label}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Status badge for upcoming/overdue */}
              {event.status !== 'completed' && (
                <Badge 
                  variant="outline" 
                  className={cn(
                    "mt-2",
                    event.status === 'upcoming' && "border-primary/30 text-primary",
                    event.status === 'overdue' && "border-destructive/30 text-destructive"
                  )}
                >
                  {event.status === 'upcoming' ? 'Upcoming' : 'Overdue'}
                </Badge>
              )}
            </div>
          </div>

          {/* Chevron */}
          <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </div>
  );
}
