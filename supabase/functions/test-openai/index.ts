import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('Test OpenAI function called:', req.method);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get ALL environment variables
    const allEnvVars = Deno.env.toObject();
    console.log('All environment variables:', Object.keys(allEnvVars));
    
    // Try multiple possible API key names
    let openAIApiKey = null;
    const possibleKeyNames = ['OPENAI_API_KEY', 'OpenAI API Key', 'OPENAI_KEY', 'OPENAI'];
    
    for (const keyName of possibleKeyNames) {
      const value = allEnvVars[keyName];
      if (value && value.trim()) {
        openAIApiKey = value.trim();
        console.log(`Found API key with name: ${keyName}`);
        console.log(`Key length: ${value.length}`);
        console.log(`Key starts with: ${value.substring(0, 8)}`);
        break;
      }
    }
    
    if (!openAIApiKey) {
      console.error('No OpenAI API key found in any expected environment variable');
      console.error('Available env vars:', Object.keys(allEnvVars));
      throw new Error('No OpenAI API key found');
    }

    console.log('Testing OpenAI API connection...');
    
    // Simple test with basic model
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'user', content: 'Say "API test successful"' }
        ],
        max_tokens: 10,
      }),
    });
    
    console.log('OpenAI response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API failed: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('✅ OpenAI API test successful!');
    console.log('Response:', data.choices[0].message.content);
    
    return new Response(JSON.stringify({
      success: true,
      message: 'OpenAI API working perfectly!',
      response: data.choices[0].message.content,
      keyFound: true
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('ERROR:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});