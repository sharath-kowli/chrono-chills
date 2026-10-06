INSERT INTO public.episodes (id, series_id, number, title, subtitle, duration, stream_id, thumbnail_url, is_new)
VALUES ('sn-ep-1', 'sergeant-napalm-season-1', 1, 'Episode 1', '', '', 'e63add40ef88a2b28fa2e4598478fe43',
  'https://videodelivery.net/e63add40ef88a2b28fa2e4598478fe43/thumbnails/thumbnail.jpg?time=10s&height=1280', true)
ON CONFLICT (id) DO NOTHING;