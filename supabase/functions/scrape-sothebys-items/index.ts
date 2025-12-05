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

interface ScrapedItem {
  title: string;
  brand: string | null;
  price: number | null;
  image: string | null;
  url: string;
  category: string;
  type: string;
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
  
  // Pattern for items with brand: 
  // - [![](image_url)\\ \\ **Brand** \\ \\ Title \\ \\ XX,XXX USD \\ \\ ...Buy Now](product_url)
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
    
    // Skip if already added
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
  
  // Simpler fallback: match any dam.sothebys.com image followed by price and pdp link
  if (items.length === 0) {
    const simplePattern = /(https:\/\/dam\.sothebys\.com\/dam\/image\/Item\/[^/]+\/primary\/medium)[\s\S]*?([\d,]+)\s*USD[\s\S]*?Buy Now\]\((https:\/\/www\.sothebys\.com\/en\/buy\/pdp[^)]+)\)/g;
    
    while ((match = simplePattern.exec(markdown)) !== null) {
      const imageUrl = match[1];
      const priceStr = match[2].replace(/,/g, '');
      const url = match[3];
      
      // Extract title from URL
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

async function scrapeItemDetails(url: string): Promise<{ description: string; images: string[] } | null> {
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

    if (!response.ok) return null;

    const data = await response.json();
    const markdown = data.data?.markdown || '';
    const html = data.data?.html || '';
    
    // Extract description
    const descMatch = markdown.match(/(?:Description|About|Details)[:\s]*\n([^\n]+(?:\n[^\n]+)*)/i);
    let description = descMatch ? descMatch[1].trim().substring(0, 1000) : '';
    
    // Extract images
    const imgPattern = /src=["'](https:\/\/dam\.sothebys\.com\/dam\/image\/[^"']+)["']/gi;
    const images: string[] = [];
    let imgMatch;
    while ((imgMatch = imgPattern.exec(html)) !== null) {
      const imgUrl = imgMatch[1].replace('/thumbnail/', '/large/').replace('/medium/', '/large/');
      if (!images.includes(imgUrl)) {
        images.push(imgUrl);
      }
      if (images.length >= 5) break;
    }
    
    return { description, images };
  } catch (error) {
    console.error(`Error scraping item details ${url}:`, error);
    return null;
  }
}

async function syncToDatabase(supabase: any, items: ScrapedItem[]): Promise<{ inserted: number; updated: number }> {
  let inserted = 0;
  let updated = 0;

  for (const item of items) {
    try {
      // Check if item exists by title
      const { data: existing } = await supabase
        .from('luxury_items')
        .select('id')
        .eq('title', item.title)
        .single();

      const itemData = {
        title: item.title,
        brand: item.brand,
        price: item.price,
        category: item.category,
        type: item.type,
        auction_house: "Sotheby's",
        images: item.image ? [item.image] : [],
        status: 'active',
        featured: item.price && item.price > 50000,
        updated_at: new Date().toISOString(),
        details: { source_url: item.url },
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

  return { inserted, updated };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action = 'sync', categories: selectedCategories } = await req.json().catch(() => ({}));
    console.log(`Starting Sotheby's items scraper, action: ${action}`);

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
    const allItems: ScrapedItem[] = [];
    
    for (const cat of categoriesToScrape) {
      const items = await scrapeCategoryPage(cat.url, cat.category, cat.type);
      allItems.push(...items);
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    console.log(`Total items scraped: ${allItems.length}`);

    // Sync to database
    const { inserted, updated } = await syncToDatabase(supabase, allItems);

    return new Response(
      JSON.stringify({
        success: true,
        source: "Sotheby's",
        categoriesScraped: categoriesToScrape.length,
        itemsFound: allItems.length,
        inserted,
        updated,
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
