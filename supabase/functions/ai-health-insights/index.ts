import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { dogId, analysisType } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch relevant data for analysis
    const [dogData, weightRecords, mealRecords, activityRecords, treatLogs] = await Promise.all([
      supabase.from("dogs").select("*").eq("id", dogId).single(),
      supabase.from("weight_records").select("*").eq("dog_id", dogId).order("date", { ascending: false }).limit(30),
      supabase.from("meal_records").select("*").eq("dog_id", dogId).order("scheduled_date", { ascending: false }).limit(50),
      supabase.from("activity_records").select("*").eq("dog_id", dogId).order("start_time", { ascending: false }).limit(30),
      supabase.from("treat_logs").select("*").eq("dog_id", dogId).order("given_at", { ascending: false }).limit(50),
    ]);

    let systemPrompt = "";
    let userPrompt = "";

    switch (analysisType) {
      case "nutrition":
        systemPrompt = `You are a professional canine nutritionist AI assistant. Analyze the dog's eating patterns, weight trends, and provide actionable insights. Be concise, practical, and focus on health.`;
        userPrompt = `Analyze this dog's nutrition data:
Dog: ${dogData.data?.name}, ${dogData.data?.breed}, ${dogData.data?.weight}kg, ${dogData.data?.age} years old

Recent Weight Records: ${JSON.stringify(weightRecords.data?.slice(0, 10))}
Recent Meals: ${JSON.stringify(mealRecords.data?.slice(0, 20))}
Recent Treats: ${JSON.stringify(treatLogs.data?.slice(0, 15))}

Provide:
1. Weight trend analysis (gaining/losing/stable)
2. Eating pattern insights
3. Portion recommendations
4. 3 specific actionable recommendations`;
        break;

      case "activity":
        systemPrompt = `You are a professional canine fitness expert. Analyze activity patterns and provide exercise recommendations. Be specific and actionable.`;
        userPrompt = `Analyze this dog's activity data:
Dog: ${dogData.data?.name}, ${dogData.data?.breed}, ${dogData.data?.age} years old

Recent Activities: ${JSON.stringify(activityRecords.data?.slice(0, 20))}
Recent Weight: ${weightRecords.data?.[0]?.weight}kg

Provide:
1. Activity level assessment
2. Exercise pattern trends
3. Fitness recommendations
4. 3 specific exercise goals`;
        break;

      case "health":
        systemPrompt = `You are a veterinary health analyst AI. Review health data and identify patterns, potential concerns, and preventive care recommendations.`;
        userPrompt = `Analyze this dog's overall health data:
Dog: ${dogData.data?.name}, ${dogData.data?.breed}, ${dogData.data?.weight}kg, ${dogData.data?.age} years old

Weight Trend: ${JSON.stringify(weightRecords.data?.slice(0, 5))}
Activity Level: ${JSON.stringify(activityRecords.data?.slice(0, 10))}
Nutrition: ${JSON.stringify(mealRecords.data?.slice(0, 10))}

Provide:
1. Overall health assessment
2. Pattern detection (any concerns?)
3. Preventive care recommendations
4. 3 specific health action items`;
        break;

      default:
        throw new Error("Invalid analysis type");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const insights = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ insights, analysisType }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
