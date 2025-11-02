import { Lightbulb } from "lucide-react";

interface CareTipsCardProps {
  className?: string;
}

const careTips = [
  "Keep fresh water available at all times",
  "Regular grooming helps detect health issues early",
  "Exercise both body and mind daily",
  "Brush teeth 2-3 times per week",
  "Check paws regularly for cuts or debris",
  "Maintain a consistent daily routine",
  "Socialize your dog with people and pets",
  "Keep vaccinations and preventive care up to date",
];

export function CareTipsCard({ className = "" }: CareTipsCardProps) {
  // Rotate tip based on day of year
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const tipOfTheDay = careTips[dayOfYear % careTips.length];
  
  return (
    <div
      className={`rounded-2xl border bg-card p-4 text-left w-full ${className}`}
    >
      <div className="flex flex-col justify-between h-full">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Lightbulb className="w-4 h-4 text-primary" />
          </div>
          <h3 className="font-semibold text-base">Care Tips</h3>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col justify-center my-4">
          <p className="text-xs text-muted-foreground mb-2">Tip of the Day</p>
          <p className="text-sm text-foreground leading-relaxed">
            {tipOfTheDay}
          </p>
        </div>
      </div>
    </div>
  );
}
