import { useMemo } from 'react';
import { useTricks } from './useTricks';

export const useHomeData = (dogId: string) => {
  const { dogTricks, loading } = useTricks(dogId);

  // Get next trick to practice
  const nextTrick = useMemo(() => {
    const learningTricks = dogTricks.filter(dt => dt.status === 'learning' || dt.status === 'practicing');
    return learningTricks.length > 0 ? learningTricks[0] : null;
  }, [dogTricks]);

  return {
    loading,
    nextTrick
  };
};
