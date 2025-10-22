import { useState } from "react";
import { DogDropdown } from "@/components/dogs/DogDropdown";
import { Heart, TrendingUp, Calendar, AlertCircle, Plus, Award, Scale, Syringe, Scissors, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDogs } from "@/hooks/useDogs";
import { useHealthData } from "@/hooks/useHealthData";
import { WeightTracker } from "@/components/health/WeightTracker";
import { VaccineScheduleModal } from "@/components/health/VaccineScheduleModal";
import { VetVisitsModal } from "@/components/health/VetVisitsModal";
import { HealthNotesModal } from "@/components/health/HealthNotesModal";
import { ActivityMonitor } from "@/components/health/ActivityMonitor";
import { GroomingScheduleModal } from "@/components/health/GroomingScheduleModal";
import { HealthCheckupModal } from "@/components/health/HealthCheckupModal";
import { PreventiveCareCard } from "@/components/health/PreventiveCareCard";
import { HealthQuickActions } from "@/components/health/HealthQuickActions";



const getIconComponent = (iconName: string) => {
  switch (iconName) {
    case 'TrendingUp':
      return TrendingUp;
    case 'Calendar':
      return Calendar;
    case 'AlertCircle':
      return AlertCircle;
    case 'Heart':
      return Heart;
    case 'Award':
      return Award;
    default:
      return AlertCircle;
  }
};

interface HealthScreenProps {
  selectedDogId: string;
  onDogChange: (dogId: string) => void;
}

