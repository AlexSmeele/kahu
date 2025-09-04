import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('Test OpenAI function called:', req.method);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    
    console.log('=== DIAGNOSTIC INFO ===');
    console.log('OpenAI API key exists:', !!openAIApiKey);
    console.log('API key starts with:', openAIApiKey ? openAIApiKey.substring(0, 7) : 'undefined');
    console.log('API key length:', openAIApiKey ? openAIApiKey.length : 'undefined');
    console.log('All env vars:', Object.keys(Deno.env.toObject()));
    
    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY not found in environment variables');
    }

    console.log('Testing OpenAI API connection...');
    
    // Test 1: Check if we can reach OpenAI models endpoint
    console.log('TEST 1: Checking models endpoint...');
    const modelsResponse = await fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
      },
    });
    
    console.log('Models endpoint status:', modelsResponse.status);
    
    if (!modelsResponse.ok) {
      const errorText = await modelsResponse.text();
      console.error('Models endpoint failed:', errorText);
      throw new Error(`Models API failed: ${modelsResponse.status} - ${errorText}`);
    }
    
    console.log('✅ Models endpoint successful');
    
    // Test 2: Simple chat completion
    console.log('TEST 2: Testing chat completion...');
    const chatResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
        max_tokens: 50,
      }),
    });
    
    console.log('Chat completion status:', chatResponse.status);
    
    if (!chatResponse.ok) {
      const errorText = await chatResponse.text();
      console.error('Chat completion failed:', errorText);
      throw new Error(`Chat API failed: ${chatResponse.status} - ${errorText}`);
    }
    
    const chatData = await chatResponse.json();
    console.log('✅ Chat completion successful');
    console.log('Response:', chatData.choices[0].message.content);
    
    return new Response(JSON.stringify({
      success: true,
      message: 'All OpenAI API tests passed successfully',
      response: chatData.choices[0].message.content,
      tests: {
        modelsEndpoint: 'PASS',
        chatCompletion: 'PASS'
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('ERROR in test function:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      stack: error.stack
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});