// Profile Service - handles user profiles

import { supabase } from '@/integrations/supabase/client';
import type { ApiResponse } from '../types/common';
import type { Profile, UpdateProfileParams } from '../types/user';
import { successResponse, errorResponse } from '../types/common';

export const ProfileService = {
  /**
   * Get user's profile
   */
  async getProfile(userId: string): Promise<ApiResponse<Profile | null>> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        return errorResponse(error.message);
      }

      return successResponse(data);
    } catch (err) {
      return errorResponse(err instanceof Error ? err.message : 'Failed to fetch profile');
    }
  },

  /**
   * Update user's profile
   */
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

      if (error) {
        return errorResponse(error.message);
      }

      return successResponse(data);
    } catch (err) {
      return errorResponse(err instanceof Error ? err.message : 'Failed to update profile');
    }
  },

  /**
   * Get user's full name
   */
  getFullName(profile: Profile | null): string {
    if (!profile) return '';
    const parts = [profile.first_name, profile.last_name].filter(Boolean);
    return parts.join(' ');
  },

  /**
   * Get user's initials
   */
  getInitials(profile: Profile | null): string {
    if (!profile) return '';
    const first = profile.first_name?.[0] || '';
    const last = profile.last_name?.[0] || '';
    return (first + last).toUpperCase();
  },
};