export function HealthScreen({ selectedDogId, onDogChange }: HealthScreenProps) {
  const [isWeightTrackerOpen, setIsWeightTrackerOpen] = useState(false);
  const [isVaccineModalOpen, setIsVaccineModalOpen] = useState(false);
  const [isVetVisitsModalOpen, setIsVetVisitsModalOpen] = useState(false);
  const [isHealthNotesModalOpen, setIsHealthNotesModalOpen] = useState(false);
  const [isGroomingModalOpen, setIsGroomingModalOpen] = useState(false);
  const [isCheckupModalOpen, setIsCheckupModalOpen] = useState(false);
  const { dogs } = useDogs();
  const currentDog = dogs.find(dog => dog.id === selectedDogId) || dogs[0];
  const { weightData, recentRecords, healthRecordsCount, vaccinationData, vetVisitData, groomingData, checkupData, loading, refetch } = useHealthData(selectedDogId);

  const handleRecordClick = (record: any) => {
    switch (record.type) {
      case 'weight':
        setIsWeightTrackerOpen(true);
        break;
      case 'health':
        setIsHealthNotesModalOpen(true);
        break;
      case 'training':
        // Could open a training modal in the future
        break;
      default:
        break;
    }
  };
  return (
    <div className="flex flex-col h-full pt-16">
      <DogDropdown selectedDogId={selectedDogId} onDogChange={onDogChange} />

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-6">
          {/* Activity Monitor - Prime Placement */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Daily Activity</h3>
            <ActivityMonitor dogId={selectedDogId} />
          </div>

          {/* Quick Actions */}
          <HealthQuickActions
            onGroomingClick={() => setIsGroomingModalOpen(true)}
            onCheckupClick={() => setIsCheckupModalOpen(true)}
            onWeightClick={() => setIsWeightTrackerOpen(true)}
            onAddRecordClick={() => setIsHealthNotesModalOpen(true)}
          />

          {/* Preventive Care Dashboard */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Preventive Care</h3>
            <div className="grid grid-cols-2 gap-3">
              <PreventiveCareCard
                icon={TrendingUp}
                title="Weight"
                status={weightData?.current ? `${weightData.current} kg` : "No data"}
                statusColor={weightData?.change && weightData.change !== 0 ? (weightData.change > 0 ? "warning" : "success") : "default"}
                description={weightData?.lastUpdated || "Track your dog's weight"}
                onClick={() => setIsWeightTrackerOpen(true)}
              />
              <PreventiveCareCard
                icon={Syringe}
                title="Vaccinations"
                status={vaccinationData?.dueCount ? `${vaccinationData.dueCount} due` : "Up to date"}
                statusColor={vaccinationData?.dueCount ? "error" : "success"}
                description={vaccinationData?.upcoming || "View schedule"}
                onClick={() => setIsVaccineModalOpen(true)}
              />
              <PreventiveCareCard
                icon={Scissors}
                title="Grooming"
                status={groomingData?.overdue ? `${groomingData.overdue} overdue` : (groomingData?.nextDue || "No schedule")}
                statusColor={groomingData?.overdue ? "error" : "success"}
                description={groomingData?.overdue ? "Tasks need attention" : "On track"}
                onClick={() => setIsGroomingModalOpen(true)}
              />
              <PreventiveCareCard
                icon={Stethoscope}
                title="Weekly Checkup"
                status={checkupData?.weeksSinceCheckup === 0 ? "Done this week" : checkupData?.weeksSinceCheckup === 1 ? "1 week ago" : checkupData?.weeksSinceCheckup && checkupData.weeksSinceCheckup < 999 ? `${checkupData.weeksSinceCheckup} weeks ago` : "Never done"}
                statusColor={checkupData?.weeksSinceCheckup === 0 ? "success" : checkupData?.weeksSinceCheckup && checkupData.weeksSinceCheckup <= 1 ? "success" : checkupData?.weeksSinceCheckup && checkupData.weeksSinceCheckup <= 2 ? "warning" : "error"}
                description={checkupData?.lastCheckup || "Perform full body check"}
                onClick={() => setIsCheckupModalOpen(true)}
              />
            </div>
          </div>

          <h3 className="font-semibold text-foreground mb-3">Recent Records</h3>
          <div className="space-y-3">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="card-soft p-3 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-muted rounded w-24 mb-1"></div>
                      <div className="h-3 bg-muted rounded w-16"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : recentRecords.length > 0 ? (
              recentRecords.map((record) => {
                const Icon = getIconComponent(record.icon);
                return (
                  <div 
                    key={record.id} 
                    className="card-soft p-3 cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleRecordClick(record)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full bg-secondary flex items-center justify-center`}>
                        <Icon className={`w-4 h-4 ${record.color}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-foreground text-sm">{record.title}</h4>
                          <span className="text-xs text-muted-foreground">{record.formattedDate}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{record.value}</p>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8">
                <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No recent health records</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Health Modals */}
      <WeightTracker
        isOpen={isWeightTrackerOpen}
        onClose={() => {
          setIsWeightTrackerOpen(false);
          // Refresh health data when closing weight tracker
          setTimeout(() => {
            refetch();
          }, 500);
        }}
        currentWeight={weightData?.current || 0}
        dogName={currentDog?.name || 'Your dog'}
        dogBirthday={currentDog?.birthday ? new Date(currentDog.birthday) : undefined}
        dogId={currentDog?.id || ''}
      />
      
      <VaccineScheduleModal
        isOpen={isVaccineModalOpen}
        onClose={() => {
          setIsVaccineModalOpen(false);
          refetch(); // Refresh health data when vaccine modal closes
        }}
        dogId={currentDog?.id || ''}
        dogName={currentDog?.name || 'Your dog'}
        dogBirthday={currentDog?.birthday ? new Date(currentDog.birthday) : undefined}
      />
      
      <VetVisitsModal
        isOpen={isVetVisitsModalOpen}
        onClose={() => setIsVetVisitsModalOpen(false)}
        dogName={currentDog?.name || 'Your dog'}
        dogId={currentDog?.id || ''}
      />
      
      <HealthNotesModal
        isOpen={isHealthNotesModalOpen}
        onClose={() => {
          setIsHealthNotesModalOpen(false);
          refetch();
        }}
        dogName={currentDog?.name || 'Your dog'}
        dogId={currentDog?.id || ''}
      />

      <GroomingScheduleModal
        isOpen={isGroomingModalOpen}
        onClose={() => {
          setIsGroomingModalOpen(false);
          refetch();
        }}
        dogId={currentDog?.id || ''}
      />

      <HealthCheckupModal
        isOpen={isCheckupModalOpen}
        onClose={() => {
          setIsCheckupModalOpen(false);
          refetch();
        }}
        dogId={currentDog?.id || ''}
      />
    </div>
  );
}