// ── Core Types ──────────────────────────────────────

export type UserRole = 'tenant' | 'landlord' | 'agent' | 'admin';
export type ListingType = 'sale' | 'rent' | 'shortlet';
export type PropertyType = 'apartment' | 'house' | 'duplex' | 'bungalow' | 'terrace' | 'penthouse' | 'studio' | 'commercial' | 'land' | 'shortlet';
export type PropertyStatus = 'available' | 'rented' | 'sold' | 'under_offer' | 'delisted';
export type PaymentStatus = 'pending' | 'success' | 'failed' | 'refunded';

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  avatar_url: string | null;
  is_verified: boolean;
  bio: string | null;
  company_name: string | null;
  lga: string | null;
  state: string | null;
  created_at: string;
}

export interface PropertyImage {
  id: number;
  image_url: string;
  is_primary: boolean;
  sort_order: number;
}

export interface Property {
  id: number;
  title: string;
  slug: string;
  description: string;
  price: number;
  formatted_price: string;
  listing_type: ListingType;
  property_type: PropertyType;
  status: PropertyStatus;
  bedrooms: number;
  bathrooms: number;
  toilets: number;
  area_sqm: number | null;
  address: string;
  city: string;
  state: string;
  lga: string;
  latitude: number | null;
  longitude: number | null;
  year_built: number | null;
  amenities: {
    is_furnished: boolean;
    has_parking: boolean;
    has_security: boolean;
    has_pool: boolean;
    has_gym: boolean;
  };
  is_featured: boolean;
  is_verified: boolean;
  images: PropertyImage[];
  primary_image: PropertyImage | null;
  owner: User | null;
  neighborhood: Neighborhood | null;
  reviews_count: number;
  reviews_avg_rating: number | null;
  created_at: string;
  updated_at: string;
}

export interface Neighborhood {
  id: number;
  name: string;
  slug: string;
  city: string;
  state: string;
  lga: string;
  description: string | null;
  latitude: number | null;
  longitude: number | null;
  avg_rent_price: number | null;
  avg_sale_price: number | null;
  formatted_avg_rent: string | null;
  formatted_avg_sale: string | null;
  safety_rating: number | null;
  image_url: string | null;
  properties_count: number;
}

export interface Booking {
  id: number;
  property: Property;
  user: User;
  agent: User | null;
  scheduled_at: string;
  status: string;
  notes: string | null;
  created_at: string;
}

export interface Payment {
  id: number;
  amount: number;
  formatted_amount: string;
  currency: string;
  reference: string;
  status: PaymentStatus;
  payment_method: string | null;
  property: Property | null;
  created_at: string;
}

export interface Review {
  id: number;
  user: User;
  rating: number;
  comment: string | null;
  created_at: string;
}

// ── API Response Types ──────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface SearchFilters {
  q?: string;
  listing_type?: ListingType;
  property_type?: PropertyType;
  city?: string;
  lga?: string;
  min_price?: number;
  max_price?: number;
  bedrooms?: number;
  is_furnished?: boolean;
  lat?: number;
  lng?: number;
  radius?: number;
}
