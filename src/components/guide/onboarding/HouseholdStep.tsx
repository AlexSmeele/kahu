import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";

interface StepProps {
  data: {
    household_adults: number;
    household_children: number;
    household_seniors: number;
  };
  setData: (updates: any) => void;
}

export function HouseholdStep({ data, setData }: StepProps) {
  const Counter = ({ 
    label, 
    value, 
    onChange 
  }: { 
    label: string; 
    value: number; 
    onChange: (val: number) => void;
  }) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-4">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => onChange(Math.max(0, value - 1))}
        >
          <Minus className="w-4 h-4" />
        </Button>
        <span className="text-2xl font-semibold w-12 text-center">{value}</span>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => onChange(value + 1)}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Tell us about your household</h2>
        <p className="text-muted-foreground">
          This helps us understand your living situation and provide personalized guidance.
        </p>
      </div>

      <Counter
        label="Adults (18+)"
        value={data.household_adults}
        onChange={(val) => setData({ household_adults: val })}
      />

      <Counter
        label="Children (under 18)"
        value={data.household_children}
        onChange={(val) => setData({ household_children: val })}
      />

      <Counter
        label="Seniors (65+)"
        value={data.household_seniors}
        onChange={(val) => setData({ household_seniors: val })}
      />
    </div>
  );
}
