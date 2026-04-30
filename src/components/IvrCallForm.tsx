import { useState } from "react";
import { Phone, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const IvrCallForm = () => {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = phone.trim();
    if (!/^\+[1-9]\d{6,14}$/.test(trimmed)) {
      toast.error("Use international format, e.g. +14155552671");
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.functions.invoke("trigger-ivr-call", {
      body: { phone: trimmed },
    });
    setLoading(false);
    if (error || (data && data.success === false)) {
      let msg: string =
        (data && (data.error?.phone?.[0] || (typeof data.error === "string" ? data.error : null))) ||
        error?.message ||
        "Call failed";
      // Twilio trial: unverified number
      if (/unverified|21219/i.test(msg)) {
        msg = "Twilio trial: this number must be verified in your Twilio console first (Phone Numbers → Verified Caller IDs).";
      }
      toast.error(msg, { duration: 8000 });
      return;
    }
    toast.success("Calling you now — answer to start your eco report.");
    setPhone("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-2xl bg-card border border-border p-5 shadow-soft">
      <Label htmlFor="phone" className="font-sans text-sm font-semibold text-foreground">
        Get a real IVR call
      </Label>
      <p className="text-sm text-muted-foreground -mt-1">
        Enter your number — we'll call instantly with the EcoTrack voice survey.
      </p>
      <div className="flex flex-col sm:flex-row gap-2">
        <Input
          id="phone"
          type="tel"
          inputMode="tel"
          placeholder="+14155552671"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          maxLength={20}
          className="font-sans"
          required
        />
        <Button type="submit" variant="hero" size="lg" disabled={loading} className="shrink-0">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Phone className="h-4 w-4" />}
          Call me
        </Button>
      </div>
    </form>
  );
};
