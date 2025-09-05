import { useState } from "react";
import { Stethoscope, Calendar, MapPin, Plus, Clock, Phone, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";

interface VetVisit {
  id: string;
  date: Date;
  type: 'routine' | 'emergency' | 'follow-up' | 'vaccination' | 'surgery';
  veterinarian: string;
  clinic: string;
  reason: string;
  diagnosis?: string;
  treatment?: string;
  notes?: string;
  followUpDate?: Date;
  cost?: number;
}

interface VetClinic {
  id: string;
  name: string;
  address: string;
  phone: string;
  isDefault?: boolean;
}

interface VetVisitsModalProps {
  isOpen: boolean;
  onClose: () => void;
  dogName: string;
}

// Mock data
const mockVetVisits: VetVisit[] = [
  {
    id: "1",
    date: new Date(2024, 7, 15),
    type: "routine",
    veterinarian: "Dr. Sarah Johnson",
    clinic: "Sunny Paws Veterinary Clinic",
    reason: "Annual checkup and vaccinations",
    diagnosis: "Healthy, all vaccinations up to date",
    treatment: "Rabies and DHPP vaccines administered",
    cost: 145,
  },
  {
    id: "2",
    date: new Date(2024, 5, 3),
    type: "follow-up",
    veterinarian: "Dr. Michael Chen",
    clinic: "Sunny Paws Veterinary Clinic", 
    reason: "Follow-up for ear infection",
    diagnosis: "Ear infection resolved",
    treatment: "Discontinued ear drops",
    followUpDate: new Date(2024, 8, 3),
    cost: 65,
  },
];

const mockVetClinics: VetClinic[] = [
  {
    id: "1",
    name: "Sunny Paws Veterinary Clinic",
    address: "123 Pet Street, Animal City, AC 12345",
    phone: "(555) 123-4567",
    isDefault: true,
  },
  {
    id: "2", 
    name: "Emergency Pet Hospital",
    address: "456 Emergency Ave, Animal City, AC 12345",
    phone: "(555) 987-6543",
  },
];

export function VetVisitsModal({ isOpen, onClose, dogName }: VetVisitsModalProps) {
  const [visits, setVisits] = useState<VetVisit[]>(mockVetVisits);
  const [clinics, setClinics] = useState<VetClinic[]>(mockVetClinics);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showClinicForm, setShowClinicForm] = useState(false);
  const [newVisit, setNewVisit] = useState({
    date: new Date().toISOString().split('T')[0],
    type: '' as VetVisit['type'] | '',
    veterinarian: '',
    clinic: '',
    reason: '',
    diagnosis: '',
    treatment: '',
    notes: '',
    followUpDate: '',
    cost: '',
  });
  const [newClinic, setNewClinic] = useState({
    name: '',
    address: '',
    phone: '',
  });

  const defaultClinic = clinics.find(c => c.isDefault);

  const getVisitTypeColor = (type: VetVisit['type']) => {
    switch (type) {
      case 'routine':
        return 'bg-success/10 text-success border-success/20';
      case 'emergency':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'follow-up':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'vaccination':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'surgery':
        return 'bg-accent/10 text-accent border-accent/20';
      default:
        return 'bg-muted/10 text-muted-foreground border-muted/20';
    }
  };

  const handleAddVisit = () => {
    if (!newVisit.date || !newVisit.type || !newVisit.veterinarian || !newVisit.reason) {
      return;
    }

    const visit: VetVisit = {
      id: Date.now().toString(),
      date: new Date(newVisit.date),
      type: newVisit.type as VetVisit['type'],
      veterinarian: newVisit.veterinarian,
      clinic: newVisit.clinic || defaultClinic?.name || '',
      reason: newVisit.reason,
      diagnosis: newVisit.diagnosis || undefined,
      treatment: newVisit.treatment || undefined,
      notes: newVisit.notes || undefined,
      followUpDate: newVisit.followUpDate ? new Date(newVisit.followUpDate) : undefined,
      cost: newVisit.cost ? parseFloat(newVisit.cost) : undefined,
    };

    setVisits(prev => [visit, ...prev].sort((a, b) => b.date.getTime() - a.date.getTime()));
    setNewVisit({
      date: new Date().toISOString().split('T')[0],
      type: '',
      veterinarian: '',
      clinic: '',
      reason: '',
      diagnosis: '',
      treatment: '',
      notes: '',
      followUpDate: '',
      cost: '',
    });
    setShowAddForm(false);
  };

  const handleAddClinic = () => {
    if (!newClinic.name || !newClinic.address) return;

    const clinic: VetClinic = {
      id: Date.now().toString(),
      ...newClinic,
      isDefault: clinics.length === 0,
    };

    setClinics(prev => [...prev, clinic]);
    setNewClinic({ name: '', address: '', phone: '' });
    setShowClinicForm(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-2xl h-[calc(100vh-4rem)] max-h-[600px] flex flex-col mx-auto my-8">
        <DialogHeader className="pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-primary" />
              {dogName}'s Vet Visits
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

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="p-3 bg-primary/10 rounded-lg text-center">
              <div className="text-lg font-bold text-primary">{visits.length}</div>
              <div className="text-xs text-muted-foreground">Total Visits</div>
            </div>
            <div className="p-3 bg-success/10 rounded-lg text-center">
              <div className="text-lg font-bold text-success">
                {visits[0] ? format(visits[0].date, 'MMM dd') : 'N/A'}
              </div>
              <div className="text-xs text-muted-foreground">Last Visit</div>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 px-1">
          <div className="space-y-4">
            {/* Default Vet Clinic Info */}
            {defaultClinic && (
              <div className="card-soft p-4 bg-primary/5">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-sm flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    Primary Vet Clinic
                  </h4>
                  <Badge variant="outline" className="text-primary border-primary/30">
                    Default
                  </Badge>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="font-medium">{defaultClinic.name}</div>
                  <div className="text-muted-foreground">{defaultClinic.address}</div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Phone className="w-3 h-3" />
                    {defaultClinic.phone}
                  </div>
                </div>
              </div>
            )}

            {/* Add Visit Form */}
            {showAddForm && (
              <div className="card-soft p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Add Vet Visit</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAddForm(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="visit-date">Date</Label>
                    <Input
                      id="visit-date"
                      type="date"
                      value={newVisit.date}
                      onChange={(e) => setNewVisit(prev => ({ ...prev, date: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="visit-type">Type</Label>
                    <Select value={newVisit.type} onValueChange={(value) => setNewVisit(prev => ({ ...prev, type: value as VetVisit['type'] }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Visit type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="routine">Routine Checkup</SelectItem>
                        <SelectItem value="emergency">Emergency</SelectItem>
                        <SelectItem value="follow-up">Follow-up</SelectItem>
                        <SelectItem value="vaccination">Vaccination</SelectItem>
                        <SelectItem value="surgery">Surgery</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="veterinarian">Veterinarian</Label>
                    <Input
                      id="veterinarian"
                      value={newVisit.veterinarian}
                      onChange={(e) => setNewVisit(prev => ({ ...prev, veterinarian: e.target.value }))}
                      placeholder="Dr. Name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="clinic">Clinic</Label>
                    <Select value={newVisit.clinic} onValueChange={(value) => setNewVisit(prev => ({ ...prev, clinic: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder={defaultClinic?.name || "Select clinic"} />
                      </SelectTrigger>
                      <SelectContent>
                        {clinics.map(clinic => (
                          <SelectItem key={clinic.id} value={clinic.name}>{clinic.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="reason">Reason for Visit</Label>
                  <Input
                    id="reason"
                    value={newVisit.reason}
                    onChange={(e) => setNewVisit(prev => ({ ...prev, reason: e.target.value }))}
                    placeholder="Describe the reason for the visit"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="diagnosis">Diagnosis (Optional)</Label>
                    <Textarea
                      id="diagnosis"
                      value={newVisit.diagnosis}
                      onChange={(e) => setNewVisit(prev => ({ ...prev, diagnosis: e.target.value }))}
                      placeholder="Veterinarian's diagnosis"
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label htmlFor="treatment">Treatment (Optional)</Label>
                    <Textarea
                      id="treatment"
                      value={newVisit.treatment}
                      onChange={(e) => setNewVisit(prev => ({ ...prev, treatment: e.target.value }))}
                      placeholder="Treatment provided"
                      rows={2}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="follow-up">Follow-up Date (Optional)</Label>
                    <Input
                      id="follow-up"
                      type="date"
                      value={newVisit.followUpDate}
                      onChange={(e) => setNewVisit(prev => ({ ...prev, followUpDate: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cost">Cost (Optional)</Label>
                    <Input
                      id="cost"
                      type="number"
                      step="0.01"
                      value={newVisit.cost}
                      onChange={(e) => setNewVisit(prev => ({ ...prev, cost: e.target.value }))}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <Button onClick={handleAddVisit} size="sm" className="w-full">
                  Add Visit Record
                </Button>
              </div>
            )}

            {/* Visits List */}
            {visits.map((visit) => (
              <div key={visit.id} className="card-soft p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{format(visit.date, 'MMM dd, yyyy')}</span>
                    </div>
                    <Badge className={`${getVisitTypeColor(visit.type)} text-xs border`}>
                      {visit.type.charAt(0).toUpperCase() + visit.type.slice(1)}
                    </Badge>
                  </div>
                  {visit.cost && (
                    <div className="text-right">
                      <div className="font-medium">${visit.cost}</div>
                    </div>
                  )}
                </div>

                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Reason: </span>
                    <span>{visit.reason}</span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-muted-foreground">
                    <span>Dr. {visit.veterinarian}</span>
                    <span>•</span>
                    <span>{visit.clinic}</span>
                  </div>

                  {visit.diagnosis && (
                    <div>
                      <span className="font-medium text-muted-foreground">Diagnosis: </span>
                      <span>{visit.diagnosis}</span>
                    </div>
                  )}

                  {visit.treatment && (
                    <div>
                      <span className="font-medium text-muted-foreground">Treatment: </span>
                      <span>{visit.treatment}</span>
                    </div>
                  )}

                  {visit.followUpDate && (
                    <div className="flex items-center gap-1 text-warning">
                      <Clock className="w-3 h-3" />
                      <span className="text-xs">
                        Follow-up: {format(visit.followUpDate, 'MMM dd, yyyy')}
                      </span>
                    </div>
                  )}

                  {visit.notes && (
                    <div className="pt-2 border-t border-border/50">
                      <span className="font-medium text-muted-foreground">Notes: </span>
                      <span className="text-muted-foreground">{visit.notes}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {visits.length === 0 && (
              <div className="text-center py-8">
                <Stethoscope className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No vet visits recorded yet</p>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="pt-4 border-t space-y-2">
          <Button
            variant="outline"
            onClick={() => setShowAddForm(!showAddForm)}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Vet Visit
          </Button>
          
          <Button
            variant="ghost"
            onClick={() => setShowClinicForm(!showClinicForm)}
            size="sm"
            className="w-full text-xs"
          >
            <MapPin className="w-3 h-3 mr-1" />
            Manage Vet Clinics
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}