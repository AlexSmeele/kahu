import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type AnalysisType = 'nutrition' | 'activity' | 'health';

export const useAIInsights = () => {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<string | null>(null);
  const { toast } = useToast();

  const getInsights = async (dogId: string, analysisType: AnalysisType) => {
    setLoading(true);
    setInsights(null);

    try {
      const { data, error } = await supabase.functions.invoke('ai-health-insights', {
        body: { dogId, analysisType },
      });

      if (error) throw error;

      setInsights(data.insights);
      return data.insights;
    } catch (error: any) {
      console.error('Error getting AI insights:', error);
      
      if (error.message?.includes('429')) {
        toast({
          title: 'Rate Limit Reached',
          description: 'Too many requests. Please try again in a moment.',
          variant: 'destructive',
        });
      } else if (error.message?.includes('402')) {
        toast({
          title: 'AI Credits Exhausted',
          description: 'Please add credits to your workspace to continue using AI features.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to generate insights. Please try again.',
          variant: 'destructive',
        });
      }
      
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    insights,
    loading,
    getInsights,
  };
};
