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

// Mock vaccine data - in a real app, this would come from the database
const mockVaccines: Vaccine[] = [
  {
    id: "1",
    name: "Rabies",
    type: "core",
    lastGiven: new Date(2024, 0, 15),
    nextDue: new Date(2025, 0, 15),
    frequency: 12,
    status: "current",
  },
  {
    id: "2", 
    name: "DHPP (Distemper, Hepatitis, Parvovirus, Parainfluenza)",
    type: "core",
    lastGiven: new Date(2024, 2, 10),
    nextDue: new Date(2025, 2, 10),
    frequency: 12,
    status: "current",
  },
  {
    id: "3",
    name: "Bordetella",
    type: "non-core",
    lastGiven: new Date(2024, 5, 20),
    nextDue: new Date(2024, 11, 20),
    frequency: 6,
    status: "due",
  },
  {
    id: "4",
    name: "Lyme Disease", 
    type: "non-core",
    status: "not_given",
  },
  {
    id: "5",
    name: "Kennel Cough",
    type: "annual",
    lastGiven: new Date(2023, 8, 5),
    nextDue: new Date(2024, 8, 5),
    frequency: 12,
    status: "overdue",
  },
];

export function VaccineModal({ isOpen, onClose, dogName, dogBirthday }: VaccineModalProps) {
  const [vaccines, setVaccines] = useState<Vaccine[]>(mockVaccines);
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
        return {
          ...v,
          lastGiven,
          nextDue,
          status: 'current' as const,
        };
      }
      return v;
    }));
  };

  const handleAddVaccine = () => {
    if (!newVaccine.name.trim()) return;

    const vaccine: Vaccine = {
      id: Date.now().toString(),
      name: newVaccine.name,
      type: 'non-core',
      lastGiven: new Date(newVaccine.date),
      status: 'current',
      notes: newVaccine.notes || undefined,
    };

    setVaccines(prev => [...prev, vaccine]);
    setNewVaccine({ name: "", date: new Date().toISOString().split('T')[0], notes: "" });
    setShowAddForm(false);
  };

  const currentVaccines = vaccines.filter(v => v.status === 'current');
  const dueVaccines = vaccines.filter(v => v.status === 'due' || v.status === 'overdue');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-lg h-[calc(100vh-4rem)] max-h-[600px] flex flex-col mx-auto my-8">
        <DialogHeader className="pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Syringe className="w-5 h-5 text-primary" />
              {dogName}'s Vaccines
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-1 h-8 w-8"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="text-center p-3 bg-success/10 rounded-lg">
              <div className="text-lg font-bold text-success">{currentVaccines.length}</div>
              <div className="text-xs text-muted-foreground">Current</div>
            </div>
            <div className="text-center p-3 bg-warning/10 rounded-lg">
              <div className="text-lg font-bold text-warning">{dueVaccines.length}</div>
              <div className="text-xs text-muted-foreground">Due</div>
            </div>
            <div className="text-center p-3 bg-primary/10 rounded-lg">
              <div className="text-lg font-bold text-primary">{vaccines.length}</div>
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
            {vaccines.map((vaccine) => {
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
                                <span className={`ml-1 ${daysUntilDue < 0 ? 'text-destructive' : daysUntilDue <= 30 ? 'text-warning' : 'text-muted-foreground'}`}>
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