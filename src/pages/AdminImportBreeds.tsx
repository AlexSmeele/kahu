import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function AdminImportBreeds() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleImport = async () => {
    setLoading(true);
    try {
      // Fetch the CSV files
      const breedsResponse = await fetch('/dog_breeds.csv');
      const healthResponse = await fetch('/dog_health_issues.csv');
      
      const breedsCSV = await breedsResponse.text();
      const healthIssuesCSV = await healthResponse.text();

      // Call the edge function
      const { data, error } = await supabase.functions.invoke('import-breed-health-data', {
        body: { breedsCSV, healthIssuesCSV }
      });

      if (error) throw error;

      toast({
        title: 'Import Complete',
        description: `Processed ${data.summary.breeds_processed} breeds and ${data.summary.health_issues_processed} health issues`,
      });
    } catch (error: any) {
      toast({
        title: 'Import Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Import Breed Data</h1>
      <Button onClick={handleImport} disabled={loading}>
        {loading ? 'Importing...' : 'Start Import'}
      </Button>
    </div>
  );
}
