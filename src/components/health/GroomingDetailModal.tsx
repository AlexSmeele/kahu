import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Calendar, Scissors, Check, X } from "lucide-react";

interface GroomingDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  grooming: {
    id: string;
    grooming_type: string;
    last_completed_at?: string | null;
    next_due_date?: string | null;
    notes?: string | null;
    frequency_days?: number;
  };
}

export function GroomingDetailModal({ open, onOpenChange, grooming }: GroomingDetailModalProps) {
  const isOverdue = grooming.next_due_date && new Date(grooming.next_due_date) < new Date();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scissors className="w-5 h-5" />
            Grooming Details
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg">{grooming.grooming_type}</h3>
            {isOverdue && (
              <Badge variant="destructive" className="mt-2">Overdue</Badge>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4">
            {grooming.last_completed_at && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Last Completed</span>
                </div>
                <p className="font-medium">
                  {format(new Date(grooming.last_completed_at), 'MMMM d, yyyy')}
                </p>
              </div>
            )}

            {grooming.next_due_date && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>Next Due</span>
                </div>
                <p className={`font-medium ${isOverdue ? 'text-destructive' : ''}`}>
                  {format(new Date(grooming.next_due_date), 'MMMM d, yyyy')}
                </p>
              </div>
            )}

            {grooming.frequency_days && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Frequency</p>
                <p className="font-medium">Every {grooming.frequency_days} days</p>
              </div>
            )}
          </div>

          {grooming.notes && (
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Notes</p>
              <p className="font-medium whitespace-pre-wrap">{grooming.notes}</p>
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
