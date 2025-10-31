import { Card } from '@/components/ui/card';
import { TrendingUp, Brain, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AnalyticsCard = () => {
  const navigate = useNavigate();

  return (
    <Card 
      className="p-4 cursor-pointer hover:shadow-lg transition-shadow bg-gradient-to-br from-primary/10 to-primary/5"
      onClick={() => navigate('/analytics')}
    >
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-sm">Insights</h3>
        </div>
        <Sparkles className="h-4 w-4 text-primary" />
      </div>
      <p className="text-xs text-muted-foreground mb-2">
        View analytics and recommendations
      </p>
      <div className="flex items-center gap-1.5 text-primary text-xs font-medium">
        <TrendingUp className="h-3.5 w-3.5" />
        <span>View →</span>
      </div>
    </Card>
  );
};
