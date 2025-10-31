import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useWellnessTimeline } from "@/hooks/useWellnessTimeline";
import { TimelineEventCard } from "./TimelineEventCard";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { VetVisitDetailModal } from "./VetVisitDetailModal";
import { CheckupDetailModal } from "./CheckupDetailModal";
import { VaccinationDetailModal } from "./VaccinationDetailModal";
import { WeightDetailModal } from "./WeightDetailModal";
import { TreatmentDetailModal } from "./TreatmentDetailModal";
import { InjuryDetailModal } from "./InjuryDetailModal";
import { WalkMapViewer } from "./WalkMapViewer";

interface WellnessTimelineProps {
  dogId: string;
}

export function WellnessTimeline({ dogId }: WellnessTimelineProps) {
  const { timelineData, loading, showFullTimeline, setShowFullTimeline } = useWellnessTimeline(dogId);
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [modalType, setModalType] = useState<string | null>(null);
  const [showMapViewer, setShowMapViewer] = useState(false);

  const handleEventClick = (event: any) => {
    if (event.type === 'activity' && event.metadata?.activityId) {
      const scrollableContainer = document.querySelector('.overflow-y-auto');
      const scrollPosition = scrollableContainer?.scrollTop || 0;
      try {
        const h = window.history as any;
        const prevUsr = h.state?.usr || {};
        h.replaceState({ ...h.state, usr: { ...prevUsr, scrollPosition } }, document.title, window.location.href);
      } catch {}
      try {
        sessionStorage.setItem(`wellnessScroll:${dogId}`, String(scrollPosition));
      } catch {}
      navigate(`/activity/${event.metadata.activityId}`, { 
        state: { 
          dogId, 
          from: '/?tab=wellness',
          scrollPosition 
        } 
      });
    } else if (event.type === 'meal' && event.details?.id) {
      const scrollableContainer = document.querySelector('.overflow-y-auto');
      const scrollPosition = scrollableContainer?.scrollTop || 0;
      try {
        const h = window.history as any;
        const prevUsr = h.state?.usr || {};
        h.replaceState({ ...h.state, usr: { ...prevUsr, scrollPosition } }, document.title, window.location.href);
      } catch {}
      try {
        sessionStorage.setItem(`wellnessScroll:${dogId}`, String(scrollPosition));
      } catch {}
      navigate(`/meal/${event.details.id}`, { 
        state: { 
          dogId, 
          from: '/?tab=wellness',
          scrollPosition 
        } 
      });
    } else if (event.type === 'grooming') {
      if (!event.details?.id) {
        console.error('Grooming event missing ID:', event);
        return;
      }
      const scrollableContainer = document.querySelector('.overflow-y-auto');
      const scrollPosition = scrollableContainer?.scrollTop || 0;
      try {
        const h = window.history as any;
        const prevUsr = h.state?.usr || {};
        h.replaceState({ ...h.state, usr: { ...prevUsr, scrollPosition } }, document.title, window.location.href);
      } catch {}
      try {
        sessionStorage.setItem(`wellnessScroll:${dogId}`, String(scrollPosition));
      } catch {}
      navigate(`/grooming/${event.details.id}`, { 
        state: { 
          dogId, 
          from: '/?tab=wellness',
          scrollPosition 
        } 
      });
    } else if (event.details) {
      setSelectedEvent(event.details);
      setModalType(event.type);
    }
  };
  
  if (loading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, dayIdx) => (
          <div key={dayIdx} className="space-y-4">
            <div className="h-6 w-32 bg-muted rounded animate-pulse" />
            {Array.from({ length: 2 }).map((_, eventIdx) => (
              <div key={eventIdx} className="relative pl-6">
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
        ))}
      </div>
    );
  }

  if (timelineData.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Timeline Activity Yet</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Start tracking your dog's activities, meals, and health records to see them here
        </p>
      </div>
    );
  }

  // Separate past and upcoming events
  const now = new Date();
  const pastDays = timelineData.filter(day => day.date <= now);
  const upcomingDays = timelineData.filter(day => day.date > now);
  
  // Check if there's more data to show
  const hasMoreData = !showFullTimeline;

  return (
    <>
      <div className="space-y-8">
        {/* Past & Today Events */}
        {pastDays.length > 0 && (
          <div className="space-y-6">
            {pastDays.map((day) => (
              <div key={day.date.toISOString()}>
                <div className="flex items-center gap-3 mb-4">
                  <h3 className="text-base font-semibold">
                    {day.label}
                  </h3>
                  {day.isToday && (
                    <Badge variant="default" className="text-xs">
                      {day.events.length} {day.events.length === 1 ? 'event' : 'events'}
                    </Badge>
                  )}
                </div>

                <div className="space-y-0">
                  {day.events.map((event) => (
                    <TimelineEventCard 
                      key={event.id} 
                      event={event}
                      onClick={() => handleEventClick(event)}
                      onMapClick={() => setShowMapViewer(true)}
                      hasGpsData={event.type === 'activity' && !!event.metadata?.activityId}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* View Full Timeline Button */}
        {hasMoreData && (
          <Button
            variant="default"
            onClick={() => {
              navigate(`/full-timeline/${dogId}`, { 
                state: { from: 'wellness' } 
              });
            }}
            className="w-full"
          >
            <Calendar className="w-4 h-4 mr-2" />
            View Full Timeline
          </Button>
        )}

        {/* Upcoming Events Section */}
        {upcomingDays.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <h3 className="text-base font-semibold">Due Soon</h3>
              <Badge variant="outline" className="text-xs">
                {upcomingDays.reduce((sum, day) => sum + day.events.length, 0)} upcoming
              </Badge>
            </div>

            {upcomingDays.map((day) => (
              <div key={day.date.toISOString()}>
                <h4 className="text-sm font-medium text-muted-foreground mb-3">
                  {day.label}
                </h4>

                <div className="space-y-0">
                  {day.events.map((event) => (
                    <TimelineEventCard 
                      key={event.id} 
                      event={event}
                      onClick={() => handleEventClick(event)}
                      onMapClick={() => setShowMapViewer(true)}
                      hasGpsData={event.type === 'activity' && !!event.metadata?.activityId}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Walk Map Viewer */}
      <Dialog open={showMapViewer} onOpenChange={setShowMapViewer}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Walk Map Viewer</DialogTitle>
          </DialogHeader>
          <WalkMapViewer dogId={dogId} />
        </DialogContent>
      </Dialog>

      {/* Detail Modals */}
      {selectedEvent && modalType === 'vet_visit' && (
        <VetVisitDetailModal
          open={true}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedEvent(null);
              setModalType(null);
            }
          }}
          visit={selectedEvent}
        />
      )}

      {selectedEvent && modalType === 'checkup' && (
        <CheckupDetailModal
          open={true}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedEvent(null);
              setModalType(null);
            }
          }}
          checkup={selectedEvent}
        />
      )}

      {selectedEvent && modalType === 'vaccination' && (
        <VaccinationDetailModal
          open={true}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedEvent(null);
              setModalType(null);
            }
          }}
          vaccination={selectedEvent}
        />
      )}

      {selectedEvent && modalType === 'weight' && (
        <WeightDetailModal
          open={true}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedEvent(null);
              setModalType(null);
            }
          }}
          weight={selectedEvent}
        />
      )}

      {selectedEvent && modalType === 'treatment' && (
        <TreatmentDetailModal
          open={true}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedEvent(null);
              setModalType(null);
            }
          }}
          treatment={selectedEvent}
        />
      )}

      {selectedEvent && modalType === 'injury' && (
        <InjuryDetailModal
          open={true}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedEvent(null);
              setModalType(null);
            }
          }}
          injury={selectedEvent}
        />
      )}
    </>
  );
}
