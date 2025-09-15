import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface BreedInfo {
  id: string;
  breed: string;
  origin: string | null;
  life_span_years: string | null;
  temperament: string[] | null;
  exercise_needs: string | null;
  trainability: string | null;
  coat: string | null;
  grooming: string | null;
  common_health_issues: string[] | null;
  registries: string[] | null;
  weight_kg: {
    male: {
      adult_min: number | null;
      adult_max: number | null;
      m6_min: number | null;
      m6_max: number | null;
    };
    female: {
      adult_min: number | null;
      adult_max: number | null;
      m6_min: number | null;
      m6_max: number | null;
    };
  } | null;
  created_at: string;
  updated_at: string;
}

export const useBreedInfo = (breedName?: string) => {
  return useQuery({
    queryKey: ['breed-info', breedName],
    queryFn: async () => {
      if (!breedName) return null;
      
      const { data, error } = await supabase
        .from('dog_breeds')
        .select('*')
        .ilike('breed', breedName)
        .maybeSingle();

      if (error) throw error;
      return data as BreedInfo | null;
    },
    enabled: !!breedName,
  });
};

export const useAllBreeds = () => {
  return useQuery({
    queryKey: ['all-breeds'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dog_breeds')
        .select('breed')
        .order('breed');

      if (error) throw error;
      return data.map(item => item.breed);
    },
  });
};

// Helper function to check if a dog's weight is within breed standards
export const getWeightStatus = (
  currentWeight: number,
  gender: 'male' | 'female',
  breedInfo?: BreedInfo | null
): 'underweight' | 'normal' | 'overweight' | 'unknown' => {
  if (!breedInfo?.weight_kg || !currentWeight) return 'unknown';
  
  const weightRange = breedInfo.weight_kg[gender];
  if (!weightRange?.adult_min || !weightRange?.adult_max) return 'unknown';

  if (currentWeight < weightRange.adult_min) return 'underweight';
  if (currentWeight > weightRange.adult_max) return 'overweight';
  return 'normal';
};

// Helper function to get exercise recommendations based on breed
export const getExerciseRecommendation = (breedInfo?: BreedInfo | null): string => {
  if (!breedInfo?.exercise_needs) {
    return "Consult your veterinarian for exercise recommendations specific to your dog's breed and health.";
  }
  
  return `Based on breed characteristics: ${breedInfo.exercise_needs}. Always adjust based on your individual dog's age, health, and fitness level.`;
};