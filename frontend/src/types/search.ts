import type { ListingType, Furnishing } from './property';

export interface SearchFilters {
  q?: string;
  listing_type?: ListingType;
  property_type_id?: string;
  state_id?: string;
  city_id?: string;
  area_id?: string;
  min_price?: number;
  max_price?: number;
  min_bedrooms?: number;
  max_bedrooms?: number;
  min_bathrooms?: number;
  furnishing?: Furnishing;
  is_serviced?: boolean;
  has_bq?: boolean;
  sort_by?: 'price_asc' | 'price_desc' | 'newest' | 'popular';
  per_page?: number;
  page?: number;
}

export interface SearchSuggestion {
  type: 'area' | 'city' | 'property_type';
  id: string;
  label: string;
  slug: string | null;
  extra: string | null;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface MapProperty {
  id: string;
  title: string;
  slug: string;
  price_kobo: number;
  listing_type: ListingType;
  bedrooms: number | null;
  bathrooms: number | null;
  latitude: number;
  longitude: number;
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  type: string;
  data: Record<string, unknown> | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}
