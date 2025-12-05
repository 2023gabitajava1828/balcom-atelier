// Event Service - handles events and RSVPs

import { supabase } from '@/integrations/supabase/client';
import type { ApiResponse } from '../types/common';
import type { Event, EventRsvp, EventFilters, CreateRsvpParams } from '../types/event';
import { successResponse, errorResponse, TIER_HIERARCHY } from '../types/common';
import type { MembershipTier } from '../types/common';

export const EventService = {
  /**
   * Get upcoming events with optional filters
   */
  async getUpcomingEvents(filters?: EventFilters): Promise<ApiResponse<Event[]>> {
    try {
      let query = supabase
        .from('events')
        .select('*')
        .eq('status', 'upcoming')
        .order('event_date', { ascending: true });

      if (filters?.city) {
        query = query.ilike('city', `%${filters.city}%`);
      }
      if (filters?.startDate) {
        query = query.gte('event_date', filters.startDate);
      }
      if (filters?.endDate) {
        query = query.lte('event_date', filters.endDate);
      }

      const { data, error } = await query;

      if (error) {
        return errorResponse(error.message);
      }

      return successResponse(data || []);
    } catch (err) {
      return errorResponse(err instanceof Error ? err.message : 'Failed to fetch events');
    }
  },

  /**
   * Get a single event by ID
   */
  async getEventById(id: string): Promise<ApiResponse<Event | null>> {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        return errorResponse(error.message);
      }

      return successResponse(data);
    } catch (err) {
      return errorResponse(err instanceof Error ? err.message : 'Failed to fetch event');
    }
  },

  /**
   * Get user's RSVPs
   */
  async getUserRsvps(userId: string): Promise<ApiResponse<EventRsvp[]>> {
    try {
      const { data, error } = await supabase
        .from('event_rsvps')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        return errorResponse(error.message);
      }

      return successResponse(data || []);
    } catch (err) {
      return errorResponse(err instanceof Error ? err.message : 'Failed to fetch RSVPs');
    }
  },

  /**
   * Get RSVP'd event IDs for a user
   */
  async getUserRsvpEventIds(userId: string): Promise<ApiResponse<string[]>> {
    try {
      const { data, error } = await supabase
        .from('event_rsvps')
        .select('event_id')
        .eq('user_id', userId);

      if (error) {
        return errorResponse(error.message);
      }

      const eventIds = (data || []).map(r => r.event_id);
      return successResponse(eventIds);
    } catch (err) {
      return errorResponse(err instanceof Error ? err.message : 'Failed to fetch RSVPs');
    }
  },

  /**
   * Create an RSVP
   */
  async createRsvp(params: CreateRsvpParams): Promise<ApiResponse<EventRsvp>> {
    try {
      const { data, error } = await supabase
        .from('event_rsvps')
        .insert({
          event_id: params.event_id,
          user_id: params.user_id,
          guests: params.guests || 1,
          notes: params.notes,
          status: 'confirmed',
        })
        .select()
        .single();

      if (error) {
        return errorResponse(error.message);
      }

      return successResponse(data);
    } catch (err) {
      return errorResponse(err instanceof Error ? err.message : 'Failed to create RSVP');
    }
  },

  /**
   * Cancel an RSVP
   */
  async cancelRsvp(userId: string, eventId: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('event_rsvps')
        .delete()
        .eq('user_id', userId)
        .eq('event_id', eventId);

      if (error) {
        return errorResponse(error.message);
      }

      return successResponse(undefined);
    } catch (err) {
      return errorResponse(err instanceof Error ? err.message : 'Failed to cancel RSVP');
    }
  },

  /**
   * Check if user can access event based on tier
   */
  canAccessEvent(userTier: MembershipTier, eventMinTier: MembershipTier | null): boolean {
    if (!eventMinTier) return true;
    return TIER_HIERARCHY[userTier] >= TIER_HIERARCHY[eventMinTier];
  },

  /**
   * Get RSVP count for an event
   */
  async getEventRsvpCount(eventId: string): Promise<ApiResponse<number>> {
    try {
      const { count, error } = await supabase
        .from('event_rsvps')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', eventId);

      if (error) {
        return errorResponse(error.message);
      }

      return successResponse(count || 0);
    } catch (err) {
      return errorResponse(err instanceof Error ? err.message : 'Failed to get RSVP count');
    }
  },
};
