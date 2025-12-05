import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const FIRECRAWL_API_KEY = Deno.env.get('FIRECRAWL_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

interface PropertyData {
  title: string;
  description: string;
  price: number;
  bedrooms: number | null;
  bathrooms: number | null;
  sqft: number | null;
  property_type: string;
  address: string;
  city: string;
  country: string;
  region: string;
  images: string[];
  features: string[];
  lifestyle_tags: string[];
  status: string;
}

// Convert AED to USD
const AED_TO_USD_RATE = 0.27;

function parsePrice(priceStr: string): number {
  const cleaned = priceStr.replace(/AED|USD|,|\s|[$]/gi, '').trim();
  const numMatch = cleaned.match(/^(\d+)/);
  const numericValue = numMatch ? parseFloat(numMatch[1]) : 0;
  if (isNaN(numericValue) || numericValue === 0) return 0;
  
  // If price is in AED (usually > 1 million), convert to USD
  if (numericValue > 100000 && priceStr.toLowerCase().includes('aed')) {
    return Math.round(numericValue * AED_TO_USD_RATE);
  }
  return numericValue;
}

function extractPropertyType(title: string, description: string): string {
  const text = `${title} ${description}`.toLowerCase();
  if (text.includes('villa')) return 'villa';
  if (text.includes('penthouse')) return 'penthouse';
  if (text.includes('apartment')) return 'apartment';
  if (text.includes('townhouse')) return 'townhouse';
  if (text.includes('mansion')) return 'mansion';
  if (text.includes('duplex')) return 'duplex';
  return 'house';
}

function extractLifestyleTags(features: string[], description: string): string[] {
  const tags: string[] = [];
  const text = `${features.join(' ')} ${description}`.toLowerCase();
  
  if (text.includes('pool') || text.includes('swimming')) tags.push('Pool');
  if (text.includes('beach') || text.includes('waterfront') || text.includes('sea view')) tags.push('Waterfront');
  if (text.includes('golf')) tags.push('Golf');
  if (text.includes('gym') || text.includes('fitness')) tags.push('Fitness');
  if (text.includes('spa')) tags.push('Spa');
  if (text.includes('garden')) tags.push('Garden');
  if (text.includes('marina')) tags.push('Marina');
  if (text.includes('skyline') || text.includes('city view')) tags.push('City Views');
  if (text.includes('palm')) tags.push('Palm Jumeirah');
  if (text.includes('downtown')) tags.push('Downtown');
  if (text.includes('burj')) tags.push('Burj View');
  
  return tags.length > 0 ? tags : ['Luxury'];
}

// Scrape Christie's listing pages
async function scrapeListingPage(pageUrl: string): Promise<string[]> {
  console.log(`Scraping Christie's listing page: ${pageUrl}`);
  
  try {
    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: pageUrl,
        formats: ['html', 'links'],
        waitFor: 3000,
      }),
    });

    if (!response.ok) {
      console.error(`Failed to scrape listing page: ${pageUrl}`);
      return [];
    }

    const data = await response.json();
    const links = data.data?.links || [];
    const html = data.data?.html || '';
    
    // Extract property URLs from links - Christie's format
    const propertyUrls = links.filter((url: string) => 
      (url.includes('/property/') || url.includes('/listing/')) && 
      (url.includes('dubai') || url.includes('uae'))
    );
    
    // Also extract from HTML
    const hrefMatches = html.matchAll(/href=["']([^"']*(?:property|listing)[^"']*dubai[^"']*)["']/gi);
    for (const match of hrefMatches) {
      let fullUrl = match[1];
      if (fullUrl.startsWith('/')) {
        fullUrl = `https://www.christiesrealestate.com${fullUrl}`;
      }
      if (!propertyUrls.includes(fullUrl)) {
        propertyUrls.push(fullUrl);
      }
    }
    
    console.log(`Found ${propertyUrls.length} Christie's property URLs from ${pageUrl}`);
    return propertyUrls;
  } catch (error) {
    console.error(`Error scraping Christie's listing page ${pageUrl}:`, error);
    return [];
  }
}

