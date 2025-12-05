-- Add AGENT role to the enum (need to recreate since we can't easily add to enum)
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'AGENT';

-- Create athletes table
CREATE TABLE public.athletes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  sport text NOT NULL,
  team text,
  position text,
  email text,
  phone text,
  avatar_url text,
  contract_end date,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'prospect')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create athlete_requests table for agent-submitted concierge requests
CREATE TABLE public.athlete_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id uuid NOT NULL REFERENCES public.athletes(id) ON DELETE CASCADE,
  agent_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category text NOT NULL,
  title text NOT NULL,
  description text,
  preferred_date timestamptz,
  budget_min numeric,
  budget_max numeric,
  status text DEFAULT 'submitted' CHECK (status IN ('submitted', 'in_progress', 'completed', 'cancelled')),
  priority text DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.athletes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.athlete_requests ENABLE ROW LEVEL SECURITY;

-- RLS policies for athletes
CREATE POLICY "Agents can manage their athletes"
ON public.athletes FOR ALL
USING (auth.uid() = agent_id);

CREATE POLICY "Admins can view all athletes"
ON public.athletes FOR SELECT
USING (has_role(auth.uid(), 'ADMIN'));

-- RLS policies for athlete_requests
CREATE POLICY "Agents can manage their athlete requests"
ON public.athlete_requests FOR ALL
USING (auth.uid() = agent_id);

CREATE POLICY "Admins and concierge can view all athlete requests"
ON public.athlete_requests FOR SELECT
USING (has_role(auth.uid(), 'ADMIN') OR has_role(auth.uid(), 'CONCIERGE'));

CREATE POLICY "Admins and concierge can update athlete requests"
ON public.athlete_requests FOR UPDATE
USING (has_role(auth.uid(), 'ADMIN') OR has_role(auth.uid(), 'CONCIERGE'));

-- Trigger for updated_at
CREATE TRIGGER update_athletes_updated_at
  BEFORE UPDATE ON public.athletes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_athlete_requests_updated_at
  BEFORE UPDATE ON public.athlete_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();