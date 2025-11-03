import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Heart, PawPrint, Award } from "lucide-react";

interface StepProps {
  data: {
    experience: 'first_time' | 'some' | 'experienced';
    allergies: boolean;
  };
  setData: (updates: any) => void;
}

export function ExperienceStep({ data, setData }: StepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Your dog experience</h2>
        <p className="text-muted-foreground">
          Help us tailor the course content to your level.
        </p>
      </div>

      <div className="space-y-3">
        <Label>Dog Ownership Experience</Label>
        <RadioGroup
          value={data.experience}
          onValueChange={(value) => setData({ experience: value })}
        >
          <Label htmlFor="first_time" className="flex items-center space-x-3 p-4 rounded-lg border cursor-pointer hover:bg-accent">
            <RadioGroupItem value="first_time" id="first_time" />
            <Heart className="w-5 h-5 text-muted-foreground" />
            <div className="flex-1">
              <div className="font-semibold">First-time owner</div>
              <p className="text-sm text-muted-foreground">Never had a dog before</p>
            </div>
          </Label>
          
          <Label htmlFor="some" className="flex items-center space-x-3 p-4 rounded-lg border cursor-pointer hover:bg-accent">
            <RadioGroupItem value="some" id="some" />
            <PawPrint className="w-5 h-5 text-muted-foreground" />
            <div className="flex-1">
              <div className="font-semibold">Some experience</div>
              <p className="text-sm text-muted-foreground">Had dogs growing up or helped care for them</p>
            </div>
          </Label>
          
          <Label htmlFor="experienced" className="flex items-center space-x-3 p-4 rounded-lg border cursor-pointer hover:bg-accent">
            <RadioGroupItem value="experienced" id="experienced" />
            <Award className="w-5 h-5 text-muted-foreground" />
            <div className="flex-1">
              <div className="font-semibold">Experienced</div>
              <p className="text-sm text-muted-foreground">Owned and cared for dogs independently</p>
            </div>
          </Label>
        </RadioGroup>
      </div>

      <Label htmlFor="allergies" className="flex items-center space-x-3 p-4 rounded-lg border cursor-pointer hover:bg-accent">
        <Checkbox
          id="allergies"
          checked={data.allergies}
          onCheckedChange={(checked) => setData({ allergies: checked === true })}
        />
        <div className="flex-1">
          <div className="font-semibold">
            I or someone in my household has pet allergies
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            We'll recommend hypoallergenic breeds
          </p>
        </div>
      </Label>
    </div>
  );
}
