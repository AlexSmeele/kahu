import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";

interface StepProps {
  data: {
    preferences: {
      size: 'small' | 'medium' | 'large' | 'any';
      shedding: 'low' | 'medium' | 'high' | 'any';
      age: 'puppy' | 'adult' | 'senior' | 'any';
    };
    target_timeline_months?: number;
  };
  setData: (updates: any) => void;
}

export function PreferencesStep({ data, setData }: StepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Your preferences</h2>
        <p className="text-muted-foreground">
          What are you looking for in a dog?
        </p>
      </div>

      <div className="space-y-3">
        <Label>Preferred Size</Label>
        <RadioGroup
          value={data.preferences.size}
          onValueChange={(value) => setData({ 
            preferences: { ...data.preferences, size: value }
          })}
        >
          {['small', 'medium', 'large', 'any'].map((size) => (
            <div key={size} className="flex items-center space-x-3 p-3 rounded-lg border cursor-pointer hover:bg-accent">
              <RadioGroupItem value={size} id={`size-${size}`} />
              <Label htmlFor={`size-${size}`} className="flex-1 cursor-pointer capitalize">
                {size === 'any' ? 'No preference' : size}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div className="space-y-3">
        <Label>Shedding Level</Label>
        <RadioGroup
          value={data.preferences.shedding}
          onValueChange={(value) => setData({ 
            preferences: { ...data.preferences, shedding: value }
          })}
        >
          {['low', 'medium', 'high', 'any'].map((level) => (
            <div key={level} className="flex items-center space-x-3 p-3 rounded-lg border cursor-pointer hover:bg-accent">
              <RadioGroupItem value={level} id={`shed-${level}`} />
              <Label htmlFor={`shed-${level}`} className="flex-1 cursor-pointer capitalize">
                {level === 'any' ? 'No preference' : level}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div className="space-y-3">
        <Label>Preferred Age</Label>
        <RadioGroup
          value={data.preferences.age}
          onValueChange={(value) => setData({ 
            preferences: { ...data.preferences, age: value }
          })}
        >
          {['puppy', 'adult', 'senior', 'any'].map((age) => (
            <div key={age} className="flex items-center space-x-3 p-3 rounded-lg border cursor-pointer hover:bg-accent">
              <RadioGroupItem value={age} id={`age-${age}`} />
              <Label htmlFor={`age-${age}`} className="flex-1 cursor-pointer capitalize">
                {age === 'any' ? 'No preference' : age}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Timeline to bring dog home</Label>
          <span className="text-sm font-semibold text-primary">
            {data.target_timeline_months || 0} months
          </span>
        </div>
        <Slider
          value={[data.target_timeline_months || 0]}
          onValueChange={(value) => setData({ target_timeline_months: value[0] })}
          min={0}
          max={24}
          step={1}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>ASAP</span>
          <span>2 years</span>
        </div>
      </div>
    </div>
  );
}
