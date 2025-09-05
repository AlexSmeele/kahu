import { useState } from "react";
import { Heart, TrendingUp, Calendar, AlertCircle, Plus, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDogs } from "@/hooks/useDogs";
import { useHealthData } from "@/hooks/useHealthData";
import { DogSwitcher } from "@/components/dogs/DogSwitcher";
import { WeightTracker } from "@/components/health/WeightTracker";
import { VaccineModal } from "@/components/health/VaccineModal";
import { VetVisitsModal } from "@/components/health/VetVisitsModal";
import { HealthNotesModal } from "@/components/health/HealthNotesModal";

const vaccinationData = {
  due: 1, 
  upcoming: "Rabies - Due in 2 weeks"
};

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

export function HealthScreen() {
  const [selectedDogId, setSelectedDogId] = useState<string>('');
  const [isWeightTrackerOpen, setIsWeightTrackerOpen] = useState(false);
  const [isVaccineModalOpen, setIsVaccineModalOpen] = useState(false);
  const [isVetVisitsModalOpen, setIsVetVisitsModalOpen] = useState(false);
  const [isHealthNotesModalOpen, setIsHealthNotesModalOpen] = useState(false);
  const { dogs } = useDogs();
  const currentDog = dogs.find(dog => dog.id === selectedDogId) || dogs[0];
  const { weightData, recentRecords, healthRecordsCount, loading, refetch } = useHealthData(selectedDogId);

  // Update selected dog when dogs load
  useState(() => {
    if (dogs.length > 0 && !selectedDogId) {
      setSelectedDogId(dogs[0].id);
    }
  });

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
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="safe-top p-4 bg-card border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-destructive to-destructive/80 rounded-full flex items-center justify-center">
              <Heart className="w-6 h-6 text-destructive-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">Health Dashboard</h1>
              <p className="text-sm text-muted-foreground">Wellness overview & records</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsHealthNotesModalOpen(true)}
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Record
          </Button>
        </div>
        
        {/* Dog Switcher */}
        <DogSwitcher
          selectedDogId={selectedDogId}
          onDogChange={setSelectedDogId}
        />
      </header>

      {/* Health Summary Cards */}
      <div className="p-4 space-y-4">
        {/* Weight and Vaccination Cards - Side by Side */}
        <div className="grid grid-cols-2 gap-4">
          {/* Weight Card */}
          <div 
            className="card-soft p-4 bg-gradient-to-r from-success/5 to-success/10 cursor-pointer hover:shadow-md transition-shadow" 
            onClick={() => setIsWeightTrackerOpen(true)}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-success" />
                Weight
              </h3>
              {weightData?.change !== 0 && (
                <Badge 
                  variant="outline" 
                  className={`text-xs border-opacity-30 ${
                    weightData && weightData.change > 0 
                      ? 'text-success border-success' 
                      : weightData && weightData.change < 0 
                      ? 'text-destructive border-destructive' 
                      : 'text-muted-foreground border-muted'
                  }`}
                >
                  {weightData?.trend || 'No change'}
                </Badge>
              )}
            </div>
            <div className="flex items-end gap-1 mb-1">
              <span className="text-xl font-bold text-foreground">
                {weightData?.current || currentDog?.weight || 'No data'}
              </span>
              <span className="text-xs text-muted-foreground mb-0.5">kg</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {weightData?.lastUpdated || 'No recent updates'}
            </p>
          </div>

          {/* Vaccinations Card */}
          <div 
            className="card-soft p-4 bg-gradient-to-r from-warning/5 to-warning/10 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setIsVaccineModalOpen(true)}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4 text-warning" />
                Vaccines
              </h3>
              {vaccinationData.due > 0 && (
                <Badge variant="outline" className="text-warning border-warning/30 text-xs">
                  {vaccinationData.due} due
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mb-2">
              {vaccinationData.upcoming}
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs h-7"
              onClick={(e) => {
                e.stopPropagation();
                setIsVaccineModalOpen(true);
              }}
            >
              View Schedule
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div 
            className="card-soft p-3 text-center cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setIsVetVisitsModalOpen(true)}
          >
            <div className="text-lg font-bold text-primary">No recent visits</div>
            <div className="text-xs text-muted-foreground">Last Vet Visit</div>
          </div>
          <div 
            className="card-soft p-3 text-center cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setIsHealthNotesModalOpen(true)}
          >
            <div className="text-lg font-bold text-accent">{healthRecordsCount}</div>
            <div className="text-xs text-muted-foreground">Health Notes</div>
          </div>
        </div>
      </div>

      {/* Recent Records */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
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
        currentWeight={weightData?.current || currentDog?.weight || 0}
        dogName={currentDog?.name || 'Your dog'}
        dogBirthday={currentDog?.birthday ? new Date(currentDog.birthday) : undefined}
        dogId={currentDog?.id || ''}
      />
      
      <VaccineModal
        isOpen={isVaccineModalOpen}
        onClose={() => setIsVaccineModalOpen(false)}
        dogName={currentDog?.name || 'Your dog'}
        dogBirthday={currentDog?.birthday ? new Date(currentDog.birthday) : undefined}
      />
      
      <VetVisitsModal
        isOpen={isVetVisitsModalOpen}
        onClose={() => setIsVetVisitsModalOpen(false)}
        dogName={currentDog?.name || 'Your dog'}
      />
      
      <HealthNotesModal
        isOpen={isHealthNotesModalOpen}
        onClose={() => setIsHealthNotesModalOpen(false)}
        dogName={currentDog?.name || 'Your dog'}
      />
    </div>
  );
}