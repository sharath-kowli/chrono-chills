
CREATE TABLE public.events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id text NOT NULL,
  country text NOT NULL DEFAULT 'unknown',
  page text NOT NULL,
  event_type text NOT NULL DEFAULT 'page_view',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (visitors don't need to be logged in)
CREATE POLICY "Anyone can insert events"
ON public.events
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Only admins can read events
CREATE POLICY "Admins can read all events"
ON public.events
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Index for country filtering
CREATE INDEX idx_events_country ON public.events (country);
CREATE INDEX idx_events_session ON public.events (session_id);
CREATE INDEX idx_events_created ON public.events (created_at);
