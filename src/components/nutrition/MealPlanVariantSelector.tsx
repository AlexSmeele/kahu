import { useState } from "react";
import { Settings, Zap, Calendar, ArrowRight, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { MealPlanVariantA } from "./MealPlanVariantA";
import { MealPlanVariantB } from "./MealPlanVariantB";
import { MealPlanVariantC } from "./MealPlanVariantC";
import { NutritionPlan } from "@/hooks/useNutrition";

interface MealPlanVariantSelectorProps {
  dogId: string;
  nutritionPlan?: NutritionPlan | null;
  onSave?: (plan: NutritionPlan) => void;
  trigger?: React.ReactNode;
}

const VARIANTS = [
  {
    id: 'A',
    title: 'Split-Pane Daily Editor',
    subtitle: 'Focus on one day at a time',
    icon: Layers,
    description: 'Clean split interface with day selector on left, meal details on right. Perfect for detailed meal planning.',
    pros: ['Focused editing', 'Clean interface', 'Easy to use'],
    cons: ['One day at a time', 'More clicks for weekly planning'],
    recommended: true,
    component: MealPlanVariantA,
  },
  {
    id: 'B', 
    title: '3-Step Wizard',
    subtitle: 'Guided setup process',
    icon: ArrowRight,
    description: 'Step-by-step wizard that guides you through diet basics, meal schedule, and review.',
    pros: ['Guided process', 'Less overwhelming', 'Perfect for beginners'],
    cons: ['Linear flow', 'Can\'t jump around', 'More steps'],
    recommended: false,
    component: MealPlanVariantB,
  },
  {
    id: 'C',
    title: 'Weekly Grid Planner',
    subtitle: 'See the whole week at once',
    icon: Calendar,
    description: 'Calendar-style grid showing all 7 days at once. Great for weekly meal prep planning.',
    pros: ['Full week view', 'Visual overview', 'Quick comparisons'],
    cons: ['Can be cluttered', 'Limited detail per meal', 'Better on large screens'],
    recommended: false,
    component: MealPlanVariantC,
  },
];

export function MealPlanVariantSelector({ dogId, nutritionPlan, onSave, trigger }: MealPlanVariantSelectorProps) {
  const [open, setOpen] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);

  const handleVariantSelect = (variantId: string) => {
    setSelectedVariant(variantId);
    setOpen(false);
  };

  return (
    <>
      {/* Variant Selector Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {trigger || (
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-1" />
              {nutritionPlan ? 'Edit Diet Plan' : 'Create Diet Plan'}
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="max-w-[min(95vw,1000px)] max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Choose Your Meal Planning Style</DialogTitle>
            <p className="text-muted-foreground">
              Try different layouts to find what works best for you. You can always switch later.
            </p>
          </DialogHeader>

          <ScrollArea className="flex-1 overflow-y-auto">
            <div className="grid gap-4 p-1">
              {VARIANTS.map(variant => {
                const IconComponent = variant.icon;
                
                return (
                  <div key={variant.id} className="relative">
                    {variant.recommended && (
                      <Badge className="absolute -top-2 -right-2 z-10 bg-primary text-primary-foreground">
                        <Zap className="w-3 h-3 mr-1" />
                        Recommended
                      </Badge>
                    )}
                    
                    <div 
                      className={`card-soft p-6 cursor-pointer transition-all hover:border-primary/50 ${
                        variant.recommended ? 'border-primary/30' : ''
                      }`}
                      onClick={() => handleVariantSelect(variant.id)}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg ${variant.recommended ? 'bg-primary/10' : 'bg-muted'}`}>
                          <IconComponent className={`w-6 h-6 ${variant.recommended ? 'text-primary' : 'text-muted-foreground'}`} />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg">{variant.title}</h3>
                            <Badge variant="outline" className="text-xs">
                              Option {variant.id}
                            </Badge>
                          </div>
                          
                          <p className="text-muted-foreground mb-2">{variant.subtitle}</p>
                          <p className="text-sm mb-4">{variant.description}</p>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h4 className="text-sm font-medium text-green-600 mb-1">✓ Pros</h4>
                              <ul className="text-xs text-muted-foreground space-y-1">
                                {variant.pros.map((pro, index) => (
                                  <li key={index}>• {pro}</li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-amber-600 mb-1">Considerations</h4>
                              <ul className="text-xs text-muted-foreground space-y-1">
                                {variant.cons.map((con, index) => (
                                  <li key={index}>• {con}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                          
                          <Button 
                            className="mt-4 w-full" 
                            variant={variant.recommended ? "default" : "outline"}
                          >
                            Try {variant.title}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>

          <div className="pt-4 border-t">
            <Button variant="outline" onClick={() => setOpen(false)} className="w-full">
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Render Selected Variant */}
      {selectedVariant && (() => {
        const variant = VARIANTS.find(v => v.id === selectedVariant);
        if (!variant) return null;
        
        const VariantComponent = variant.component;
        return (
          <Dialog open={true} onOpenChange={() => setSelectedVariant(null)}>
            <DialogContent className="max-w-[min(95vw,1000px)] max-h-[80vh] overflow-hidden flex flex-col">
              <VariantComponent
                key={selectedVariant}
                dogId={dogId}
                nutritionPlan={nutritionPlan}
                onSave={(plan) => {
                  onSave?.(plan);
                  setSelectedVariant(null);
                }}
                trigger={null} // No trigger needed since we control the dialog
              />
            </DialogContent>
          </Dialog>
        );
      })()}
    </>
  );
}