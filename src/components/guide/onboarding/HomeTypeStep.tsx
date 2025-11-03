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
          <div className="flex items-center space-x-3 p-4 rounded-lg border cursor-pointer hover:bg-accent">
            <RadioGroupItem value="apartment" id="apartment" />
            <Building className="w-5 h-5 text-muted-foreground" />
            <Label htmlFor="apartment" className="flex-1 cursor-pointer">
              Apartment/Flat
            </Label>
          </div>
          
          <div className="flex items-center space-x-3 p-4 rounded-lg border cursor-pointer hover:bg-accent">
            <RadioGroupItem value="house" id="house" />
            <Home className="w-5 h-5 text-muted-foreground" />
            <Label htmlFor="house" className="flex-1 cursor-pointer">
              House (urban/suburban)
            </Label>
          </div>
          
          <div className="flex items-center space-x-3 p-4 rounded-lg border cursor-pointer hover:bg-accent">
            <RadioGroupItem value="rural" id="rural" />
            <Trees className="w-5 h-5 text-muted-foreground" />
            <Label htmlFor="rural" className="flex-1 cursor-pointer">
              Rural property
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-3">
        <Label>Outdoor Space</Label>
        <RadioGroup
          value={data.outdoor_space}
          onValueChange={(value) => setData({ outdoor_space: value })}
        >
          <div className="flex items-center space-x-3 p-4 rounded-lg border cursor-pointer hover:bg-accent">
            <RadioGroupItem value="none" id="none" />
            <Label htmlFor="none" className="flex-1 cursor-pointer">
              No outdoor space
            </Label>
          </div>
          
          <div className="flex items-center space-x-3 p-4 rounded-lg border cursor-pointer hover:bg-accent">
            <RadioGroupItem value="small" id="small" />
            <Label htmlFor="small" className="flex-1 cursor-pointer">
              Small yard/balcony
            </Label>
          </div>
          
          <div className="flex items-center space-x-3 p-4 rounded-lg border cursor-pointer hover:bg-accent">
            <RadioGroupItem value="large" id="large" />
            <Label htmlFor="large" className="flex-1 cursor-pointer">
              Large yard/land
            </Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  );
}
