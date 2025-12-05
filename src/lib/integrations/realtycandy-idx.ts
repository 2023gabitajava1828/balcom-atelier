/**
 * RealtyCandy IDX Integration Adapter
 * 
 * Fetch luxury property listings from live FMLS feed via edge function.
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
}

/**
 * Search properties from live FMLS feed
 */
export async function searchProperties(params: PropertySearchParams = {}): Promise<Property[]> {
  console.log('[IDX] Searching properties:', params);
  
  try {
    const { data, error } = await supabase.functions.invoke('idx-properties', {
      body: {
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

    console.log('[IDX] Received response:', data);
    return data?.properties || [];
  } catch (error) {
    console.error('[IDX] Search failed:', error);
    return [];
  }
}

/**
 * Get a single property by ID (searches from current results)
 */
export async function getPropertyById(id: string): Promise<Property | null> {
  console.log('[IDX] Getting property:', id);
  
  // For now, search and find - in production you'd have a dedicated endpoint
  const properties = await searchProperties({ limit: 100 });
  return properties.find(p => p.id === id) || null;
}

/**
 * Get available lifestyle tags
 */
export function getLifestyleTags(): string[] {
  return ['beach', 'golf', 'city', 'desert', 'luxury', 'waterfront', 'gated'];
}

/**
 * Get available property types
 */
export function getPropertyTypes(): string[] {
  return ['house', 'condo', 'villa', 'penthouse', 'townhouse', 'land'];
}
