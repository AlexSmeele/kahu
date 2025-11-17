import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export default function ImportSkills() {
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<string>('');

  const handleImport = async () => {
    setImporting(true);
    setResult('');
    
    try {
      // Fetch and parse CSV
      const response = await fetch('/supabase/functions/import-skills-data/skills_data.csv');
      const csvText = await response.text();
      
      // Parse CSV to JSON
      const lines = csvText.split('\n');
      const headers = lines[0].split(',');
      const skills = lines.slice(1).filter(line => line.trim()).map(line => {
        const values = line.split(',');
        const skill: any = {};
        headers.forEach((header, i) => {
          skill[header.trim()] = values[i]?.trim() || '';
        });
        return skill;
      });

      // Call edge function
      const { data, error } = await supabase.functions.invoke('import-skills-data', {
        body: { skills }
      });

      if (error) throw error;

      setResult(`✅ Successfully imported ${data.count} skills!`);
      toast({
        title: 'Import Complete',
        description: `${data.count} skills imported successfully`,
      });
    } catch (error: any) {
      setResult(`❌ Error: ${error.message}`);
      toast({
        title: 'Import Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="p-8">
      <Card className="p-6 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Import Skills Data</h1>
        <p className="text-muted-foreground mb-6">
          This will delete all existing skills and import 97 new skills from the CSV file.
        </p>
        <Button onClick={handleImport} disabled={importing} size="lg">
          {importing ? 'Importing...' : 'Import 97 Skills from CSV'}
        </Button>
        {result && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <pre className="text-sm">{result}</pre>
          </div>
        )}
      </Card>
    </div>
  );
}
