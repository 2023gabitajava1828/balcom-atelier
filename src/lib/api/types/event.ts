// Event types

import type { MembershipTier } from './common';

export interface Event {
  id: string;
  title: string;
  description: string | null;
  city: string;
  venue: string | null;
  event_date: string;
  capacity: number | null;
  min_tier: string | null; // MembershipTier as string from DB
  dress_code: string | null;
  image_url: string | null;
  partner_logos: string[] | null;
  status: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface EventRsvp {
  id: string;
  event_id: string;
  user_id: string;
  status: string | null;
  guests: number | null;
  notes: string | null;
  created_at: string | null;
}

export interface EventFilters {
  city?: string;
  minTier?: MembershipTier;
  startDate?: string;
  endDate?: string;
}

export interface CreateRsvpParams {
  event_id: string;
  user_id: string;
  guests?: number;
  notes?: string;
}
