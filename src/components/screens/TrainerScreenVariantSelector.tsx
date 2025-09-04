import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
    <div className="flex flex-col h-full">
      {/* Variant Selector */}
      <div className="p-4 bg-card border-b border-border">
        <h2 className="text-sm font-medium text-foreground mb-3">Design Variants</h2>
        <div className="grid grid-cols-1 gap-2">
          {variants.map((variant) => (
            <Card 
              key={variant.id}
              className={`p-3 cursor-pointer transition-colors ${
                selectedVariant === variant.id 
                  ? 'bg-primary text-primary-foreground' 
                  : 'hover:bg-secondary'
              }`}
              onClick={() => setSelectedVariant(variant.id)}
            >
              <div className="text-sm font-medium">{variant.name}</div>
              <div className="text-xs opacity-80">{variant.description}</div>
            </Card>
          ))}
        </div>
      </div>

      {/* Selected Variant */}
      <div className="flex-1 overflow-hidden">
        {renderSelectedVariant()}
      </div>
    </div>
  );
}