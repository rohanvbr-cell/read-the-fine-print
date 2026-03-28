import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are FinePrint, an AI contract analyzer. You analyze Terms & Conditions, contracts, and agreements. You MUST respond with valid JSON only, no markdown, no extra text.

Respond with this exact JSON structure:
{
  "summary": ["bullet 1", "bullet 2", "bullet 3"],
  "risks": [{"label": "Risk Name", "explanation": "Short explanation"}],
  "hiddenClauses": ["clause 1", "clause 2"],
  "verdict": "safe" | "caution" | "risky",
  "verdictExplanation": "Short explanation of the verdict"
}

Rules:
- summary: 3-5 bullet points in plain English summarizing what the document says
- risks: Identify key risks like auto-renewal, hidden fees, data sharing, cancellation issues, one-sided terms. Each with a short label and explanation.
- hiddenClauses: 2-3 important clauses users might miss. Things "they don't want you to notice."
- verdict: "safe" if generally fair, "caution" if there are notable concerns, "risky" if there are serious red flags
- verdictExplanation: 1-2 sentences explaining the verdict
- Use simple, clear, non-legal language
- Focus on helping users understand real consequences
- Be specific about what each clause means for the user`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text } = await req.json();

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Please provide document text to analyze." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `Analyze this document:\n\n${text.slice(0, 15000)}` },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add funds." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    // Parse the JSON from the AI response (strip markdown fences if present)
    const jsonStr = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const analysis = JSON.parse(jsonStr);

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-contract error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
