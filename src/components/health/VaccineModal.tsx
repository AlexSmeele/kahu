import { useState } from "react";
import { Syringe, Calendar, CheckCircle, Clock, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format, addDays, differenceInDays } from "date-fns";

interface Vaccine {
  id: string;
  name: string;
  type: 'core' | 'non-core' | 'annual' | 'booster';
  lastGiven?: Date;
  nextDue?: Date;
  frequency?: number; // months
  status: 'due' | 'overdue' | 'current' | 'not_given';
  notes?: string;
}

interface VaccineModalProps {
  isOpen: boolean;
  onClose: () => void;
  dogName: string;
  dogBirthday?: Date;
}

// Function to calculate vaccine status based on dates
const calculateVaccineStatus = (lastGiven?: Date, nextDue?: Date): Vaccine['status'] => {
  if (!lastGiven) return 'not_given';
  if (!nextDue) return 'current';
  
  const today = new Date();
  const daysUntilDue = differenceInDays(nextDue, today);
  
  if (daysUntilDue < 0) return 'overdue';
  if (daysUntilDue <= 30) return 'due';
  return 'current';
};

// Mock vaccine data - in a real app, this would come from the database
const createMockVaccines = (): Vaccine[] => {
  const today = new Date();
  const vaccines = [
    {
      id: "1",
      name: "Rabies",
      type: "core" as const,
      lastGiven: new Date(2024, 8, 15), // September 15, 2024
      nextDue: new Date(2025, 8, 15), // September 15, 2025
      frequency: 12,
    },
    {
      id: "2", 
      name: "DHPP (Distemper, Hepatitis, Parvovirus, Parainfluenza)",
      type: "core" as const,
      lastGiven: new Date(2024, 10, 10), // November 10, 2024
      nextDue: new Date(2025, 10, 10), // November 10, 2025
      frequency: 12,
    },
    {
      id: "3",
      name: "Bordetella",
      type: "non-core" as const,
      lastGiven: new Date(2025, 2, 20), // March 20, 2025
      nextDue: new Date(2025, 8, 20), // September 20, 2025
      frequency: 6,
    },
    {
      id: "4",
      name: "Lyme Disease", 
      type: "non-core" as const,
    },
    {
      id: "5",
      name: "Kennel Cough",
      type: "annual" as const,
      lastGiven: new Date(2024, 6, 5), // July 5, 2024
      nextDue: new Date(2025, 6, 5), // July 5, 2025
      frequency: 12,
    },
  ];
  
  // Calculate status for each vaccine
  return vaccines.map(vaccine => ({
    ...vaccine,
    status: calculateVaccineStatus(vaccine.lastGiven, vaccine.nextDue),
  }));
};

