// Property Service - handles both Supabase and IDX properties

import { supabase } from '@/integrations/supabase/client';
import { apiConfig } from '../config';
import type { ApiResponse, PaginationParams } from '../types/common';
import type { Property, PropertyFilters, SavedProperty, IDXProperty, transformIDXProperty } from '../types/property';
import { successResponse, errorResponse } from '../types/common';
import { transformIDXProperty as transform } from '../types/property';

export const PropertyService = {
  /**
   * Get properties from Supabase with optional filters
   */
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

      if (filters?.city) {
        query = query.ilike('city', `%${filters.city}%`);
      }
      if (filters?.country) {
        query = query.eq('country', filters.country);
      }
      if (filters?.minPrice) {
        query = query.gte('price', filters.minPrice);
      }
      if (filters?.maxPrice) {
        query = query.lte('price', filters.maxPrice);
      }
      if (filters?.bedrooms) {
        query = query.gte('bedrooms', filters.bedrooms);
      }
      if (filters?.bathrooms) {
        query = query.gte('bathrooms', filters.bathrooms);
      }
      if (filters?.property_type) {
        query = query.eq('property_type', filters.property_type);
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

      const properties: Property[] = (data || []).map(p => ({
        ...p,
        source: 'supabase' as const,
      }));

      return successResponse(properties);
    } catch (err) {
      return errorResponse(err instanceof Error ? err.message : 'Failed to fetch properties');
    }
  },

  /**
   * Get a single property by ID from Supabase
   */
  async getPropertyById(id: string): Promise<ApiResponse<Property | null>> {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        return errorResponse(error.message);
      }

      if (!data) {
        return successResponse(null);
      }

      return successResponse({ ...data, source: 'supabase' as const });
    } catch (err) {
      return errorResponse(err instanceof Error ? err.message : 'Failed to fetch property');
    }
  },

  /**
   * Get Atlanta properties from IDX Broker API
   */
  async getAtlantaProperties(limit?: number): Promise<ApiResponse<Property[]>> {
    try {
      const url = new URL(apiConfig.idxEdgeFunctionUrl);
      if (limit) {
        url.searchParams.set('limit', limit.toString());
      }

      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${apiConfig.supabaseKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return errorResponse(`IDX API error: ${response.status}`);
      }

      const json = await response.json();
      const idxProperties: IDXProperty[] = json.data || [];
      const properties = idxProperties.map(transform);

      return successResponse(properties);
    } catch (err) {
      return errorResponse(err instanceof Error ? err.message : 'Failed to fetch Atlanta properties');
    }
  },

  /**
   * Get user's saved properties
   */
  async getSavedProperties(userId: string): Promise<ApiResponse<SavedProperty[]>> {
    try {
      const { data, error } = await supabase
        .from('saved_properties')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        return errorResponse(error.message);
      }

      return successResponse(data || []);
    } catch (err) {
      return errorResponse(err instanceof Error ? err.message : 'Failed to fetch saved properties');
    }
  },

  /**
   * Save a property for a user
   */
  async saveProperty(userId: string, propertyId: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('saved_properties')
        .insert({ user_id: userId, property_id: propertyId });

      if (error) {
        return errorResponse(error.message);
      }

      return successResponse(undefined);
    } catch (err) {
      return errorResponse(err instanceof Error ? err.message : 'Failed to save property');
    }
  },

  /**
   * Remove a saved property
   */
  async unsaveProperty(userId: string, propertyId: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('saved_properties')
        .delete()
        .eq('user_id', userId)
        .eq('property_id', propertyId);

      if (error) {
        return errorResponse(error.message);
      }

      return successResponse(undefined);
    } catch (err) {
      return errorResponse(err instanceof Error ? err.message : 'Failed to unsave property');
    }
  },

  /**
   * Check if a property is saved by user
   */
  async isPropertySaved(userId: string, propertyId: string): Promise<ApiResponse<boolean>> {
    try {
      const { data, error } = await supabase
        .from('saved_properties')
        .select('id')
        .eq('user_id', userId)
        .eq('property_id', propertyId)
        .maybeSingle();

      if (error) {
        return errorResponse(error.message);
      }

      return successResponse(!!data);
    } catch (err) {
      return errorResponse(err instanceof Error ? err.message : 'Failed to check saved status');
    }
  },
};
