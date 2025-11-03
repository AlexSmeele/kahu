import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { profile_id } = await req.json();

    // Fetch the lifestyle profile
    const { data: profile, error: profileError } = await supabase
      .from('lifestyle_profiles')
      .select('*')
      .eq('id', profile_id)
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile) {
      throw new Error('Profile not found');
    }

    // Fetch breed data from encyclopedia
    const { data: breeds, error: breedsError } = await supabase
      .from('breed_encyclopedia')
      .select('*');

    if (breedsError) {
      throw new Error('Failed to fetch breeds');
    }

    // Use Lovable AI to generate personalized recommendations
    const prompt = `You are a dog breed expert. Based on the following lifestyle profile, recommend the top 5 most suitable dog breeds with detailed reasoning.

Lifestyle Profile:
- Household: ${profile.household_adults} adults, ${profile.household_children} children, ${profile.household_seniors} seniors
- Home Type: ${profile.home_type}
- Outdoor Space: ${profile.outdoor_space}
- Weekday Hours Away: ${profile.weekday_hours_away}
- Weekend Hours Away: ${profile.weekend_hours_away}
- Activity Level: ${profile.activity_level}
- Travel Frequency: ${profile.travel_frequency}
- Dog Ownership Experience: ${profile.experience}
- Has Allergies: ${profile.allergies}
- Monthly Budget: $${profile.budget_monthly_nzd} NZD
- Preferences: Size - ${profile.preferences.size}, Shedding - ${profile.preferences.shedding}, Age - ${profile.preferences.age}
- Target Timeline: ${profile.target_timeline_months} months

Available breeds (sample): ${breeds.slice(0, 50).map(b => b.breed_name).join(', ')}

For each of your top 5 recommendations, provide:
1. Breed name (must match one from the available breeds)
2. Match score (0-100)
3. Detailed reasoning (2-3 sentences explaining why this breed fits their lifestyle)
4. Key considerations (any potential challenges or requirements)

Return ONLY a JSON array with this exact structure:
[
  {
    "breed_name": "string",
    "match_score": number,
    "reasoning": "string",
    "considerations": "string"
  }
]`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are a dog breed recommendation expert. Always return valid JSON arrays.' },
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: 'Payment required' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error('AI request failed');
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices[0].message.content;
    
    // Parse AI response
    let recommendations;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/\[[\s\S]*\]/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
      recommendations = JSON.parse(jsonStr);
    } catch (e) {
      console.error('Failed to parse AI response:', content);
      throw new Error('Invalid AI response format');
    }

    // Store recommendations in database
    const recommendationsToInsert = recommendations.map((rec: any, index: number) => ({
      user_id: user.id,
      lifestyle_profile_id: profile_id,
      breed_name: rec.breed_name,
      match_score: rec.match_score,
      reasoning: rec.reasoning,
      considerations: rec.considerations,
      rank: index + 1,
    }));

    const { error: insertError } = await supabase
      .from('user_breed_recommendations')
      .insert(recommendationsToInsert);

    if (insertError) {
      console.error('Insert error:', insertError);
      throw new Error('Failed to save recommendations');
    }

    return new Response(JSON.stringify({ 
      success: true, 
      recommendations: recommendationsToInsert 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
