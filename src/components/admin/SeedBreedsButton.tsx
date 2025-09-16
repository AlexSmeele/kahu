import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const SeedBreedsButton = () => {
  const [isSeeding, setIsSeeding] = useState(false);

  const handleSeedBreeds = async () => {
    setIsSeeding(true);
    try {
      const { data, error } = await supabase.functions.invoke('seed-breed-encyclopedia');
      
      if (error) {
        console.error('Error seeding breeds:', error);
        toast.error('Failed to seed breed data');
        return;
      }

      console.log('Seed result:', data);
      toast.success(`Successfully seeded ${data.final_count} dog breeds`);
    } catch (error) {
      console.error('Error calling seed function:', error);
      toast.error('Failed to seed breed data');
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <Button 
      onClick={handleSeedBreeds} 
      disabled={isSeeding}
      className="mb-4"
    >
      {isSeeding ? 'Seeding Breeds...' : 'Seed Dog Breeds Database'}
    </Button>
  );
};