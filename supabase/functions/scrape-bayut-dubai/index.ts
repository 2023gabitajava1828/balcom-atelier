import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Luxury areas in Dubai to target
const LUXURY_AREAS = [
  'palm-jumeirah',
  'emirates-hills',
  'dubai-hills-estate',
  'downtown-dubai',
  'dubai-marina',
  'jumeirah-beach-residence-jbr',
  'bluewaters-island',
  'dubai-creek-harbour',
  'jumeirah-golf-estates',
  'al-barari',
  'mohammed-bin-rashid-city',
  'difc'
];

const FIRECRAWL_API_KEY = Deno.env.get('FIRECRAWL_API_KEY');

async function scrapeListingPage(url: string): Promise<string[]> {
  console.log(`Scraping Bayut listing page: ${url}`);
  
  try {
    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
        formats: ['links'],
        waitFor: 3000,
      }),
    });

    if (!response.ok) {
      console.error(`Firecrawl scrape failed for ${url}: ${response.status}`);
      return [];
    }

    const data = await response.json();
    const links: string[] = data.data?.links || [];
    
    // Filter for property detail URLs
    const propertyUrls = links.filter(link => 
      link && link.includes('/property/details-') && link.endsWith('.html')
    );
    
    console.log(`Found ${propertyUrls.length} Bayut property URLs from ${url}`);
    return propertyUrls;
  } catch (error) {
    console.error(`Error scraping ${url}:`, error);
    return [];
  }
}

async function mapPropertyUrls(): Promise<string[]> {
  console.log('Mapping Bayut Dubai property URLs...');
  const allUrls: Set<string> = new Set();

  // Scrape luxury area pages with high price filter (5M+ AED)
  for (const area of LUXURY_AREAS) {
    const listingUrl = `https://www.bayut.com/for-sale/property/dubai/${area}/?price_min=5000000`;
    const urls = await scrapeListingPage(listingUrl);
    urls.forEach(url => allUrls.add(url));
    
    // Add a small delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Also try Firecrawl map API as backup
  console.log('Using Firecrawl map API for additional URLs...');
  try {
    const mapResponse = await fetch('https://api.firecrawl.dev/v1/map', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: 'https://www.bayut.com/for-sale/property/dubai/palm-jumeirah/',
        search: 'property details villa apartment penthouse',
        limit: 100,
      }),
    });

    if (mapResponse.ok) {
      const mapData = await mapResponse.json();
      const mappedLinks = mapData.links || [];
      mappedLinks.forEach((link: string) => {
        if (link && link.includes('/property/details-') && link.endsWith('.html')) {
          allUrls.add(link);
        }
      });
    }
  } catch (error) {
    console.error('Map API error:', error);
  }

  const uniqueUrls = Array.from(allUrls);
  console.log(`Found ${uniqueUrls.length} unique Bayut Dubai property URLs`);
  return uniqueUrls.slice(0, 100); // Limit to 100 properties
}

async function scrapePropertyDetails(url: string): Promise<any | null> {
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
        waitFor: 2000,
      }),
    });

    if (!response.ok) {
      console.error(`Failed to scrape ${url}: ${response.status}`);
      return null;
    }

    const data = await response.json();
    const markdown = data.data?.markdown || '';
    const html = data.data?.html || '';
    
    return parsePropertyData(markdown, html, url);
  } catch (error) {
    console.error(`Error scraping property ${url}:`, error);
    return null;
  }
}

