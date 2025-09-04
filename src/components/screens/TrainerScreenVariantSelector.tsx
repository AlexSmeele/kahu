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
    <div className="relative h-full">
      {/* Variant Selector - Floating */}
      <div className="absolute top-4 left-4 right-4 z-50 bg-card border border-border rounded-lg shadow-lg p-3">
        <h2 className="text-sm font-medium text-foreground mb-3">Design Variants</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
          {variants.map((variant) => (
            <Card 
              key={variant.id}
              className={`p-2 cursor-pointer transition-colors ${
                selectedVariant === variant.id 
                  ? 'bg-primary text-primary-foreground' 
                  : 'hover:bg-secondary'
              }`}
              onClick={() => setSelectedVariant(variant.id)}
            >
              <div className="text-xs font-medium">{variant.name}</div>
            </Card>
          ))}
        </div>
      </div>

      {/* Selected Variant - Full Height */}
      <div className="h-full">
        {renderSelectedVariant()}
      </div>
    </div>
  );
}