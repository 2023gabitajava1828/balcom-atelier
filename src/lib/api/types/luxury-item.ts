// Luxury item types for shopping and auction

export type LuxuryItemType = 'shopping' | 'auction';

export type LuxuryItemCategory = 
  | 'Fashion'
  | 'Watches'
  | 'Jewelry'
  | 'Art'
  | 'Wine'
  | 'Collectibles'
  | 'Home'
  | 'Other';

export interface LuxuryItemDetails {
  dimensions?: string;
  materials?: string;
  condition?: string;
  signature?: string;
  edition?: string;
  provenance?: string;
  origin?: string;
  year?: string;
  [key: string]: string | undefined;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface LuxuryItem {
  id: string;
  type: string; // 'shopping' | 'auction' from DB
  title: string;
  description: string | null;
  category: string;
  brand: string | null;
  price: number | null;
  estimate_low: number | null;
  estimate_high: number | null;
  auction_date: string | null;
  auction_house: string | null;
  images: string[] | null;
  provenance: string | null;
  details: unknown; // Json from DB - can be any serializable value
  featured: boolean | null;
  status: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface LuxuryItemFilters {
  type?: LuxuryItemType;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  featured?: boolean;
}

export const LUXURY_CATEGORIES: LuxuryItemCategory[] = [
  'Fashion',
  'Watches',
  'Jewelry',
  'Art',
  'Wine',
  'Collectibles',
  'Home',
  'Other',
];
