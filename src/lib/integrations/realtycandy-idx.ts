/**
 * RealtyCandy IDX Integration Adapter
 * 
 * Fetch luxury property listings with search and filtering.
 * Starts in mock mode with curated sample properties.
 */

const USE_MOCK = true;

export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  propertyType: string;
  address: string;
  city: string;
  region?: string;
  country: string;
  latitude?: number;
  longitude?: number;
  lifestyleTags: string[];
  images: string[];
  features: string[];
  status: string;
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
 * Mock luxury property data
 */
const MOCK_PROPERTIES: Property[] = [
  {
    id: 'prop_atlanta_1',
    title: 'Modern Buckhead Penthouse',
    description: 'Stunning penthouse in the heart of Buckhead with panoramic city views, chef\'s kitchen, and private rooftop terrace. Walking distance to premier shopping and dining.',
    price: 3500000,
    bedrooms: 3,
    bathrooms: 3.5,
    sqft: 3200,
    propertyType: 'penthouse',
    address: '3630 Peachtree Road NE',
    city: 'Atlanta',
    region: 'Georgia',
    country: 'USA',
    latitude: 33.8479,
    longitude: -84.3633,
    lifestyleTags: ['city', 'luxury'],
    images: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    features: ['Rooftop Terrace', 'Concierge', 'Valet Parking', 'Wine Cellar', 'Smart Home'],
    status: 'active'
  },
  {
    id: 'prop_dubai_1',
    title: 'Palm Jumeirah Waterfront Villa',
    description: 'Exclusive 5-bedroom villa on the iconic Palm Jumeirah with private beach access, infinity pool, and breathtaking Arabian Gulf views.',
    price: 12000000,
    bedrooms: 5,
    bathrooms: 6,
    sqft: 8500,
    propertyType: 'villa',
    address: 'Palm Jumeirah Frond',
    city: 'Dubai',
    country: 'UAE',
    latitude: 25.1124,
    longitude: 55.1390,
    lifestyleTags: ['beach', 'luxury', 'golf'],
    images: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    features: ['Private Beach', 'Infinity Pool', 'Home Theater', 'Gym', 'Maid\'s Quarters'],
    status: 'active'
  },
  {
    id: 'prop_miami_1',
    title: 'South Beach Ocean-View Condo',
    description: 'Ultra-modern 2-bedroom condo in the heart of South Beach. Floor-to-ceiling windows, designer finishes, and world-class amenities.',
    price: 2800000,
    bedrooms: 2,
    bathrooms: 2.5,
    sqft: 2100,
    propertyType: 'condo',
    address: '1 Collins Avenue',
    city: 'Miami',
    region: 'Florida',
    country: 'USA',
    latitude: 25.7617,
    longitude: -80.1918,
    lifestyleTags: ['beach', 'city', 'luxury'],
    images: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    features: ['Ocean View', 'Spa', 'Restaurant', 'Pool Deck', 'Valet'],
    status: 'active'
  },
  {
    id: 'prop_cdmx_1',
    title: 'Polanco Contemporary Residence',
    description: 'Stunning contemporary home in Mexico City\'s most prestigious neighborhood. Private garden, rooftop terrace, and museum-quality finishes.',
    price: 4200000,
    bedrooms: 4,
    bathrooms: 5,
    sqft: 5200,
    propertyType: 'house',
    address: 'Calle Campos Elíseos',
    city: 'Mexico City',
    country: 'Mexico',
    latitude: 19.4326,
    longitude: -99.1332,
    lifestyleTags: ['city', 'luxury'],
    images: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    features: ['Private Garden', 'Rooftop Terrace', 'Wine Cellar', 'Office', 'Security'],
    status: 'active'
  },
  {
    id: 'prop_dubai_2',
    title: 'Emirates Hills Golf Estate',
    description: 'Palatial mansion on prestigious Emirates Hills golf course. 7 bedrooms, private cinema, spa, and panoramic golf course views.',
    price: 18500000,
    bedrooms: 7,
    bathrooms: 8,
    sqft: 12000,
    propertyType: 'villa',
    address: 'Emirates Hills',
    city: 'Dubai',
    country: 'UAE',
    latitude: 25.0657,
    longitude: 55.1713,
    lifestyleTags: ['golf', 'luxury'],
    images: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    features: ['Golf Course View', 'Private Cinema', 'Spa', 'Pool', 'Staff Quarters'],
    status: 'active'
  },
  {
    id: 'prop_atlanta_2',
    title: 'Ansley Park Historic Estate',
    description: 'Meticulously restored historic mansion in Atlanta\'s most charming neighborhood. Original details with modern amenities.',
    price: 5800000,
    bedrooms: 6,
    bathrooms: 6,
    sqft: 7500,
    propertyType: 'house',
    address: 'The Prado',
    city: 'Atlanta',
    region: 'Georgia',
    country: 'USA',
    latitude: 33.7904,
    longitude: -84.3733,
    lifestyleTags: ['city', 'luxury'],
    images: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    features: ['Historic Architecture', 'Pool', 'Guest House', 'Garden', 'Wine Cellar'],
    status: 'active'
  },
  {
    id: 'prop_miami_2',
    title: 'Key Biscayne Waterfront Villa',
    description: 'Tropical paradise on Key Biscayne with private dock, pool, and stunning bay views. Perfect for yacht owners.',
    price: 9500000,
    bedrooms: 5,
    bathrooms: 5.5,
    sqft: 6800,
    propertyType: 'villa',
    address: 'Mashta Island',
    city: 'Miami',
    region: 'Florida',
    country: 'USA',
    latitude: 25.6926,
    longitude: -80.1631,
    lifestyleTags: ['beach', 'luxury'],
    images: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    features: ['Private Dock', 'Pool', 'Outdoor Kitchen', 'Bay Views', 'Smart Home'],
    status: 'active'
  },
  {
    id: 'prop_cdmx_2',
    title: 'San Ángel Colonial Masterpiece',
    description: 'Rare colonial-era estate in the artistic heart of Mexico City. Courtyard, fountain, original murals, and modern amenities.',
    price: 6200000,
    bedrooms: 5,
    bathrooms: 6,
    sqft: 8200,
    propertyType: 'house',
    address: 'Plaza San Jacinto',
    city: 'Mexico City',
    country: 'Mexico',
    latitude: 19.3467,
    longitude: -99.1917,
    lifestyleTags: ['city', 'luxury'],
    images: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    features: ['Historic Architecture', 'Courtyard', 'Fountain', 'Art Studio', 'Library'],
    status: 'active'
  }
];

