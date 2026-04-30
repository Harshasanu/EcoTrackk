import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

// Public webhook for Twilio. Must NOT verify JWT.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const PROJECT_REF = "nbuokrailfjiqgcrtkgk";
const BASE = `https://${PROJECT_REF}.supabase.co/functions/v1/ivr-webhook`;

const FLOW: Record<string, { next: string | null; prompt: string; column: string }> = {
  water: {
    next: "energy",
    prompt: "Now press a number from 1 to 5 for today's energy usage.",
    column: "water_rating",
  },
  energy: {
    next: "waste",
    prompt: "Finally, press a number from 1 to 5 for today's waste produced.",
    column: "energy_rating",
  },
  waste: {
    next: null,
    prompt: "",
    column: "waste_rating",
  },
};

function twiml(xml: string) {
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>${xml}`, {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "text/xml" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const url = new URL(req.url);
  const step = url.searchParams.get("step") ?? "water";

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(SUPABASE_URL, SERVICE);

  const form = await req.formData().catch(() => null);
  const callSid = (form?.get("CallSid") as string) ?? "";
  const digits = (form?.get("Digits") as string) ?? "";

  // Status callback (call completed)
  if (step === "status") {
    const callStatus = (form?.get("CallStatus") as string) ?? "";
    const duration = parseInt((form?.get("CallDuration") as string) ?? "0", 10) || 0;
    if (callSid) {
      await supabase
        .from("ivr_calls")
        .update({
          status: callStatus || "completed",
          duration_seconds: duration,
          completed_at: new Date().toISOString(),
        })
        .eq("twilio_call_sid", callSid);
    }
    return new Response("ok", { headers: corsHeaders });
  }

  const node = FLOW[step];
  if (!node) {
    return twiml(`<Response><Say voice="alice">Invalid step. Goodbye.</Say></Response>`);
  }

  // Persist this digit
  if (callSid && digits) {
    await supabase.from("ivr_responses").insert({
      call_sid: callSid,
      question: step,
      digit: digits,
    });

    const numeric = parseInt(digits, 10);
    if (numeric >= 1 && numeric <= 5) {
      await supabase
        .from("ivr_calls")
        .update({ [node.column]: numeric })
        .eq("twilio_call_sid", callSid);
    }
  }

  // Decide next step
  if (node.next) {
    const nextNode = FLOW[node.next];
    const nextUrl = `${BASE}?step=${node.next}`;
    return twiml(`<Response>
  <Gather numDigits="1" timeout="8" action="${nextUrl}" method="POST">
    <Say voice="alice">${nextNode.prompt}</Say>
  </Gather>
  <Say voice="alice">No input received. Goodbye.</Say>
</Response>`);
  }

  // Done
  return twiml(`<Response>
  <Say voice="alice">Thank you. Your EcoTrack score has been recorded. Together, we make invisible waste visible. Goodbye.</Say>
  <Hangup/>
</Response>`);
});
