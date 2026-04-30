import { useState } from "react";
import { MessageSquare, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const SmsForm = () => {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = message.trim();
    if (trimmed.length < 2 || trimmed.length > 480) {
      toast.error("Message must be between 2 and 480 characters.");
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.functions.invoke("send-anonymous-sms", {
      body: { message: trimmed },
    });
    setLoading(false);
    if (error || (data && data.success === false)) {
      let msg: string =
        (data && (data.error?.message?.[0] || (typeof data.error === "string" ? data.error : null))) ||
        error?.message ||
        "Send failed";
      if (/21408|Permission to send/i.test(msg)) {
        msg = "Twilio: SMS to this region isn't enabled. Open Twilio → Messaging → Geo Permissions and enable the destination country.";
      }
      toast.error(msg, { duration: 8000 });
      return;
    }
    toast.success("Anonymous report sent to the community admin.");
    setMessage("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-2xl bg-card border border-border p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <Label htmlFor="message" className="font-sans text-sm font-semibold text-foreground">
          Send an anonymous SMS report
        </Label>
        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 text-leaf" /> Anonymous
        </span>
      </div>
      <p className="text-sm text-muted-foreground -mt-1">
        Report leaks, blackouts, illegal dumping. Your identity is never shared.
      </p>
      <Textarea
        id="message"
        placeholder="e.g. Water tap leaking near block C since Monday..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        maxLength={480}
        rows={4}
        required
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{message.length}/480</span>
        <Button type="submit" variant="earth" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageSquare className="h-4 w-4" />}
          Send report
        </Button>
      </div>
    </form>
  );
};
