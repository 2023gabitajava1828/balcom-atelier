import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ScrapedEvent {
  title: string;
  description: string;
  event_date: string;
  venue: string;
  city: string;
  min_tier: string | null;
  capacity: number | null;
  dress_code: string;
  image_url: string | null;
  status: string;
}

// Map event types to membership tiers
function getTierFromEventType(title: string, description: string): string | null {
  const text = `${title} ${description}`.toLowerCase();
  
  if (text.includes('gala') || text.includes('black tie') || text.includes('amfar') || text.includes('invitation only')) {
    return 'black';
  }
  if (text.includes('vip') || text.includes('private') || text.includes('exclusive')) {
    return 'platinum';
  }
  if (text.includes('auction') || text.includes('grand prix') || text.includes('concours')) {
    return 'gold';
  }
  return null; // Open to all members
}

// Get dress code based on event type
function getDressCode(title: string, description: string): string {
  const text = `${title} ${description}`.toLowerCase();
  
  if (text.includes('gala') || text.includes('ball') || text.includes('amfar')) {
    return 'Black Tie';
  }
  if (text.includes('yacht') || text.includes('monaco') || text.includes('polo')) {
    return 'Resort Elegant';
  }
  if (text.includes('art') || text.includes('gallery') || text.includes('exhibition')) {
    return 'Cocktail Attire';
  }
  if (text.includes('wine') || text.includes('culinary') || text.includes('dining')) {
    return 'Smart Casual';
  }
  return 'Business Casual';
}

// Get capacity estimate based on event type
function getCapacityEstimate(title: string): number {
  const text = title.toLowerCase();
  
  if (text.includes('gala') || text.includes('ball')) {
    return 500;
  }
  if (text.includes('grand prix') || text.includes('yacht show')) {
    return 200;
  }
  if (text.includes('polo') || text.includes('concours')) {
    return 300;
  }
  if (text.includes('dinner') || text.includes('supper')) {
    return 50;
  }
  return 150;
}

