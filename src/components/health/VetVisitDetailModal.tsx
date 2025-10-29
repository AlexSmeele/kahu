import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Calendar, Stethoscope, MapPin, DollarSign, FileText } from "lucide-react";

interface VetVisitDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  visit: {
    id: string;
    date: string;
    type?: string;
    veterinarian?: string;
    clinic?: string;
    reason?: string;
    diagnosis?: string;
    treatment?: string;
    notes?: string;
    cost?: number;
  };
}

export function VetVisitDetailModal({ open, onOpenChange, visit }: VetVisitDetailModalProps) {
  const getTypeColor = (type?: string) => {
    switch (type) {
      case 'emergency': return 'destructive';
      case 'routine': return 'default';
      case 'follow-up': return 'secondary';
      case 'vaccination': return 'outline';
      case 'surgery': return 'default';
      default: return 'default';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Stethoscope className="w-5 h-5" />
            Vet Visit Details
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-lg">{visit.reason || 'Vet Visit'}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <Calendar className="w-4 h-4" />
                <span>{format(new Date(visit.date), 'MMMM d, yyyy')}</span>
              </div>
            </div>
            {visit.type && (
              <Badge variant={getTypeColor(visit.type)}>
                {visit.type.charAt(0).toUpperCase() + visit.type.slice(1)}
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {visit.veterinarian && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Veterinarian</p>
                <p className="font-medium">{visit.veterinarian}</p>
              </div>
            )}

            {visit.clinic && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>Clinic</span>
                </div>
                <p className="font-medium">{visit.clinic}</p>
              </div>
            )}
          </div>

          {visit.diagnosis && (
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Diagnosis</p>
              <p className="font-medium">{visit.diagnosis}</p>
            </div>
          )}

          {visit.treatment && (
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Treatment</p>
              <p className="font-medium">{visit.treatment}</p>
            </div>
          )}

          {visit.notes && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="w-4 h-4" />
                <span>Notes</span>
              </div>
              <p className="font-medium whitespace-pre-wrap">{visit.notes}</p>
            </div>
          )}

          {visit.cost && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <DollarSign className="w-4 h-4" />
                <span>Cost</span>
              </div>
              <p className="font-medium">${visit.cost.toFixed(2)}</p>
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
