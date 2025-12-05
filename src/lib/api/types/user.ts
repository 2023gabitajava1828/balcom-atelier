// User, Profile, and Membership types

import type { MembershipTier } from './common';

export interface User {
  id: string;
  email: string;
  created_at: string;
  app_metadata: Record<string, unknown>;
  user_metadata: {
    first_name?: string;
    last_name?: string;
    [key: string]: unknown;
  };
}

export interface Profile {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface Membership {
  id: string;
  user_id: string;
  tier: MembershipTier;
  status: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface UpdateProfileParams {
  first_name?: string;
  last_name?: string;
  phone?: string;
  avatar_url?: string;
}

export interface SignUpParams {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface SignInParams {
  email: string;
  password: string;
}
