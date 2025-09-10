import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useVaccines, Vaccine } from "@/hooks/useVaccines";

interface AddVaccinationModalProps {
  isOpen: boolean;
  onClose: () => void;
  dogId: string;
  vaccineId?: string;
  vaccines: Vaccine[];
}

export function AddVaccinationModal({
  isOpen,
  onClose,
  dogId,
  vaccineId,
  vaccines
}: AddVaccinationModalProps) {
  const [selectedVaccineId, setSelectedVaccineId] = useState(vaccineId || '');
  const [administeredDate, setAdministeredDate] = useState<Date>();
  const [dueDate, setDueDate] = useState<Date>();
  const [veterinarian, setVeterinarian] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { addVaccinationRecord } = useVaccines(dogId);

  const selectedVaccine = vaccines.find(v => v.id === selectedVaccineId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVaccineId || !administeredDate) return;

    setIsSubmitting(true);
    try {
      await addVaccinationRecord(
        selectedVaccineId,
        format(administeredDate, 'yyyy-MM-dd'),
        dueDate ? format(dueDate, 'yyyy-MM-dd') : undefined,
        veterinarian || undefined,
        batchNumber || undefined,
        notes || undefined
      );
      
      handleClose();
    } catch (error) {
      console.error('Error adding vaccination record:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedVaccineId(vaccineId || '');
    setAdministeredDate(undefined);
    setDueDate(undefined);
    setVeterinarian('');
    setBatchNumber('');
    setNotes('');
    onClose();
  };

  const calculateDueDate = (vaccine: Vaccine, administeredDate: Date) => {
    if (!vaccine.frequency_months || !vaccine.booster_required) return null;
    
    const dueDate = new Date(administeredDate);
    dueDate.setMonth(dueDate.getMonth() + vaccine.frequency_months);
    return dueDate;
  };

  // Auto-calculate due date when administered date or vaccine changes
  const handleAdministeredDateChange = (date: Date | undefined) => {
    setAdministeredDate(date);
    if (date && selectedVaccine) {
      const calculatedDueDate = calculateDueDate(selectedVaccine, date);
      if (calculatedDueDate) {
        setDueDate(calculatedDueDate);
      }
    }
  };

  const handleVaccineChange = (vaccineId: string) => {
    setSelectedVaccineId(vaccineId);
    const vaccine = vaccines.find(v => v.id === vaccineId);
    if (vaccine && administeredDate) {
      const calculatedDueDate = calculateDueDate(vaccine, administeredDate);
      if (calculatedDueDate) {
        setDueDate(calculatedDueDate);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Vaccination Record</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="vaccine">Vaccine/Treatment</Label>
            <Select value={selectedVaccineId} onValueChange={handleVaccineChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select vaccine or treatment" />
              </SelectTrigger>
              <SelectContent>
                <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">Core Vaccines</div>
                {vaccines.filter(v => v.vaccine_type === 'core').map((vaccine) => (
                  <SelectItem key={vaccine.id} value={vaccine.id}>
                    {vaccine.name}
                  </SelectItem>
                ))}
                <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">Lifestyle Vaccines</div>
                {vaccines.filter(v => v.vaccine_type === 'lifestyle').map((vaccine) => (
                  <SelectItem key={vaccine.id} value={vaccine.id}>
                    {vaccine.name}
                  </SelectItem>
                ))}
                <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">Regional Vaccines</div>
                {vaccines.filter(v => v.vaccine_type === 'regional').map((vaccine) => (
                  <SelectItem key={vaccine.id} value={vaccine.id}>
                    {vaccine.name}
                  </SelectItem>
                ))}
                <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">Injectable Therapies</div>
                {vaccines.filter(v => v.vaccine_type === 'injectable_therapy').map((vaccine) => (
                  <SelectItem key={vaccine.id} value={vaccine.id}>
                    {vaccine.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedVaccine && (
              <p className="text-xs text-muted-foreground">{selectedVaccine.protects_against}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date Administered *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !administeredDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {administeredDate ? format(administeredDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={administeredDate}
                    onSelect={handleAdministeredDateChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Next Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, "PPP") : "Optional"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="veterinarian">Veterinarian</Label>
            <Input
              id="veterinarian"
              value={veterinarian}
              onChange={(e) => setVeterinarian(e.target.value)}
              placeholder="Vet name or clinic"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="batchNumber">Batch/Lot Number</Label>
            <Input
              id="batchNumber"
              value={batchNumber}
              onChange={(e) => setBatchNumber(e.target.value)}
              placeholder="Optional batch number"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes about this vaccination"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!selectedVaccineId || !administeredDate || isSubmitting}
            >
              {isSubmitting ? 'Adding...' : 'Add Record'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}