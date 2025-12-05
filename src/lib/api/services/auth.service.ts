// Auth Service - handles authentication

import { supabase } from '@/integrations/supabase/client';
import type { Session, User, AuthChangeEvent } from '@supabase/supabase-js';
import type { ApiResponse } from '../types/common';
import type { SignUpParams, SignInParams } from '../types/user';
import { successResponse, errorResponse } from '../types/common';

export const AuthService = {
  /**
   * Sign up a new user
   */
  async signUp(params: SignUpParams): Promise<ApiResponse<User>> {
    try {
      const redirectUrl = typeof window !== 'undefined' 
        ? `${window.location.origin}/`
        : undefined;

      const { data, error } = await supabase.auth.signUp({
        email: params.email,
        password: params.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            first_name: params.firstName,
            last_name: params.lastName,
          },
        },
      });

      if (error) {
        return errorResponse(error.message);
      }

      if (!data.user) {
        return errorResponse('Failed to create user');
      }

      return successResponse(data.user);
    } catch (err) {
      return errorResponse(err instanceof Error ? err.message : 'Sign up failed');
    }
  },

  /**
   * Sign in an existing user
   */
  async signIn(params: SignInParams): Promise<ApiResponse<User>> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: params.email,
        password: params.password,
      });

      if (error) {
        return errorResponse(error.message);
      }

      if (!data.user) {
        return errorResponse('Failed to sign in');
      }

      return successResponse(data.user);
    } catch (err) {
      return errorResponse(err instanceof Error ? err.message : 'Sign in failed');
    }
  },

  /**
   * Sign out the current user
   */
  async signOut(): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        return errorResponse(error.message);
      }

      return successResponse(undefined);
    } catch (err) {
      return errorResponse(err instanceof Error ? err.message : 'Sign out failed');
    }
  },

  /**
   * Get the current session
   */
  async getSession(): Promise<ApiResponse<Session | null>> {
    try {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        return errorResponse(error.message);
      }

      return successResponse(data.session);
    } catch (err) {
      return errorResponse(err instanceof Error ? err.message : 'Failed to get session');
    }
  },

  /**
   * Get the current user
   */
  async getUser(): Promise<ApiResponse<User | null>> {
    try {
      const { data, error } = await supabase.auth.getUser();

      if (error) {
        return errorResponse(error.message);
      }

      return successResponse(data.user);
    } catch (err) {
      return errorResponse(err instanceof Error ? err.message : 'Failed to get user');
    }
  },

  /**
   * Subscribe to auth state changes
   */
  onAuthStateChange(
    callback: (event: AuthChangeEvent, session: Session | null) => void
  ): { unsubscribe: () => void } {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(callback);
    return { unsubscribe: () => subscription.unsubscribe() };
  },

  /**
   * Send password reset email
   */
  async resetPassword(email: string): Promise<ApiResponse<void>> {
    try {
      const redirectUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/auth?reset=true`
        : undefined;

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (error) {
        return errorResponse(error.message);
      }

      return successResponse(undefined);
    } catch (err) {
      return errorResponse(err instanceof Error ? err.message : 'Failed to send reset email');
    }
  },

  /**
   * Update user password
   */
  async updatePassword(newPassword: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        return errorResponse(error.message);
      }

      return successResponse(undefined);
    } catch (err) {
      return errorResponse(err instanceof Error ? err.message : 'Failed to update password');
    }
  },
};
