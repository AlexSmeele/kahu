import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Calendar, Pill, Clock, FileText } from "lucide-react";

interface TreatmentDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  treatment: {
    id: string;
    medication_name: string;
    dosage: string;
    frequency: string;
    start_date: string;
    end_date?: string | null;
    last_administered?: string | null;
    next_due?: string | null;
    notes?: string | null;
    is_active: boolean;
  };
}

export function TreatmentDetailModal({ open, onOpenChange, treatment }: TreatmentDetailModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pill className="w-5 h-5" />
            Treatment Details
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-lg">{treatment.medication_name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{treatment.dosage}</p>
            </div>
            <Badge variant={treatment.is_active ? 'default' : 'secondary'}>
              {treatment.is_active ? 'Active' : 'Completed'}
            </Badge>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>Frequency</span>
              </div>
              <p className="font-medium">{treatment.frequency}</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>Start Date</span>
              </div>
              <p className="font-medium">
                {format(new Date(treatment.start_date), 'MMMM d, yyyy')}
              </p>
            </div>

            {treatment.end_date && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">End Date</p>
                <p className="font-medium">
                  {format(new Date(treatment.end_date), 'MMMM d, yyyy')}
                </p>
              </div>
            )}

            {treatment.last_administered && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Last Administered</p>
                <p className="font-medium">
                  {format(new Date(treatment.last_administered), 'MMMM d, yyyy h:mm a')}
                </p>
              </div>
            )}

            {treatment.next_due && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Next Due</p>
                <p className="font-medium">
                  {format(new Date(treatment.next_due), 'MMMM d, yyyy h:mm a')}
                </p>
              </div>
            )}
          </div>

          {treatment.notes && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="w-4 h-4" />
                <span>Notes</span>
              </div>
              <p className="font-medium whitespace-pre-wrap">{treatment.notes}</p>
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
