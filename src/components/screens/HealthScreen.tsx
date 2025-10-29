import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { DogDropdown } from "@/components/dogs/DogDropdown";
import { PageLogo } from "@/components/layout/PageLogo";
import { useDogs } from "@/hooks/useDogs";
import { WeightTracker } from "@/components/health/WeightTracker";
import { VaccineScheduleModal } from "@/components/health/VaccineScheduleModal";
import { VetVisitsModal } from "@/components/health/VetVisitsModal";
import { HealthNotesModal } from "@/components/health/HealthNotesModal";
import { ActivityMonitor } from "@/components/health/ActivityMonitor";
import { GroomingScheduleModal } from "@/components/health/GroomingScheduleModal";
import { HealthCheckupModal } from "@/components/health/HealthCheckupModal";
import { TimelineQuickActions } from "@/components/health/TimelineQuickActions";
import { WellnessTimeline } from "@/components/health/WellnessTimeline";
import { ActivityRecordModal } from "@/components/home/ActivityRecordModal";
import { useWellnessTimeline } from "@/hooks/useWellnessTimeline";

interface WellnessScreenProps {
  selectedDogId: string;
  onDogChange: (dogId: string) => void;
}

export function WellnessScreen({ selectedDogId, onDogChange }: WellnessScreenProps) {
  const [isWeightTrackerOpen, setIsWeightTrackerOpen] = useState(false);
  const [isVaccineModalOpen, setIsVaccineModalOpen] = useState(false);
  const [isVetVisitsModalOpen, setIsVetVisitsModalOpen] = useState(false);
  const [isHealthNotesModalOpen, setIsHealthNotesModalOpen] = useState(false);
  const [isGroomingModalOpen, setIsGroomingModalOpen] = useState(false);
  const [isCheckupModalOpen, setIsCheckupModalOpen] = useState(false);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  
  const { dogs } = useDogs();
  const currentDog = dogs.find(dog => dog.id === selectedDogId) || dogs[0];
  const location = useLocation();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { loading: timelineLoading } = useWellnessTimeline(selectedDogId);

  useEffect(() => {
    const state = location.state as any;
    if (state?.scrollPosition !== undefined && scrollContainerRef.current && !timelineLoading) {
      // Double RAF to ensure content is fully rendered
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          scrollContainerRef.current?.scrollTo({
            top: state.scrollPosition,
            behavior: 'instant'
          });
        });
      });
      window.history.replaceState({}, document.title);
    }
  }, [location.state, timelineLoading]);

  return (
    <div className="flex flex-col h-full safe-top relative">
      <div className="pt-16">
        <DogDropdown selectedDogId={selectedDogId} onDogChange={onDogChange} />
        <PageLogo />
      </div>

      {/* Scrollable Content */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-6">
          {/* Quick Actions - Horizontal scrollable */}
          <TimelineQuickActions
            onAddActivity={() => setIsActivityModalOpen(true)}
            onLogMeal={() => {
              // Future: Open meal logging modal
              console.log('Log meal clicked');
            }}
            onRecordWeight={() => setIsWeightTrackerOpen(true)}
            onGrooming={() => setIsGroomingModalOpen(true)}
            onCheckup={() => setIsCheckupModalOpen(true)}
            onAddNote={() => setIsHealthNotesModalOpen(true)}
          />

          {/* Today's Activity Summary - Condensed */}
          <div className="card-soft p-4">
            <ActivityMonitor dogId={selectedDogId} />
          </div>

          {/* Timeline Section */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Timeline</h2>
            <WellnessTimeline dogId={selectedDogId} />
          </div>
        </div>
      </div>

      {/* Modals */}
      <WeightTracker
        isOpen={isWeightTrackerOpen}
        onClose={() => setIsWeightTrackerOpen(false)}
        dogId={selectedDogId}
        dogName={currentDog?.name || 'Your Dog'}
        currentWeight={currentDog?.weight || 0}
      />

      <VaccineScheduleModal
        isOpen={isVaccineModalOpen}
        onClose={() => setIsVaccineModalOpen(false)}
        dogId={selectedDogId}
        dogName={currentDog?.name || 'Your Dog'}
      />

      <VetVisitsModal
        isOpen={isVetVisitsModalOpen}
        onClose={() => setIsVetVisitsModalOpen(false)}
        dogId={selectedDogId}
        dogName={currentDog?.name || 'Your Dog'}
      />

      <HealthNotesModal
        isOpen={isHealthNotesModalOpen}
        onClose={() => setIsHealthNotesModalOpen(false)}
        dogId={selectedDogId}
        dogName={currentDog?.name || 'Your Dog'}
      />

      <GroomingScheduleModal
        isOpen={isGroomingModalOpen}
        onClose={() => setIsGroomingModalOpen(false)}
        dogId={selectedDogId}
      />

      <HealthCheckupModal
        isOpen={isCheckupModalOpen}
        onClose={() => setIsCheckupModalOpen(false)}
        dogId={selectedDogId}
      />

      <ActivityRecordModal
        isOpen={isActivityModalOpen}
        onClose={() => setIsActivityModalOpen(false)}
        dogId={selectedDogId}
      />
    </div>
  );
}
