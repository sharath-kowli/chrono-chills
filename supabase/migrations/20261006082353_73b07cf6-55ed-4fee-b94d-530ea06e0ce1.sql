CREATE TABLE public.episodes (
  id text PRIMARY KEY,
  series_id text NOT NULL,
  number integer NOT NULL,
  title text NOT NULL,
  subtitle text NOT NULL DEFAULT '',
  duration text NOT NULL DEFAULT '',
  stream_id text NOT NULL,
  thumbnail_url text,
  is_new boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (series_id, number)
);
GRANT SELECT ON public.episodes TO anon, authenticated;
GRANT ALL ON public.episodes TO service_role;
ALTER TABLE public.episodes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view episodes" ON public.episodes FOR SELECT TO anon, authenticated USING (true);
CREATE TRIGGER set_episodes_updated_at BEFORE UPDATE ON public.episodes FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();