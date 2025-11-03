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
          <Label htmlFor="low" className="flex items-center space-x-3 p-4 rounded-lg border cursor-pointer hover:bg-accent">
            <RadioGroupItem value="low" id="low" />
            <Armchair className="w-5 h-5 text-muted-foreground" />
            <div className="flex-1">
              <div className="font-semibold">Low</div>
              <p className="text-sm text-muted-foreground">Short walks, relaxed lifestyle</p>
            </div>
          </Label>
          
          <Label htmlFor="medium" className="flex items-center space-x-3 p-4 rounded-lg border cursor-pointer hover:bg-accent">
            <RadioGroupItem value="medium" id="medium" />
            <Footprints className="w-5 h-5 text-muted-foreground" />
            <div className="flex-1">
              <div className="font-semibold">Medium</div>
              <p className="text-sm text-muted-foreground">Regular walks and occasional activities</p>
            </div>
          </Label>
          
          <Label htmlFor="high" className="flex items-center space-x-3 p-4 rounded-lg border cursor-pointer hover:bg-accent">
            <RadioGroupItem value="high" id="high" />
            <Bike className="w-5 h-5 text-muted-foreground" />
            <div className="flex-1">
              <div className="font-semibold">High</div>
              <p className="text-sm text-muted-foreground">Very active, hiking, running, sports</p>
            </div>
          </Label>
        </RadioGroup>
      </div>

      <div className="space-y-3">
        <Label>How often do you travel?</Label>
        <RadioGroup
          value={data.travel_frequency}
          onValueChange={(value) => setData({ travel_frequency: value })}
        >
          <Label htmlFor="rare" className="flex items-center space-x-3 p-4 rounded-lg border cursor-pointer hover:bg-accent">
            <RadioGroupItem value="rare" id="rare" />
            <span className="flex-1">
              Rarely (1-2 times/year)
            </span>
          </Label>
          
          <Label htmlFor="sometimes" className="flex items-center space-x-3 p-4 rounded-lg border cursor-pointer hover:bg-accent">
            <RadioGroupItem value="sometimes" id="sometimes" />
            <span className="flex-1">
              Sometimes (3-6 times/year)
            </span>
          </Label>
          
          <Label htmlFor="often" className="flex items-center space-x-3 p-4 rounded-lg border cursor-pointer hover:bg-accent">
            <RadioGroupItem value="often" id="often" />
            <span className="flex-1">
              Often (7+ times/year)
            </span>
          </Label>
        </RadioGroup>
      </div>
    </div>
  );
}
