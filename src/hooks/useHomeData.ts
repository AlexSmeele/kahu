import { useMemo } from 'react';
import { useSkills } from './useSkills';

export const useHomeData = (dogId: string) => {
  const { dogSkills, loading } = useSkills(dogId);

  // Get next skill to practice
  const nextTrick = useMemo(() => {
    const learningSkills = dogSkills.filter(dt => dt.status === 'learning' || dt.status === 'practicing');
    return learningSkills.length > 0 ? learningSkills[0] : null;
  }, [dogSkills]);

  return {
    loading,
    nextTrick
  };
};
