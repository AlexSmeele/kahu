import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useAIInsights, AnalysisType } from '@/hooks/useAIInsights';
import { Brain, Activity, Apple, Heart, Sparkles, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface AIInsightsCardProps {
  dogId: string;
  dogName: string;
}

export const AIInsightsCard = ({ dogId, dogName }: AIInsightsCardProps) => {
  const { insights, loading, getInsights } = useAIInsights();
  const [activeTab, setActiveTab] = useState<AnalysisType>('nutrition');

  const handleAnalyze = async (type: AnalysisType) => {
    setActiveTab(type);
    await getInsights(dogId, type);
  };

  const getTabIcon = (type: AnalysisType) => {
    switch (type) {
      case 'nutrition':
        return <Apple className="h-4 w-4" />;
      case 'activity':
        return <Activity className="h-4 w-4" />;
      case 'health':
        return <Heart className="h-4 w-4" />;
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">AI-Powered Insights</h3>
        <Sparkles className="h-4 w-4 text-primary ml-auto" />
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as AnalysisType)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="nutrition" className="flex items-center gap-2">
            {getTabIcon('nutrition')}
            Nutrition
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            {getTabIcon('activity')}
            Activity
          </TabsTrigger>
          <TabsTrigger value="health" className="flex items-center gap-2">
            {getTabIcon('health')}
            Health
          </TabsTrigger>
        </TabsList>

        {(['nutrition', 'activity', 'health'] as AnalysisType[]).map((type) => (
          <TabsContent key={type} value={type} className="space-y-4">
            {!insights || activeTab !== type ? (
              <div className="text-center py-8">
                <div className={`mx-auto w-16 h-16 rounded-full bg-${type === 'nutrition' ? 'orange' : type === 'activity' ? 'blue' : 'red'}-100 flex items-center justify-center mb-4`}>
                  {getTabIcon(type)}
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Get AI-powered {type} insights for {dogName}
                </p>
                <Button onClick={() => handleAnalyze(type)} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Analyze {type.charAt(0).toUpperCase() + type.slice(1)}
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown>{insights}</ReactMarkdown>
                </div>
                <Button onClick={() => handleAnalyze(type)} variant="outline" size="sm" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Refreshing...
                    </>
                  ) : (
                    'Refresh Analysis'
                  )}
                </Button>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </Card>
  );
};
