import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';
import { toast } from 'sonner';

interface BreedRecommendation {
  id: string;
  breed_name: string;
  match_score: number;
  reasoning: string;
  considerations: string;
  rank: number;
  shortlisted: boolean;
  created_at: string;
}

export function useBreedRecommendations(profileId?: string) {
  const [recommendations, setRecommendations] = useState<BreedRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (profileId) {
      fetchRecommendations();
    }
  }, [profileId]);

  const fetchRecommendations = async () => {
    if (!profileId) return;

    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_breed_recommendations')
        .select('*')
        .eq('lifestyle_profile_id', profileId)
        .eq('user_id', user.id)
        .order('rank', { ascending: true });

      if (error) throw error;
      setRecommendations(data || []);
    } catch (error) {
      logger.error('Error fetching breed recommendations', error);
    } finally {
      setLoading(false);
    }
  };

  const generateRecommendations = async (profileId: string) => {
    try {
      setGenerating(true);
      
      const { data, error } = await supabase.functions.invoke('generate-breed-recommendations', {
        body: { profile_id: profileId }
      });

      if (error) {
        if (error.message?.includes('Rate limit')) {
          toast.error('Too many requests. Please try again in a moment.');
        } else if (error.message?.includes('Payment required')) {
          toast.error('AI service quota exceeded. Please contact support.');
        } else {
          toast.error('Failed to generate recommendations');
        }
        throw error;
      }

      toast.success('Breed recommendations generated!');
      await fetchRecommendations();
      return data.recommendations;
    } catch (error) {
      logger.error('Error generating recommendations', error);
      throw error;
    } finally {
      setGenerating(false);
    }
  };

  const toggleShortlist = async (recommendationId: string) => {
    try {
      const recommendation = recommendations.find(r => r.id === recommendationId);
      if (!recommendation) return;

      const { error } = await supabase
        .from('user_breed_recommendations')
        .update({ shortlisted: !recommendation.shortlisted })
        .eq('id', recommendationId);

      if (error) throw error;

      setRecommendations(prev =>
        prev.map(r =>
          r.id === recommendationId
            ? { ...r, shortlisted: !r.shortlisted }
            : r
        )
      );

      toast.success(
        recommendation.shortlisted
          ? 'Removed from shortlist'
          : 'Added to shortlist'
      );
    } catch (error) {
      logger.error('Error toggling shortlist', error);
      toast.error('Failed to update shortlist');
    }
  };

  return {
    recommendations,
    loading,
    generating,
    generateRecommendations,
    toggleShortlist,
    refetch: fetchRecommendations,
  };
}
