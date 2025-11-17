import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export default function ImportSkills() {
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<string>('');

  // Proper CSV parser that handles quoted fields with commas
  const parseCSV = (text: string) => {
    const lines: string[][] = [];
    let currentLine: string[] = [];
    let currentField = '';
    let insideQuotes = false;
    
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const nextChar = text[i + 1];
      
      if (char === '"') {
        if (insideQuotes && nextChar === '"') {
          // Escaped quote
          currentField += '"';
          i++; // Skip next quote
        } else {
          // Toggle quote state
          insideQuotes = !insideQuotes;
        }
      } else if (char === ',' && !insideQuotes) {
        // End of field
        currentLine.push(currentField);
        currentField = '';
      } else if ((char === '\n' || char === '\r') && !insideQuotes) {
        // End of line
        if (char === '\r' && nextChar === '\n') {
          i++; // Skip \n in \r\n
        }
        currentLine.push(currentField);
        if (currentLine.some(field => field.trim())) {
          lines.push(currentLine);
        }
        currentLine = [];
        currentField = '';
      } else {
        currentField += char;
      }
    }
    
    // Handle last field and line
    if (currentField || currentLine.length > 0) {
      currentLine.push(currentField);
      if (currentLine.some(field => field.trim())) {
        lines.push(currentLine);
      }
    }
    
    return lines;
  };

  const handleImport = async () => {
    setImporting(true);
    setResult('');
    
    try {
      // Fetch and parse CSV
      const response = await fetch('/supabase/functions/import-skills-data/skills_data.csv');
      const csvText = await response.text();
      
      // Parse CSV properly handling quoted fields
      const lines = parseCSV(csvText);
      const headers = lines[0].map(h => h.trim());
      const skills = lines.slice(1).map(line => {
        const skill: any = {};
        headers.forEach((header, i) => {
          skill[header] = line[i]?.trim() || '';
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
