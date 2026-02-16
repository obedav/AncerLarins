import type { AgentListItem, AgentDetail } from './agent';

export type ListingType = 'rent' | 'sale';
export type PropertyStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'expired' | 'rented' | 'sold' | 'archived';
export type Furnishing = 'furnished' | 'semi_furnished' | 'unfurnished';
export type RentPeriod = 'yearly' | 'monthly' | 'quarterly';

export interface PropertyType {
  id: string;
  name: string;
  slug: string;
}

export interface PropertyImage {
  id: string;
  url: string;
  thumbnail_url: string;
  caption: string | null;
  is_cover: boolean;
  sort_order: number;
}

export interface PropertyListItem {
  id: string;
  title: string;
  slug: string;
  listing_type: ListingType;
  price_kobo: number;
  formatted_price: string;
  price_negotiable: boolean;
  rent_period?: RentPeriod;
  bedrooms: number | null;
  bathrooms: number | null;
  toilets: number | null;
  floor_area_sqm: number | null;
  address: string;
  featured: boolean;
  is_new: boolean;
  status: PropertyStatus;
  property_type?: PropertyType;
  city?: { id: string; name: string; slug: string };
  area?: { id: string; name: string } | null;
  cover_image?: { url: string; thumbnail_url: string } | null;
  agent?: {
    id: string;
    company_name: string;
    user_name: string;
    is_verified: boolean;
  } | null;
  views_count?: number;
  leads_count?: number;
  published_at: string | null;
  created_at?: string;
}

export interface Amenity {
  id: string;
  name: string;
  icon: string | null;
  category: string | null;
}

export interface PropertyDetail extends Omit<PropertyListItem, 'agent'> {
  description: string;
  agency_fee_pct: number | null;
  caution_fee_kobo: number | null;
  service_charge_kobo: number | null;
  legal_fee_kobo: number | null;
  landmark_note: string | null;
  location_fuzzy: boolean;
  sitting_rooms: number | null;
  land_area_sqm: number | null;
  floor_number: number | null;
  total_floors: number | null;
  year_built: number | null;
  furnishing: Furnishing | null;
  parking_spaces: number | null;
  has_bq: boolean;
  has_swimming_pool: boolean;
  has_gym: boolean;
  has_cctv: boolean;
  has_generator: boolean;
  has_water_supply: boolean;
  has_prepaid_meter: boolean;
  is_serviced: boolean;
  is_new_build: boolean;
  available_from: string | null;
  inspection_available: boolean;
  state?: { id: string; name: string };
  images?: PropertyImage[];
  amenities?: Amenity[];
  agent?: AgentDetail | null;
  virtual_tour?: { type: string; url: string } | null;
  meta_title: string | null;
  meta_description: string | null;
  saves_count?: number;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreatePropertyPayload {
  listing_type: ListingType;
  property_type_id: string;
  title: string;
  description: string;
  price_kobo: number;
  price_negotiable?: boolean;
  rent_period?: RentPeriod;
  agency_fee_pct?: number;
  caution_fee_kobo?: number;
  service_charge_kobo?: number;
  legal_fee_kobo?: number;
  state_id: string;
  city_id: string;
  area_id?: string;
  address: string;
  landmark_note?: string;
  location_fuzzy?: boolean;
  latitude?: number;
  longitude?: number;
  bedrooms?: number;
  bathrooms?: number;
  toilets?: number;
  sitting_rooms?: number;
  floor_area_sqm?: number;
  land_area_sqm?: number;
  floor_number?: number;
  total_floors?: number;
  year_built?: number;
  furnishing?: Furnishing;
  parking_spaces?: number;
  has_bq?: boolean;
  has_swimming_pool?: boolean;
  has_gym?: boolean;
  has_cctv?: boolean;
  has_generator?: boolean;
  has_water_supply?: boolean;
  has_prepaid_meter?: boolean;
  is_serviced?: boolean;
  is_new_build?: boolean;
  available_from?: string;
  inspection_available?: boolean;
  amenity_ids?: string[];
  status?: PropertyStatus;
}
