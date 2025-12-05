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

// Convert AED to USD (approximate rate)
const AED_TO_USD_RATE = 0.27;

function parsePrice(priceStr: string): number {
  // Remove "AED", commas, spaces
  const cleaned = priceStr.replace(/AED|,|\s/gi, '').trim();
  // Extract just numbers (handle concatenated format like "296,000,0007Beds")
  const numMatch = cleaned.match(/^(\d+)/);
  const numericValue = numMatch ? parseFloat(numMatch[1]) : 0;
  if (isNaN(numericValue) || numericValue === 0) return 0;
  // Convert to USD
  return Math.round(numericValue * AED_TO_USD_RATE);
}

function extractPriceFromContent(markdown: string, html: string): number {
  // Try multiple patterns for price extraction
  
  // Pattern 1: Look for price in HTML span (most reliable)
  const htmlPriceMatch = html.match(/font-medium text-sm[^>]*>(\d{1,3}(?:,\d{3})+)<\/span>/i);
  if (htmlPriceMatch) {
    return parsePrice(htmlPriceMatch[1]);
  }
  
  // Pattern 2: Look for concatenated format like "296,000,0007Beds"
  const concatMatch = markdown.match(/([\d,]+)\d*Beds/i) || html.match(/([\d,]+)\d*<!-- -->Beds/i);
  if (concatMatch) {
    // The price is everything before the last digit that connects to "Beds"
    const priceStr = concatMatch[1].replace(/\d$/, ''); // Remove last digit if it's the beds count
    if (priceStr.length > 3) {
      return parsePrice(priceStr);
    }
  }
  
  // Pattern 3: Standard AED format
  const aedMatch = markdown.match(/AED\s*([\d,]+)/i) || html.match(/AED[^\d]*([\d,]+)/i);
  if (aedMatch) {
    return parsePrice(aedMatch[1]);
  }
  
  // Pattern 4: Large number followed by beds/baths (Sotheby's specific)
  const largeNumMatch = markdown.match(/([\d,]{8,})\d*(?:Bed|Bath)/i);
  if (largeNumMatch) {
    return parsePrice(largeNumMatch[1]);
  }
  
  return 0;
}

