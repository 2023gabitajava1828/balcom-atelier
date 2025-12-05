// Concierge Service - handles requests and messaging

import { supabase } from '@/integrations/supabase/client';
import type { ApiResponse } from '../types/common';
import type { 
  ConciergeRequest, 
  ConciergeMessage, 
  CreateConciergeRequestParams,
  SendMessageParams 
} from '../types/concierge';
import { successResponse, errorResponse } from '../types/common';

export const ConciergeService = {
  /**
   * Create a new concierge request
   */
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

      if (error) {
        return errorResponse(error.message);
      }

      return successResponse(data);
    } catch (err) {
      return errorResponse(err instanceof Error ? err.message : 'Failed to create request');
    }
  },

  /**
   * Get user's concierge requests
   */
  async getUserRequests(userId: string): Promise<ApiResponse<ConciergeRequest[]>> {
    try {
      const { data, error } = await supabase
        .from('concierge_requests')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        return errorResponse(error.message);
      }

      return successResponse(data || []);
    } catch (err) {
      return errorResponse(err instanceof Error ? err.message : 'Failed to fetch requests');
    }
  },

  /**
   * Get a single request by ID
   */
  async getRequestById(id: string): Promise<ApiResponse<ConciergeRequest | null>> {
    try {
      const { data, error } = await supabase
        .from('concierge_requests')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        return errorResponse(error.message);
      }

      return successResponse(data);
    } catch (err) {
      return errorResponse(err instanceof Error ? err.message : 'Failed to fetch request');
    }
  },

  /**
   * Get messages for a request
   */
  async getRequestMessages(requestId: string): Promise<ApiResponse<ConciergeMessage[]>> {
    try {
      const { data, error } = await supabase
        .from('concierge_messages')
        .select('*')
        .eq('request_id', requestId)
        .order('created_at', { ascending: true });

      if (error) {
        return errorResponse(error.message);
      }

      return successResponse(data || []);
    } catch (err) {
      return errorResponse(err instanceof Error ? err.message : 'Failed to fetch messages');
    }
  },

  /**
   * Send a message
   */
  async sendMessage(params: SendMessageParams): Promise<ApiResponse<ConciergeMessage>> {
    try {
      const { data, error } = await supabase
        .from('concierge_messages')
        .insert({
          request_id: params.request_id,
          sender_id: params.sender_id,
          message: params.message,
          sender_type: params.sender_type || 'user',
          attachments: params.attachments,
        })
        .select()
        .single();

      if (error) {
        return errorResponse(error.message);
      }

      return successResponse(data);
    } catch (err) {
      return errorResponse(err instanceof Error ? err.message : 'Failed to send message');
    }
  },

  /**
   * Mark messages as read
   */
  async markMessagesAsRead(requestId: string, userId: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('concierge_messages')
        .update({ is_read: true })
        .eq('request_id', requestId)
        .neq('sender_id', userId);

      if (error) {
        return errorResponse(error.message);
      }

      return successResponse(undefined);
    } catch (err) {
      return errorResponse(err instanceof Error ? err.message : 'Failed to mark as read');
    }
  },

  /**
   * Get unread message count for a request
   */
  async getUnreadCount(requestId: string, userId: string): Promise<ApiResponse<number>> {
    try {
      const { count, error } = await supabase
        .from('concierge_messages')
        .select('*', { count: 'exact', head: true })
        .eq('request_id', requestId)
        .eq('is_read', false)
        .neq('sender_id', userId);

      if (error) {
        return errorResponse(error.message);
      }

      return successResponse(count || 0);
    } catch (err) {
      return errorResponse(err instanceof Error ? err.message : 'Failed to get unread count');
    }
  },

  /**
   * Subscribe to new messages for a request (realtime)
   */
  subscribeToMessages(
    requestId: string,
    callback: (message: ConciergeMessage) => void
  ): { unsubscribe: () => void } {
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
        (payload) => {
          callback(payload.new as ConciergeMessage);
        }
      )
      .subscribe();

    return {
      unsubscribe: () => {
        supabase.removeChannel(channel);
      },
    };
  },
};
