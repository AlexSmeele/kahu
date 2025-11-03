import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Home, Building, Trees } from "lucide-react";

interface StepProps {
  data: {
    home_type: 'apartment' | 'house' | 'rural';
    outdoor_space: 'none' | 'small' | 'large';
  };
  setData: (updates: any) => void;
}

export function HomeTypeStep({ data, setData }: StepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">What type of home do you have?</h2>
        <p className="text-muted-foreground">
          Different living spaces suit different dogs.
        </p>
      </div>

      <div className="space-y-3">
        <Label>Home Type</Label>
        <RadioGroup
          value={data.home_type}
          onValueChange={(value) => setData({ home_type: value })}
        >
          <Label htmlFor="apartment" className="flex items-center space-x-3 p-4 rounded-lg border cursor-pointer hover:bg-accent">
            <RadioGroupItem value="apartment" id="apartment" />
            <Building className="w-5 h-5 text-muted-foreground" />
            <span className="flex-1">
              Apartment/Flat
            </span>
          </Label>
          
          <Label htmlFor="house" className="flex items-center space-x-3 p-4 rounded-lg border cursor-pointer hover:bg-accent">
            <RadioGroupItem value="house" id="house" />
            <Home className="w-5 h-5 text-muted-foreground" />
            <span className="flex-1">
              House (urban/suburban)
            </span>
          </Label>
          
          <Label htmlFor="rural" className="flex items-center space-x-3 p-4 rounded-lg border cursor-pointer hover:bg-accent">
            <RadioGroupItem value="rural" id="rural" />
            <Trees className="w-5 h-5 text-muted-foreground" />
            <span className="flex-1">
              Rural property
            </span>
          </Label>
        </RadioGroup>
      </div>

      <div className="space-y-3">
        <Label>Outdoor Space</Label>
        <RadioGroup
          value={data.outdoor_space}
          onValueChange={(value) => setData({ outdoor_space: value })}
        >
          <Label htmlFor="none" className="flex items-center space-x-3 p-4 rounded-lg border cursor-pointer hover:bg-accent">
            <RadioGroupItem value="none" id="none" />
            <span className="flex-1">
              No outdoor space
            </span>
          </Label>
          
          <Label htmlFor="small" className="flex items-center space-x-3 p-4 rounded-lg border cursor-pointer hover:bg-accent">
            <RadioGroupItem value="small" id="small" />
            <span className="flex-1">
              Small yard/balcony
            </span>
          </Label>
          
          <Label htmlFor="large" className="flex items-center space-x-3 p-4 rounded-lg border cursor-pointer hover:bg-accent">
            <RadioGroupItem value="large" id="large" />
            <span className="flex-1">
              Large yard/land
            </span>
          </Label>
        </RadioGroup>
      </div>
    </div>
  );
}
