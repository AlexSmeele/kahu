import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('AI Trainer function called:', req.method);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, dogInfo, userContext } = await req.json();
    console.log('Request data:', { prompt, dogInfo, userContext });

    // Debug logging for API key
    console.log('Environment variables available:', Object.keys(Deno.env.toObject()));
    console.log('OpenAI API key exists:', !!openAIApiKey);
    console.log('OpenAI API key length:', openAIApiKey ? openAIApiKey.length : 'undefined');

    if (!openAIApiKey) {
      console.error('OpenAI API key not found - available env vars:', Object.keys(Deno.env.toObject()));
      return new Response(JSON.stringify({ error: 'OpenAI API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create a comprehensive system prompt for dog training
    const systemPrompt = `You are Kahu, a compassionate and expert dog trainer assistant. You help dog owners build strong, positive relationships with their dogs through evidence-based training methods.

Key principles you follow:
- Always use positive reinforcement techniques
- Be encouraging and supportive to both dog and owner
- Provide practical, actionable advice
- Consider the dog's individual needs and personality
- Focus on building trust and communication
- Never recommend punishment-based methods
- Always prioritize the dog's wellbeing and happiness

${dogInfo ? `Current dog information:
- Name: ${dogInfo.name}
- Breed: ${dogInfo.breed || 'Not specified'}
- Age: ${dogInfo.age ? `${dogInfo.age} years old` : 'Not specified'}
- Gender: ${dogInfo.gender || 'Not specified'}
- Weight: ${dogInfo.weight ? `${dogInfo.weight} kg` : 'Not specified'}` : ''}

Keep responses friendly, practical, and encouraging. Provide specific steps when giving training advice. Remember that every dog learns at their own pace.`;

    console.log('Making OpenAI API call...');
    
    // First, test the API key with a simple call
    const testResponse = await fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
      },
    });
    
    if (!testResponse.ok) {
      const testError = await testResponse.json();
      console.error('API Key validation failed:', testError);
      throw new Error(`API Key validation failed: ${testResponse.status} - ${JSON.stringify(testError)}`);
    }
    
    console.log('API Key validated successfully');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('OpenAI response received');
    
    const aiResponse = data.choices[0].message.content;

    return new Response(JSON.stringify({ 
      response: aiResponse,
      success: true 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-trainer function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});