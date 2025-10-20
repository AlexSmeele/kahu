import { Card } from "@/components/ui/card";
import { MessageCircle } from "lucide-react";

interface GetAdviceCardProps {
  onClick: () => void;
}

export const GetAdviceCard = ({ onClick }: GetAdviceCardProps) => {
  return (
    <Card 
      className="p-4 cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <MessageCircle className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-base mb-1">Get Advice</h3>
          <p className="text-sm text-muted-foreground">
            Ask our AI trainer anything about your dog's training, behavior, or health
          </p>
        </div>
      </div>
    </Card>
  );
};
