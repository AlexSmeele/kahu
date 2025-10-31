import { Card } from '@/components/ui/card';
import { TrendingUp, Brain, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AnalyticsCard = () => {
  const navigate = useNavigate();

  return (
    <Card 
      className="p-6 cursor-pointer hover:shadow-lg transition-shadow bg-gradient-to-br from-primary/10 to-primary/5"
      onClick={() => navigate('/analytics')}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">AI Insights</h3>
        </div>
        <Sparkles className="h-4 w-4 text-primary" />
      </div>
      <p className="text-sm text-muted-foreground mb-3">
        Get intelligent recommendations and analytics
      </p>
      <div className="flex items-center gap-2 text-primary text-sm font-medium">
        <TrendingUp className="h-4 w-4" />
        <span>View Analytics →</span>
      </div>
    </Card>
  );
};