export function VaccineModal({ isOpen, onClose, dogName, dogBirthday }: VaccineModalProps) {
  const [vaccines, setVaccines] = useState<Vaccine[]>(createMockVaccines());
  const [showAddForm, setShowAddForm] = useState(false);
  const [newVaccine, setNewVaccine] = useState({
    name: "",
    date: new Date().toISOString().split('T')[0],
    notes: "",
  });

  const getStatusColor = (status: Vaccine['status']) => {
    switch (status) {
      case 'current':
        return 'bg-success text-success-foreground';
      case 'due':
        return 'bg-warning text-warning-foreground';
      case 'overdue':
        return 'bg-destructive text-destructive-foreground';
      case 'not_given':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status: Vaccine['status']) => {
    switch (status) {
      case 'current':
        return <CheckCircle className="w-4 h-4" />;
      case 'due':
      case 'overdue':
        return <Clock className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getDaysUntilDue = (nextDue?: Date) => {
    if (!nextDue) return null;
    const days = differenceInDays(nextDue, new Date());
    return days;
  };

  const getProgressValue = (vaccine: Vaccine) => {
    if (!vaccine.lastGiven || !vaccine.nextDue || !vaccine.frequency) return 0;
    
    const totalDays = vaccine.frequency * 30; // Approximate days
    const daysSinceGiven = differenceInDays(new Date(), vaccine.lastGiven);
    const progress = Math.min((daysSinceGiven / totalDays) * 100, 100);
    
    return progress;
  };

  const handleMarkGiven = (vaccineId: string) => {
    setVaccines(prev => prev.map(v => {
      if (v.id === vaccineId) {
        const lastGiven = new Date();
        const nextDue = v.frequency ? addDays(lastGiven, v.frequency * 30) : undefined;
        const status = calculateVaccineStatus(lastGiven, nextDue);
        return {
          ...v,
          lastGiven,
          nextDue,
          status,
        };
      }
      return v;
    }));
  };

  const handleAddVaccine = () => {
    if (!newVaccine.name.trim()) return;

    const lastGiven = new Date(newVaccine.date);
    const vaccine: Vaccine = {
      id: Date.now().toString(),
      name: newVaccine.name,
      type: 'non-core',
      lastGiven,
      status: calculateVaccineStatus(lastGiven),
      notes: newVaccine.notes || undefined,
    };

    setVaccines(prev => [...prev, vaccine]);
    setNewVaccine({ name: "", date: new Date().toISOString().split('T')[0], notes: "" });
    setShowAddForm(false);
  };

  // Sort vaccines by days until due (overdue first, then due soon, then future)
  const sortedVaccines = vaccines.sort((a, b) => {
    const daysA = getDaysUntilDue(a.nextDue);
    const daysB = getDaysUntilDue(b.nextDue);
    
    // Handle null values (vaccines with no due date go to end)
    if (daysA === null && daysB === null) return 0;
    if (daysA === null) return 1;
    if (daysB === null) return -1;
    
    return daysA - daysB;
  });

  const currentVaccines = vaccines.filter(v => v.status === 'current');
  const dueVaccines = vaccines.filter(v => v.status === 'due');
  const overdueVaccines = vaccines.filter(v => v.status === 'overdue');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg h-[calc(100vh-4rem)] max-h-[600px] flex flex-col">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-2">
            <Syringe className="w-5 h-5 text-primary" />
            {dogName}'s Vaccines
          </DialogTitle>
          
          {/* Summary Stats */}
          <div className="grid grid-cols-4 gap-2 mt-4">
            <div className="text-center p-2 bg-success/10 rounded-lg">
              <div className="text-sm font-bold text-success">{currentVaccines.length}</div>
              <div className="text-xs text-muted-foreground">Current</div>
            </div>
            <div className="text-center p-2 bg-warning/10 rounded-lg">
              <div className="text-sm font-bold text-warning">{dueVaccines.length}</div>
              <div className="text-xs text-muted-foreground">Due</div>
            </div>
            <div className="text-center p-2 bg-destructive/10 rounded-lg">
              <div className="text-sm font-bold text-destructive">{overdueVaccines.length}</div>
              <div className="text-xs text-muted-foreground">Overdue</div>
            </div>
            <div className="text-center p-2 bg-primary/10 rounded-lg">
              <div className="text-sm font-bold text-primary">{vaccines.length}</div>
              <div className="text-xs text-muted-foreground">Total</div>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 px-1">
          <div className="space-y-4">
            {/* Add New Vaccine Form */}
            {showAddForm && (
              <div className="card-soft p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Add Vaccine Record</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAddForm(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                
                <div>
                  <Label htmlFor="vaccine-name">Vaccine Name</Label>
                  <Input
                    id="vaccine-name"
                    value={newVaccine.name}
                    onChange={(e) => setNewVaccine(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Rabies, DHPP"
                  />
                </div>

                <div>
                  <Label htmlFor="vaccine-date">Date Given</Label>
                  <Input
                    id="vaccine-date"
                    type="date"
                    value={newVaccine.date}
                    onChange={(e) => setNewVaccine(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="vaccine-notes">Notes (Optional)</Label>
                  <Input
                    id="vaccine-notes"
                    value={newVaccine.notes}
                    onChange={(e) => setNewVaccine(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Batch number, vet clinic, etc."
                  />
                </div>

                <Button onClick={handleAddVaccine} size="sm" className="w-full">
                  Add Vaccine
                </Button>
              </div>
            )}

            {/* Vaccines List */}
            {sortedVaccines.map((vaccine) => {
              const daysUntilDue = getDaysUntilDue(vaccine.nextDue);
              const progressValue = getProgressValue(vaccine);

              return (
                <div key={vaccine.id} className="card-soft p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{vaccine.name}</h4>
                      <Badge variant="outline" className="mt-1 text-xs">
                        {vaccine.type}
                      </Badge>
                    </div>
                    <Badge className={`${getStatusColor(vaccine.status)} text-xs`}>
                      {getStatusIcon(vaccine.status)}
                      <span className="ml-1">
                        {vaccine.status === 'current' && 'Current'}
                        {vaccine.status === 'due' && 'Due Soon'}
                        {vaccine.status === 'overdue' && 'Overdue'}
                        {vaccine.status === 'not_given' && 'Not Given'}
                      </span>
                    </Badge>
                  </div>

                  {vaccine.lastGiven && (
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        <span>Last given: {format(vaccine.lastGiven, 'MMM dd, yyyy')}</span>
                      </div>
                      
                      {vaccine.nextDue && (
                        <>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>
                              Next due: {format(vaccine.nextDue, 'MMM dd, yyyy')}
                              {daysUntilDue !== null && (
                                <span className={`ml-1 font-medium ${
                                  daysUntilDue < 0 ? 'text-destructive' : 
                                  daysUntilDue <= 30 ? 'text-warning' : 
                                  'text-muted-foreground'
                                }`}>
                                  ({daysUntilDue < 0 ? `${Math.abs(daysUntilDue)} days overdue` : 
                                    daysUntilDue === 0 ? 'Due today' :
                                    `${daysUntilDue} days remaining`})
                                </span>
                              )}
                            </span>
                          </div>
                          
                          {vaccine.frequency && (
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span>Progress to next dose</span>
                                <span>{Math.round(progressValue)}%</span>
                              </div>
                              <Progress value={progressValue} className="h-2" />
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2">
                    {(vaccine.status === 'due' || vaccine.status === 'overdue' || vaccine.status === 'not_given') && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleMarkGiven(vaccine.id)}
                        className="text-xs"
                      >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Mark Given
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" className="text-xs">
                      Edit
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        <div className="pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => setShowAddForm(!showAddForm)}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Vaccine Record
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}