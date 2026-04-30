-- Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can view own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
ON public.user_roles FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Extend ivr_calls
ALTER TABLE public.ivr_calls
  ADD COLUMN IF NOT EXISTS water_rating int,
  ADD COLUMN IF NOT EXISTS energy_rating int,
  ADD COLUMN IF NOT EXISTS waste_rating int,
  ADD COLUMN IF NOT EXISTS duration_seconds int,
  ADD COLUMN IF NOT EXISTS completed_at timestamptz;

-- Per-step responses
CREATE TABLE public.ivr_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  call_sid text NOT NULL,
  question text NOT NULL,
  digit text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ivr_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "No public select on ivr_responses"
ON public.ivr_responses FOR SELECT
USING (false);

CREATE POLICY "Admins can view ivr_responses"
ON public.ivr_responses FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admin select on existing tables
CREATE POLICY "Admins can view ivr_calls"
ON public.ivr_calls FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view sms_reports"
ON public.sms_reports FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_ivr_responses_call_sid ON public.ivr_responses(call_sid);
CREATE INDEX idx_ivr_calls_created_at ON public.ivr_calls(created_at DESC);
CREATE INDEX idx_sms_reports_created_at ON public.sms_reports(created_at DESC);