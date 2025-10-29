import { TrendingUp, Droplet, Scale, AlertCircle } from "lucide-react";

export function NutritionTipsCard() {
  const tips = [
    {
      icon: Scale,
      text: "Monitor weight changes weekly to adjust portions",
    },
    {
      icon: TrendingUp,
      text: "Consistent feeding times help with digestion",
    },
    {
      icon: Droplet,
      text: "Fresh water should always be available",
    },
    {
      icon: AlertCircle,
      text: "Watch for food allergies or sensitivities",
    },
  ];

  return (
    <div className="card-soft p-4 bg-gradient-to-r from-primary/5 to-primary/10">
      <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-primary" />
        Nutrition Tips
      </h3>
      <div className="space-y-3">
        {tips.map((tip, idx) => (
          <div key={idx} className="flex items-start gap-3">
            <tip.icon className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-sm text-muted-foreground">{tip.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
