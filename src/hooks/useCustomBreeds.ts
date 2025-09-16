import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { CustomBreed, BreedInfo, ResolvedBreedInfo } from './useBreedInfo';

export const useCustomBreeds = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['custom-breeds', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('custom_breeds')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (error) throw error;
      return data as CustomBreed[];
    },
    enabled: !!user?.id,
  });
};

export const useCreateCustomBreed = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (breedData: Omit<CustomBreed, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user?.id) throw new Error('User must be authenticated');

      const { data, error } = await supabase
        .from('custom_breeds')
        .insert({
          ...breedData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data as CustomBreed;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['custom-breeds'] });
      toast.success(`Custom breed "${data.name}" created successfully`);
    },
    onError: (error) => {
      toast.error(`Failed to create custom breed: ${error.message}`);
    },
  });
};

export const useUpdateCustomBreed = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CustomBreed> & { id: string }) => {
      const { data, error } = await supabase
        .from('custom_breeds')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as CustomBreed;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['custom-breeds'] });
      toast.success(`Custom breed "${data.name}" updated successfully`);
    },
    onError: (error) => {
      toast.error(`Failed to update custom breed: ${error.message}`);
    },
  });
};

export const useDeleteCustomBreed = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('custom_breeds')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-breeds'] });
      toast.success('Custom breed deleted successfully');
    },
    onError: (error) => {
      toast.error(`Failed to delete custom breed: ${error.message}`);
    },
  });
};

// Helper function to resolve breed information from either standard or custom breeds
export const useResolveBreedInfo = (breedId?: string, customBreedId?: string) => {
  return useQuery({
    queryKey: ['resolved-breed-info', breedId, customBreedId],
    queryFn: async (): Promise<ResolvedBreedInfo | null> => {
      if (!breedId && !customBreedId) return null;

      if (breedId) {
        // Fetch standard breed info
        const { data: breedData, error: breedError } = await supabase
          .from('dog_breeds')
          .select('*')
          .eq('id', breedId)
          .single();

        if (breedError) throw breedError;

        const breed = breedData as BreedInfo;
        return {
          id: breed.id,
          name: breed.breed,
          isCustom: false,
          origin: breed.origin,
          life_span_years: breed.life_span_years,
          weight_kg: {
            male: {
              adult_min: breed.male_weight_adult_kg_min,
              adult_max: breed.male_weight_adult_kg_max,
              m6_min: breed.male_weight_6m_kg_min,
              m6_max: breed.male_weight_6m_kg_max,
            },
            female: {
              adult_min: breed.female_weight_adult_kg_min,
              adult_max: breed.female_weight_adult_kg_max,
              m6_min: breed.female_weight_6m_kg_min,
              m6_max: breed.female_weight_6m_kg_max,
            },
          },
          temperament: breed.temperament,
          exercise_needs: breed.exercise_needs,
          trainability: breed.trainability,
          coat: breed.coat,
          grooming: breed.grooming,
          common_health_issues: breed.common_health_issues,
          recognized_by: breed.recognized_by,
          also_known_as: breed.also_known_as,
          fci_group: breed.fci_group,
          exercise_level: breed.exercise_level,
          grooming_needs: breed.grooming_needs,
        };
      }

      if (customBreedId) {
        // Fetch custom breed info with parent breeds
        const { data: customBreedData, error: customBreedError } = await supabase
          .from('custom_breeds')
          .select('*')
          .eq('id', customBreedId)
          .single();

        if (customBreedError) throw customBreedError;

        const customBreed = customBreedData as CustomBreed;
        
        // Fetch parent breeds if they exist
        const parentBreeds: Array<{ breed: BreedInfo; percentage: number }> = [];
        
        if (customBreed.parent_breed_1_id) {
          const { data: parent1 } = await supabase
            .from('dog_breeds')
            .select('*')
            .eq('id', customBreed.parent_breed_1_id)
            .single();
          if (parent1) {
            parentBreeds.push({
              breed: parent1 as BreedInfo,
              percentage: customBreed.parent_breed_1_percentage || 100,
            });
          }
        }

        if (customBreed.parent_breed_2_id) {
          const { data: parent2 } = await supabase
            .from('dog_breeds')
            .select('*')
            .eq('id', customBreed.parent_breed_2_id)
            .single();
          if (parent2) {
            parentBreeds.push({
              breed: parent2 as BreedInfo,
              percentage: customBreed.parent_breed_2_percentage || 0,
            });
          }
        }

        if (customBreed.parent_breed_3_id) {
          const { data: parent3 } = await supabase
            .from('dog_breeds')
            .select('*')
            .eq('id', customBreed.parent_breed_3_id)
            .single();
          if (parent3) {
            parentBreeds.push({
              breed: parent3 as BreedInfo,
              percentage: customBreed.parent_breed_3_percentage || 0,
            });
          }
        }

        // Calculate weighted averages from parent breeds
        const resolvedInfo: ResolvedBreedInfo = {
          id: customBreed.id,
          name: customBreed.name,
          isCustom: true,
          parentBreeds,
        };

        if (parentBreeds.length > 0) {
          // Calculate weighted averages for numerical values
          const weightedAverage = (getValue: (breed: BreedInfo) => number | null) => {
            const values = parentBreeds
              .map(p => ({ value: getValue(p.breed), percentage: p.percentage }))
              .filter(v => v.value !== null);
            
            if (values.length === 0) return null;
            
            const total = values.reduce((sum, v) => sum + (v.value! * v.percentage / 100), 0);
            return Math.round(total * 100) / 100; // Round to 2 decimal places
          };

          // Apply overrides or calculate from parents
          resolvedInfo.weight_kg = {
            male: {
              adult_min: customBreed.weight_male_adult_min_override || weightedAverage(b => b.male_weight_adult_kg_min),
              adult_max: customBreed.weight_male_adult_max_override || weightedAverage(b => b.male_weight_adult_kg_max),
              m6_min: weightedAverage(b => b.male_weight_6m_kg_min),
              m6_max: weightedAverage(b => b.male_weight_6m_kg_max),
            },
            female: {
              adult_min: customBreed.weight_female_adult_min_override || weightedAverage(b => b.female_weight_adult_kg_min),
              adult_max: customBreed.weight_female_adult_max_override || weightedAverage(b => b.female_weight_adult_kg_max),
              m6_min: weightedAverage(b => b.female_weight_6m_kg_min),
              m6_max: weightedAverage(b => b.female_weight_6m_kg_max),
            },
          };

          // For text fields, use overrides or combine parent characteristics
          resolvedInfo.exercise_needs = customBreed.exercise_needs_override || 
            parentBreeds.map(p => p.breed.exercise_needs).filter(Boolean).join(' / ') || null;
          
          resolvedInfo.temperament = customBreed.temperament_override ||
            parentBreeds.map(p => p.breed.temperament).filter(Boolean).join(', ') || null;
          
          resolvedInfo.grooming_needs = customBreed.grooming_needs_override ||
            parentBreeds.map(p => p.breed.grooming_needs).filter(Boolean).join(' / ') || null;
        }

        return resolvedInfo;
      }

      return null;
    },
    enabled: !!(breedId || customBreedId),
  });
};