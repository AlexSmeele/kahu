import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { DogDropdown } from "@/components/dogs/DogDropdown";
import { PageLogo } from "@/components/layout/PageLogo";
import { useDogs } from "@/hooks/useDogs";
import { useNutrition } from "@/hooks/useNutrition";
import { MealLogModal } from "@/components/nutrition/MealLogModal";
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
  const [isMealLogModalOpen, setIsMealLogModalOpen] = useState(false);
  
  const { dogs } = useDogs();
  const currentDog = dogs.find(dog => dog.id === selectedDogId) || dogs[0];
  const { nutritionPlan } = useNutrition(selectedDogId);
  const location = useLocation();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { loading: timelineLoading } = useWellnessTimeline(selectedDogId);

  // Clear stale scroll data on mount
  useEffect(() => {
    try {
      sessionStorage.removeItem(`wellnessScroll:${selectedDogId}`);
    } catch {}
  }, [selectedDogId]);

  useEffect(() => {
    if (!scrollContainerRef.current || timelineLoading) return;

    // Try to recover saved scroll from multiple sources
    let saved: number | null = null;
    const state = location.state as any;

    // Priority 1: location.state (programmatic navigate)
    if (state?.scrollPosition !== undefined) {
      saved = Number(state.scrollPosition);
    }

    // Priority 2: history.state.usr (browser back button)
    if (saved == null) {
      try {
        const hs = (window.history as any).state?.usr?.scrollPosition;
        if (typeof hs === 'number') saved = hs;
      } catch {}
    }

    // Priority 3: sessionStorage fallback
    if (saved == null) {
      try {
        const s = sessionStorage.getItem(`wellnessScroll:${selectedDogId}`);
        if (s) saved = parseInt(s, 10);
      } catch {}
    }

    if (saved != null && !Number.isNaN(saved)) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          scrollContainerRef.current?.scrollTo({ top: saved, behavior: 'auto' });
          
          // Clear sessionStorage
          try { 
            sessionStorage.removeItem(`wellnessScroll:${selectedDogId}`); 
          } catch {}

          // Clear only usr.scrollPosition from history.state, preserving everything else
          try {
            const h = window.history as any;
            const curr = h.state || {};
            const usr = { ...(curr.usr || {}) };
            if ('scrollPosition' in usr) {
              delete usr.scrollPosition;
              const nextState = { ...curr, usr };
              h.replaceState(nextState, document.title, window.location.href);
            }
          } catch {}
        });
      });
    }
  }, [location.state, timelineLoading, selectedDogId]);

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
            onLogMeal={() => setIsMealLogModalOpen(true)}
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

      <MealLogModal
        isOpen={isMealLogModalOpen}
        onClose={() => setIsMealLogModalOpen(false)}
        dogId={selectedDogId}
        dogName={currentDog?.name}
        nutritionPlanId={nutritionPlan?.id}
      />
    </div>
  );
}
