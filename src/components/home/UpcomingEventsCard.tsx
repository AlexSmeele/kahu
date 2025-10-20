import { Card } from "@/components/ui/card";
import { Calendar, Stethoscope, Syringe, Scissors } from "lucide-react";
import { format } from "date-fns";
import type { UpcomingEvent } from "@/hooks/useHomeData";

interface UpcomingEventsCardProps {
  events: UpcomingEvent[];
  onClick: () => void;
}

export const UpcomingEventsCard = ({ events, onClick }: UpcomingEventsCardProps) => {
  if (events.length === 0) {
    return (
      <Card 
        className="p-4 cursor-pointer hover:shadow-lg transition-all duration-200"
        onClick={onClick}
      >
        <div className="flex items-start gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Calendar className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-base mb-1">Upcoming Events</h3>
            <p className="text-sm text-muted-foreground">No upcoming events</p>
          </div>
        </div>
      </Card>
    );
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'vet_visit':
        return Stethoscope;
      case 'vaccination':
        return Syringe;
      case 'grooming':
        return Scissors;
      default:
        return Calendar;
    }
  };

  return (
    <Card 
      className="p-4 cursor-pointer hover:shadow-lg transition-all duration-200"
      onClick={onClick}
    >
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-base">Upcoming Events</h3>
        </div>

        <div className="space-y-2">
          {events.slice(0, 4).map((event) => {
            const Icon = getIcon(event.type);
            return (
              <div
                key={event.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{event.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(event.date, 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};
