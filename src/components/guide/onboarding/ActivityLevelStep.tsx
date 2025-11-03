import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Footprints, Bike, Armchair } from "lucide-react";

interface StepProps {
  data: {
    activity_level: 'low' | 'medium' | 'high';
    travel_frequency: 'rare' | 'sometimes' | 'often';
  };
  setData: (updates: any) => void;
}

export function ActivityLevelStep({ data, setData }: StepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">How active are you?</h2>
        <p className="text-muted-foreground">
          Match your energy level with the right dog breed.
        </p>
      </div>

      <div className="space-y-3">
        <Label>Your Activity Level</Label>
        <RadioGroup
          value={data.activity_level}
          onValueChange={(value) => setData({ activity_level: value })}
        >
          <div className="flex items-center space-x-3 p-4 rounded-lg border cursor-pointer hover:bg-accent">
            <RadioGroupItem value="low" id="low" />
            <Armchair className="w-5 h-5 text-muted-foreground" />
            <div className="flex-1">
              <Label htmlFor="low" className="cursor-pointer font-semibold">Low</Label>
              <p className="text-sm text-muted-foreground">Short walks, relaxed lifestyle</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-4 rounded-lg border cursor-pointer hover:bg-accent">
            <RadioGroupItem value="medium" id="medium" />
            <Footprints className="w-5 h-5 text-muted-foreground" />
            <div className="flex-1">
              <Label htmlFor="medium" className="cursor-pointer font-semibold">Medium</Label>
              <p className="text-sm text-muted-foreground">Regular walks and occasional activities</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-4 rounded-lg border cursor-pointer hover:bg-accent">
            <RadioGroupItem value="high" id="high" />
            <Bike className="w-5 h-5 text-muted-foreground" />
            <div className="flex-1">
              <Label htmlFor="high" className="cursor-pointer font-semibold">High</Label>
              <p className="text-sm text-muted-foreground">Very active, hiking, running, sports</p>
            </div>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-3">
        <Label>How often do you travel?</Label>
        <RadioGroup
          value={data.travel_frequency}
          onValueChange={(value) => setData({ travel_frequency: value })}
        >
          <div className="flex items-center space-x-3 p-4 rounded-lg border cursor-pointer hover:bg-accent">
            <RadioGroupItem value="rare" id="rare" />
            <Label htmlFor="rare" className="flex-1 cursor-pointer">
              Rarely (1-2 times/year)
            </Label>
          </div>
          
          <div className="flex items-center space-x-3 p-4 rounded-lg border cursor-pointer hover:bg-accent">
            <RadioGroupItem value="sometimes" id="sometimes" />
            <Label htmlFor="sometimes" className="flex-1 cursor-pointer">
              Sometimes (3-6 times/year)
            </Label>
          </div>
          
          <div className="flex items-center space-x-3 p-4 rounded-lg border cursor-pointer hover:bg-accent">
            <RadioGroupItem value="often" id="often" />
            <Label htmlFor="often" className="flex-1 cursor-pointer">
              Often (7+ times/year)
            </Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  );
}
