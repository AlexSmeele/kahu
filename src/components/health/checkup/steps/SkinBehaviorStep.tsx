import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import type { CheckupData } from "./BodyAndLumpsStep";

interface StepProps {
  data: CheckupData;
  setData: (updates: Partial<CheckupData>) => void;
}

export function SkinBehaviorStep({ data, setData }: StepProps) {
  return (
    <div className="space-y-6">
      {/* Skin Condition */}
      <div className="space-y-3">
        <Label>Skin Condition</Label>
        <RadioGroup
          value={data.skin_condition}
          onValueChange={(value) => setData({ skin_condition: value })}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="normal" id="skin-normal" />
            <Label htmlFor="skin-normal">Normal</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="dry" id="skin-dry" />
            <Label htmlFor="skin-dry">Dry/Flaky</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="irritated" id="skin-irritated" />
            <Label htmlFor="skin-irritated">Irritated</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="rash" id="skin-rash" />
            <Label htmlFor="skin-rash">Rash</Label>
          </div>
        </RadioGroup>
        {data.skin_condition !== "normal" && (
          <Textarea
            placeholder="Additional skin notes..."
            value={data.skin_notes}
            onChange={(e) => setData({ skin_notes: e.target.value })}
          />
        )}
      </div>

      {/* Behavior Changes */}
      <div className="space-y-3">
        <Label>Behavior Changes</Label>
        <Textarea
          placeholder="Any changes in behavior, energy, appetite, etc..."
          value={data.behavior_changes}
          onChange={(e) => setData({ behavior_changes: e.target.value })}
        />
      </div>
    </div>
  );
}