async function mapPropertyUrls(): Promise<string[]> {
  console.log('Mapping Christie\'s Dubai property URLs...');
  
  const allPropertyUrls: Set<string> = new Set();
  
  // Christie's Dubai listing pages
  const listingPages = [
    'https://www.christiesrealestate.com/dubai/sales',
    'https://www.christiesrealestate.com/dubai/sales?page=2',
    'https://www.christiesrealestate.com/dubai/sales?page=3',
    'https://www.christiesrealestate.com/uae/sales',
    'https://www.christiesrealestate.com/sales/location/united-arab-emirates',
    'https://www.christiesrealestate.com/sales/location/dubai',
  ];
  
  for (const pageUrl of listingPages) {
    const urls = await scrapeListingPage(pageUrl);
    urls.forEach(url => allPropertyUrls.add(url));
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (allPropertyUrls.size >= 100) break;
  }
  
  // Also try Firecrawl map API
  console.log('Using Firecrawl map API for Christie\'s...');
  try {
    const mapResponse = await fetch('https://api.firecrawl.dev/v1/map', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: 'https://www.christiesrealestate.com/dubai',
        search: 'property listing sale',
        limit: 300,
      }),
    });

    if (mapResponse.ok) {
      const mapData = await mapResponse.json();
      const mapUrls = (mapData.links || []).filter((url: string) => 
        url.includes('/property/') || url.includes('/listing/')
      );
      mapUrls.forEach((url: string) => allPropertyUrls.add(url));
    }
  } catch (error) {
    console.error('Christie\'s map API error:', error);
  }
  
  const uniqueUrls = Array.from(allPropertyUrls);
  console.log(`Found ${uniqueUrls.length} unique Christie's Dubai property URLs`);
  return uniqueUrls.slice(0, 100);
}

