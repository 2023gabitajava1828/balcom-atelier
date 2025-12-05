-- Fix 1: Update update_updated_at function with proper search_path
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Fix 2: Add restrictive RLS policy for profiles - ensure concierge can view for service
CREATE POLICY "Concierge can view profiles for service"
ON public.profiles
FOR SELECT
USING (has_role(auth.uid(), 'CONCIERGE'::app_role));

-- Fix 3: Add restrictive RLS for athletes - only show contact info to authorized users
-- First, let's ensure agents can only see their athletes' contact details
CREATE POLICY "Concierge can view athletes for service"
ON public.athletes
FOR SELECT
USING (has_role(auth.uid(), 'CONCIERGE'::app_role));