// 2026 VIP Events Calendar - Manually curated from verified sources
const VIP_EVENTS_2026: ScrapedEvent[] = [
  // January
  {
    title: "Sotheby's Masters Week",
    description: "Sotheby's annual Masters Week featuring Old Master Paintings and Drawings, showcasing works from the Renaissance through the 19th century.",
    event_date: "2026-01-23T18:00:00Z",
    venue: "Sotheby's New York",
    city: "New York",
    min_tier: "gold",
    capacity: 200,
    dress_code: "Cocktail Attire",
    image_url: "https://images.unsplash.com/photo-1578321272176-b7bbc0679853?w=800",
    status: "upcoming"
  },
  // February
  {
    title: "Art Wynwood",
    description: "Miami's contemporary and modern art fair featuring leading galleries from around the world.",
    event_date: "2026-02-12T18:00:00Z",
    venue: "Art Wynwood Tent",
    city: "Miami",
    min_tier: null,
    capacity: 400,
    dress_code: "Cocktail Attire",
    image_url: "https://images.unsplash.com/photo-1541367777708-7905fe3296c0?w=800",
    status: "upcoming"
  },
  {
    title: "New York Fashion Week",
    description: "Fall/Winter collections from top American and international designers. VIP access includes front-row seats and exclusive after-parties.",
    event_date: "2026-02-13T14:00:00Z",
    venue: "Spring Studios",
    city: "New York",
    min_tier: "platinum",
    capacity: 60,
    dress_code: "Cocktail Attire",
    image_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
    status: "upcoming"
  },
  {
    title: "London Fashion Week",
    description: "Fall/Winter collections showcasing British and emerging designers. VIP access includes designer meet-and-greets.",
    event_date: "2026-02-20T15:00:00Z",
    venue: "180 The Strand",
    city: "London",
    min_tier: "platinum",
    capacity: 50,
    dress_code: "Cocktail Attire",
    image_url: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800",
    status: "upcoming"
  },
  // March
  {
    title: "Bahrain Grand Prix",
    description: "Formula 1 season opener under the lights at Bahrain International Circuit. VIP paddock access and hospitality.",
    event_date: "2026-03-08T18:00:00Z",
    venue: "Bahrain International Circuit",
    city: "Bahrain",
    min_tier: "gold",
    capacity: 100,
    dress_code: "Resort Elegant",
    image_url: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800",
    status: "upcoming"
  },
  {
    title: "Saudi Arabian Grand Prix",
    description: "F1's fastest street circuit in Jeddah. Experience the thrilling night race with exclusive VIP hospitality.",
    event_date: "2026-03-22T20:00:00Z",
    venue: "Jeddah Corniche Circuit",
    city: "Jeddah",
    min_tier: "gold",
    capacity: 100,
    dress_code: "Resort Elegant",
    image_url: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800",
    status: "upcoming"
  },
  {
    title: "Dubai World Cup",
    description: "The world's richest horse race at Meydan Racecourse, featuring luxury hospitality and elite networking.",
    event_date: "2026-03-28T15:00:00Z",
    venue: "Meydan Racecourse",
    city: "Dubai",
    min_tier: "gold",
    capacity: 150,
    dress_code: "Resort Elegant",
    image_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
    status: "upcoming"
  },
  {
    title: "En Primeur Bordeaux Week",
    description: "The most important wine tasting event of the year. Sample the latest Bordeaux vintages before they're bottled.",
    event_date: "2026-03-30T10:00:00Z",
    venue: "Various Châteaux",
    city: "Bordeaux",
    min_tier: "platinum",
    capacity: 40,
    dress_code: "Smart Casual",
    image_url: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800",
    status: "upcoming"
  },
  // April
  {
    title: "Australian Grand Prix",
    description: "F1 returns to Melbourne's Albert Park. VIP hospitality includes paddock tours and driver appearances.",
    event_date: "2026-04-05T15:00:00Z",
    venue: "Albert Park Circuit",
    city: "Melbourne",
    min_tier: "gold",
    capacity: 100,
    dress_code: "Smart Casual",
    image_url: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800",
    status: "upcoming"
  },
  {
    title: "Salone del Mobile Milano",
    description: "The world's largest furniture fair and design week, featuring exclusive showroom previews and VIP parties.",
    event_date: "2026-04-21T10:00:00Z",
    venue: "Fiera Milano",
    city: "Milan",
    min_tier: "gold",
    capacity: 100,
    dress_code: "Smart Casual",
    image_url: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800",
    status: "upcoming"
  },
  {
    title: "Chinese Grand Prix",
    description: "F1 in Shanghai with exclusive hospitality and paddock access at the state-of-the-art circuit.",
    event_date: "2026-04-19T14:00:00Z",
    venue: "Shanghai International Circuit",
    city: "Shanghai",
    min_tier: "gold",
    capacity: 80,
    dress_code: "Smart Casual",
    image_url: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800",
    status: "upcoming"
  },
  // May
  {
    title: "Miami Grand Prix",
    description: "F1's glamorous Miami event featuring yacht access, celebrity sightings, and world-class hospitality.",
    event_date: "2026-05-03T15:30:00Z",
    venue: "Miami International Autodrome",
    city: "Miami",
    min_tier: "platinum",
    capacity: 80,
    dress_code: "Resort Elegant",
    image_url: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800",
    status: "upcoming"
  },
  {
    title: "Cannes Film Festival",
    description: "The prestigious international film festival on the French Riviera. VIP access includes red carpet events and exclusive parties.",
    event_date: "2026-05-13T19:00:00Z",
    venue: "Palais des Festivals",
    city: "Cannes",
    min_tier: "platinum",
    capacity: 50,
    dress_code: "Black Tie",
    image_url: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800",
    status: "upcoming"
  },
  {
    title: "amfAR Cannes Gala",
    description: "The Foundation for AIDS Research's annual Cinema Against AIDS gala during Cannes Film Festival. One of the most exclusive charity events in the world.",
    event_date: "2026-05-21T20:00:00Z",
    venue: "Hôtel du Cap-Eden-Roc",
    city: "Cannes",
    min_tier: "black",
    capacity: 40,
    dress_code: "Black Tie",
    image_url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800",
    status: "upcoming"
  },
  {
    title: "Monaco Grand Prix",
    description: "Formula 1's most prestigious race through the streets of Monte Carlo. VIP hospitality includes yacht access and exclusive viewing areas.",
    event_date: "2026-05-24T14:00:00Z",
    venue: "Circuit de Monaco",
    city: "Monaco",
    min_tier: "platinum",
    capacity: 80,
    dress_code: "Resort Elegant",
    image_url: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800",
    status: "upcoming"
  },
  {
    title: "Vinexpo Bordeaux",
    description: "The world's leading wine and spirits exhibition, featuring exclusive tastings and networking with top winemakers.",
    event_date: "2026-05-18T10:00:00Z",
    venue: "Parc des Expositions",
    city: "Bordeaux",
    min_tier: "gold",
    capacity: 100,
    dress_code: "Smart Casual",
    image_url: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800",
    status: "upcoming"
  },
  // June
  {
    title: "Canadian Grand Prix",
    description: "F1 in Montreal with VIP hospitality at the historic Circuit Gilles Villeneuve.",
    event_date: "2026-06-14T14:00:00Z",
    venue: "Circuit Gilles Villeneuve",
    city: "Montreal",
    min_tier: "gold",
    capacity: 100,
    dress_code: "Smart Casual",
    image_url: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800",
    status: "upcoming"
  },
  {
    title: "Art Basel Switzerland",
    description: "The world's premier modern and contemporary art fair, featuring galleries from around the globe and exclusive VIP previews.",
    event_date: "2026-06-18T11:00:00Z",
    venue: "Messe Basel",
    city: "Basel",
    min_tier: "gold",
    capacity: 200,
    dress_code: "Cocktail Attire",
    image_url: "https://images.unsplash.com/photo-1531243269054-5ebf6f34081e?w=800",
    status: "upcoming"
  },
  {
    title: "Veuve Clicquot Polo Classic",
    description: "The annual polo tournament hosted by Veuve Clicquot featuring world-class polo and luxury hospitality.",
    event_date: "2026-06-06T12:00:00Z",
    venue: "Liberty State Park",
    city: "New York",
    min_tier: "gold",
    capacity: 150,
    dress_code: "Resort Elegant",
    image_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
    status: "upcoming"
  },
  {
    title: "Paris Haute Couture Week",
    description: "The pinnacle of fashion featuring exclusive Haute Couture collections from the world's most prestigious fashion houses.",
    event_date: "2026-06-29T14:00:00Z",
    venue: "Various Venues",
    city: "Paris",
    min_tier: "black",
    capacity: 30,
    dress_code: "Cocktail Attire",
    image_url: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800",
    status: "upcoming"
  },
  // July
  {
    title: "British Grand Prix",
    description: "F1's home race at legendary Silverstone. VIP hospitality includes paddock access and driver appearances.",
    event_date: "2026-07-05T15:00:00Z",
    venue: "Silverstone Circuit",
    city: "Silverstone",
    min_tier: "platinum",
    capacity: 100,
    dress_code: "Smart Casual",
    image_url: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800",
    status: "upcoming"
  },
  {
    title: "Wimbledon Championships",
    description: "The oldest and most prestigious tennis tournament in the world. VIP hospitality in the Debenture Holders' Lounge.",
    event_date: "2026-07-06T11:00:00Z",
    venue: "All England Lawn Tennis Club",
    city: "London",
    min_tier: "platinum",
    capacity: 60,
    dress_code: "Smart Casual",
    image_url: "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=800",
    status: "upcoming"
  },
  {
    title: "Hungarian Grand Prix",
    description: "F1 at the Hungaroring with exclusive hospitality and paddock access.",
    event_date: "2026-07-19T15:00:00Z",
    venue: "Hungaroring",
    city: "Budapest",
    min_tier: "gold",
    capacity: 80,
    dress_code: "Smart Casual",
    image_url: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800",
    status: "upcoming"
  },
  {
    title: "Aspen Food & Wine Classic",
    description: "The nation's premier culinary event featuring world-renowned chefs, winemakers, and exclusive tastings.",
    event_date: "2026-06-19T11:00:00Z",
    venue: "Aspen Mountain",
    city: "Aspen",
    min_tier: "platinum",
    capacity: 60,
    dress_code: "Resort Elegant",
    image_url: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800",
    status: "upcoming"
  },
  // August
  {
    title: "Belgian Grand Prix",
    description: "F1 at the legendary Spa-Francorchamps circuit. VIP hospitality with paddock access.",
    event_date: "2026-08-30T15:00:00Z",
    venue: "Circuit de Spa-Francorchamps",
    city: "Spa",
    min_tier: "gold",
    capacity: 80,
    dress_code: "Smart Casual",
    image_url: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800",
    status: "upcoming"
  },
  {
    title: "Pebble Beach Concours d'Elegance",
    description: "The world's premier celebration of the automobile, featuring the finest collector cars and exclusive gatherings.",
    event_date: "2026-08-16T10:00:00Z",
    venue: "Pebble Beach Golf Links",
    city: "Pebble Beach",
    min_tier: "platinum",
    capacity: 100,
    dress_code: "Resort Elegant",
    image_url: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800",
    status: "upcoming"
  },
  // September
  {
    title: "Italian Grand Prix",
    description: "F1 at the Temple of Speed - Monza. Experience Ferrari's home race with exclusive hospitality.",
    event_date: "2026-09-06T15:00:00Z",
    venue: "Autodromo Nazionale Monza",
    city: "Monza",
    min_tier: "platinum",
    capacity: 80,
    dress_code: "Smart Casual",
    image_url: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800",
    status: "upcoming"
  },
  {
    title: "New York Fashion Week",
    description: "Spring/Summer collections from top American and international designers. VIP access includes front-row seats.",
    event_date: "2026-09-11T14:00:00Z",
    venue: "Spring Studios",
    city: "New York",
    min_tier: "platinum",
    capacity: 60,
    dress_code: "Cocktail Attire",
    image_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
    status: "upcoming"
  },
  {
    title: "Singapore Grand Prix",
    description: "F1's spectacular night race through the streets of Singapore. VIP hospitality includes yacht access.",
    event_date: "2026-09-20T20:00:00Z",
    venue: "Marina Bay Street Circuit",
    city: "Singapore",
    min_tier: "platinum",
    capacity: 80,
    dress_code: "Resort Elegant",
    image_url: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800",
    status: "upcoming"
  },
  {
    title: "Monaco Yacht Show",
    description: "The world's most prestigious superyacht show, featuring the finest yachts and exclusive networking events.",
    event_date: "2026-09-23T10:00:00Z",
    venue: "Port Hercules",
    city: "Monaco",
    min_tier: "platinum",
    capacity: 80,
    dress_code: "Resort Elegant",
    image_url: "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800",
    status: "upcoming"
  },
  {
    title: "Milan Fashion Week",
    description: "Spring/Summer collections from the world's leading fashion houses. VIP access includes front-row seats and designer meet-and-greets.",
    event_date: "2026-09-22T15:00:00Z",
    venue: "Various Venues",
    city: "Milan",
    min_tier: "platinum",
    capacity: 50,
    dress_code: "Cocktail Attire",
    image_url: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800",
    status: "upcoming"
  },
  {
    title: "Paris Fashion Week",
    description: "Spring/Summer ready-to-wear collections from the world's top fashion houses. VIP access to exclusive shows and events.",
    event_date: "2026-09-28T14:00:00Z",
    venue: "Various Venues",
    city: "Paris",
    min_tier: "platinum",
    capacity: 50,
    dress_code: "Cocktail Attire",
    image_url: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800",
    status: "upcoming"
  },
  {
    title: "Napa Valley Harvest Season",
    description: "Exclusive harvest experiences at premier Napa Valley wineries, including crush parties and private tastings with winemakers.",
    event_date: "2026-09-15T10:00:00Z",
    venue: "Various Wineries",
    city: "Napa Valley",
    min_tier: "gold",
    capacity: 40,
    dress_code: "Smart Casual",
    image_url: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800",
    status: "upcoming"
  },
  // October
  {
    title: "Japanese Grand Prix",
    description: "F1 at the legendary Suzuka Circuit. Experience the passion of Japanese motorsport fans with VIP hospitality.",
    event_date: "2026-10-04T14:00:00Z",
    venue: "Suzuka International Racing Course",
    city: "Suzuka",
    min_tier: "gold",
    capacity: 80,
    dress_code: "Smart Casual",
    image_url: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800",
    status: "upcoming"
  },
  {
    title: "Frieze London",
    description: "London's leading contemporary art fair featuring over 160 galleries from around the world.",
    event_date: "2026-10-14T11:00:00Z",
    venue: "Regent's Park",
    city: "London",
    min_tier: "gold",
    capacity: 200,
    dress_code: "Cocktail Attire",
    image_url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800",
    status: "upcoming"
  },
  {
    title: "United States Grand Prix",
    description: "F1 in Austin, Texas with exclusive hospitality at the Circuit of the Americas.",
    event_date: "2026-10-25T14:00:00Z",
    venue: "Circuit of the Americas",
    city: "Austin",
    min_tier: "gold",
    capacity: 100,
    dress_code: "Smart Casual",
    image_url: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800",
    status: "upcoming"
  },
  {
    title: "Burgundy Wine Auction",
    description: "The prestigious Hospices de Beaune wine auction, the world's oldest charity wine auction featuring rare Burgundy wines.",
    event_date: "2026-11-15T14:00:00Z",
    venue: "Hospices de Beaune",
    city: "Beaune",
    min_tier: "platinum",
    capacity: 50,
    dress_code: "Smart Casual",
    image_url: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800",
    status: "upcoming"
  },
  // November
  {
    title: "Mexico City Grand Prix",
    description: "F1 at high altitude with incredible atmosphere. VIP hospitality includes paddock access.",
    event_date: "2026-11-01T14:00:00Z",
    venue: "Autódromo Hermanos Rodríguez",
    city: "Mexico City",
    min_tier: "gold",
    capacity: 80,
    dress_code: "Smart Casual",
    image_url: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800",
    status: "upcoming"
  },
  {
    title: "São Paulo Grand Prix",
    description: "F1 at Interlagos with passionate Brazilian fans. VIP hospitality and paddock access.",
    event_date: "2026-11-08T14:00:00Z",
    venue: "Autódromo José Carlos Pace",
    city: "São Paulo",
    min_tier: "gold",
    capacity: 80,
    dress_code: "Smart Casual",
    image_url: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800",
    status: "upcoming"
  },
  {
    title: "Christie's Evening Sale",
    description: "Christie's prestigious evening auction of Impressionist and Modern Art in New York.",
    event_date: "2026-11-09T19:00:00Z",
    venue: "Christie's Rockefeller Center",
    city: "New York",
    min_tier: "gold",
    capacity: 300,
    dress_code: "Cocktail Attire",
    image_url: "https://images.unsplash.com/photo-1578321272176-b7bbc0679853?w=800",
    status: "upcoming"
  },
  {
    title: "Las Vegas Grand Prix",
    description: "F1's spectacular night race down the Las Vegas Strip. Ultimate VIP experience with celebrity sightings.",
    event_date: "2026-11-22T22:00:00Z",
    venue: "Las Vegas Strip Circuit",
    city: "Las Vegas",
    min_tier: "black",
    capacity: 60,
    dress_code: "Black Tie",
    image_url: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800",
    status: "upcoming"
  },
  {
    title: "Abu Dhabi Grand Prix",
    description: "Formula 1's season finale under the lights at Yas Marina Circuit. VIP hospitality includes yacht access and paddock tours.",
    event_date: "2026-11-29T17:00:00Z",
    venue: "Yas Marina Circuit",
    city: "Abu Dhabi",
    min_tier: "platinum",
    capacity: 80,
    dress_code: "Resort Elegant",
    image_url: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800",
    status: "upcoming"
  },
  // December
  {
    title: "Art Basel Miami Beach",
    description: "America's most prestigious art fair featuring leading galleries and exclusive VIP events during Miami Art Week.",
    event_date: "2026-12-03T11:00:00Z",
    venue: "Miami Beach Convention Center",
    city: "Miami",
    min_tier: "gold",
    capacity: 200,
    dress_code: "Cocktail Attire",
    image_url: "https://images.unsplash.com/photo-1531243269054-5ebf6f34081e?w=800",
    status: "upcoming"
  },
  {
    title: "Champagne Harvest Celebration",
    description: "Exclusive celebration of the Champagne harvest with private tastings at prestigious Champagne houses.",
    event_date: "2026-10-10T11:00:00Z",
    venue: "Various Maisons",
    city: "Reims",
    min_tier: "platinum",
    capacity: 30,
    dress_code: "Smart Casual",
    image_url: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800",
    status: "upcoming"
  },
  {
    title: "New Year's Eve Gala at The Ritz",
    description: "An exclusive black-tie celebration to ring in 2027 at The Ritz London with champagne, fine dining, and live entertainment.",
    event_date: "2026-12-31T20:00:00Z",
    venue: "The Ritz London",
    city: "London",
    min_tier: "black",
    capacity: 100,
    dress_code: "Black Tie",
    image_url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800",
    status: "upcoming"
  }
];

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action } = await req.json();
    console.log(`VIP Events function called with action: ${action}`);

    if (action === 'seed') {
      // Seed 2026 VIP events
      let inserted = 0;
      let updated = 0;

      for (const event of VIP_EVENTS_2026) {
        // Check if event already exists by title and date
        const { data: existing } = await supabase
          .from('events')
          .select('id')
          .eq('title', event.title)
          .gte('event_date', event.event_date.split('T')[0])
          .lte('event_date', event.event_date.split('T')[0] + 'T23:59:59Z')
          .maybeSingle();

        if (existing) {
          // Update existing event
          const { error } = await supabase
            .from('events')
            .update({
              description: event.description,
              venue: event.venue,
              city: event.city,
              min_tier: event.min_tier,
              capacity: event.capacity,
              dress_code: event.dress_code,
              image_url: event.image_url,
              status: event.status,
              updated_at: new Date().toISOString()
            })
            .eq('id', existing.id);

          if (!error) updated++;
        } else {
          // Insert new event
          const { error } = await supabase
            .from('events')
            .insert(event);

          if (!error) inserted++;
        }
      }

      console.log(`Seeded VIP events: ${inserted} inserted, ${updated} updated`);

      return new Response(
        JSON.stringify({
          success: true,
          totalEvents: VIP_EVENTS_2026.length,
          inserted,
          updated
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action. Use "seed".' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('VIP Events function error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
