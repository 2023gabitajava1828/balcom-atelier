import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PropertySearchParams {
  city?: string;
  region?: string;
  priceMin?: number;
  priceMax?: number;
  beds?: number;
  baths?: number;
  propertyType?: string;
  limit?: number;
  offset?: number;
  savedLinkId?: string;
  action?: 'search' | 'getSavedLinks' | 'getSavedLinkResults' | 'getPropertyById';
  propertyId?: string;
}

// Initialize Supabase client for caching
function getSupabaseClient() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  return createClient(supabaseUrl, supabaseKey);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const REALTYCANDY_API_KEY = Deno.env.get('REALTYCANDY_API_KEY');

    if (!REALTYCANDY_API_KEY) {
      console.error('[IDX] Missing API key');
      return new Response(
        JSON.stringify({ error: 'IDX credentials not configured', properties: [] }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const params: PropertySearchParams = await req.json();
    console.log('[IDX] Request params:', params);

    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'accesskey': REALTYCANDY_API_KEY,
      'outputtype': 'json',
    };

    // NEW: Get single property by ID from cache
    if (params.action === 'getPropertyById' && params.propertyId) {
      return await getPropertyFromCache(params.propertyId, corsHeaders);
    }

    if (params.action === 'getSavedLinks') {
      return await getSavedLinks(headers, corsHeaders);
    }

    if (params.action === 'getSavedLinkResults' && params.savedLinkId) {
      return await getSavedLinkResults(params.savedLinkId, headers, corsHeaders);
    }

    return await searchProperties(params, headers, corsHeaders);

  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('[IDX] Error:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage, properties: [] }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// NEW: Get single property from cache
async function getPropertyFromCache(propertyId: string, corsHeaders: Record<string, string>) {
  console.log('[IDX] Getting property from cache:', propertyId);
  
  const supabase = getSupabaseClient();
  
  // Check cache first
  const { data: cached } = await supabase
    .from('idx_property_cache')
    .select('property_data, expires_at')
    .eq('id', propertyId)
    .single();
  
  if (cached && new Date(cached.expires_at) > new Date()) {
    console.log('[IDX] Cache hit for property:', propertyId);
    return new Response(
      JSON.stringify({ property: cached.property_data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  console.log('[IDX] Cache miss for property:', propertyId);
  return new Response(
    JSON.stringify({ property: null }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Cache properties to Supabase
async function cacheProperties(properties: Record<string, unknown>[]) {
  if (properties.length === 0) return;
  
  const supabase = getSupabaseClient();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutes
  
  const cacheEntries = properties.map(p => ({
    id: String(p.id),
    property_data: p,
    cached_at: new Date().toISOString(),
    expires_at: expiresAt,
  }));
  
  // Upsert in batches of 100
  for (let i = 0; i < cacheEntries.length; i += 100) {
    const batch = cacheEntries.slice(i, i + 100);
    const { error } = await supabase
      .from('idx_property_cache')
      .upsert(batch, { onConflict: 'id' });
    
    if (error) {
      console.error('[IDX] Cache write error:', error.message);
    }
  }
  
  console.log('[IDX] Cached', properties.length, 'properties');
}

// Clean expired cache entries (background task)
async function cleanExpiredCache() {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('idx_property_cache')
    .delete()
    .lt('expires_at', new Date().toISOString());
  
  if (error) {
    console.error('[IDX] Cache cleanup error:', error.message);
  }
}

async function getSavedLinks(headers: Record<string, string>, corsHeaders: Record<string, string>) {
  console.log('[IDX] Fetching saved links');
  
  const response = await fetch('https://api.idxbroker.com/clients/savedlinks', {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[IDX] Saved links error:', response.status, errorText.substring(0, 500));
    return new Response(
      JSON.stringify({ error: `Failed to fetch saved links: ${response.status}`, savedLinks: [] }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const data = await response.json();
  
  let savedLinks: Array<{ id: string; linkName: string; linkTitle: string }> = [];
  
  if (Array.isArray(data)) {
    savedLinks = data.map(link => ({
      id: String(link.id || link.savedLinkID),
      linkName: String(link.linkName || ''),
      linkTitle: String(link.linkTitle || link.linkName || ''),
    }));
  } else if (data && typeof data === 'object') {
    savedLinks = Object.values(data).filter(item => item && typeof item === 'object').map((link: any) => ({
      id: String(link.id || link.savedLinkID),
      linkName: String(link.linkName || ''),
      linkTitle: String(link.linkTitle || link.linkName || ''),
    }));
  }

  console.log('[IDX] Found', savedLinks.length, 'saved links');
  
  return new Response(
    JSON.stringify({ savedLinks }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function getSavedLinkResults(savedLinkId: string, headers: Record<string, string>, corsHeaders: Record<string, string>) {
  console.log('[IDX] Fetching results for saved link:', savedLinkId);
  
  const response = await fetch(`https://api.idxbroker.com/clients/savedlinks/${savedLinkId}/results`, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[IDX] Saved link results error:', response.status, errorText.substring(0, 500));
    return new Response(
      JSON.stringify({ error: `Failed to fetch saved link results: ${response.status}`, properties: [] }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const data = await response.json();
  return processResponse(data, corsHeaders);
}

async function searchProperties(params: PropertySearchParams, headers: Record<string, string>, corsHeaders: Record<string, string>) {
  const queryParams = new URLSearchParams();
  if (params.city) queryParams.append('cityName', params.city);
  if (params.region) queryParams.append('state', params.region);
  if (params.priceMin) queryParams.append('minPrice', params.priceMin.toString());
  if (params.priceMax) queryParams.append('maxPrice', params.priceMax.toString());
  if (params.beds) queryParams.append('minBeds', params.beds.toString());
  if (params.baths) queryParams.append('minBaths', params.baths.toString());
  
  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
  const apiUrl = `https://api.idxbroker.com/clients/featured${queryString}`;
  
  console.log('[IDX] Fetching from:', apiUrl);

  const response = await fetch(apiUrl, { method: 'GET', headers });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[IDX] API error:', response.status, errorText.substring(0, 500));
    
    if (response.status === 404 || response.status === 403) {
      console.log('[IDX] Trying alternative endpoint: clients/listing');
      const altResponse = await fetch(`https://api.idxbroker.com/clients/listing${queryString}`, {
        method: 'GET',
        headers,
      });
      
      if (altResponse.ok) {
        const altData = await altResponse.json();
        return processResponse(altData, corsHeaders);
      }
    }
    
    return new Response(
      JSON.stringify({ error: `IDX API error: ${response.status}`, properties: [] }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const data = await response.json();
  return processResponse(data, corsHeaders);
}

async function processResponse(data: unknown, corsHeaders: Record<string, string>) {
  let listings: Record<string, unknown>[] = [];
  
  if (Array.isArray(data)) {
    listings = data;
  } else if (data && typeof data === 'object') {
    const dataObj = data as Record<string, unknown>;
    if (dataObj.data && Array.isArray(dataObj.data)) {
      listings = dataObj.data as Record<string, unknown>[];
    } else {
      listings = Object.values(dataObj).filter(
        item => item && typeof item === 'object' && !Array.isArray(item)
      ) as Record<string, unknown>[];
    }
  }
  
  console.log('[IDX] Processing', listings.length, 'raw listings');

  const soldStatuses = ['sold', 'closed', 'pending', 'expired', 'withdrawn', 'cancelled', 'off market'];
  
  const activeListings = listings.filter((listing) => {
    const status = String(listing.propStatus || listing.status || listing.listingStatus || '').toLowerCase();
    const isSold = soldStatuses.some(s => status.includes(s));
    const hasSoldPrice = listing.soldPrice && parseFloat(String(listing.soldPrice)) > 0;
    const hasSoldDate = listing.soldDate || listing.closeDate;
    
    if (isSold || hasSoldPrice || hasSoldDate) {
      console.log('[IDX] Filtering out sold/inactive listing:', listing.listingID, 'status:', status);
      return false;
    }
    return true;
  });

  const properties = activeListings.map((listing) => {
    const priceValue = listing.listPrice || listing.listingPrice || listing.price || 
                       listing.currentPrice || listing.originalPrice || listing.askingPrice || 
                       listing.salePrice || 0;
    const parsedPrice = parseFloat(String(priceValue).replace(/[,$]/g, '')) || 0;
    
    return {
      id: String(listing.listingID || listing.mlsID || listing.idxID || crypto.randomUUID()),
      title: buildTitle(listing),
      description: cleanDescription(String(listing.remarksConcat || listing.remarks || listing.description || '')),
      price: parsedPrice,
      bedrooms: parseInt(String(listing.bedrooms || listing.beds || 0)) || null,
      bathrooms: parseFloat(String(listing.totalBaths || listing.bathrooms || listing.baths || 0)) || null,
      sqft: parseInt(String(listing.sqFt || listing.squareFeet || listing.sqft || 0)) || null,
      propertyType: String(listing.propType || listing.propertyType || listing.type || 'house'),
      address: buildAddress(listing),
      city: String(listing.cityName || listing.city || 'Atlanta'),
      region: String(listing.state || listing.stateProvince || 'Georgia'),
      country: 'USA',
      latitude: parseFloat(String(listing.latitude || listing.lat)) || null,
      longitude: parseFloat(String(listing.longitude || listing.lng)) || null,
      lifestyleTags: extractLifestyleTags(listing),
      images: extractAllImages(listing),
      features: extractFeatures(listing),
      status: String(listing.propStatus || listing.status || 'active').toLowerCase(),
      mlsNumber: String(listing.listingID || listing.mlsID || ''),
      yearBuilt: parseInt(String(listing.yearBuilt || 0)) || null,
      lotSize: String(listing.acres || listing.lotSize || ''),
    };
  });

  properties.sort((a, b) => b.price - a.price);

  console.log('[IDX] Final properties:', properties.length, '(sorted by price high to low)');

  // Cache properties in background (don't block response)
  cacheProperties(properties).catch(err => console.error('[IDX] Background cache error:', err));
  
  // Clean expired cache periodically
  cleanExpiredCache().catch(err => console.error('[IDX] Background cleanup error:', err));

  return new Response(
    JSON.stringify({ properties, total: properties.length }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

function buildTitle(listing: Record<string, unknown>): string {
  if (listing.address && typeof listing.address === 'string') {
    return listing.address;
  }
  const streetNum = listing.streetNumber || '';
  const streetName = listing.streetName || '';
  const streetDir = listing.streetDirection || '';
  
  const parts = [streetNum, streetDir, streetName].filter(Boolean).map(String);
  return parts.join(' ').trim() || 'Luxury Property';
}

function buildAddress(listing: Record<string, unknown>): string {
  const streetNum = listing.streetNumber || '';
  const streetName = listing.streetName || '';
  const streetDir = listing.streetDirection || '';
  const city = listing.cityName || listing.city || '';
  const state = listing.state || '';
  const zip = listing.zipcode || '';
  
  const street = [streetNum, streetDir, streetName].filter(Boolean).map(String).join(' ').trim();
  const cityState = [city, state].filter(Boolean).map(String).join(', ');
  
  return [street, cityState, zip].filter(Boolean).join(', ');
}

function cleanDescription(desc: string): string {
  return desc
    .replace(/call\s+[\w\s]+at\s+[\d\-\(\)]+/gi, '')
    .replace(/contact\s+[\w\s]+at\s+[\d\-\(\)]+/gi, '')
    .replace(/agent:\s*[\w\s]+/gi, '')
    .replace(/broker:\s*[\w\s]+/gi, '')
    .replace(/listing\s+agent:\s*[\w\s]+/gi, '')
    .replace(/[\d]{3}[\-\.\s]?[\d]{3}[\-\.\s]?[\d]{4}/g, '')
    .replace(/[\w\.-]+@[\w\.-]+\.\w+/g, '')
    .trim();
}

function extractAllImages(listing: Record<string, unknown>): string[] {
  const images: string[] = [];
  
  if (listing.image && typeof listing.image === 'object' && !Array.isArray(listing.image)) {
    const imageObj = listing.image as Record<string, unknown>;
    const sortedKeys = Object.keys(imageObj).sort((a, b) => parseInt(a) - parseInt(b));
    
    for (const key of sortedKeys) {
      const img = imageObj[key];
      if (img && typeof img === 'object') {
        const imgData = img as Record<string, unknown>;
        const url = imgData.url || imgData.largeImageURL || imgData.mediumImageURL || imgData.smallImageURL;
        if (url && typeof url === 'string') {
          images.push(url);
        }
      } else if (typeof img === 'string') {
        images.push(img);
      }
    }
  }
  
  if (listing.image && typeof listing.image === 'string') {
    images.push(listing.image);
  }
  
  if (listing.photos && Array.isArray(listing.photos)) {
    images.push(...(listing.photos as string[]));
  }
  
  if (listing.images && Array.isArray(listing.images)) {
    images.push(...(listing.images as string[]));
  }
  
  for (let i = 0; i <= 50; i++) {
    const imgKey = `image${i}`;
    const imgVal = listing[imgKey];
    if (imgVal && typeof imgVal === 'string' && !images.includes(imgVal)) {
      images.push(imgVal);
    }
  }
  
  const photoFields = ['photoURL', 'photo', 'mainPhoto', 'primaryPhoto', 'listingPhoto'];
  for (const field of photoFields) {
    if (listing[field] && typeof listing[field] === 'string' && !images.includes(listing[field] as string)) {
      images.push(listing[field] as string);
    }
  }
  
  return images.length > 0 ? images : ['/placeholder.svg'];
}

function extractFeatures(listing: Record<string, unknown>): string[] {
  if (listing.features && Array.isArray(listing.features)) {
    return listing.features as string[];
  }
  
  const features: string[] = [];
  
  if (listing.pool === 'Y' || listing.pool === 'Yes' || listing.pool === true) features.push('Pool');
  if (listing.spa === 'Y' || listing.spa === 'Yes') features.push('Spa');
  if (listing.fireplace === 'Y' || listing.fireplace === 'Yes') features.push('Fireplace');
  if (listing.waterfront === 'Y' || listing.waterfront === 'Yes') features.push('Waterfront');
  if (listing.garage) features.push(`${listing.garage} Car Garage`);
  if (listing.yearBuilt) features.push(`Built ${listing.yearBuilt}`);
  if (listing.acres && parseFloat(String(listing.acres)) > 0) features.push(`${listing.acres} Acres`);
  if (listing.stories) features.push(`${listing.stories} Stories`);
  if (listing.basement === 'Y' || listing.basement === 'Yes') features.push('Basement');
  if (listing.cooling) features.push(String(listing.cooling));
  if (listing.heating) features.push(String(listing.heating));
  
  return features;
}

function extractLifestyleTags(listing: Record<string, unknown>): string[] {
  const tags: string[] = ['luxury'];
  
  if (listing.waterfront === 'Y' || listing.waterfront === 'Yes') tags.push('waterfront');
  if (listing.pool === 'Y' || listing.pool === 'Yes') tags.push('pool');
  const price = parseFloat(String(listing.listingPrice || listing.price || 0));
  if (price > 5000000) tags.push('ultra-luxury');
  if (listing.golfCourse === 'Y' || listing.golfCourse === 'Yes') tags.push('golf');
  if (listing.view && String(listing.view).toLowerCase().includes('ocean')) tags.push('ocean-view');
  
  return tags;
}