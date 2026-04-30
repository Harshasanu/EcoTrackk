CREATE TABLE public.ivr_calls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone_number TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  twilio_call_sid TEXT,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.sms_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  twilio_message_sid TEXT,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.ivr_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sms_reports ENABLE ROW LEVEL SECURITY;

-- No public read; inserts happen via edge functions using service role.
CREATE POLICY "No public select on ivr_calls" ON public.ivr_calls FOR SELECT USING (false);
CREATE POLICY "No public select on sms_reports" ON public.sms_reports FOR SELECT USING (false);