async function scrapePropertyPage(url: string): Promise<PropertyData | null> {
  console.log(`Scraping Christie's property: ${url}`);
  
  try {
    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
        formats: ['markdown', 'html'],
        onlyMainContent: true,
        waitFor: 3000,
      }),
    });

    if (!response.ok) {
      console.error(`Scrape error for ${url}`);
      return null;
    }

    const data = await response.json();
    const markdown = data.data?.markdown || '';
    const html = data.data?.html || '';
    const metadata = data.data?.metadata || {};
    
    console.log(`Scraped ${url}, markdown length: ${markdown.length}`);

    // Extract title
    let title = metadata.title?.replace(/\s*\|\s*Christie.*$/i, '').trim() || '';
    if (!title) {
      const h1Match = markdown.match(/^#\s+(.+)/m);
      title = h1Match ? h1Match[1].trim() : 'Luxury Property in Dubai';
    }

    // Extract price
    let price = 0;
    const priceMatch = markdown.match(/(?:AED|USD|Price)[:\s]*([\d,]+)/i) || 
                       html.match(/price[^>]*>[\s]*(?:AED|USD)?[\s]*([\d,]+)/i);
    if (priceMatch) {
      price = parsePrice(priceMatch[1]);
    }

    // Extract bedrooms
    const bedsMatch = markdown.match(/(\d+)\s*(?:bed|bedroom)/i);
    const bedrooms = bedsMatch ? parseInt(bedsMatch[1]) : null;

    // Extract bathrooms
    const bathsMatch = markdown.match(/(\d+)\s*(?:bath|bathroom)/i);
    const bathrooms = bathsMatch ? parseInt(bathsMatch[1]) : null;

    // Extract sqft
    const sqftMatch = markdown.match(/([\d,]+)\s*(?:sq\.?\s*ft|sqft|square\s*feet)/i);
    const sqft = sqftMatch ? parseInt(sqftMatch[1].replace(/,/g, '')) : null;

    // Extract location/address
    let address = 'Dubai, UAE';
    const locationMatch = markdown.match(/(?:location|address)[:\s]*([^\n]+)/i);
    if (locationMatch) {
      address = locationMatch[1].trim();
    }

    // Extract description
    let description = '';
    const descMatch = markdown.match(/(?:description|overview|about)[:\s]*\n(.+(?:\n.+)*)/i);
    if (descMatch) {
      description = descMatch[1].trim().slice(0, 800);
    }
    if (!description) {
      description = `Luxury property in Dubai, UAE. ${bedrooms ? `${bedrooms} bedrooms, ` : ''}${bathrooms ? `${bathrooms} bathrooms. ` : ''}Listed through Christie's International Real Estate.`;
    }

    // Extract images
    const images: string[] = [];
    const imgMatches = html.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi);
    for (const match of imgMatches) {
      const src = match[1];
      if (src && src.startsWith('http') && !src.includes('logo') && !src.includes('icon')) {
        if (!images.includes(src) && images.length < 20) {
          images.push(src);
        }
      }
    }

    // OG image
    const ogMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
    if (ogMatch && ogMatch[1] && !images.includes(ogMatch[1])) {
      images.unshift(ogMatch[1]);
    }

    const propertyType = extractPropertyType(title, description);
    const lifestyleTags = extractLifestyleTags([], description);

    if (!title || price === 0) {
      console.log(`Skipping ${url} - missing title or price`);
      return null;
    }

    // Add Christie's identifier to title if not present
    if (!title.toLowerCase().includes('christie')) {
      title = `${title} (Christie's)`;
    }

    return {
      title,
      description,
      price,
      bedrooms,
      bathrooms,
      sqft,
      property_type: propertyType,
      address,
      city: 'Dubai',
      country: 'UAE',
      region: 'Middle East',
      images: images.slice(0, 20),
      features: [],
      lifestyle_tags: lifestyleTags,
      status: 'active',
    };
  } catch (error) {
    console.error(`Error scraping ${url}:`, error);
    return null;
  }
}

async function syncToDatabase(properties: PropertyData[]): Promise<{ inserted: number; updated: number }> {
  const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
  
  let inserted = 0;
  let updated = 0;

  for (const property of properties) {
    const { data: existing } = await supabase
      .from('properties')
      .select('id')
      .eq('title', property.title)
      .eq('city', 'Dubai')
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from('properties')
        .update({ ...property, updated_at: new Date().toISOString() })
        .eq('id', existing.id);

      if (!error) updated++;
      else console.error('Update error:', error);
    } else {
      const { error } = await supabase
        .from('properties')
        .insert(property);

      if (!error) inserted++;
      else console.error('Insert error:', error);
    }
  }

  return { inserted, updated };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action = 'sync' } = await req.json().catch(() => ({}));
    
    console.log(`Starting Christie's Dubai scraper, action: ${action}`);

    if (!FIRECRAWL_API_KEY) {
      throw new Error('FIRECRAWL_API_KEY not configured');
    }

    if (action === 'map') {
      const urls = await mapPropertyUrls();
      return new Response(JSON.stringify({ success: true, urls, count: urls.length }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'sync') {
      const urls = await mapPropertyUrls();
      console.log(`Scraping ${urls.length} Christie's properties...`);
      
      const properties: PropertyData[] = [];
      
      for (let i = 0; i < urls.length; i++) {
        const property = await scrapePropertyPage(urls[i]);
        if (property) {
          properties.push(property);
        }
        if (i < urls.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1500));
        }
      }

      console.log(`Scraped ${properties.length} valid Christie's properties`);

      const result = await syncToDatabase(properties);
      
      return new Response(JSON.stringify({
        success: true,
        source: "Christie's Dubai",
        scraped: properties.length,
        inserted: result.inserted,
        updated: result.updated,
        totalUrls: urls.length,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Christie\'s scraper error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ success: false, error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
