
-- Server-side redemption codes table
CREATE TABLE public.redemption_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  plan TEXT NOT NULL DEFAULT 'lifetime',
  is_active BOOLEAN NOT NULL DEFAULT true,
  max_uses INTEGER,
  uses_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT ALL ON public.redemption_codes TO service_role;
-- Intentionally NO grants to anon/authenticated: only edge function (service_role) reads/writes.

ALTER TABLE public.redemption_codes ENABLE ROW LEVEL SECURITY;

-- Deny-all policies for client roles (defense in depth)
CREATE POLICY "No client select on redemption_codes" ON public.redemption_codes
  FOR SELECT TO anon, authenticated USING (false);
CREATE POLICY "No client insert on redemption_codes" ON public.redemption_codes
  FOR INSERT TO anon, authenticated WITH CHECK (false);
CREATE POLICY "No client update on redemption_codes" ON public.redemption_codes
  FOR UPDATE TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY "No client delete on redemption_codes" ON public.redemption_codes
  FOR DELETE TO anon, authenticated USING (false);

-- Seed the existing legacy code so existing holders still work after rotation review.
-- (User can rotate/disable this row from the admin tools later.)
INSERT INTO public.redemption_codes (code, plan, is_active)
VALUES ('MERIROSVO1', 'lifetime', true)
ON CONFLICT (code) DO NOTHING;
