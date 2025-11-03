import { GraduationCap, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface PrePurchaseGuideBannerProps {
  className?: string;
}

export function PrePurchaseGuideBanner({ className = "" }: PrePurchaseGuideBannerProps) {
  const navigate = useNavigate();

  return (
    <div
      className={`rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border-2 border-primary/20 p-6 text-left w-full ${className}`}
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
          <GraduationCap className="w-6 h-6 text-primary" />
        </div>
        
        <div className="flex-1">
          <h3 className="font-bold text-lg mb-2">Thinking of getting a dog?</h3>
          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
            Take our comprehensive guide to learn everything you need to know before bringing a dog home. 
            Get personalized recommendations and earn your certification.
          </p>
          
          <Button 
            onClick={() => navigate('/guide/intro')}
            className="w-full sm:w-auto"
            size="sm"
          >
            Start Guide
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
