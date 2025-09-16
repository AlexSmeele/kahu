import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

export async function seedDogBreedsIfNeeded() {
  try {
    const { count, error } = await supabase
      .from('dog_breeds')
      .select('*', { count: 'exact', head: true });

    if (error) {
      logger.error('SeedBreeds: Failed to check dog_breeds count', error);
      return;
    }

    if ((count ?? 0) === 0) {
      logger.info('SeedBreeds: No dog breeds found. Invoking seed-breed-encyclopedia');
      const { data, error: fnError } = await supabase.functions.invoke('seed-breed-encyclopedia');
      if (fnError) {
        logger.error('SeedBreeds: Edge function invocation failed', fnError);
      } else {
        logger.info('SeedBreeds: Dog breeds seeded successfully', data);
      }
    } else {
      logger.info('SeedBreeds: Dog breeds already present', { count });
    }
  } catch (e) {
    logger.error('SeedBreeds: Unexpected error', e);
  }
}
