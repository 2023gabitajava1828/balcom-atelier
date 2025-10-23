-- Create app role enum
CREATE TYPE public.app_role AS ENUM ('MEMBER', 'CONCIERGE', 'ADVISOR', 'ADMIN');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'ADMIN'));

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.has_role(auth.uid(), 'ADMIN'));

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name'
  );
  
  -- Auto-assign MEMBER role to new users
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'MEMBER');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create properties table
CREATE TABLE public.properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  bedrooms INTEGER,
  bathrooms NUMERIC,
  sqft INTEGER,
  property_type TEXT, -- house, condo, villa, penthouse
  address TEXT,
  city TEXT NOT NULL,
  region TEXT,
  country TEXT NOT NULL,
  latitude NUMERIC,
  longitude NUMERIC,
  lifestyle_tags TEXT[], -- beach, golf, city, desert
  images TEXT[],
  features TEXT[],
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active properties"
  ON public.properties FOR SELECT
  USING (status = 'active');

CREATE POLICY "Admins can manage properties"
  ON public.properties FOR ALL
  USING (public.has_role(auth.uid(), 'ADMIN'));

-- Saved properties
CREATE TABLE public.saved_properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, property_id)
);

ALTER TABLE public.saved_properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their saved properties"
  ON public.saved_properties FOR ALL
  USING (auth.uid() = user_id);

-- Concierge requests
CREATE TABLE public.concierge_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL, -- travel, dining, tickets, chauffeur, chef, errands, vip
  title TEXT NOT NULL,
  description TEXT,
  preferred_date TIMESTAMPTZ,
  budget_min NUMERIC,
  budget_max NUMERIC,
  status TEXT DEFAULT 'submitted', -- submitted, in_review, confirmed, in_progress, completed, cancelled
  assigned_to UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.concierge_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own requests"
  ON public.concierge_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create requests"
  ON public.concierge_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Concierge and admins can view all requests"
  ON public.concierge_requests FOR SELECT
  USING (
    public.has_role(auth.uid(), 'CONCIERGE') OR
    public.has_role(auth.uid(), 'ADMIN')
  );

CREATE POLICY "Concierge and admins can update requests"
  ON public.concierge_requests FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'CONCIERGE') OR
    public.has_role(auth.uid(), 'ADMIN')
  );

-- Concierge messages (realtime chat)
CREATE TABLE public.concierge_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES public.concierge_requests(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  attachments TEXT[],
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.concierge_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages for their requests"
  ON public.concierge_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.concierge_requests
      WHERE id = request_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can send messages for their requests"
  ON public.concierge_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.concierge_requests
      WHERE id = request_id AND user_id = auth.uid()
    ) AND sender_id = auth.uid()
  );

CREATE POLICY "Concierge and admins can view all messages"
  ON public.concierge_messages FOR SELECT
  USING (
    public.has_role(auth.uid(), 'CONCIERGE') OR
    public.has_role(auth.uid(), 'ADMIN')
  );

CREATE POLICY "Concierge and admins can send messages"
  ON public.concierge_messages FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'CONCIERGE') OR
    public.has_role(auth.uid(), 'ADMIN')
  );

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.concierge_messages;

-- Fit profiles (for Tailored To You)
CREATE TABLE public.fit_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  shirt_size TEXT,
  pant_size TEXT,
  shoe_size TEXT,
  suit_size TEXT,
  dress_size TEXT,
  preferred_brands TEXT[],
  style_preferences TEXT[],
  occasions TEXT[],
  budget_min NUMERIC,
  budget_max NUMERIC,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.fit_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their fit profile"
  ON public.fit_profiles FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Admins and concierge can view profiles"
  ON public.fit_profiles FOR SELECT
  USING (
    public.has_role(auth.uid(), 'ADMIN') OR
    public.has_role(auth.uid(), 'CONCIERGE')
  );

-- Lookbooks
CREATE TABLE public.lookbooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  items JSONB NOT NULL DEFAULT '[]', -- [{name, image, price, brand, link}]
  total_price NUMERIC,
  status TEXT DEFAULT 'pending', -- pending, approved, declined, purchased
  member_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.lookbooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their lookbooks"
  ON public.lookbooks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their lookbook status"
  ON public.lookbooks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins and concierge can manage lookbooks"
  ON public.lookbooks FOR ALL
  USING (
    public.has_role(auth.uid(), 'ADMIN') OR
    public.has_role(auth.uid(), 'CONCIERGE')
  );

-- Events
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  city TEXT NOT NULL,
  venue TEXT,
  event_date TIMESTAMPTZ NOT NULL,
  capacity INTEGER,
  min_tier TEXT, -- silver, gold, black
  dress_code TEXT,
  partner_logos TEXT[],
  image_url TEXT,
  status TEXT DEFAULT 'upcoming',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view upcoming events"
  ON public.events FOR SELECT
  USING (status = 'upcoming');

CREATE POLICY "Admins can manage events"
  ON public.events FOR ALL
  USING (public.has_role(auth.uid(), 'ADMIN'));

-- Event RSVPs
CREATE TABLE public.event_rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'confirmed',
  guests INTEGER DEFAULT 1,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(event_id, user_id)
);

ALTER TABLE public.event_rsvps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their RSVPs"
  ON public.event_rsvps FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all RSVPs"
  ON public.event_rsvps FOR SELECT
  USING (public.has_role(auth.uid(), 'ADMIN'));

-- Documents vault
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  folder TEXT NOT NULL, -- real_estate, trust_will, banking, tax
  title TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  shared_with UUID[], -- array of user IDs (advisors)
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their documents"
  ON public.documents FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Shared advisors can view documents"
  ON public.documents FOR SELECT
  USING (
    auth.uid() = ANY(shared_with) AND
    public.has_role(auth.uid(), 'ADVISOR')
  );

-- Membership tiers
CREATE TABLE public.memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  tier TEXT NOT NULL DEFAULT 'silver', -- silver, gold, black
  status TEXT DEFAULT 'active', -- active, cancelled, expired
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their membership"
  ON public.memberships FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage memberships"
  ON public.memberships FOR ALL
  USING (public.has_role(auth.uid(), 'ADMIN'));

-- Update timestamp triggers
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_concierge_requests_updated_at
  BEFORE UPDATE ON public.concierge_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_fit_profiles_updated_at
  BEFORE UPDATE ON public.fit_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_lookbooks_updated_at
  BEFORE UPDATE ON public.lookbooks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON public.documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_memberships_updated_at
  BEFORE UPDATE ON public.memberships
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();