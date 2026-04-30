import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { z } from "https://esm.sh/zod@3.23.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const GATEWAY_URL = "https://connector-gateway.lovable.dev/twilio";
const PROJECT_REF = "nbuokrailfjiqgcrtkgk";
const WEBHOOK_BASE = `https://${PROJECT_REF}.supabase.co/functions/v1/ivr-webhook`;

const BodySchema = z.object({
  phone: z
    .string()
    .trim()
    .regex(/^\+[1-9]\d{6,14}$/, "Phone must be E.164 format, e.g. +14155552671"),
});

const recentCalls = new Map<string, number>();
const RATE_WINDOW_MS = 60_000;

function rateLimited(phone: string): boolean {
  const now = Date.now();
  const last = recentCalls.get(phone) ?? 0;
  if (now - last < RATE_WINDOW_MS) return true;
  recentCalls.set(phone, now);
  if (recentCalls.size > 500) {
    for (const [k, v] of recentCalls) if (now - v > RATE_WINDOW_MS) recentCalls.delete(k);
  }
  return false;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const TWILIO_API_KEY = Deno.env.get("TWILIO_API_KEY");
    const TWILIO_PHONE_NUMBER = Deno.env.get("TWILIO_PHONE_NUMBER");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");
    if (!TWILIO_API_KEY) throw new Error("TWILIO_API_KEY is not configured");
    if (!TWILIO_PHONE_NUMBER) throw new Error("TWILIO_PHONE_NUMBER is not configured");

    const json = await req.json().catch(() => ({}));
    const parsed = BodySchema.safeParse(json);
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: parsed.error.flatten().fieldErrors }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { phone } = parsed.data;

    if (rateLimited(phone)) {
      return new Response(
        JSON.stringify({ error: "Please wait a minute before requesting another call." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: row, error: insertErr } = await supabase
      .from("ivr_calls")
      .insert({ phone_number: phone, status: "pending" })
      .select()
      .single();
    if (insertErr) throw new Error(`DB insert failed: ${insertErr.message}`);

    // First step: ask water question, action posts back to webhook
    const firstUrl = `${WEBHOOK_BASE}?step=water`;
    const statusUrl = `${WEBHOOK_BASE}?step=status`;
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Welcome to EcoTrack Community. Your responses help your neighborhood track water, energy, and waste.</Say>
  <Gather numDigits="1" timeout="8" action="${firstUrl}" method="POST">
    <Say voice="alice">Press a number from 1 to 5 to rate today's water usage. 1 means very low, 5 means very high.</Say>
  </Gather>
  <Say voice="alice">No input received. Goodbye.</Say>
</Response>`;

    const body = new URLSearchParams({
      To: phone,
      From: TWILIO_PHONE_NUMBER,
      Twiml: twiml,
      StatusCallback: statusUrl,
      StatusCallbackEvent: "completed",
      StatusCallbackMethod: "POST",
    });

    const tw = await fetch(`${GATEWAY_URL}/Calls.json`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "X-Connection-Api-Key": TWILIO_API_KEY,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });
    const data = await tw.json();
    if (!tw.ok) {
      await supabase
        .from("ivr_calls")
        .update({ status: "failed", error_message: JSON.stringify(data) })
        .eq("id", row.id);
      throw new Error(`Twilio call failed [${tw.status}]: ${JSON.stringify(data)}`);
    }

    await supabase
      .from("ivr_calls")
      .update({ status: "queued", twilio_call_sid: data.sid })
      .eq("id", row.id);

    return new Response(
      JSON.stringify({ success: true, callSid: data.sid, message: "Call is on its way!" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error("trigger-ivr-call error:", msg);
    return new Response(JSON.stringify({ success: false, error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
