import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const FIRECRAWL_API_KEY = Deno.env.get('FIRECRAWL_API_KEY');

// Sotheby's Buy Now categories to scrape
const CATEGORIES = [
  { url: 'https://www.sothebys.com/en/buy/luxury/jewelry', category: 'Jewelry', type: 'shopping' },
  { url: 'https://www.sothebys.com/en/buy/luxury/watches/watch', category: 'Watches', type: 'shopping' },
  { url: 'https://www.sothebys.com/en/buy/fashion/handbag', category: 'Fashion', type: 'shopping' },
  { url: 'https://www.sothebys.com/en/buy/fine-art', category: 'Art', type: 'shopping' },
  { url: 'https://www.sothebys.com/en/buy/luxury/wine-&-spirits', category: 'Wine', type: 'shopping' },
  { url: 'https://www.sothebys.com/en/buy/interiors', category: 'Collectibles', type: 'shopping' },
];

interface ItemDetails {
  description: string;
  images: string[];
  dimensions: string | null;
  materials: string | null;
  condition: string | null;
  signature: string | null;
  edition: string | null;
  year: string | null;
  provenance: string | null;
}

interface ScrapedItem {
  title: string;
  brand: string | null;
  price: number | null;
  image: string | null;
  url: string;
  category: string;
  type: string;
  details?: ItemDetails;
}

async function scrapeCategoryPage(categoryUrl: string, category: string, type: string): Promise<ScrapedItem[]> {
  console.log(`Scraping ${category} from: ${categoryUrl}`);
  
  try {
    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: categoryUrl,
        formats: ['markdown', 'html'],
        waitFor: 3000,
      }),
    });

    if (!response.ok) {
      console.error(`Firecrawl failed for ${categoryUrl}: ${response.status}`);
      return [];
    }

    const data = await response.json();
    const markdown = data.data?.markdown || '';
    const html = data.data?.html || '';
    
    return parseItems(markdown, html, category, type);
  } catch (error) {
    console.error(`Error scraping ${categoryUrl}:`, error);
    return [];
  }
}

function parseItems(markdown: string, html: string, category: string, type: string): ScrapedItem[] {
  const items: ScrapedItem[] = [];
  
  // Pattern for items with brand
  const withBrandPattern = /!\[\]\((https:\/\/dam\.sothebys\.com\/[^)]+)\)[^\n]*\n[^\n]*\n\*\*([^*]+)\*\*[^\n]*\n[^\n]*\n([^\n]+?)[^\n]*\n[^\n]*\n([\d,]+)\s*USD[^\n]*\n[^\n]*\n[^\]]*Buy Now\]\((https:\/\/www\.sothebys\.com\/en\/buy\/pdp[^)]+)\)/g;
  
  let match;
  while ((match = withBrandPattern.exec(markdown)) !== null) {
    const imageUrl = match[1];
    const brand = match[2].trim();
    const title = match[3].trim();
    const priceStr = match[4].replace(/,/g, '');
    const url = match[5];
    
    items.push({
      title,
      brand,
      price: parseInt(priceStr) || null,
      image: imageUrl,
      url,
      category,
      type,
    });
  }
  
  // Pattern for items without brand
  const noBrandPattern = /!\[\]\((https:\/\/dam\.sothebys\.com\/[^)]+)\)[^\n]*\n[^\n]*\n([^*\n][^\n]+?)[^\n]*\n[^\n]*\n([\d,]+)\s*USD[^\n]*\n[^\n]*\n[^\]]*Buy Now\]\((https:\/\/www\.sothebys\.com\/en\/buy\/pdp[^)]+)\)/g;
  
  while ((match = noBrandPattern.exec(markdown)) !== null) {
    const imageUrl = match[1];
    const title = match[2].trim();
    const priceStr = match[3].replace(/,/g, '');
    const url = match[4];
    
    if (!items.find(i => i.url === url)) {
      items.push({
        title,
        brand: null,
        price: parseInt(priceStr) || null,
        image: imageUrl,
        url,
        category,
        type,
      });
    }
  }
  
  // Simpler fallback
  if (items.length === 0) {
    const simplePattern = /(https:\/\/dam\.sothebys\.com\/dam\/image\/Item\/[^/]+\/primary\/medium)[\s\S]*?([\d,]+)\s*USD[\s\S]*?Buy Now\]\((https:\/\/www\.sothebys\.com\/en\/buy\/pdp[^)]+)\)/g;
    
    while ((match = simplePattern.exec(markdown)) !== null) {
      const imageUrl = match[1];
      const priceStr = match[2].replace(/,/g, '');
      const url = match[3];
      
      const urlParts = url.split('/');
      const slug = urlParts[urlParts.length - 1] || '';
      const title = slug.replace(/_/g, ' ').replace(/-/g, ' ').replace(/^\s+|\s+$/g, '');
      
      if (!items.find(i => i.url === url) && title) {
        items.push({
          title: title.substring(0, 200),
          brand: null,
          price: parseInt(priceStr) || null,
          image: imageUrl,
          url,
          category,
          type,
        });
      }
    }
  }
  
  console.log(`Parsed ${items.length} items from ${category}`);
  return items;
}

