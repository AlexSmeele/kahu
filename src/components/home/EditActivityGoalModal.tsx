import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useMedicalTreatments } from "@/hooks/useMedicalTreatments";
import type { ActivityGoal } from "@/hooks/useActivity";

interface EditActivityGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  dogId: string;
  currentGoal: ActivityGoal | null;
  onSave: (targetMinutes: number) => Promise<boolean>;
}

export const EditActivityGoalModal = ({
  isOpen,
  onClose,
  dogId,
  currentGoal,
  onSave,
}: EditActivityGoalModalProps) => {
  const [targetMinutes, setTargetMinutes] = useState(currentGoal?.target_minutes || 60);
  const [isSaving, setIsSaving] = useState(false);
  const { treatments } = useMedicalTreatments(dogId);

  useEffect(() => {
    if (currentGoal) {
      setTargetMinutes(currentGoal.target_minutes);
    }
  }, [currentGoal]);

  const handleSave = async () => {
    setIsSaving(true);
    const success = await onSave(targetMinutes);
    setIsSaving(false);
    if (success) {
      onClose();
    }
  };

  // Check if there are active treatments that might affect activity
  const activeTreatments = treatments.filter(t => {
    if (!t.next_due_date) return false;
    const nextDue = new Date(t.next_due_date);
    const now = new Date();
    // Consider treatment "active" if it was due recently or is due soon (within 2 weeks)
    const twoWeeksFromNow = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    return nextDue <= twoWeeksFromNow;
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Daily Activity Goal</DialogTitle>
          <DialogDescription>
            Set your dog's daily exercise target in minutes
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {activeTreatments.length > 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <p className="font-semibold mb-2">Active Medical Factors:</p>
                <ul className="space-y-1 text-sm">
                  {activeTreatments.map(treatment => (
                    <li key={treatment.id} className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>
                        {treatment.treatment_name}
                        {treatment.notes && ` - ${treatment.notes}`}
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-sm text-muted-foreground">
                  Consider these factors when setting your activity goal
                </p>
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="target-minutes">Daily Target (minutes)</Label>
            <Input
              id="target-minutes"
              type="number"
              min="1"
              max="300"
              value={targetMinutes}
              onChange={(e) => setTargetMinutes(Number(e.target.value))}
            />
            <p className="text-sm text-muted-foreground">
              Recommended range: 30-90 minutes depending on breed and age
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Goal"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
