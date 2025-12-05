// Property types for both Supabase and IDX sources

export type PropertySource = 'supabase' | 'idx';

export interface Property {
  id: string;
  title: string;
  description: string | null;
  price: number;
  property_type: string | null;
  address: string | null;
  city: string;
  region: string | null;
  country: string;
  bedrooms: number | null;
  bathrooms: number | null;
  sqft: number | null;
  latitude: number | null;
  longitude: number | null;
  images: string[] | null;
  features: string[] | null;
  lifestyle_tags: string[] | null;
  status: string | null;
  created_at: string | null;
  updated_at: string | null;
  // IDX-specific fields
  source?: PropertySource;
  mls_number?: string;
  year_built?: number;
  lot_size?: string;
}

export interface PropertyFilters {
  city?: string;
  country?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  property_type?: string;
  lifestyle_tags?: string[];
}

export interface SavedProperty {
  id: string;
  user_id: string;
  property_id: string;
  created_at: string | null;
}

export interface IDXProperty {
  listingID: string;
  address: string;
  listPrice: number;
  bedrooms: number;
  totalBaths: number;
  sqFt: number;
  acres: string;
  image: {
    totalCount: number;
    '0': { url: string };
    '1'?: { url: string };
    '2'?: { url: string };
  };
  remarksConcat: string;
  propType: string;
  propStatus: string;
  latitude: string;
  longitude: string;
  yearBuilt: number;
  mlsNumber: string;
  cityName: string;
  state: string;
  featured?: string[];
}

// Transform IDX property to standard Property interface
export function transformIDXProperty(idx: IDXProperty): Property {
  const images: string[] = [];
  if (idx.image) {
    const keys = ['0', '1', '2'] as const;
    for (const key of keys) {
      const img = idx.image[key];
      if (img && typeof img === 'object' && 'url' in img) {
        images.push(img.url);
      }
    }
  }

  return {
    id: idx.listingID,
    title: idx.address,
    description: idx.remarksConcat || null,
    price: idx.listPrice,
    property_type: idx.propType || null,
    address: idx.address,
    city: idx.cityName || 'Atlanta',
    region: idx.state || 'GA',
    country: 'USA',
    bedrooms: idx.bedrooms || null,
    bathrooms: idx.totalBaths || null,
    sqft: idx.sqFt || null,
    latitude: idx.latitude ? parseFloat(idx.latitude) : null,
    longitude: idx.longitude ? parseFloat(idx.longitude) : null,
    images,
    features: idx.featured || null,
    lifestyle_tags: null,
    status: idx.propStatus || 'active',
    created_at: null,
    updated_at: null,
    source: 'idx',
    mls_number: idx.mlsNumber,
    year_built: idx.yearBuilt,
    lot_size: idx.acres,
  };
}