async function scrapeItemDetails(url: string): Promise<ItemDetails | null> {
  console.log(`Scraping details from: ${url}`);
  
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
      console.error(`Firecrawl failed for details ${url}: ${response.status}`);
      return null;
    }

    const data = await response.json();
    const markdown = data.data?.markdown || '';
    const html = data.data?.html || '';
    
    // Extract description - look for various patterns
    let description = '';
    const descPatterns = [
      /(?:^|\n)(?:Description|About this item|About|Details)\s*\n+([\s\S]*?)(?=\n(?:Dimensions|Materials|Condition|Signature|Provenance|Specifications|\*\*|$))/i,
      /(?:^|\n)## Description\s*\n+([\s\S]*?)(?=\n##|\n\*\*|$)/i,
    ];
    
    for (const pattern of descPatterns) {
      const match = markdown.match(pattern);
      if (match && match[1]) {
        description = match[1]
          .replace(/\n\n+/g, '\n\n')
          .replace(/^\s+|\s+$/g, '')
          .substring(0, 2000);
        break;
      }
    }
    
    // If no description found, try to get first substantial paragraph
    if (!description) {
      const paragraphs = markdown.split(/\n\n+/);
      for (const p of paragraphs) {
        const cleaned = p.replace(/^\s*[-*#>\[\]!]+\s*/g, '').trim();
        if (cleaned.length > 100 && !cleaned.startsWith('http') && !cleaned.includes('USD')) {
          description = cleaned.substring(0, 2000);
          break;
        }
      }
    }
    
    // Extract dimensions
    let dimensions = null;
    const dimPatterns = [
      /(?:Dimensions|Size|Measurements)[:\s]*\n?([\s\S]*?)(?=\n(?:Materials|Condition|Signature|Weight|\*\*|$))/i,
      /(?:Height|Width|Depth)[:\s]*([\d.]+\s*(?:inches|cm|in|mm)[\s\S]*?)(?=\n\n|\n\*\*|$)/i,
      /(\d+\.?\d*\s*[x×]\s*\d+\.?\d*(?:\s*[x×]\s*\d+\.?\d*)?\s*(?:inches|cm|in|mm))/i,
    ];
    
    for (const pattern of dimPatterns) {
      const match = markdown.match(pattern);
      if (match && match[1]) {
        dimensions = match[1]
          .replace(/\n+/g, '\n')
          .replace(/^\s+|\s+$/g, '')
          .substring(0, 500);
        break;
      }
    }
    
    // Extract materials
    let materials = null;
    const matPatterns = [
      /(?:Materials?|Made (?:of|from|with)|Composition)[:\s]*\n?([\s\S]*?)(?=\n(?:Dimensions|Condition|Signature|Weight|\*\*|$))/i,
      /(?:Materials?|Metal|Stone|Fabric)[:\s]+([^\n]+)/i,
    ];
    
    for (const pattern of matPatterns) {
      const match = markdown.match(pattern);
      if (match && match[1]) {
        materials = match[1]
          .replace(/\n+/g, ', ')
          .replace(/^\s+|\s+$/g, '')
          .substring(0, 300);
        break;
      }
    }
    
    // Extract condition
    let condition = null;
    const condPatterns = [
      /(?:Condition(?: Report)?)[:\s]*\n?([\s\S]*?)(?=\n(?:Dimensions|Materials|Signature|Provenance|\*\*|$))/i,
      /\b(Like New|Very Good|Good|Fair|Revive|Excellent|Mint)\b/i,
    ];
    
    for (const pattern of condPatterns) {
      const match = markdown.match(pattern);
      if (match && match[1]) {
        // Normalize condition to standard values
        const condText = match[1].trim().toLowerCase();
        if (condText.includes('like new') || condText.includes('mint') || condText.includes('excellent')) {
          condition = 'Like New';
        } else if (condText.includes('very good')) {
          condition = 'Very Good';
        } else if (condText.includes('good')) {
          condition = 'Good';
        } else if (condText.includes('fair')) {
          condition = 'Fair';
        } else if (condText.includes('revive')) {
          condition = 'Revive';
        } else {
          condition = match[1].substring(0, 100);
        }
        break;
      }
    }
    
    // Extract signature
    let signature = null;
    const sigPatterns = [
      /(?:Signature|Signed|Authenticity)[:\s]*\n?([\s\S]*?)(?=\n(?:Dimensions|Materials|Condition|Provenance|\*\*|$))/i,
      /(?:Hand-signed|Signed by)[^.]*\./i,
    ];
    
    for (const pattern of sigPatterns) {
      const match = markdown.match(pattern);
      if (match && match[0]) {
        signature = (match[1] || match[0])
          .replace(/\n+/g, ' ')
          .replace(/^\s+|\s+$/g, '')
          .substring(0, 300);
        break;
      }
    }
    
    // Extract edition info
    let edition = null;
    const editionPatterns = [
      /(?:Edition|Limited to|Part of)[:\s]*([^\n]+)/i,
      /(\d+\s*(?:of|\/)\s*\d+)/i,
      /(?:edition of|limited edition of)\s*(\d+)/i,
    ];
    
    for (const pattern of editionPatterns) {
      const match = markdown.match(pattern);
      if (match && match[1]) {
        edition = match[1].trim().substring(0, 100);
        break;
      }
    }
    
    // Extract year
    let year = null;
    const yearPatterns = [
      /(?:Year|Date|Created|Made)[:\s]*(\d{4})/i,
      /,\s*(\d{4})\b/,
      /\b(19\d{2}|20\d{2})\b/,
    ];
    
    for (const pattern of yearPatterns) {
      const match = markdown.match(pattern);
      if (match && match[1]) {
        year = match[1];
        break;
      }
    }
    
    // Extract provenance
    let provenance = null;
    const provPatterns = [
      /(?:Provenance)[:\s]*\n?([\s\S]*?)(?=\n(?:Dimensions|Materials|Condition|Signature|\*\*|$))/i,
    ];
    
    for (const pattern of provPatterns) {
      const match = markdown.match(pattern);
      if (match && match[1]) {
        provenance = match[1]
          .replace(/\n+/g, ' ')
          .replace(/^\s+|\s+$/g, '')
          .substring(0, 500);
        break;
      }
    }
    
    // Extract images from HTML
    const imgPattern = /src=["'](https:\/\/dam\.sothebys\.com\/dam\/image\/[^"']+)["']/gi;
    const images: string[] = [];
    let imgMatch;
    while ((imgMatch = imgPattern.exec(html)) !== null) {
      const imgUrl = imgMatch[1]
        .replace('/thumbnail/', '/large/')
        .replace('/medium/', '/large/')
        .replace('/small/', '/large/');
      if (!images.includes(imgUrl)) {
        images.push(imgUrl);
      }
      if (images.length >= 8) break;
    }
    
    console.log(`Extracted details: desc=${description.length}chars, dims=${!!dimensions}, mat=${!!materials}, cond=${condition}, imgs=${images.length}`);
    
    return { 
      description, 
      images, 
      dimensions, 
      materials, 
      condition, 
      signature, 
      edition, 
      year,
      provenance 
    };
  } catch (error) {
    console.error(`Error scraping item details ${url}:`, error);
    return null;
  }
}

