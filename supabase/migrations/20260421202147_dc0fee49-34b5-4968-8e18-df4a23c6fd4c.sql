
CREATE TABLE public.entitlements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  email TEXT NOT NULL,
  stripe_customer_id TEXT NOT NULL,
  plan TEXT NOT NULL CHECK (plan IN ('weekly', 'lifetime')),
  stripe_subscription_id TEXT,
  stripe_session_id TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'expired')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_entitlements_user_plan ON public.entitlements(user_id, plan);

ALTER TABLE public.entitlements ENABLE ROW LEVEL SECURITY;

-- Users can read their own entitlements
CREATE POLICY "Users can view own entitlements"
  ON public.entitlements FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Service role inserts via webhook (no INSERT policy for regular users)
-- Admins can read all
CREATE POLICY "Admins can view all entitlements"
  ON public.entitlements FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER set_entitlements_updated_at
  BEFORE UPDATE ON public.entitlements
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
