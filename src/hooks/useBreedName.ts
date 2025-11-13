import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UseBreedNameReturn {
  breedName: string;
  loading: boolean;
}

export function useBreedName(breedId?: string, isCustom?: boolean): UseBreedNameReturn {
  const [breedName, setBreedName] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!breedId) {
      setBreedName('');
      return;
    }

    const fetchName = async () => {
      setLoading(true);
      
      try {
        if (isCustom) {
          const { data, error } = await supabase
            .from('custom_breeds')
            .select('name')
            .eq('id', breedId)
            .maybeSingle();
          
          if (error) throw error;
          if (data) setBreedName(data.name);
        } else {
          const { data, error } = await supabase
            .from('dog_breeds')
            .select('breed')
            .eq('id', breedId)
            .maybeSingle();
          
          if (error) throw error;
          if (data) setBreedName(data.breed);
        }
      } catch (error) {
        console.error('Error fetching breed name:', error);
        setBreedName(''); // Clear name on error
      } finally {
        setLoading(false);
      }
    };

    fetchName();
  }, [breedId, isCustom]);

  return { breedName, loading };
}
