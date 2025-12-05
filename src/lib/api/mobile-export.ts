/**
 * BALCOM PRIVÉ - Mobile API Export Bundle
 * ========================================
 * 
 * This is a self-contained file with all types and service functions
 * for the Balcom Privé mobile application.
 * 
 * SETUP INSTRUCTIONS:
 * 1. Copy this entire file to your Replit mobile project
 * 2. Install @supabase/supabase-js: npm install @supabase/supabase-js
 * 3. Add secrets in Replit:
 *    - SUPABASE_URL = "https://frsaqmaoguadryrjgcxv.supabase.co"
 *    - SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyc2FxbWFvZ3VhZHJ5cmpnY3h2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyMzM2NzksImV4cCI6MjA3NjgwOTY3OX0.udxgvGN_vqHV7zAofCx0WJc-J8gWUbrm0Rlf_38hRsU"
 * 4. Import and use: import { PropertyService, AuthService } from './mobile-export';
 */

import { createClient, Session, User, AuthChangeEvent } from '@supabase/supabase-js';

// ============================================================================
// CONFIGURATION
// ============================================================================

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://frsaqmaoguadryrjgcxv.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: undefined, // Will use AsyncStorage in React Native
    persistSession: true,
    autoRefreshToken: true,
  },
});

const IDX_EDGE_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/idx-properties`;

// ============================================================================
// COMMON TYPES
// ============================================================================

export type MembershipTier = 'silver' | 'gold' | 'platinum' | 'black';

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

export interface PaginationParams {
  limit?: number;
  offset?: number;
}

export const TIER_HIERARCHY: Record<MembershipTier, number> = {
  silver: 1,
  gold: 2,
  platinum: 3,
  black: 4,
};

export const TIER_LABELS: Record<MembershipTier, string> = {
  silver: 'Silver',
  gold: 'Gold',
  platinum: 'Platinum',
  black: 'Black',
};

function successResponse<T>(data: T): ApiResponse<T> {
  return { data, error: null, success: true };
}

function errorResponse<T>(error: string): ApiResponse<T> {
  return { data: null, error, success: false };
}

// ============================================================================
// PROPERTY TYPES
// ============================================================================

export type PropertySource = 'supabase' | 'idx';

export interface Property {
  id: string;
  title: string;
  description: string | null;
  price: number;
  property_type: string | null;
  address: string | null;
  city: string;
  region: string | null;
  country: string;
  bedrooms: number | null;
  bathrooms: number | null;
  sqft: number | null;
  latitude: number | null;
  longitude: number | null;
  images: string[] | null;
  features: string[] | null;
  lifestyle_tags: string[] | null;
  status: string | null;
  created_at: string | null;
  updated_at: string | null;
  source?: PropertySource;
  mls_number?: string;
  year_built?: number;
  lot_size?: string;
}

export interface PropertyFilters {
  city?: string;
  country?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  property_type?: string;
}

export interface SavedProperty {
  id: string;
  user_id: string;
  property_id: string;
  created_at: string | null;
}

interface IDXProperty {
  listingID: string;
  address: string;
  listPrice: number;
  bedrooms: number;
  totalBaths: number;
  sqFt: number;
  acres: string;
  image: {
    totalCount: number;
    '0': { url: string };
    '1'?: { url: string };
    '2'?: { url: string };
  };
  remarksConcat: string;
  propType: string;
  propStatus: string;
  latitude: string;
  longitude: string;
  yearBuilt: number;
  mlsNumber: string;
  cityName: string;
  state: string;
  featured?: string[];
}

function transformIDXProperty(idx: IDXProperty): Property {
  const images: string[] = [];
  if (idx.image) {
    const keys = ['0', '1', '2'] as const;
    for (const key of keys) {
      const img = idx.image[key];
      if (img && typeof img === 'object' && 'url' in img) {
        images.push(img.url);
      }
    }
  }

  return {
    id: idx.listingID,
    title: idx.address,
    description: idx.remarksConcat || null,
    price: idx.listPrice,
    property_type: idx.propType || null,
    address: idx.address,
    city: idx.cityName || 'Atlanta',
    region: idx.state || 'GA',
    country: 'USA',
    bedrooms: idx.bedrooms || null,
    bathrooms: idx.totalBaths || null,
    sqft: idx.sqFt || null,
    latitude: idx.latitude ? parseFloat(idx.latitude) : null,
    longitude: idx.longitude ? parseFloat(idx.longitude) : null,
    images,
    features: idx.featured || null,
    lifestyle_tags: null,
    status: idx.propStatus || 'active',
    created_at: null,
    updated_at: null,
    source: 'idx',
    mls_number: idx.mlsNumber,
    year_built: idx.yearBuilt,
    lot_size: idx.acres,
  };
}

// ============================================================================
// EVENT TYPES
// ============================================================================

export interface Event {
  id: string;
  title: string;
  description: string | null;
  city: string;
  venue: string | null;
  event_date: string;
  capacity: number | null;
  min_tier: string | null;
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
  startDate?: string;
  endDate?: string;
}

// ============================================================================
// LUXURY ITEM TYPES
// ============================================================================

export type LuxuryItemType = 'shopping' | 'auction';

export type LuxuryItemCategory =
  | 'Fashion'
  | 'Watches'
  | 'Jewelry'
  | 'Art'
  | 'Wine'
  | 'Collectibles'
  | 'Home'
  | 'Other';

export interface LuxuryItem {
  id: string;
  type: string;
  title: string;
  description: string | null;
  category: string;
  brand: string | null;
  price: number | null;
  estimate_low: number | null;
  estimate_high: number | null;
  auction_date: string | null;
  auction_house: string | null;
  images: string[] | null;
  provenance: string | null;
  details: unknown;
  featured: boolean | null;
  status: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface LuxuryItemFilters {
  type?: LuxuryItemType;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  featured?: boolean;
}

export const LUXURY_CATEGORIES: LuxuryItemCategory[] = [
  'Fashion',
  'Watches',
  'Jewelry',
  'Art',
  'Wine',
  'Collectibles',
  'Home',
  'Other',
];

// ============================================================================
// USER TYPES
// ============================================================================

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

// ============================================================================
// CONCIERGE TYPES
// ============================================================================

export type ConciergeCategory =
  | 'Travel'
  | 'Dining'
  | 'Chauffeur'
  | 'Events & Tickets'
  | 'Housing & Relocation'
  | 'Wellness'
  | 'Other';

export interface ConciergeRequest {
  id: string;
  user_id: string;
  category: string;
  title: string;
  description: string | null;
  status: string | null;
  preferred_date: string | null;
  budget_min: number | null;
  budget_max: number | null;
  assigned_to: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface ConciergeMessage {
  id: string;
  request_id: string;
  sender_id: string;
  sender_type: string | null;
  message: string;
  attachments: string[] | null;
  is_read: boolean | null;
  created_at: string | null;
}

export interface CreateConciergeRequestParams {
  user_id: string;
  category: ConciergeCategory | string;
  title: string;
  description?: string;
  preferred_date?: string;
  budget_min?: number;
  budget_max?: number;
}

export const CONCIERGE_CATEGORIES: ConciergeCategory[] = [
  'Travel',
  'Dining',
  'Chauffeur',
  'Events & Tickets',
  'Housing & Relocation',
  'Wellness',
  'Other',
];

// ============================================================================
// PROPERTY SERVICE
// ============================================================================

export const PropertyService = {
  async getProperties(
    filters?: PropertyFilters,
    pagination?: PaginationParams
  ): Promise<ApiResponse<Property[]>> {
    try {
      let query = supabase
        .from('properties')
        .select('*')
        .eq('status', 'active')
        .order('price', { ascending: false });

      if (filters?.city) query = query.ilike('city', `%${filters.city}%`);
      if (filters?.country) query = query.eq('country', filters.country);
      if (filters?.minPrice) query = query.gte('price', filters.minPrice);
      if (filters?.maxPrice) query = query.lte('price', filters.maxPrice);
      if (filters?.bedrooms) query = query.gte('bedrooms', filters.bedrooms);
      if (filters?.bathrooms) query = query.gte('bathrooms', filters.bathrooms);
      if (filters?.property_type) query = query.eq('property_type', filters.property_type);
      if (pagination?.limit) query = query.limit(pagination.limit);

      const { data, error } = await query;
      if (error) return errorResponse(error.message);

      const properties: Property[] = (data || []).map(p => ({ ...p, source: 'supabase' as const }));
      return successResponse(properties);
    } catch (err) {
      return errorResponse(err instanceof Error ? err.message : 'Failed to fetch properties');
    }
  },

  async getPropertyById(id: string): Promise<ApiResponse<Property | null>> {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) return errorResponse(error.message);
      if (!data) return successResponse(null);
      return successResponse({ ...data, source: 'supabase' as const });
    } catch (err) {
      return errorResponse(err instanceof Error ? err.message : 'Failed to fetch property');
    }
  },

  async getAtlantaProperties(limit?: number): Promise<ApiResponse<Property[]>> {
    try {
      const url = new URL(IDX_EDGE_FUNCTION_URL);
      if (limit) url.searchParams.set('limit', limit.toString());

      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) return errorResponse(`IDX API error: ${response.status}`);

      const json = await response.json();
      const properties = (json.data || []).map(transformIDXProperty);
      return successResponse(properties);
    } catch (err) {
      return errorResponse(err instanceof Error ? err.message : 'Failed to fetch Atlanta properties');
    }
  },

  async getSavedProperties(userId: string): Promise<ApiResponse<SavedProperty[]>> {
    try {
      const { data, error } = await supabase
        .from('saved_properties')
        .select('*')
        .eq('user_id', userId);

      if (error) return errorResponse(error.message);
      return successResponse(data || []);
    } catch (err) {
      return errorResponse(err instanceof Error ? err.message : 'Failed to fetch saved properties');
    }
  },

  async saveProperty(userId: string, propertyId: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('saved_properties')
        .insert({ user_id: userId, property_id: propertyId });

      if (error) return errorResponse(error.message);
      return successResponse(undefined);
    } catch (err) {
      return errorResponse(err instanceof Error ? err.message : 'Failed to save property');
    }
  },

  async unsaveProperty(userId: string, propertyId: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('saved_properties')
        .delete()
        .eq('user_id', userId)
        .eq('property_id', propertyId);

      if (error) return errorResponse(error.message);
      return successResponse(undefined);
    } catch (err) {
      return errorResponse(err instanceof Error ? err.message : 'Failed to unsave property');
    }
  },
};

// ============================================================================
// EVENT SERVICE
// ============================================================================

export const EventService = {
  async getUpcomingEvents(filters?: EventFilters): Promise<ApiResponse<Event[]>> {
    try {
      let query = supabase
        .from('events')
        .select('*')
        .eq('status', 'upcoming')
        .order('event_date', { ascending: true });

      if (filters?.city) query = query.ilike('city', `%${filters.city}%`);
      if (filters?.startDate) query = query.gte('event_date', filters.startDate);
      if (filters?.endDate) query = query.lte('event_date', filters.endDate);

      const { data, error } = await query;
      if (error) return errorResponse(error.message);
      return successResponse(data || []);
    } catch (err) {
      return errorResponse(err instanceof Error ? err.message : 'Failed to fetch events');
    }
  },

  async getEventById(id: string): Promise<ApiResponse<Event | null>> {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) return errorResponse(error.message);
      return successResponse(data);
    } catch (err) {
      return errorResponse(err instanceof Error ? err.message : 'Failed to fetch event');
    }
  },

  async getUserRsvpEventIds(userId: string): Promise<ApiResponse<string[]>> {
    try {
      const { data, error } = await supabase
        .from('event_rsvps')
        .select('event_id')
        .eq('user_id', userId);

      if (error) return errorResponse(error.message);
      return successResponse((data || []).map(r => r.event_id));
    } catch (err) {
      return errorResponse(err instanceof Error ? err.message : 'Failed to fetch RSVPs');
    }
  },

  async createRsvp(eventId: string, userId: string, guests: number = 1): Promise<ApiResponse<EventRsvp>> {
    try {
      const { data, error } = await supabase
        .from('event_rsvps')
        .insert({ event_id: eventId, user_id: userId, guests, status: 'confirmed' })
        .select()
        .single();

      if (error) return errorResponse(error.message);
      return successResponse(data);
    } catch (err) {
      return errorResponse(err instanceof Error ? err.message : 'Failed to create RSVP');
    }
  },

  async cancelRsvp(userId: string, eventId: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('event_rsvps')
        .delete()
        .eq('user_id', userId)
        .eq('event_id', eventId);

      if (error) return errorResponse(error.message);
      return successResponse(undefined);
    } catch (err) {
      return errorResponse(err instanceof Error ? err.message : 'Failed to cancel RSVP');
    }
  },

  canAccessEvent(userTier: MembershipTier, eventMinTier: string | null): boolean {
    if (!eventMinTier) return true;
    const tier = eventMinTier as MembershipTier;
    return TIER_HIERARCHY[userTier] >= (TIER_HIERARCHY[tier] || 0);
  },
};

// ============================================================================
// LUXURY ITEM SERVICE
// ============================================================================

export const LuxuryItemService = {
  async getItems(
    filters?: LuxuryItemFilters,
    pagination?: PaginationParams
  ): Promise<ApiResponse<LuxuryItem[]>> {
    try {
      let query = supabase
        .from('luxury_items')
        .select('*')
        .eq('status', 'active')
        .order('featured', { ascending: false })
        .order('created_at', { ascending: false });

      if (filters?.type) query = query.eq('type', filters.type);
      if (filters?.category) query = query.eq('category', filters.category);
      if (filters?.minPrice) query = query.gte('price', filters.minPrice);
      if (filters?.maxPrice) query = query.lte('price', filters.maxPrice);
      if (filters?.featured !== undefined) query = query.eq('featured', filters.featured);
      if (pagination?.limit) query = query.limit(pagination.limit);

      const { data, error } = await query;
      if (error) return errorResponse(error.message);
      return successResponse(data || []);
    } catch (err) {
      return errorResponse(err instanceof Error ? err.message : 'Failed to fetch luxury items');
    }
  },

  async getShoppingItems(category?: string, pagination?: PaginationParams): Promise<ApiResponse<LuxuryItem[]>> {
    return this.getItems({ type: 'shopping', category }, pagination);
  },

  async getAuctionItems(category?: string, pagination?: PaginationParams): Promise<ApiResponse<LuxuryItem[]>> {
    return this.getItems({ type: 'auction', category }, pagination);
  },

  async getFeaturedItems(type?: LuxuryItemType, limit: number = 4): Promise<ApiResponse<LuxuryItem[]>> {
    try {
      let query = supabase
        .from('luxury_items')
        .select('*')
        .eq('status', 'active')
        .eq('featured', true)
        .order('price', { ascending: false })
        .limit(limit);

      if (type) query = query.eq('type', type);

      const { data, error } = await query;
      if (error) return errorResponse(error.message);
      return successResponse(data || []);
    } catch (err) {
      return errorResponse(err instanceof Error ? err.message : 'Failed to fetch featured items');
    }
  },

  async getItemById(id: string): Promise<ApiResponse<LuxuryItem | null>> {
    try {
      const { data, error } = await supabase
        .from('luxury_items')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) return errorResponse(error.message);
      return successResponse(data);
    } catch (err) {
      return errorResponse(err instanceof Error ? err.message : 'Failed to fetch item');
    }
  },
};

// ============================================================================
// AUTH SERVICE
// ============================================================================

export const AuthService = {
  async signUp(email: string, password: string, firstName?: string, lastName?: string): Promise<ApiResponse<User>> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { first_name: firstName, last_name: lastName },
        },
      });

      if (error) return errorResponse(error.message);
      if (!data.user) return errorResponse('Failed to create user');
      return successResponse(data.user);
    } catch (err) {
      return errorResponse(err instanceof Error ? err.message : 'Sign up failed');
    }
  },

  async signIn(email: string, password: string): Promise<ApiResponse<User>> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return errorResponse(error.message);
      if (!data.user) return errorResponse('Failed to sign in');
      return successResponse(data.user);
    } catch (err) {
      return errorResponse(err instanceof Error ? err.message : 'Sign in failed');
    }
  },

  async signOut(): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) return errorResponse(error.message);
      return successResponse(undefined);
    } catch (err) {
      return errorResponse(err instanceof Error ? err.message : 'Sign out failed');
    }
  },

  async getSession(): Promise<ApiResponse<Session | null>> {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) return errorResponse(error.message);
      return successResponse(data.session);
    } catch (err) {
      return errorResponse(err instanceof Error ? err.message : 'Failed to get session');
    }
  },

  async getUser(): Promise<ApiResponse<User | null>> {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) return errorResponse(error.message);
      return successResponse(data.user);
    } catch (err) {
      return errorResponse(err instanceof Error ? err.message : 'Failed to get user');
    }
  },

  onAuthStateChange(callback: (event: AuthChangeEvent, session: Session | null) => void): { unsubscribe: () => void } {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(callback);
    return { unsubscribe: () => subscription.unsubscribe() };
  },
};

// ============================================================================
// MEMBERSHIP SERVICE
// ============================================================================

export const MembershipService = {
  async getMembership(userId: string): Promise<ApiResponse<Membership | null>> {
    try {
      const { data, error } = await supabase
        .from('memberships')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .maybeSingle();

      if (error) return errorResponse(error.message);

      if (!data) {
        return successResponse({
          id: '',
          user_id: userId,
          tier: 'silver' as MembershipTier,
          status: 'active',
          stripe_customer_id: null,
          stripe_subscription_id: null,
          current_period_start: null,
          current_period_end: null,
          created_at: null,
          updated_at: null,
        });
      }

      return successResponse(data as Membership);
    } catch (err) {
      return errorResponse(err instanceof Error ? err.message : 'Failed to fetch membership');
    }
  },

  canAccessTier(userTier: MembershipTier, requiredTier: MembershipTier): boolean {
    return TIER_HIERARCHY[userTier] >= TIER_HIERARCHY[requiredTier];
  },

  getUpgradeTier(currentTier: MembershipTier): MembershipTier | null {
    switch (currentTier) {
      case 'silver': return 'gold';
      case 'gold': return 'platinum';
      case 'platinum': return 'black';
      case 'black': return null;
      default: return 'gold';
    }
  },

  isGoldOrHigher(tier: MembershipTier): boolean {
    return TIER_HIERARCHY[tier] >= TIER_HIERARCHY.gold;
  },

  isPlatinumOrHigher(tier: MembershipTier): boolean {
    return TIER_HIERARCHY[tier] >= TIER_HIERARCHY.platinum;
  },

  getTierPricing(): Record<MembershipTier, { annual: number; quarterly: number; initiation: number }> {
    return {
      silver: { annual: 0, quarterly: 0, initiation: 0 },
      gold: { annual: 7500, quarterly: 2250, initiation: 500 },
      platinum: { annual: 25000, quarterly: 7500, initiation: 1000 },
      black: { annual: 50000, quarterly: 0, initiation: 2500 },
    };
  },
};

// ============================================================================
// PROFILE SERVICE
// ============================================================================

export const ProfileService = {
  async getProfile(userId: string): Promise<ApiResponse<Profile | null>> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) return errorResponse(error.message);
      return successResponse(data);
    } catch (err) {
      return errorResponse(err instanceof Error ? err.message : 'Failed to fetch profile');
    }
  },

  async updateProfile(userId: string, params: UpdateProfileParams): Promise<ApiResponse<Profile>> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          first_name: params.first_name,
          last_name: params.last_name,
          phone: params.phone,
          avatar_url: params.avatar_url,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) return errorResponse(error.message);
      return successResponse(data);
    } catch (err) {
      return errorResponse(err instanceof Error ? err.message : 'Failed to update profile');
    }
  },

  getFullName(profile: Profile | null): string {
    if (!profile) return '';
    return [profile.first_name, profile.last_name].filter(Boolean).join(' ');
  },

  getInitials(profile: Profile | null): string {
    if (!profile) return '';
    return ((profile.first_name?.[0] || '') + (profile.last_name?.[0] || '')).toUpperCase();
  },
};

// ============================================================================
// CONCIERGE SERVICE
// ============================================================================

export const ConciergeService = {
  async createRequest(params: CreateConciergeRequestParams): Promise<ApiResponse<ConciergeRequest>> {
    try {
      const { data, error } = await supabase
        .from('concierge_requests')
        .insert({
          user_id: params.user_id,
          category: params.category,
          title: params.title,
          description: params.description,
          preferred_date: params.preferred_date,
          budget_min: params.budget_min,
          budget_max: params.budget_max,
          status: 'submitted',
        })
        .select()
        .single();

      if (error) return errorResponse(error.message);
      return successResponse(data);
    } catch (err) {
      return errorResponse(err instanceof Error ? err.message : 'Failed to create request');
    }
  },

  async getUserRequests(userId: string): Promise<ApiResponse<ConciergeRequest[]>> {
    try {
      const { data, error } = await supabase
        .from('concierge_requests')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) return errorResponse(error.message);
      return successResponse(data || []);
    } catch (err) {
      return errorResponse(err instanceof Error ? err.message : 'Failed to fetch requests');
    }
  },

  async getRequestById(id: string): Promise<ApiResponse<ConciergeRequest | null>> {
    try {
      const { data, error } = await supabase
        .from('concierge_requests')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) return errorResponse(error.message);
      return successResponse(data);
    } catch (err) {
      return errorResponse(err instanceof Error ? err.message : 'Failed to fetch request');
    }
  },

  async getRequestMessages(requestId: string): Promise<ApiResponse<ConciergeMessage[]>> {
    try {
      const { data, error } = await supabase
        .from('concierge_messages')
        .select('*')
        .eq('request_id', requestId)
        .order('created_at', { ascending: true });

      if (error) return errorResponse(error.message);
      return successResponse(data || []);
    } catch (err) {
      return errorResponse(err instanceof Error ? err.message : 'Failed to fetch messages');
    }
  },

  async sendMessage(requestId: string, senderId: string, message: string, senderType: 'user' | 'concierge' = 'user'): Promise<ApiResponse<ConciergeMessage>> {
    try {
      const { data, error } = await supabase
        .from('concierge_messages')
        .insert({
          request_id: requestId,
          sender_id: senderId,
          message,
          sender_type: senderType,
        })
        .select()
        .single();

      if (error) return errorResponse(error.message);
      return successResponse(data);
    } catch (err) {
      return errorResponse(err instanceof Error ? err.message : 'Failed to send message');
    }
  },

  subscribeToMessages(requestId: string, callback: (message: ConciergeMessage) => void): { unsubscribe: () => void } {
    const channel = supabase
      .channel(`messages:${requestId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'concierge_messages',
          filter: `request_id=eq.${requestId}`,
        },
        (payload) => callback(payload.new as ConciergeMessage)
      )
      .subscribe();

    return { unsubscribe: () => supabase.removeChannel(channel) };
  },
};

// ============================================================================
// DESIGN SYSTEM CONSTANTS
// ============================================================================

export const COLORS = {
  background: '#050608',
  cardSurface: '#1A1B1E',
  gold: '#C7A97B',
  ivory: '#F6F3EF',
  subtle: '#8A8A8A',
  tier: {
    silver: '#A8A9AD',
    gold: '#C7A97B',
    platinum: '#E5E4E2',
    black: '#1A1B1E',
  },
};

export const FONTS = {
  heading: 'Playfair Display',
  body: 'Inter',
};
