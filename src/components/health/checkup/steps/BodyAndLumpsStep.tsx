import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

export interface CheckupData {
  body_condition_score: number;
  lumps_found: boolean;
  lump_notes: string;
  ear_condition: string;
  ear_notes: string;
  eye_condition: string;
  eye_notes: string;
  skin_condition: string;
  skin_notes: string;
  behavior_changes: string;
  overall_notes: string;
}

interface StepProps {
  data: CheckupData;
  setData: (updates: Partial<CheckupData>) => void;
}

export function BodyAndLumpsStep({ data, setData }: StepProps) {
  return (
    <div className="space-y-6">
      {/* Body Condition Score */}
      <div className="space-y-3">
        <Label>Body Condition Score (1-9)</Label>
        <div className="flex items-center gap-4">
          <Slider
            value={[data.body_condition_score]}
            onValueChange={(value) =>
              setData({ body_condition_score: value[0] })
            }
            min={1}
            max={9}
            step={1}
            className="flex-1"
          />
          <span className="text-xl font-semibold w-8 text-center">
            {data.body_condition_score}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">1: Very thin, 5: Ideal, 9: Obese</p>
      </div>

      {/* Lumps Check */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="lumps"
            checked={data.lumps_found}
            onCheckedChange={(checked) => setData({ lumps_found: checked as boolean })}
          />
          <Label htmlFor="lumps">Lumps or bumps found</Label>
        </div>
        {data.lumps_found && (
          <Textarea
            placeholder="Describe location and characteristics..."
            value={data.lump_notes}
            onChange={(e) => setData({ lump_notes: e.target.value })}
          />
        )}
      </div>
    </div>
  );
}
