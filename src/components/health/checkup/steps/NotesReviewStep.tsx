import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { CheckupData } from "./BodyAndLumpsStep";

interface StepProps {
  data: CheckupData;
  setData: (updates: Partial<CheckupData>) => void;
}

export function NotesReviewStep({ data, setData }: StepProps) {
  return (
    <div className="space-y-6">
      {/* Overall Notes */}
      <div className="space-y-3">
        <Label>Overall Notes</Label>
        <Textarea
          placeholder="Any other observations..."
          value={data.overall_notes}
          onChange={(e) => setData({ overall_notes: e.target.value })}
        />
      </div>
    </div>
  );
}
