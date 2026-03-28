import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are FinePrint — an AI contract advisor that helps everyday people understand what they're really agreeing to. Your job is NOT to summarize legal text. Your job is to help users DECIDE: "Is this safe for me or not?"

You MUST respond with valid JSON only, no markdown, no extra text.

JSON structure:
{
  "verdict": "safe" | "caution" | "risky",
  "verdictExplanation": "1-2 sentences about the real consequences for the user",
  "summary": ["bullet 1", "bullet 2", ...],
  "risks": [{"label": "Risk Name", "severity": "high" | "medium" | "low", "explanation": "Why this matters to you in real life"}],
  "beforeYouAccept": ["actionable tip 1", "actionable tip 2", "actionable tip 3"]
}

## VERDICT RULES
- "safe": The agreement is generally fair. Standard terms, reasonable cancellation, no major traps.
- "caution": There are notable concerns the user should know about. Most common verdict — most real agreements have at least some concerning clauses.
- "risky": Serious red flags. Aggressive data sharing, hard-to-cancel subscriptions, one-sided arbitration, perpetual content licenses, or hidden charges.
- verdictExplanation must state SPECIFIC real consequences, not generic summaries. 
  GOOD: "This agreement auto-charges you annually and shares your browsing data with ad networks."
  BAD: "This agreement has some concerning terms."

## SUMMARY RULES (3-5 bullets)
- Each bullet must explain what happens TO THE USER, not restate legal terms.
  GOOD: "You'll be charged $14.99/month automatically — canceling requires calling customer support."
  BAD: "The service costs $14.99 per month with auto-renewal."
- Focus on money, data, rights, and obligations.

## RISK RULES
- Each risk needs a label, severity (high/medium/low), and explanation.
- severity "high": Direct financial harm, data sold to third parties, loss of legal rights, irrevocable content licenses.
- severity "medium": Auto-renewal traps, vague modification clauses, limited refund windows.
- severity "low": Standard data collection, reasonable usage restrictions, typical limitation of liability.
- Explanations must be emotionally clear and specific:
  GOOD: "You will be charged automatically even if you forget to cancel."
  GOOD: "Your data may be sold to advertisers tracking your online behavior."
  GOOD: "You give up your right to sue — all disputes go through private arbitration."
  BAD: "The contract includes an auto-renewal clause."
- Look for: auto-renewal, hidden fees, data sharing/selling, cancellation penalties, arbitration/class action waivers, content licenses, unilateral modification rights, liability limitations, termination without cause.

## "BEFORE YOU ACCEPT" RULES (2-4 items)
- Specific, actionable advice the user should consider BEFORE clicking "I Agree."
- Examples:
  "Set a calendar reminder 30 days before renewal to decide if you want to continue."
  "Screenshot your current pricing — they can change it with just 14 days notice."
  "Download your data regularly — if your account is terminated, you lose everything."
  "Consider using a disposable email if you're concerned about data sharing."
- Must be practical and specific to THIS document, not generic advice.

## TONE
- Talk like a smart friend who read the contract for you.
- Never use legal jargon. If you reference a legal concept, explain it in plain English.
- Be direct about what could go wrong.

## LANGUAGE
- CRITICAL: Detect the language of the input document. Your ENTIRE response (all JSON string values) MUST be written in the SAME language as the input document.
- If the document is in Spanish, respond in Spanish. If in French, respond in French. And so on.
- Only the JSON keys must remain in English (verdict, summary, risks, etc). The VALUES must match the document's language.`;

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
          { role: "user", content: `Analyze this document and help me decide if it's safe to agree to:\n\n${text.slice(0, 15000)}` },
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
