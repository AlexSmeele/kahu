import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface BreedInfo {
  id: string;
  breed: string;
  origin: string | null;
  life_span_years: string | null;
  // Updated to match the new column structure
  male_weight_adult_kg_min: number | null;
  male_weight_adult_kg_max: number | null;
  male_weight_6m_kg_min: number | null;
  male_weight_6m_kg_max: number | null;
  female_weight_adult_kg_min: number | null;
  female_weight_adult_kg_max: number | null;
  female_weight_6m_kg_min: number | null;  
  female_weight_6m_kg_max: number | null;
  temperament: string | null;
  exercise_needs: string | null;
  trainability: string | null;
  coat: string | null;
  grooming: string | null;
  common_health_issues: string | null;
  recognized_by: string | null;
  also_known_as: string | null;
  fci_group: number | null;
  exercise_level: string | null;
  grooming_needs: string | null;
  enrichment_confidence: string | null;
  weights_confidence: string | null;
  health_notes_confidence: string | null;
  recommended_screenings: string | null;
  health_watchlist_tags: string | null;
  health_prevalence_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CustomBreed {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  notes: string | null;
  parent_breed_1_id: string | null;
  parent_breed_1_percentage: number | null;
  parent_breed_2_id: string | null;
  parent_breed_2_percentage: number | null;
  parent_breed_3_id: string | null;
  parent_breed_3_percentage: number | null;
  exercise_needs_override: string | null;
  weight_male_adult_min_override: number | null;
  weight_male_adult_max_override: number | null;
  weight_female_adult_min_override: number | null;
  weight_female_adult_max_override: number | null;
  temperament_override: string | null;
  grooming_needs_override: string | null;
  health_notes_override: string | null;
  created_at: string;
  updated_at: string;
}

// Unified interface for resolved breed information
export interface ResolvedBreedInfo {
  id: string;
  name: string;
  isCustom: boolean;
  origin?: string | null;
  life_span_years?: string | null;
  weight_kg?: {
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
  };
  temperament?: string | null;
  exercise_needs?: string | null;
  trainability?: string | null;
  coat?: string | null;
  grooming?: string | null;
  common_health_issues?: string | null;
  recognized_by?: string | null;
  also_known_as?: string | null;
  fci_group?: number | null;
  exercise_level?: string | null;
  grooming_needs?: string | null;
  parentBreeds?: Array<{
    breed: BreedInfo;
    percentage: number;
  }>;
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
  breedInfo?: ResolvedBreedInfo | null
): 'underweight' | 'normal' | 'overweight' | 'unknown' => {
  if (!breedInfo?.weight_kg || !currentWeight) return 'unknown';
  
  const weightRange = breedInfo.weight_kg[gender];
  if (!weightRange?.adult_min || !weightRange?.adult_max) return 'unknown';

  if (currentWeight < weightRange.adult_min) return 'underweight';
  if (currentWeight > weightRange.adult_max) return 'overweight';
  return 'normal';
};

// Helper function to get exercise recommendations based on breed
export const getExerciseRecommendation = (breedInfo?: ResolvedBreedInfo | null): string => {
  if (!breedInfo?.exercise_needs) {
    return "Consult your veterinarian for exercise recommendations specific to your dog's breed and health.";
  }
  
  return `Based on breed characteristics: ${breedInfo.exercise_needs}. Always adjust based on your individual dog's age, health, and fitness level.`;
};