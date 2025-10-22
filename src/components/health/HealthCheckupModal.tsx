import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useHealthCheckups } from "@/hooks/useHealthCheckups";
import { BodyAndLumpsStep, type CheckupData } from "./checkup/steps/BodyAndLumpsStep";
import { EarsEyesStep } from "./checkup/steps/EarsEyesStep";
import { SkinBehaviorStep } from "./checkup/steps/SkinBehaviorStep";
import { NotesReviewStep } from "./checkup/steps/NotesReviewStep";

interface HealthCheckupModalProps {
  isOpen: boolean;
  onClose: () => void;
  dogId: string;
}

export const HealthCheckupModal = ({ isOpen, onClose, dogId }: HealthCheckupModalProps) => {
  const { addCheckup } = useHealthCheckups(dogId);
  const [checkupData, setCheckupData] = useState<CheckupData>({
    body_condition_score: 5,
    lumps_found: false,
    lump_notes: "",
    ear_condition: "normal",
    ear_notes: "",
    eye_condition: "normal",
    eye_notes: "",
    skin_condition: "normal",
    skin_notes: "",
    behavior_changes: "",
    overall_notes: "",
  });
  const [step, setStep] = useState(0);

  const steps = useMemo(
    () => [
      { key: "body", title: "Body & Lumps", Component: BodyAndLumpsStep },
      { key: "earsEyes", title: "Ears & Eyes", Component: EarsEyesStep },
      { key: "skinBehavior", title: "Skin & Behavior", Component: SkinBehaviorStep },
      { key: "notes", title: "Notes", Component: NotesReviewStep },
    ],
    []
  );

  const totalSteps = steps.length;
  const progress = ((step + 1) / totalSteps) * 100;

  const setData = (updates: Partial<CheckupData>) =>
    setCheckupData((prev) => ({ ...prev, ...updates }));

  const handleSubmit = async () => {
    await addCheckup({ checkup_date: new Date().toISOString(), ...checkupData });
    // Reset
    setCheckupData({
      body_condition_score: 5,
      lumps_found: false,
      lump_notes: "",
      ear_condition: "normal",
      ear_notes: "",
      eye_condition: "normal",
      eye_notes: "",
      skin_condition: "normal",
      skin_notes: "",
      behavior_changes: "",
      overall_notes: "",
    });
    setStep(0);
    onClose();
  };

  const Current = steps[step].Component;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-0 overflow-hidden flex flex-col">
        <DialogHeader className="p-4 pb-2">
          <DialogTitle>Weekly Health Checkup</DialogTitle>
          <div className="mt-2">
            <Progress value={progress} />
            <div className="mt-2 text-xs text-muted-foreground">
              Step {step + 1} of {totalSteps}: {steps[step].title}
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-4">
          <Current data={checkupData} setData={setData} />
        </div>

        <div className="flex items-center gap-2 p-4 border-t">
          <Button
            variant="outline"
            onClick={() => (step > 0 ? setStep((s) => s - 1) : onClose())}
          >
            {step === 0 ? "Cancel" : "Back"}
          </Button>
          {step < totalSteps - 1 ? (
            <Button className="ml-auto" onClick={() => setStep((s) => s + 1)}>
              Next
            </Button>
          ) : (
            <Button className="ml-auto" onClick={handleSubmit}>
              Save Checkup
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