async function syncToDatabase(supabase: any, items: ScrapedItem[], fetchDetails: boolean): Promise<{ inserted: number; updated: number; detailsFetched: number }> {
  let inserted = 0;
  let updated = 0;
  let detailsFetched = 0;

  for (const item of items) {
    try {
      // Check if item exists by title
      const { data: existing } = await supabase
        .from('luxury_items')
        .select('id, details')
        .eq('title', item.title)
        .maybeSingle();

      // Fetch detailed info if enabled and item is new or doesn't have details
      let itemDetails: ItemDetails | null = null;
      const existingDetails = existing?.details || {};
      const hasDetailedInfo = existingDetails.dimensions || existingDetails.materials || existingDetails.condition;
      
      if (fetchDetails && !hasDetailedInfo) {
        itemDetails = await scrapeItemDetails(item.url);
        if (itemDetails) {
          detailsFetched++;
        }
        // Rate limiting for detail requests
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      const itemData = {
        title: item.title,
        brand: item.brand,
        price: item.price,
        category: item.category,
        type: item.type,
        auction_house: "Sotheby's",
        images: itemDetails?.images?.length ? itemDetails.images : (item.image ? [item.image] : []),
        status: 'active',
        featured: item.price && item.price > 50000,
        description: itemDetails?.description || existing?.description || null,
        provenance: itemDetails?.provenance || existing?.provenance || null,
        updated_at: new Date().toISOString(),
        details: {
          source_url: item.url,
          dimensions: itemDetails?.dimensions || existingDetails.dimensions || null,
          materials: itemDetails?.materials || existingDetails.materials || null,
          condition: itemDetails?.condition || existingDetails.condition || null,
          signature: itemDetails?.signature || existingDetails.signature || null,
          edition: itemDetails?.edition || existingDetails.edition || null,
          year: itemDetails?.year || existingDetails.year || null,
        },
      };

      if (existing) {
        await supabase
          .from('luxury_items')
          .update(itemData)
          .eq('id', existing.id);
        updated++;
      } else {
        await supabase
          .from('luxury_items')
          .insert({
            ...itemData,
            created_at: new Date().toISOString(),
          });
        inserted++;
      }
    } catch (error) {
      console.error(`Error syncing item ${item.title}:`, error);
    }
  }

  return { inserted, updated, detailsFetched };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      action = 'sync', 
      categories: selectedCategories,
      fetchDetails = false,  // Set to true to fetch individual product pages
      limit = 0,  // Limit items to process (0 = all)
    } = await req.json().catch(() => ({}));
    
    console.log(`Starting Sotheby's items scraper, action: ${action}, fetchDetails: ${fetchDetails}`);

    if (!FIRECRAWL_API_KEY) {
      throw new Error('FIRECRAWL_API_KEY not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Filter categories if specified
    const categoriesToScrape = selectedCategories 
      ? CATEGORIES.filter(c => selectedCategories.includes(c.category))
      : CATEGORIES;

    // Scrape all category pages
    let allItems: ScrapedItem[] = [];
    
    for (const cat of categoriesToScrape) {
      const items = await scrapeCategoryPage(cat.url, cat.category, cat.type);
      allItems.push(...items);
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    console.log(`Total items scraped: ${allItems.length}`);
    
    // Apply limit if specified
    if (limit > 0 && allItems.length > limit) {
      allItems = allItems.slice(0, limit);
      console.log(`Limited to ${limit} items`);
    }

    // Sync to database
    const { inserted, updated, detailsFetched } = await syncToDatabase(supabase, allItems, fetchDetails);

    return new Response(
      JSON.stringify({
        success: true,
        source: "Sotheby's",
        categoriesScraped: categoriesToScrape.length,
        itemsFound: allItems.length,
        inserted,
        updated,
        detailsFetched,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Sotheby's items scraper error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