function parsePropertyData(markdown: string, html: string, url: string): any | null {
  try {
    // Extract title - usually after price section
    const titleMatch = markdown.match(/##\s*([^\n]+)/);
    let title = titleMatch ? titleMatch[1].trim() : '';
    
    // Clean up title
    if (!title || title.length < 10) {
      const altTitleMatch = markdown.match(/(?:Villa|Apartment|Penthouse|Townhouse)[^\n]*/i);
      title = altTitleMatch ? altTitleMatch[0].trim() : 'Luxury Property in Dubai';
    }
    
    // Extract price in AED
    const priceMatch = markdown.match(/AED\s*([\d,]+(?:\.\d+)?)/i) || 
                       markdown.match(/([\d,]+)\s*AED/i) ||
                       html.match(/AED\s*([\d,]+)/i);
    let priceAED = 0;
    if (priceMatch) {
      priceAED = parseInt(priceMatch[1].replace(/,/g, ''));
    }
    
    // Convert AED to USD (1 AED ≈ 0.27 USD)
    const priceUSD = Math.round(priceAED * 0.27);
    
    // Filter out properties under $1M USD
    if (priceUSD < 1000000) {
      console.log(`Skipping property under $1M: ${priceUSD}`);
      return null;
    }
    
    // Extract bedrooms
    const bedsMatch = markdown.match(/(\d+)\s*(?:Bed|BR|Bedroom)/i) ||
                      html.match(/(\d+)\s*(?:Bed|BR)/i);
    const bedrooms = bedsMatch ? parseInt(bedsMatch[1]) : null;
    
    // Extract bathrooms
    const bathsMatch = markdown.match(/(\d+)\s*(?:Bath|BA|Bathroom)/i) ||
                       html.match(/(\d+)\s*(?:Bath|BA)/i);
    const bathrooms = bathsMatch ? parseInt(bathsMatch[1]) : null;
    
    // Extract sqft
    const sqftMatch = markdown.match(/([\d,]+)\s*(?:sqft|sq\.?\s*ft|square feet)/i) ||
                      html.match(/([\d,]+)\s*sqft/i);
    const sqft = sqftMatch ? parseInt(sqftMatch[1].replace(/,/g, '')) : null;
    
    // Extract location/area
    const locationMatch = markdown.match(/(?:###\s*)?([^,\n]+,\s*Dubai)/i) ||
                          markdown.match(/(Palm Jumeirah|Emirates Hills|Downtown Dubai|Dubai Marina|Dubai Hills|JBR|Bluewaters|Creek Harbour|DIFC|Al Barari|MBR City)[^\n]*/i);
    const address = locationMatch ? locationMatch[1].trim() : 'Dubai, UAE';
    
    // Extract description
    const descMatch = markdown.match(/(?:Description|About|Overview)[:\s]*\n([^\n]+(?:\n[^\n]+)*)/i);
    let description = descMatch ? descMatch[1].trim() : '';
    if (description.length > 2000) {
      description = description.substring(0, 2000) + '...';
    }
    
    // Extract images from HTML
    const imageMatches = html.matchAll(/src=["'](https:\/\/images\.bayut\.com\/[^"']+)["']/g);
    const images: string[] = [];
    for (const match of imageMatches) {
      if (!images.includes(match[1]) && !match[1].includes('thumbnail') && !match[1].includes('logo')) {
        images.push(match[1].replace(/-\d+x\d+\./, '-800x600.'));
      }
      if (images.length >= 10) break;
    }
    
    // Determine property type
    const propertyType = determinePropertyType(title + ' ' + description);
    
    // Extract features
    const features = extractFeatures(markdown);
    
    // Determine lifestyle tags
    const lifestyleTags = determineLifestyleTags(title, description, address);

    return {
      title: title.substring(0, 200),
      price: priceUSD,
      bedrooms,
      bathrooms,
      sqft,
      address,
      description,
      images,
      property_type: propertyType,
      features,
      lifestyle_tags: lifestyleTags,
      source_url: url,
    };
  } catch (error) {
    console.error('Error parsing property data:', error);
    return null;
  }
}

function determinePropertyType(text: string): string {
  const lowerText = text.toLowerCase();
  if (lowerText.includes('villa')) return 'Villa';
  if (lowerText.includes('penthouse')) return 'Penthouse';
  if (lowerText.includes('townhouse')) return 'Townhouse';
  if (lowerText.includes('duplex')) return 'Duplex';
  if (lowerText.includes('apartment') || lowerText.includes('flat')) return 'Apartment';
  if (lowerText.includes('mansion')) return 'Mansion';
  return 'Residential';
}

function extractFeatures(markdown: string): string[] {
  const features: string[] = [];
  const featureKeywords = [
    'private pool', 'pool', 'gym', 'parking', 'balcony', 'terrace',
    'sea view', 'marina view', 'city view', 'garden', 'maid room',
    'study', 'beach access', 'concierge', 'security', 'elevator',
    'smart home', 'furnished', 'unfurnished', 'high floor', 'corner unit'
  ];
  
  const lowerMarkdown = markdown.toLowerCase();
  for (const feature of featureKeywords) {
    if (lowerMarkdown.includes(feature)) {
      features.push(feature.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '));
    }
  }
  
  return features.slice(0, 15);
}

function determineLifestyleTags(title: string, description: string, address: string): string[] {
  const tags: string[] = [];
  const text = (title + ' ' + description + ' ' + address).toLowerCase();
  
  if (text.includes('beach') || text.includes('sea') || text.includes('palm') || text.includes('jbr')) {
    tags.push('Beachfront');
  }
  if (text.includes('golf')) tags.push('Golf');
  if (text.includes('marina')) tags.push('Waterfront');
  if (text.includes('downtown') || text.includes('difc')) tags.push('Urban');
  if (text.includes('hills') || text.includes('barari')) tags.push('Suburban');
  if (text.includes('view') || text.includes('panoramic')) tags.push('Views');
  
  if (tags.length === 0) tags.push('Luxury');
  
  return tags;
}

async function syncProperties(supabase: any, properties: any[]): Promise<{ inserted: number; updated: number }> {
  let inserted = 0;
  let updated = 0;

  for (const property of properties) {
    try {
      // Check if property exists by title and city
      const { data: existing } = await supabase
        .from('properties')
        .select('id')
        .eq('title', property.title)
        .eq('city', 'Dubai')
        .single();

      const propertyData = {
        title: property.title,
        price: property.price,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        sqft: property.sqft,
        address: property.address,
        description: property.description,
        images: property.images,
        property_type: property.property_type,
        features: property.features,
        lifestyle_tags: property.lifestyle_tags,
        city: 'Dubai',
        country: 'UAE',
        region: 'Middle East',
        status: 'active',
        updated_at: new Date().toISOString(),
      };

      if (existing) {
        await supabase
          .from('properties')
          .update(propertyData)
          .eq('id', existing.id);
        updated++;
      } else {
        await supabase
          .from('properties')
          .insert({
            ...propertyData,
            created_at: new Date().toISOString(),
          });
        inserted++;
      }
    } catch (error) {
      console.error(`Error syncing property ${property.title}:`, error);
    }
  }

  return { inserted, updated };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action = 'sync' } = await req.json().catch(() => ({}));
    console.log(`Starting Bayut Dubai scraper, action: ${action}`);

    if (!FIRECRAWL_API_KEY) {
      throw new Error('FIRECRAWL_API_KEY not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Step 1: Map property URLs
    const propertyUrls = await mapPropertyUrls();
    console.log(`Scraping ${propertyUrls.length} Bayut properties...`);

    // Step 2: Scrape each property
    const properties: any[] = [];
    for (const url of propertyUrls) {
      const property = await scrapePropertyDetails(url);
      if (property) {
        properties.push(property);
        console.log(`Scraped: ${property.title} - $${property.price.toLocaleString()}`);
      }
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    console.log(`Scraped ${properties.length} valid Bayut properties`);

    // Step 3: Sync to database
    const { inserted, updated } = await syncProperties(supabase, properties);

    return new Response(
      JSON.stringify({
        success: true,
        source: 'Bayut',
        urlsFound: propertyUrls.length,
        propertiesScraped: properties.length,
        inserted,
        updated,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Bayut scraper error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
