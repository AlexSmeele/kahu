import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Calendar, Syringe, MapPin, FileText } from "lucide-react";

interface VaccinationDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vaccination: {
    id: string;
    vaccine_name: string;
    date_administered: string;
    next_due_date?: string | null;
    veterinarian?: string | null;
    clinic?: string | null;
    batch_number?: string | null;
    notes?: string | null;
  };
}

export function VaccinationDetailModal({ open, onOpenChange, vaccination }: VaccinationDetailModalProps) {
  const isDue = vaccination.next_due_date && new Date(vaccination.next_due_date) <= new Date();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Syringe className="w-5 h-5" />
            Vaccination Details
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg">{vaccination.vaccine_name}</h3>
            {isDue && (
              <Badge variant="destructive" className="mt-2">Due Now</Badge>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>Date Administered</span>
              </div>
              <p className="font-medium">
                {format(new Date(vaccination.date_administered), 'MMMM d, yyyy')}
              </p>
            </div>

            {vaccination.next_due_date && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Next Due Date</p>
                <p className={`font-medium ${isDue ? 'text-destructive' : ''}`}>
                  {format(new Date(vaccination.next_due_date), 'MMMM d, yyyy')}
                </p>
              </div>
            )}

            {vaccination.veterinarian && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Veterinarian</p>
                <p className="font-medium">{vaccination.veterinarian}</p>
              </div>
            )}

            {vaccination.clinic && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>Clinic</span>
                </div>
                <p className="font-medium">{vaccination.clinic}</p>
              </div>
            )}

            {vaccination.batch_number && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Batch Number</p>
                <p className="font-medium font-mono text-sm">{vaccination.batch_number}</p>
              </div>
            )}
          </div>

          {vaccination.notes && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="w-4 h-4" />
                <span>Notes</span>
              </div>
              <p className="font-medium whitespace-pre-wrap">{vaccination.notes}</p>
            </div>
          )}

          <div className="pt-4 border-t">
            <Button
              onClick={() => onOpenChange(false)}
              className="w-full"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