function parseNumber(str: string | null | undefined): number | null {
  if (!str) return null;
  const num = parseFloat(str.replace(/,/g, ''));
  return isNaN(num) ? null : num;
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

async function mapPropertyUrls(): Promise<string[]> {
  console.log('Mapping property URLs from sothebysrealty.ae...');
  
  const response = await fetch('https://api.firecrawl.dev/v1/map', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url: 'https://sothebysrealty.ae',
      search: '/properties/',
      limit: 200,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Firecrawl map error:', error);
    throw new Error(`Failed to map URLs: ${error}`);
  }

  const data = await response.json();
  console.log('Map response:', JSON.stringify(data).slice(0, 500));
  
  // Filter to only property detail pages
  const propertyUrls = (data.links || []).filter((url: string) => 
    url.includes('/properties/buy/') && 
    !url.endsWith('/buy/') &&
    !url.includes('?') &&
    url.split('/').length > 5
  );
  
  console.log(`Found ${propertyUrls.length} property URLs`);
  return propertyUrls.slice(0, 50); // Limit to 50 for initial sync
}

async function scrapePropertyPage(url: string): Promise<PropertyData | null> {
  console.log(`Scraping: ${url}`);
  
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
      const error = await response.text();
      console.error(`Scrape error for ${url}:`, error);
      return null;
    }

    const data = await response.json();
    const markdown = data.data?.markdown || '';
    const html = data.data?.html || '';
    const metadata = data.data?.metadata || {};
    
    console.log(`Scraped ${url}, markdown length: ${markdown.length}`);

    // Extract property type and location from URL
    // Format: /properties/buy/villa-for-sale-dubai-palm-jumeirah-xxii-carat-49522
    const urlParts = url.split('/').pop()?.split('-') || [];
    const propertyTypeFromUrl = urlParts[0] || 'property'; // villa, apartment, penthouse, etc.
    
    // Find location from the first line (usually "Palm Jumeirah, Dubai")
    const firstLine = markdown.split('\n').find((l: string) => l.trim() && !l.startsWith('!') && !l.startsWith('['));
    const locationFromContent = firstLine?.trim() || '';
    
    // Build title from location and property type
    let title = '';
    if (locationFromContent && locationFromContent.includes(',')) {
      const [area] = locationFromContent.split(',').map((s: string) => s.trim());
      title = `${propertyTypeFromUrl.charAt(0).toUpperCase() + propertyTypeFromUrl.slice(1)} in ${area}`;
    } else {
      title = metadata.title?.replace(/\s*\|\s*Sotheby.*$/i, '').trim() || `Luxury ${propertyTypeFromUrl} in Dubai`;
    }

    // Extract price using the improved function
    const price = extractPriceFromContent(markdown, html);
    console.log(`Extracted price: ${price} USD from ${url}`);

    // Extract bedrooms - look for pattern like "7Beds" or "7 Beds"
    const bedsMatch = markdown.match(/(\d+)\s*Beds?/i) || html.match(/>(\d+)<!-- -->.*Beds/i);
    const bedrooms = bedsMatch ? parseInt(bedsMatch[1]) : null;

    // Extract bathrooms  
    const bathsMatch = markdown.match(/(\d+)\s*Baths?/i) || html.match(/>(\d+)<!-- -->.*Baths/i);
    const bathrooms = bathsMatch ? parseInt(bathsMatch[1]) : null;

    // Extract sqft
    const sqftMatch = markdown.match(/([\d,]+)\s*SQ\.?\s*FT/i);
    const sqft = sqftMatch ? parseNumber(sqftMatch[1].replace(/,/g, '')) : null;

    // Use location from content or URL
    let address = locationFromContent || '';
    if (!address) {
      // Try to construct from URL parts
      const locationParts = urlParts.slice(4, -1); // Skip property type and ID
      address = locationParts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
    }

    // Determine city from URL or content
    let city = 'Dubai';
    if (url.includes('-london-') || locationFromContent.toLowerCase().includes('london')) {
      city = 'London';
    } else if (url.includes('-dubai-') || locationFromContent.toLowerCase().includes('dubai')) {
      city = 'Dubai';
    }

    // Skip non-Dubai properties for this sync
    if (city !== 'Dubai') {
      console.log(`Skipping non-Dubai property: ${url}`);
      return null;
    }

    // Extract description
    const descMatch = markdown.match(/(?:Description|About|Overview)[:\s]*\n(.+(?:\n.+)*)/i);
    let description = descMatch ? descMatch[1].trim() : '';
    if (!description) {
      // Take first paragraph from markdown lines
      const lines = markdown.split('\n').filter((l: string) => l.trim());
      description = lines.find((l: string) => l.length > 100) || `Luxury property in Dubai, UAE.`;
    }
    description = description.slice(0, 1000);

    // Extract images from HTML - Sotheby's uses S3 for images
    const images: string[] = [];
    
    // Pattern 1: S3 image URLs (most reliable for Sotheby's)
    const s3Matches = html.matchAll(/https:\/\/my-dubai-real-estate\.s3[^"'\s]+\.(?:jpg|jpeg|png|webp)/gi);
    for (const match of s3Matches) {
      if (!images.includes(match[0])) {
        images.push(match[0]);
      }
    }
    
    // Pattern 2: CDN image URLs with original S3 source
    const cdnMatches = html.matchAll(/https:\/\/sothebysrealty\.ae\/cdn-cgi\/image[^"']+/gi);
    for (const match of cdnMatches) {
      if (!images.includes(match[0]) && images.length < 30) {
        images.push(match[0]);
      }
    }
    
    // Pattern 3: Standard img src
    const imgMatches = html.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi);
    for (const match of imgMatches) {
      const src = match[1];
      if (src && !images.includes(src) && images.length < 30) {
        if ((src.includes('s3') || src.includes('cdn') || src.includes('listing')) && 
            !src.includes('logo') && !src.includes('icon') && !src.includes('avatar') && !src.includes('svg')) {
          if (src.startsWith('http')) {
            images.push(src);
          }
        }
      }
    }

    // Also try og:image
    const ogImageMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
    if (ogImageMatch && ogImageMatch[1] && !images.includes(ogImageMatch[1])) {
      images.unshift(ogImageMatch[1]);
    }

    // Extract features/amenities
    const features: string[] = [];
    const amenityMatches = markdown.match(/(?:Amenities|Features|Highlights)[:\s]*\n((?:[-•]\s*.+\n?)+)/i);
    if (amenityMatches) {
      const amenityLines = amenityMatches[1].split('\n');
      for (const line of amenityLines) {
        const cleaned = line.replace(/^[-•]\s*/, '').trim();
        if (cleaned) features.push(cleaned);
      }
    }

    const propertyType = extractPropertyType(title, description);
    const lifestyleTags = extractLifestyleTags(features, description);

    // Only return if we have meaningful data
    if (!title || price === 0) {
      console.log(`Skipping ${url} - missing title or price`);
      return null;
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
      features,
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
    // Check if property exists (by title + city + price combo)
    const { data: existing } = await supabase
      .from('properties')
      .select('id')
      .eq('title', property.title)
      .eq('city', 'Dubai')
      .maybeSingle();

    if (existing) {
      // Update existing
      const { error } = await supabase
        .from('properties')
        .update({
          ...property,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);

      if (error) {
        console.error('Update error:', error);
      } else {
        updated++;
      }
    } else {
      // Insert new
      const { error } = await supabase
        .from('properties')
        .insert(property);

      if (error) {
        console.error('Insert error:', error);
      } else {
        inserted++;
      }
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
    
    console.log(`Starting Sotheby's Dubai scraper, action: ${action}`);

    if (!FIRECRAWL_API_KEY) {
      throw new Error('FIRECRAWL_API_KEY not configured');
    }

    if (action === 'map') {
      // Just map URLs without scraping
      const urls = await mapPropertyUrls();
      return new Response(JSON.stringify({ 
        success: true, 
        urls,
        count: urls.length 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'sync') {
      // Full sync: map URLs, scrape properties, save to DB
      const urls = await mapPropertyUrls();
      console.log(`Scraping ${urls.length} properties...`);
      
      const properties: PropertyData[] = [];
      
      // Scrape in batches to avoid rate limits
      for (let i = 0; i < urls.length; i++) {
        const property = await scrapePropertyPage(urls[i]);
        if (property) {
          properties.push(property);
        }
        
        // Small delay between requests
        if (i < urls.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      console.log(`Scraped ${properties.length} valid properties`);

      // Sync to database
      const result = await syncToDatabase(properties);
      
      return new Response(JSON.stringify({
        success: true,
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
    console.error('Scraper error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ 
      success: false, 
      error: errorMessage 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
