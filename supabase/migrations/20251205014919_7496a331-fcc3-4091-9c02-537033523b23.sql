-- Add athlete_user_id to link athletes to auth accounts
ALTER TABLE public.athletes 
ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add approval fields to athlete_requests
ALTER TABLE public.athlete_requests
ADD COLUMN athlete_approval text DEFAULT 'pending' CHECK (athlete_approval IN ('pending', 'approved', 'rejected')),
ADD COLUMN athlete_approval_date timestamptz,
ADD COLUMN athlete_notes text;

-- Create index for faster lookups
CREATE INDEX idx_athletes_user_id ON public.athletes(user_id);
CREATE INDEX idx_athletes_email ON public.athletes(email);

-- RLS policy for athletes to view their own data
CREATE POLICY "Athletes can view their own profile"
ON public.athletes FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Athletes can update their own profile"
ON public.athletes FOR UPDATE
USING (auth.uid() = user_id);

-- Athletes can view requests made for them
CREATE POLICY "Athletes can view their requests"
ON public.athlete_requests FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.athletes 
    WHERE athletes.id = athlete_requests.athlete_id 
    AND athletes.user_id = auth.uid()
  )
);

-- Athletes can update approval on their requests
CREATE POLICY "Athletes can approve their requests"
ON public.athlete_requests FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.athletes 
    WHERE athletes.id = athlete_requests.athlete_id 
    AND athletes.user_id = auth.uid()
  )
);