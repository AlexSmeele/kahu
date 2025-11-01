import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";

interface CompleteTreatmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  treatmentName: string;
  onComplete: (completionDateTime: Date) => void;
}

export function CompleteTreatmentModal({
  open,
  onOpenChange,
  treatmentName,
  onComplete,
}: CompleteTreatmentModalProps) {
  // Format current date/time for datetime-local input (YYYY-MM-DDTHH:mm)
  const now = new Date();
  const defaultDateTime = format(now, "yyyy-MM-dd'T'HH:mm");
  
  const [selectedDateTime, setSelectedDateTime] = useState<string>(defaultDateTime);

  const handleComplete = () => {
    // Parse the datetime-local value and create a Date object
    const completionDateTime = new Date(selectedDateTime);
    onComplete(completionDateTime);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Complete Treatment</DialogTitle>
          <DialogDescription>
            Mark "{treatmentName}" as completed. Set when the treatment was administered.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="datetime">Date and Time</Label>
            <Input
              id="datetime"
              type="datetime-local"
              value={selectedDateTime}
              onChange={(e) => setSelectedDateTime(e.target.value)}
              max={defaultDateTime}
              className="text-base"
            />
            <p className="text-xs text-muted-foreground">
              Select when the treatment was administered
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleComplete}>
            Complete Treatment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
