/**
 * RealtyCandy IDX Integration Adapter
 * 
 * Fetch luxury property listings from live FMLS feed via edge function.
 * Supports: featured listings, saved search links, full property images
 */

import { supabase } from "@/integrations/supabase/client";

export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  bedrooms: number | null;
  bathrooms: number | null;
  sqft: number | null;
  propertyType: string;
  address: string;
  city: string;
  region?: string;
  country: string;
  latitude?: number | null;
  longitude?: number | null;
  lifestyleTags: string[];
  images: string[];
  features: string[];
  status: string;
  mlsNumber?: string;
  yearBuilt?: number | null;
  lotSize?: string;
}

export interface SavedLink {
  id: string;
  linkName: string;
  linkTitle: string;
}

export interface PropertySearchParams {
  city?: string;
  region?: string;
  country?: string;
  priceMin?: number;
  priceMax?: number;
  beds?: number;
  baths?: number;
  propertyType?: string;
  lifestyleTags?: string[];
  limit?: number;
  offset?: number;
  savedLinkId?: string;
}

/**
 * Search properties from live FMLS feed
 */
export async function searchProperties(params: PropertySearchParams = {}): Promise<Property[]> {
  console.log('[IDX] Searching properties:', params);
  
  try {
    const { data, error } = await supabase.functions.invoke('idx-properties', {
      body: {
        action: params.savedLinkId ? 'getSavedLinkResults' : 'search',
        savedLinkId: params.savedLinkId,
        city: params.city || 'Atlanta',
        region: params.region || 'Georgia',
        priceMin: params.priceMin,
        priceMax: params.priceMax,
        beds: params.beds,
        baths: params.baths,
        propertyType: params.propertyType,
        limit: params.limit || 20,
        offset: params.offset || 0,
      },
    });

    if (error) {
      console.error('[IDX] Edge function error:', error);
      return [];
    }

    console.log('[IDX] Received', data?.properties?.length || 0, 'properties');
    return data?.properties || [];
  } catch (error) {
    console.error('[IDX] Search failed:', error);
    return [];
  }
}

/**
 * Get all saved search links from IDX account
 */
export async function getSavedLinks(): Promise<SavedLink[]> {
  console.log('[IDX] Fetching saved links');
  
  try {
    const { data, error } = await supabase.functions.invoke('idx-properties', {
      body: { action: 'getSavedLinks' },
    });

    if (error) {
      console.error('[IDX] Failed to fetch saved links:', error);
      return [];
    }

    console.log('[IDX] Found', data?.savedLinks?.length || 0, 'saved links');
    return data?.savedLinks || [];
  } catch (error) {
    console.error('[IDX] Saved links failed:', error);
    return [];
  }
}

/**
 * Get properties from a specific saved link
 */
export async function getPropertiesFromSavedLink(savedLinkId: string): Promise<Property[]> {
  return searchProperties({ savedLinkId });
}

/**
 * Get a single property by ID
 */
export async function getPropertyById(id: string): Promise<Property | null> {
  console.log('[IDX] Getting property:', id);
  const properties = await searchProperties({ limit: 100 });
  return properties.find(p => p.id === id) || null;
}

/**
 * Get available lifestyle tags
 */
export function getLifestyleTags(): string[] {
  return ['luxury', 'waterfront', 'pool', 'golf', 'ocean-view', 'ultra-luxury'];
}

/**
 * Get available property types
 */
export function getPropertyTypes(): string[] {
  return ['house', 'condo', 'villa', 'penthouse', 'townhouse', 'land'];
}
