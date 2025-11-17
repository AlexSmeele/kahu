import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

function parseEstimatedMinutes(timeStr: string): number {
  // Parse "5–10 minutes" or "10-15 minutes" format
  const match = timeStr.match(/(\d+)[-–]?(\d+)?/);
  if (!match) return 10; // default
  
  const min = parseInt(match[1]);
  const max = match[2] ? parseInt(match[2]) : min;
  
  return Math.round((min + max) / 2);
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { modules } = await req.json() as { modules: FoundationModuleData[] };

    if (!modules || !Array.isArray(modules)) {
      throw new Error('Invalid request body: expected { modules: FoundationModuleData[] }');
    }

    console.log(`Importing ${modules.length} foundation modules...`);

    // Clear existing foundation modules
    const { error: deleteError } = await supabase
      .from('foundation_modules')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (deleteError) {
      console.error('Error clearing existing modules:', deleteError);
      throw deleteError;
    }

    // Transform and insert modules
    const transformedModules = modules.map((module, index) => ({
      category: module.categoryTitle,
      title: module.moduleTitle,
      format: module.format,
      estimated_minutes: parseEstimatedMinutes(module.estimatedTime),
      ideal_stage: module.idealStage,
      brief_description: module.briefDescription,
      detailed_description: module.detailedDescription,
      brief_steps: [
        module.briefStep1,
        module.briefStep2,
        module.briefStep3,
        module.briefStep4,
        module.briefStep5,
      ],
      detailed_steps: [
        module.detailedStep1,
        module.detailedStep2,
        module.detailedStep3,
        module.detailedStep4,
        module.detailedStep5,
      ],
      order_index: index,
      is_published: true,
    }));

    const { data, error: insertError } = await supabase
      .from('foundation_modules')
      .insert(transformedModules)
      .select();

    if (insertError) {
      console.error('Error inserting modules:', insertError);
      throw insertError;
    }

    console.log(`Successfully imported ${data?.length || 0} foundation modules`);

    return new Response(
      JSON.stringify({
        success: true,
        imported: data?.length || 0,
        modules: data,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in import-foundation-modules function:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});