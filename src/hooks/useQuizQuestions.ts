import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

interface QuizQuestion {
  id: string;
  quiz_id: string;
  question: string;
  options: any; // JSONB from database
  correct_index: number;
  explanation: string;
  tags: string[];
  order_index: number;
}

export function useQuizQuestions(quizId: string) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (quizId) {
      fetchQuestions();
    }
  }, [quizId]);

  const fetchQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('quiz_id', quizId)
        .order('order_index', { ascending: true });

      if (error) throw error;

      setQuestions(data || []);
    } catch (error) {
      logger.error('Error fetching quiz questions', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    questions,
    loading,
    refetch: fetchQuestions,
  };
}
