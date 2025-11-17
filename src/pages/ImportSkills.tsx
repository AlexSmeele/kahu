import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export default function ImportSkills() {
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<string>('');

  // Map CSV column names to expected property names
  const normalizeColumnName = (header: string): string => {
    const normalized = header.trim().toLowerCase();
    
    // Special mappings
    const mappings: Record<string, string> = {
      'brief instructions step 1': 'brief_step_1',
      'brief instructions step 2': 'brief_step_2',
      'brief instructions step 3': 'brief_step_3',
      'detailed instructions step 1': 'detailed_step_1',
      'detailed instructions step 2': 'detailed_step_2',
      'detailed instructions step 3': 'detailed_step_3',
      'detailed instructions step 4': 'detailed_step_4',
      'detailed instructions step 5': 'detailed_step_5',
      'achievement level 1': 'achievement_level_1',
      'achievement level 2': 'achievement_level_2',
      'achievement level 3': 'achievement_level_3',
      'ideal stage level 1': 'ideal_stage_level_1',
      'ideal stage level 2': 'ideal_stage_level_2',
      'ideal stage level 3': 'ideal_stage_level_3',
      'estimated time': 'estimated_time',
      'ideal stage': 'ideal_stage',
      'short description': 'short_description',
      'long description': 'long_description',
      'general tips': 'general_tips',
      'preparation tips': 'preparation_tips',
      'training insights': 'training_insights',
      'pass criteria': 'pass_criteria',
      'fail criteria': 'fail_criteria',
      'mastery criteria': 'mastery_criteria',
    };
    
    return mappings[normalized] || normalized.replace(/\s+/g, '_');
  };

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
      const headers = lines[0].map(h => normalizeColumnName(h));
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
