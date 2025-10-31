import { useState } from "react";
import { TrendingUp, Droplet, Scale, AlertCircle, ChevronDown, ChevronUp, Clock, Shield, Utensils, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const FEEDING_TIPS = {
  hygiene: {
    icon: Droplet,
    title: "Hygiene & Cleanliness",
    color: "text-blue-500",
    tips: [
      "Clean bowls after EVERY meal with hot soapy water to prevent bacterial growth",
      "Stainless steel or ceramic bowls are preferred over plastic (which can harbor bacteria)",
      "Wash hands before and after handling dog food",
      "Food mats should be cleaned daily to prevent mold and bacteria",
      "Replace plastic bowls if they become scratched (bacteria can hide in grooves)",
    ]
  },
  safety: {
    icon: Shield,
    title: "Food Safety",
    color: "text-green-500",
    tips: [
      "Store dry food in airtight containers in a cool, dry place",
      "Refrigerate opened wet food and use within 2-3 days",
      "Check expiration dates regularly and discard expired food",
      "Never feed spoiled or moldy food - it can cause serious illness",
      "Register for recall alerts with FDA and food manufacturer",
      "Keep batch/lot numbers for recall tracking",
      "Transition to new foods gradually over 7-10 days to avoid digestive upset",
    ]
  },
  timing: {
    icon: Clock,
    title: "Feeding Schedule",
    color: "text-orange-500",
    tips: [
      "Wait 30-60 minutes after meals before vigorous exercise (prevents bloat)",
      "Consistent feeding times help regulate digestion",
      "Puppies need 3-4 meals/day until 6 months old",
      "Adult dogs typically need 1-2 meals per day",
      "Senior dogs may benefit from smaller, more frequent meals",
      "Don't leave food out all day (encourages picky eating and attracts pests)",
    ]
  },
  behavior: {
    icon: Brain,
    title: "Feeding Behavior",
    color: "text-purple-500",
    tips: [
      "Feed in a quiet, low-stress area away from distractions",
      "Don't interrupt dogs while eating (prevents resource guarding)",
      "If eating too fast, use a slow-feeder bowl or puzzle feeder",
      "Monitor for food aggression in multi-dog households",
      "Remove uneaten food after 15-20 minutes",
      "Never punish a dog near their food bowl",
    ]
  },
  portions: {
    icon: Scale,
    title: "Portion Control",
    color: "text-pink-500",
    tips: [
      "Use measuring cups - don't eyeball portions",
      "Adjust based on body condition score (ribs should be easily palpable)",
      "Treats should be less than 10% of daily calories",
      "Account for training treats in daily calorie budget",
      "Monitor weight weekly during diet changes",
      "Overweight dogs need gradual weight loss (1-2% body weight per week)",
    ]
  },
  special: {
    icon: Utensils,
    title: "Special Considerations",
    color: "text-yellow-500",
    tips: [
      "Large breeds: Elevate bowls to prevent bloat, avoid single large meals",
      "Small breeds: More frequent meals prevent hypoglycemia",
      "Active/working dogs: Higher protein requirements (25-30%)",
      "Overweight dogs: High-fiber, low-calorie foods increase satiety",
      "Senior dogs: May need softer foods or smaller kibble",
      "Pregnant/nursing: Require 25-50% more calories",
    ]
  },
  warnings: {
    icon: AlertCircle,
    title: "Warning Signs",
    color: "text-red-500",
    tips: [
      "Sudden appetite changes (increase or decrease) - may indicate illness",
      "Refusing food for 24+ hours requires vet visit",
      "Vomiting immediately after meals - possible obstruction or allergy",
      "Excessive gas or bloating - dietary issue or bloat emergency",
      "Weight loss despite normal eating - parasites or health condition",
      "Difficulty chewing or swallowing - dental issues or obstruction",
      "Food aggression or guarding behavior - needs professional training",
    ]
  },
};

export function NutritionTipsCard() {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['hygiene']));

  const toggleSection = (key: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-foreground">Comprehensive Feeding Guide</h3>
      </div>

      {Object.entries(FEEDING_TIPS).map(([key, section]) => {
        const Icon = section.icon;
        const isExpanded = expandedSections.has(key);

        return (
          <Collapsible
            key={key}
            open={isExpanded}
            onOpenChange={() => toggleSection(key)}
          >
            <div className="card-soft overflow-hidden">
              <CollapsibleTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="w-full justify-between p-4 h-auto hover:bg-primary/5"
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${section.color}`} />
                    <span className="font-medium text-left">{section.title}</span>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                </Button>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <div className="px-4 pb-4 space-y-2">
                  {section.tips.map((tip, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 ${section.color.replace('text-', 'bg-')}`} />
                      <p className="text-sm text-muted-foreground leading-relaxed">{tip}</p>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>
        );
      })}

      {/* Quick stats footer */}
      <div className="card-soft p-3 bg-gradient-to-r from-primary/5 to-primary/10">
        <p className="text-xs text-muted-foreground text-center">
          💡 Click each section to expand and learn more about proper feeding practices
        </p>
      </div>
    </div>
  );
}