/**
 * Search properties with filters
 */
export async function searchProperties(params: PropertySearchParams = {}): Promise<Property[]> {
  if (USE_MOCK) {
    console.log('[RealtyCandy Mock] Searching properties:', params);
    
    let filtered = [...MOCK_PROPERTIES];

    // Apply filters
    if (params.city) {
      filtered = filtered.filter(p => 
        p.city.toLowerCase().includes(params.city!.toLowerCase())
      );
    }

    if (params.country) {
      filtered = filtered.filter(p => 
        p.country.toLowerCase().includes(params.country!.toLowerCase())
      );
    }

    if (params.priceMin !== undefined) {
      filtered = filtered.filter(p => p.price >= params.priceMin!);
    }

    if (params.priceMax !== undefined) {
      filtered = filtered.filter(p => p.price <= params.priceMax!);
    }

    if (params.beds !== undefined) {
      filtered = filtered.filter(p => p.bedrooms >= params.beds!);
    }

    if (params.baths !== undefined) {
      filtered = filtered.filter(p => p.bathrooms >= params.baths!);
    }

    if (params.propertyType) {
      filtered = filtered.filter(p => p.propertyType === params.propertyType);
    }

    if (params.lifestyleTags && params.lifestyleTags.length > 0) {
      filtered = filtered.filter(p => 
        params.lifestyleTags!.some(tag => p.lifestyleTags.includes(tag))
      );
    }

    // Apply pagination
    const offset = params.offset || 0;
    const limit = params.limit || 20;
    filtered = filtered.slice(offset, offset + limit);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return filtered;
  }

  // Production implementation
  const REALTYCANDY_API_KEY = import.meta.env.VITE_REALTYCANDY_API_KEY;
  const REALTYCANDY_FEED_ID = import.meta.env.VITE_REALTYCANDY_FEED_ID;

  if (!REALTYCANDY_API_KEY || !REALTYCANDY_FEED_ID) {
    throw new Error('RealtyCandy credentials not configured');
  }

  try {
    const queryParams = new URLSearchParams();
    if (params.city) queryParams.append('city', params.city);
    if (params.region) queryParams.append('region', params.region);
    if (params.country) queryParams.append('country', params.country);
    if (params.priceMin) queryParams.append('price_min', params.priceMin.toString());
    if (params.priceMax) queryParams.append('price_max', params.priceMax.toString());
    if (params.beds) queryParams.append('beds', params.beds.toString());
    if (params.baths) queryParams.append('baths', params.baths.toString());
    if (params.propertyType) queryParams.append('property_type', params.propertyType);
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.offset) queryParams.append('offset', params.offset.toString());

    const response = await fetch(
      `https://api.realtycandy.com/v2/properties/search?feed_id=${REALTYCANDY_FEED_ID}&${queryParams.toString()}`,
      {
        headers: {
          'Authorization': `Bearer ${REALTYCANDY_API_KEY}`,
          'Content-Type': 'application/json',
        }
      }
    );

    if (!response.ok) {
      throw new Error(`RealtyCandy API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Map API response to our Property interface
    return data.properties.map((prop: any) => ({
      id: prop.id,
      title: prop.title,
      description: prop.description,
      price: prop.price,
      bedrooms: prop.bedrooms,
      bathrooms: prop.bathrooms,
      sqft: prop.square_feet,
      propertyType: prop.property_type,
      address: prop.address,
      city: prop.city,
      region: prop.state_or_province,
      country: prop.country,
      latitude: prop.latitude,
      longitude: prop.longitude,
      lifestyleTags: prop.tags || [],
      images: prop.images || [],
      features: prop.features || [],
      status: prop.status,
    }));
  } catch (error) {
    console.error('[RealtyCandy] Search failed:', error);
    throw error;
  }
}

/**
 * Get a single property by ID
 */
export async function getPropertyById(id: string): Promise<Property | null> {
  if (USE_MOCK) {
    console.log('[RealtyCandy Mock] Getting property:', id);
    
    const property = MOCK_PROPERTIES.find(p => p.id === id);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return property || null;
  }

  // Production implementation
  const REALTYCANDY_API_KEY = import.meta.env.VITE_REALTYCANDY_API_KEY;

  try {
    const response = await fetch(
      `https://api.realtycandy.com/v2/properties/${id}`,
      {
        headers: {
          'Authorization': `Bearer ${REALTYCANDY_API_KEY}`,
          'Content-Type': 'application/json',
        }
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`RealtyCandy API error: ${response.statusText}`);
    }

    const prop = await response.json();
    
    return {
      id: prop.id,
      title: prop.title,
      description: prop.description,
      price: prop.price,
      bedrooms: prop.bedrooms,
      bathrooms: prop.bathrooms,
      sqft: prop.square_feet,
      propertyType: prop.property_type,
      address: prop.address,
      city: prop.city,
      region: prop.state_or_province,
      country: prop.country,
      latitude: prop.latitude,
      longitude: prop.longitude,
      lifestyleTags: prop.tags || [],
      images: prop.images || [],
      features: prop.features || [],
      status: prop.status,
    };
  } catch (error) {
    console.error('[RealtyCandy] Failed to get property:', error);
    throw error;
  }
}

/**
 * Get available lifestyle tags
 */
export function getLifestyleTags(): string[] {
  return ['beach', 'golf', 'city', 'desert', 'luxury'];
}

/**
 * Get available property types
 */
export function getPropertyTypes(): string[] {
  return ['house', 'condo', 'villa', 'penthouse'];
}
