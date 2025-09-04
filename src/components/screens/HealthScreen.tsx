import { useState } from "react";
import { Heart, TrendingUp, Calendar, AlertCircle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDogs } from "@/hooks/useDogs";
import { DogSwitcher } from "@/components/dogs/DogSwitcher";

const healthData = {
  weight: { current: 12.4, trend: "+0.2", lastUpdated: "3 days ago" },
  vaccinations: { due: 1, upcoming: "Rabies - Due in 2 weeks" },
  lastVetVisit: "2 months ago",
  notes: 3
};

const recentRecords = [
  {
    id: 1,
    type: "weight",
    title: "Weight Check",
    value: "12.4 kg",
    date: "3 days ago",
    trend: "up",
    icon: TrendingUp,
    color: "text-success"
  },
  {
    id: 2,
    type: "vaccination",
    title: "Annual Vaccination",
    value: "Completed",
    date: "3 months ago",
    icon: Calendar,
    color: "text-primary"
  },
  {
    id: 3,
    type: "note",
    title: "Slight limp on left paw",
    value: "Monitoring",
    date: "1 week ago",
    icon: AlertCircle,
    color: "text-warning"
  }
];

export function HealthScreen() {
  const [selectedDogId, setSelectedDogId] = useState<string>('');
  const { dogs } = useDogs();
  const currentDog = dogs.find(dog => dog.id === selectedDogId) || dogs[0];

  // Update selected dog when dogs load
  useState(() => {
    if (dogs.length > 0 && !selectedDogId) {
      setSelectedDogId(dogs[0].id);
    }
  });
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
          <Button variant="outline" size="sm">
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
        {/* Weight Card */}
        <div className="card-soft p-4 bg-gradient-to-r from-success/5 to-success/10">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-success" />
              Current Weight
            </h3>
            <Badge variant="outline" className="text-success border-success/30">
              {healthData.weight.trend} kg
            </Badge>
          </div>
          <div className="flex items-end gap-1 mb-1">
            <span className="text-2xl font-bold text-foreground">
              {currentDog?.weight || healthData.weight.current}
            </span>
            <span className="text-sm text-muted-foreground mb-1">kg</span>
          </div>
          <p className="text-xs text-muted-foreground">Updated {healthData.weight.lastUpdated}</p>
        </div>

        {/* Vaccinations Card */}
        <div className="card-soft p-4 bg-gradient-to-r from-warning/5 to-warning/10">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Calendar className="w-5 h-5 text-warning" />
              Vaccinations
            </h3>
            {healthData.vaccinations.due > 0 && (
              <Badge variant="outline" className="text-warning border-warning/30">
                {healthData.vaccinations.due} due
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mb-2">
            {healthData.vaccinations.upcoming}
          </p>
          <Button variant="outline" size="sm" className="text-xs">
            View Schedule
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="card-soft p-3 text-center">
            <div className="text-lg font-bold text-primary">{healthData.lastVetVisit}</div>
            <div className="text-xs text-muted-foreground">Last Vet Visit</div>
          </div>
          <div className="card-soft p-3 text-center">
            <div className="text-lg font-bold text-accent">{healthData.notes}</div>
            <div className="text-xs text-muted-foreground">Health Notes</div>
          </div>
        </div>
      </div>

      {/* Recent Records */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <h3 className="font-semibold text-foreground mb-3">Recent Records</h3>
          <div className="space-y-3 pb-24">
            {recentRecords.map((record) => {
              const Icon = record.icon;
              return (
                <div key={record.id} className="card-soft p-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full bg-secondary flex items-center justify-center`}>
                      <Icon className={`w-4 h-4 ${record.color}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-foreground text-sm">{record.title}</h4>
                        <span className="text-xs text-muted-foreground">{record.date}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{record.value}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}