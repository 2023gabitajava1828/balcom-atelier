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

    if (!REALTYCANDY_API_KEY || !REALTYCANDY_FEED_ID) {
      console.error('Missing RealtyCandy credentials');
      return new Response(
        JSON.stringify({ error: 'IDX credentials not configured', properties: [] }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const params: PropertySearchParams = await req.json();
    console.log('[IDX] Search params:', params);

    // Build query parameters
    const queryParams = new URLSearchParams();
    queryParams.append('api_key', REALTYCANDY_API_KEY);
    queryParams.append('outputtype', 'json');
    
    if (params.city) queryParams.append('city', params.city);
    if (params.region) queryParams.append('state', params.region);
    if (params.priceMin) queryParams.append('lp_min', params.priceMin.toString());
    if (params.priceMax) queryParams.append('lp_max', params.priceMax.toString());
    if (params.beds) queryParams.append('bd_min', params.beds.toString());
    if (params.baths) queryParams.append('ba_min', params.baths.toString());
    if (params.propertyType) queryParams.append('pt', params.propertyType);
    queryParams.append('limit', (params.limit || 20).toString());
    if (params.offset) queryParams.append('start', params.offset.toString());

    const apiUrl = `https://www.idxbroker.com/api/idx/listing?${queryParams.toString()}`;
    console.log('[IDX] Fetching from API...');

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'accesskey': REALTYCANDY_API_KEY,
      },
    });

    if (!response.ok) {
      console.error('[IDX] API error:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('[IDX] Error body:', errorText);
      
      return new Response(
        JSON.stringify({ error: `IDX API error: ${response.status}`, properties: [] }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('[IDX] Received', Array.isArray(data) ? data.length : 'object', 'results');

    // Map IDX Broker response to our property format
    const properties = (Array.isArray(data) ? data : []).map((listing: Record<string, unknown>) => ({
      id: (listing.listingID as string) || (listing.mlsID as string) || crypto.randomUUID(),
      title: (listing.address as string) || `${listing.streetNumber || ''} ${listing.streetName || ''}`,
      description: (listing.remarksConcat as string) || (listing.remarks as string) || '',
      price: parseFloat(String(listing.listPrice)) || 0,
      bedrooms: parseInt(String(listing.bedrooms)) || null,
      bathrooms: parseFloat(String(listing.totalBaths || listing.bathrooms)) || null,
      sqft: parseInt(String(listing.sqFt || listing.sqft)) || null,
      propertyType: (listing.propType as string) || (listing.propertyType as string) || 'house',
      address: `${listing.streetNumber || ''} ${listing.streetName || ''}, ${listing.cityName || listing.city || ''}`.trim(),
      city: (listing.cityName as string) || (listing.city as string) || 'Atlanta',
      region: (listing.state as string) || 'Georgia',
      country: 'USA',
      latitude: parseFloat(String(listing.latitude)) || null,
      longitude: parseFloat(String(listing.longitude)) || null,
      lifestyleTags: ['luxury'],
      images: listing.image ? [listing.image as string] : ((listing.photos as string[]) || ['/placeholder.svg']),
      features: (listing.features as string[]) || [],
      status: 'active',
      mlsNumber: (listing.mlsID as string) || (listing.listingID as string),
    }));

    console.log('[IDX] Mapped', properties.length, 'properties');

    return new Response(
      JSON.stringify({ properties, total: properties.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('[IDX] Error:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage, properties: [] }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
