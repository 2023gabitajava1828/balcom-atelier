// Luxury Item Service - handles shopping and auction items

import { supabase } from '@/integrations/supabase/client';
import type { ApiResponse, PaginationParams } from '../types/common';
import type { LuxuryItem, LuxuryItemFilters, LuxuryItemType } from '../types/luxury-item';
import { successResponse, errorResponse } from '../types/common';

export const LuxuryItemService = {
  /**
   * Get luxury items with optional filters
   */
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

      if (filters?.type) {
        query = query.eq('type', filters.type);
      }
      if (filters?.category) {
        query = query.eq('category', filters.category);
      }
      if (filters?.minPrice) {
        query = query.gte('price', filters.minPrice);
      }
      if (filters?.maxPrice) {
        query = query.lte('price', filters.maxPrice);
      }
      if (filters?.featured !== undefined) {
        query = query.eq('featured', filters.featured);
      }

      if (pagination?.limit) {
        query = query.limit(pagination.limit);
      }
      if (pagination?.offset) {
        query = query.range(pagination.offset, pagination.offset + (pagination.limit || 10) - 1);
      }

      const { data, error } = await query;

      if (error) {
        return errorResponse(error.message);
      }

      return successResponse(data || []);
    } catch (err) {
      return errorResponse(err instanceof Error ? err.message : 'Failed to fetch luxury items');
    }
  },

  /**
   * Get shopping items (type = 'shopping')
   */
  async getShoppingItems(
    category?: string,
    pagination?: PaginationParams
  ): Promise<ApiResponse<LuxuryItem[]>> {
    return this.getItems(
      { type: 'shopping', category },
      pagination
    );
  },

  /**
   * Get auction items (type = 'auction')
   */
  async getAuctionItems(
    category?: string,
    pagination?: PaginationParams
  ): Promise<ApiResponse<LuxuryItem[]>> {
    return this.getItems(
      { type: 'auction', category },
      pagination
    );
  },

  /**
   * Get featured items for homepage
   */
  async getFeaturedItems(type?: LuxuryItemType, limit: number = 4): Promise<ApiResponse<LuxuryItem[]>> {
    try {
      let query = supabase
        .from('luxury_items')
        .select('*')
        .eq('status', 'active')
        .eq('featured', true)
        .order('price', { ascending: false })
        .limit(limit);

      if (type) {
        query = query.eq('type', type);
      }

      const { data, error } = await query;

      if (error) {
        return errorResponse(error.message);
      }

      return successResponse(data || []);
    } catch (err) {
      return errorResponse(err instanceof Error ? err.message : 'Failed to fetch featured items');
    }
  },

  /**
   * Get a single item by ID
   */
  async getItemById(id: string): Promise<ApiResponse<LuxuryItem | null>> {
    try {
      const { data, error } = await supabase
        .from('luxury_items')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        return errorResponse(error.message);
      }

      return successResponse(data);
    } catch (err) {
      return errorResponse(err instanceof Error ? err.message : 'Failed to fetch item');
    }
  },

  /**
   * Get items by category with counts
   */
  async getCategories(type?: LuxuryItemType): Promise<ApiResponse<{ category: string; count: number }[]>> {
    try {
      let query = supabase
        .from('luxury_items')
        .select('category')
        .eq('status', 'active');

      if (type) {
        query = query.eq('type', type);
      }

      const { data, error } = await query;

      if (error) {
        return errorResponse(error.message);
      }

      // Count by category
      const counts: Record<string, number> = {};
      (data || []).forEach(item => {
        counts[item.category] = (counts[item.category] || 0) + 1;
      });

      const categories = Object.entries(counts).map(([category, count]) => ({
        category,
        count,
      }));

      return successResponse(categories);
    } catch (err) {
      return errorResponse(err instanceof Error ? err.message : 'Failed to fetch categories');
    }
  },
};
