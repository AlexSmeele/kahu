import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Core skill UUIDs that must be maintained for roadmap compatibility
const CORE_SKILL_IDS: Record<string, string> = {
  'Sit': 'bbc0357d-2d9e-4ae1-8ac8-e9af77a82852',
  'Down': 'fffa5ef5-83e6-4839-92e1-e1badbd88887',
  'Stay': 'd3fff6a0-871d-40eb-91ae-dd4e2cc6780b',
  'Come': '25cafc44-6396-4c3a-b6de-d203656eac71',
  'Leave It': '46950108-abb8-48e4-86c4-fd0367e514eb',
  'Heel': '8fe6f9b0-25d8-4f1c-9e85-f4f3d6b5c9a7',
};

interface SkillData {
  name: string;
  category: string;
  difficulty: string;
  estimated_time: string;
  ideal_stage: string;
  short_description: string;
  long_description: string;
  brief_step_1: string;
  brief_step_2: string;
  brief_step_3: string;
  detailed_step_1: string;
  detailed_step_2: string;
  detailed_step_3: string;
  detailed_step_4: string;
  detailed_step_5: string;
  general_tips: string;
  troubleshooting: string;
  prerequisites: string;
  progressions: string;
  preparation_tips: string;
  training_insights: string;
  achievement_level_1: string;
  achievement_level_2: string;
  achievement_level_3: string;
  ideal_stage_level_1: string;
  ideal_stage_level_2: string;
  ideal_stage_level_3: string;
  pass_criteria: string;
  fail_criteria: string;
  mastery_criteria: string;
}

function mapDifficultyToLevel(difficulty: string): number {
  const normalizedDifficulty = difficulty.trim().toLowerCase();
  if (normalizedDifficulty === 'beginner') return 1;
  if (normalizedDifficulty === 'intermediate') return 3;
  if (normalizedDifficulty === 'advanced') return 5;
  return 2; // Default to beginner-intermediate
}

function parseEstimatedTime(timeStr: string): number {
  // Parse strings like "1-2 weeks" or "2 weeks"
  const match = timeStr.match(/(\d+)(?:-(\d+))?\s*week/i);
  if (match) {
    const min = parseInt(match[1]);
    const max = match[2] ? parseInt(match[2]) : min;
    return Math.ceil((min + max) / 2);
  }
  return 2; // Default 2 weeks
}

function parseWeekNumber(stageStr: string): number | null {
  // Parse strings like "Week 4" or "Level 1 by Week 4"
  const match = stageStr.match(/Week\s+(\d+)/i);
  return match ? parseInt(match[1]) : null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { skills } = await req.json() as { skills: SkillData[] };

    console.log(`Importing ${skills.length} skills...`);

    // Clear existing skills
    const { error: deleteError } = await supabaseClient
      .from('skills')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (deleteError) {
      throw new Error(`Failed to clear existing skills: ${deleteError.message}`);
    }

    // Transform and insert skills
    const transformedSkills = skills.map(skill => {
      // Use predefined UUID for core skills, generate new ones for others
      const skillId = CORE_SKILL_IDS[skill.name] || crypto.randomUUID();

      // Parse prerequisites (comma-separated names)
      const prerequisitesList = skill.prerequisites 
        ? skill.prerequisites.split(',').map(p => p.trim()).filter(Boolean)
        : [];

      return {
        id: skillId,
        name: skill.name,
        category: skill.category,
        difficulty_level: mapDifficultyToLevel(skill.difficulty),
        estimated_time_weeks: parseEstimatedTime(skill.estimated_time),
        short_description: skill.short_description,
        long_description: skill.long_description,
        brief_instructions: [
          skill.brief_step_1,
          skill.brief_step_2,
          skill.brief_step_3
        ].filter(Boolean),
        detailed_instructions: [
          skill.detailed_step_1,
          skill.detailed_step_2,
          skill.detailed_step_3,
          skill.detailed_step_4,
          skill.detailed_step_5
        ].filter(Boolean),
        general_tips: skill.general_tips,
        troubleshooting: skill.troubleshooting,
        prerequisites: prerequisitesList,
        progressions: skill.progressions,
        preparation_tips: skill.preparation_tips,
        training_insights: skill.training_insights,
        achievement_levels: {
          level1: skill.achievement_level_1,
          level2: skill.achievement_level_2,
          level3: skill.achievement_level_3
        },
        ideal_stage_weeks: {
          level1: parseWeekNumber(skill.ideal_stage_level_1),
          level2: parseWeekNumber(skill.ideal_stage_level_2),
          level3: parseWeekNumber(skill.ideal_stage_level_3)
        },
        pass_criteria: skill.pass_criteria,
        fail_criteria: skill.fail_criteria,
        mastery_criteria: skill.mastery_criteria,
        priority_order: 0, // Will be updated later if needed
        min_age_weeks: null,
        skill_type: 'trick',
        recommended_practice_frequency_days: 1
      };
    });

    const { data, error } = await supabaseClient
      .from('skills')
      .insert(transformedSkills)
      .select();

    if (error) {
      throw new Error(`Failed to insert skills: ${error.message}`);
    }

    console.log(`Successfully imported ${data.length} skills`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        count: data.length,
        message: `Successfully imported ${data.length} skills`
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error importing skills:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})