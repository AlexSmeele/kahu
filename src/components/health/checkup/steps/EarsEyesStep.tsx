import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import type { CheckupData } from "./BodyAndLumpsStep";

interface StepProps {
  data: CheckupData;
  setData: (updates: Partial<CheckupData>) => void;
}

export function EarsEyesStep({ data, setData }: StepProps) {
  return (
    <div className="space-y-6">
      {/* Ear Condition */}
      <div className="space-y-3">
        <Label>Ear Condition</Label>
        <RadioGroup
          value={data.ear_condition}
          onValueChange={(value) => setData({ ear_condition: value })}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="normal" id="ear-normal" />
            <Label htmlFor="ear-normal">Normal</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="red" id="ear-red" />
            <Label htmlFor="ear-red">Redness</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="discharge" id="ear-discharge" />
            <Label htmlFor="ear-discharge">Discharge</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="odor" id="ear-odor" />
            <Label htmlFor="ear-odor">Bad odor</Label>
          </div>
        </RadioGroup>
        {data.ear_condition !== "normal" && (
          <Textarea
            placeholder="Additional ear notes..."
            value={data.ear_notes}
            onChange={(e) => setData({ ear_notes: e.target.value })}
          />
        )}
      </div>

      {/* Eye Condition */}
      <div className="space-y-3">
        <Label>Eye Condition</Label>
        <RadioGroup
          value={data.eye_condition}
          onValueChange={(value) => setData({ eye_condition: value })}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="normal" id="eye-normal" />
            <Label htmlFor="eye-normal">Normal</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="discharge" id="eye-discharge" />
            <Label htmlFor="eye-discharge">Discharge</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="redness" id="eye-redness" />
            <Label htmlFor="eye-redness">Redness</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="cloudiness" id="eye-cloudiness" />
            <Label htmlFor="eye-cloudiness">Cloudiness</Label>
          </div>
        </RadioGroup>
        {data.eye_condition !== "normal" && (
          <Textarea
            placeholder="Additional eye notes..."
            value={data.eye_notes}
            onChange={(e) => setData({ eye_notes: e.target.value })}
          />
        )}
      </div>
    </div>
  );
}
