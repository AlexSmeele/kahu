import { Card } from '@/components/ui/card';
import { TrendingUp, Brain, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AnalyticsCardProps {
  className?: string;
}

export const AnalyticsCard = ({ className = "" }: AnalyticsCardProps) => {
  const navigate = useNavigate();

  return (
    <Card 
      className={`p-4 cursor-pointer hover:bg-accent transition-all hover:scale-[1.02] border rounded-2xl ${className}`}
      onClick={() => navigate('/analytics')}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Brain className="w-4 h-4 text-primary" />
        </div>
        <h3 className="font-semibold text-base text-foreground">Insights</h3>
      </div>
      
      <div className="flex flex-col justify-center min-h-[88px] my-3">
        <p className="text-sm text-muted-foreground mb-3">
          View analytics and recommendations
        </p>
        
        <p className="text-xs text-muted-foreground">
          View →
        </p>
      </div>
    </Card>
  );
};
