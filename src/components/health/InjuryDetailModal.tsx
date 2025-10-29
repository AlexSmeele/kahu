import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Calendar, AlertCircle, FileText } from "lucide-react";

interface InjuryDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  injury: {
    id: string;
    date: string;
    type?: string;
    description?: string;
    treatment?: string;
    recovery_status?: string;
    notes?: string;
  };
}

export function InjuryDetailModal({ open, onOpenChange, injury }: InjuryDetailModalProps) {
  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'recovered': return 'default';
      case 'recovering': return 'secondary';
      case 'monitoring': return 'outline';
      default: return 'default';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Injury/Incident Details
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-lg">{injury.type || 'Injury/Incident'}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <Calendar className="w-4 h-4" />
                <span>{format(new Date(injury.date), 'MMMM d, yyyy')}</span>
              </div>
            </div>
            {injury.recovery_status && (
              <Badge variant={getStatusColor(injury.recovery_status)}>
                {injury.recovery_status}
              </Badge>
            )}
          </div>

          {injury.description && (
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Description</p>
              <p className="font-medium whitespace-pre-wrap">{injury.description}</p>
            </div>
          )}

          {injury.treatment && (
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Treatment Given</p>
              <p className="font-medium whitespace-pre-wrap">{injury.treatment}</p>
            </div>
          )}

          {injury.notes && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="w-4 h-4" />
                <span>Additional Notes</span>
              </div>
              <p className="font-medium whitespace-pre-wrap">{injury.notes}</p>
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
