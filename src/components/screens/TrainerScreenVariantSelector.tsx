import { useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { TrainerScreen } from "./TrainerScreen";
import { TrainerScreenVariant1 } from "./TrainerScreenVariant1";
import { TrainerScreenVariant2 } from "./TrainerScreenVariant2";
import { TrainerScreenVariant3 } from "./TrainerScreenVariant3";
import { TrainerScreenVariant4 } from "./TrainerScreenVariant4";

type VariantType = 'current' | 'variant1' | 'variant2' | 'variant3' | 'variant4';

const variants = [
  { id: 'current' as VariantType, name: 'Current Design', description: 'Chat-style with welcome prompts' },
  { id: 'variant1' as VariantType, name: 'Card Actions', description: 'Action cards with gradient background' },
  { id: 'variant2' as VariantType, name: 'Minimalist Search', description: 'Clean, search-focused interface' },
  { id: 'variant3' as VariantType, name: 'Dashboard Style', description: 'Stats and quick actions dashboard' },
  { id: 'variant4' as VariantType, name: 'Magazine Style', description: 'Editorial layout with hero image' },
];

export function TrainerScreenVariantSelector() {
  const [selectedVariant, setSelectedVariant] = useState<VariantType>('current');

  const renderSelectedVariant = () => {
    switch (selectedVariant) {
      case 'current':
        return <TrainerScreen />;
      case 'variant1':
        return <TrainerScreenVariant1 />;
      case 'variant2':
        return <TrainerScreenVariant2 />;
      case 'variant3':
        return <TrainerScreenVariant3 />;
      case 'variant4':
        return <TrainerScreenVariant4 />;
      default:
        return <TrainerScreen />;
    }
  };

  return (
    <div className="relative h-full">
      {/* Compact Dropdown Selector */}
      <div className="absolute top-4 right-4 z-50">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="bg-background/95 backdrop-blur-sm shadow-lg border-border">
              {variants.find(v => v.id === selectedVariant)?.name}
              <ChevronDown className="w-4 h-4 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end" 
            className="w-48 bg-background/95 backdrop-blur-sm border-border shadow-lg z-50"
          >
            {variants.map((variant) => (
              <DropdownMenuItem
                key={variant.id}
                onClick={() => setSelectedVariant(variant.id)}
                className={`cursor-pointer ${
                  selectedVariant === variant.id 
                    ? 'bg-primary text-primary-foreground' 
                    : ''
                }`}
              >
                <div>
                  <div className="font-medium">{variant.name}</div>
                  <div className="text-xs opacity-70">{variant.description}</div>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Selected Variant - Full Height */}
      <div className="h-full">
        {renderSelectedVariant()}
      </div>
    </div>
  );
}