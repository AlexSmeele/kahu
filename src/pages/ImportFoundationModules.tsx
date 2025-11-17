import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ArrowLeft, Upload, CheckCircle2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FoundationModuleData {
  categoryTitle: string;
  moduleTitle: string;
  format: string;
  estimatedTime: string;
  idealStage: string;
  briefDescription: string;
  detailedDescription: string;
  briefStep1: string;
  briefStep2: string;
  briefStep3: string;
  briefStep4: string;
  briefStep5: string;
  detailedStep1: string;
  detailedStep2: string;
  detailedStep3: string;
  detailedStep4: string;
  detailedStep5: string;
}

export default function ImportFoundationModules() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importedCount, setImportedCount] = useState(0);

  const normalizeColumnName = (header: string): keyof FoundationModuleData | null => {
    const normalized = header.trim().toLowerCase();
    const mapping: Record<string, keyof FoundationModuleData> = {
      'category title': 'categoryTitle',
      'module title': 'moduleTitle',
      'format': 'format',
      'estimated time': 'estimatedTime',
      'ideal stage': 'idealStage',
      'brief description': 'briefDescription',
      'detailed description': 'detailedDescription',
      'brief step 1': 'briefStep1',
      'brief step 2': 'briefStep2',
      'brief step 3': 'briefStep3',
      'brief step 4': 'briefStep4',
      'brief step 5': 'briefStep5',
      'detailed step 1': 'detailedStep1',
      'detailed step 2': 'detailedStep2',
      'detailed step 3': 'detailedStep3',
      'detailed step 4': 'detailedStep4',
      'detailed step 5': 'detailedStep5',
    };
    return mapping[normalized] || null;
  };

  const parseCSV = (text: string): FoundationModuleData[] => {
    const lines = text.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    
    const normalizedHeaders = headers.map(normalizeColumnName);
    
    const modules: FoundationModuleData[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const values: string[] = [];
      let current = '';
      let inQuotes = false;
      
      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim().replace(/^"|"$/g, ''));
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim().replace(/^"|"$/g, ''));
      
      const module: any = {};
      normalizedHeaders.forEach((header, index) => {
        if (header && values[index] !== undefined) {
          module[header] = values[index];
        }
      });
      
      if (module.categoryTitle && module.moduleTitle) {
        modules.push(module as FoundationModuleData);
      }
    }
    
    return modules;
  };

  const handleImport = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/foundation_modules.csv');
      const text = await response.text();
      
      const modules = parseCSV(text);
      
      if (modules.length === 0) {
        throw new Error('No valid module data found in CSV');
      }

      console.log(`Parsed ${modules.length} foundation modules from CSV`);

      const { data, error: importError } = await supabase.functions.invoke(
        'import-foundation-modules',
        {
          body: { modules }
        }
      );

      if (importError) throw importError;

      console.log('Import response:', data);
      
      setImportedCount(data.imported || 0);
      setSuccess(true);
      toast.success(`Successfully imported ${data.imported} foundation modules!`);
      
    } catch (err: any) {
      console.error('Import error:', err);
      setError(err.message || 'Failed to import foundation modules');
      toast.error('Import failed: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Import Foundation Modules</h1>
            <p className="text-sm text-muted-foreground">
              Import training foundation modules from CSV
            </p>
          </div>
        </div>

        <Card className="p-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-foreground">Import Status</h2>
              <p className="text-sm text-muted-foreground">
                This will import foundation modules from <code className="bg-muted px-2 py-1 rounded">public/foundation_modules.csv</code>
              </p>
            </div>

            {error && (
              <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-destructive">Import Failed</p>
                  <p className="text-sm text-destructive/80 mt-1">{error}</p>
                </div>
              </div>
            )}

            {success && (
              <div className="flex items-start gap-3 p-4 bg-success/10 border border-success/20 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-success mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-success">Import Successful!</p>
                  <p className="text-sm text-success/80 mt-1">
                    Successfully imported {importedCount} foundation modules
                  </p>
                </div>
              </div>
            )}

            <Button
              onClick={handleImport}
              disabled={loading}
              className="w-full"
              size="lg"
            >
              <Upload className="h-5 w-5 mr-2" />
              {loading ? 'Importing...' : 'Import Foundation Modules'}
            </Button>

            <div className="text-xs text-muted-foreground space-y-1">
              <p><strong>Note:</strong> This will:</p>
              <ul className="list-disc list-inside ml-2 space-y-1">
                <li>Delete all existing foundation modules</li>
                <li>Import new modules from the CSV file</li>
                <li>Set all modules as published</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
