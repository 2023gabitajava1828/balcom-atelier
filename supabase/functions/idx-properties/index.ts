import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const REALTYCANDY_API_KEY = Deno.env.get('REALTYCANDY_API_KEY');
    const REALTYCANDY_FEED_ID = Deno.env.get('REALTYCANDY_FEED_ID');

    if (!REALTYCANDY_API_KEY) {
      console.error('Missing RealtyCandy/IDX Broker API key');
      return new Response(
        JSON.stringify({ error: 'IDX credentials not configured', properties: [] }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const params: PropertySearchParams = await req.json();
    console.log('[IDX] Search params:', params);

    // Build query parameters for filtering
    const queryParams = new URLSearchParams();
    if (params.city) queryParams.append('cityName', params.city);
    if (params.region) queryParams.append('state', params.region);
    if (params.priceMin) queryParams.append('minPrice', params.priceMin.toString());
    if (params.priceMax) queryParams.append('maxPrice', params.priceMax.toString());
    if (params.beds) queryParams.append('minBeds', params.beds.toString());
    if (params.baths) queryParams.append('minBaths', params.baths.toString());
    
    // IDX Broker API endpoints - try featured first, then search
    // API URL structure: https://api.idxbroker.com/{component}/{method}
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    const apiUrl = `https://api.idxbroker.com/clients/featured${queryString}`;
    
    console.log('[IDX] Fetching from:', apiUrl);

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'accesskey': REALTYCANDY_API_KEY,
        'outputtype': 'json',
      },
    });

    console.log('[IDX] Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[IDX] API error:', response.status, errorText.substring(0, 500));
      
      // If featured fails, try the listings endpoint
      if (response.status === 404 || response.status === 403) {
        console.log('[IDX] Trying alternative endpoint: clients/listing');
        const altResponse = await fetch(`https://api.idxbroker.com/clients/listing${queryString}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'accesskey': REALTYCANDY_API_KEY,
            'outputtype': 'json',
          },
        });
        
        if (altResponse.ok) {
          const altData = await altResponse.json();
          console.log('[IDX] Alt endpoint success, received:', typeof altData);
          return processResponse(altData, corsHeaders);
        }
      }
      
      return new Response(
        JSON.stringify({ error: `IDX API error: ${response.status}`, properties: [] }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('[IDX] Received data type:', typeof data, Array.isArray(data) ? `array[${data.length}]` : 'object');
    
    return processResponse(data, corsHeaders);

  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('[IDX] Error:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage, properties: [] }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function processResponse(data: unknown, corsHeaders: Record<string, string>) {
  // IDX Broker returns data in different formats depending on the endpoint
  let listings: Record<string, unknown>[] = [];
  
  if (Array.isArray(data)) {
    listings = data;
  } else if (data && typeof data === 'object') {
    // Sometimes it's an object with numeric keys or property keys
    const dataObj = data as Record<string, unknown>;
    if (dataObj.data && Array.isArray(dataObj.data)) {
      listings = dataObj.data as Record<string, unknown>[];
    } else {
      // Try to extract listings from object format
      listings = Object.values(dataObj).filter(
        item => item && typeof item === 'object' && !Array.isArray(item)
      ) as Record<string, unknown>[];
    }
  }
  
  console.log('[IDX] Processing', listings.length, 'listings');

  // Map IDX Broker response to our property format
  const properties = listings.map((listing) => ({
    id: String(listing.listingID || listing.mlsID || listing.idxID || crypto.randomUUID()),
    title: String(listing.address || `${listing.streetNumber || ''} ${listing.streetName || ''}`.trim() || 'Luxury Property'),
    description: String(listing.remarksConcat || listing.remarks || listing.description || ''),
    price: parseFloat(String(listing.listingPrice || listing.price || listing.listPrice || 0)),
    bedrooms: parseInt(String(listing.bedrooms || listing.beds || 0)) || null,
    bathrooms: parseFloat(String(listing.totalBaths || listing.bathrooms || listing.baths || 0)) || null,
    sqft: parseInt(String(listing.sqFt || listing.squareFeet || listing.sqft || 0)) || null,
    propertyType: String(listing.propType || listing.propertyType || listing.type || 'house'),
    address: `${listing.streetNumber || ''} ${listing.streetName || ''}, ${listing.cityName || listing.city || ''}`.trim() || String(listing.address || ''),
    city: String(listing.cityName || listing.city || 'Atlanta'),
    region: String(listing.state || listing.stateProvince || 'Georgia'),
    country: 'USA',
    latitude: parseFloat(String(listing.latitude || listing.lat)) || null,
    longitude: parseFloat(String(listing.longitude || listing.lng)) || null,
    lifestyleTags: ['luxury'],
    images: extractImages(listing),
    features: extractFeatures(listing),
    status: 'active',
    mlsNumber: String(listing.listingID || listing.mlsID || ''),
  }));

  console.log('[IDX] Mapped', properties.length, 'properties');

  return new Response(
    JSON.stringify({ properties, total: properties.length }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

function extractImages(listing: Record<string, unknown>): string[] {
  if (listing.image && typeof listing.image === 'string') {
    return [listing.image];
  }
  if (listing.photos && Array.isArray(listing.photos)) {
    return listing.photos as string[];
  }
  if (listing.images && Array.isArray(listing.images)) {
    return listing.images as string[];
  }
  // Check for numbered image fields (image0, image1, etc.)
  const images: string[] = [];
  for (let i = 0; i <= 25; i++) {
    const imgKey = `image${i}` as keyof typeof listing;
    if (listing[imgKey] && typeof listing[imgKey] === 'string') {
      images.push(listing[imgKey] as string);
    }
  }
  return images.length > 0 ? images : ['/placeholder.svg'];
}

function extractFeatures(listing: Record<string, unknown>): string[] {
  if (listing.features && Array.isArray(listing.features)) {
    return listing.features as string[];
  }
  // Build features from common fields
  const features: string[] = [];
  if (listing.pool === 'Y' || listing.pool === 'Yes') features.push('Pool');
  if (listing.garage) features.push(`${listing.garage} Car Garage`);
  if (listing.yearBuilt) features.push(`Built ${listing.yearBuilt}`);
  if (listing.acres) features.push(`${listing.acres} Acres`);
  return features;
}
