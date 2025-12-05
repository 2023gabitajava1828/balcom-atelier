-- Create IDX property cache table for faster property lookups
CREATE TABLE public.idx_property_cache (
  id TEXT PRIMARY KEY,
  property_data JSONB NOT NULL,
  cached_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '15 minutes')
);

-- Create index for expiration cleanup
CREATE INDEX idx_property_cache_expires_at ON public.idx_property_cache(expires_at);

-- Enable RLS but allow public read (cached property data is public)
ALTER TABLE public.idx_property_cache ENABLE ROW LEVEL SECURITY;

-- Anyone can read cached properties
CREATE POLICY "Anyone can read cached properties"
ON public.idx_property_cache
FOR SELECT
USING (true);

-- Only service role can insert/update/delete (via edge functions)
CREATE POLICY "Service role can manage cache"
ON public.idx_property_cache
FOR ALL
USING (auth.role() = 'service_role');