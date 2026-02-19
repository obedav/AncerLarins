export type EstateType = 'gated_estate' | 'open_estate' | 'highrise' | 'mixed_use';

export interface EstateListItem {
  id: string;
  name: string;
  slug: string;
  estate_type: EstateType;
  security_type: string | null;
  service_charge_kobo: number | null;
  service_charge_period: string | null;
  cover_image_url: string | null;
  avg_rating: number | null;
  reviews_count?: number;
  properties_count?: number;
  area?: { id: string; name: string };
}

export interface EstateDetail extends EstateListItem {
  description: string | null;
  developer: string | null;
  year_built: number | null;
  total_units: number | null;
  amenities: string[] | null;
  electricity_source: string | null;
  water_source: string | null;
  reviews?: EstateReview[];
  created_at: string;
  updated_at: string;
}

export interface EstateReview {
  id: string;
  rating: number;
  pros: string | null;
  cons: string | null;
  lived_from: string | null;
  lived_to: string | null;
  user?: { id: string; full_name: string };
  created_at: string;
}

export interface CreateEstatePayload {
  name: string;
  area_id: string;
  estate_type: EstateType;
  description?: string;
  developer?: string;
  year_built?: number;
  total_units?: number;
  amenities?: string[];
  security_type?: string;
  service_charge_kobo?: number;
  service_charge_period?: string;
  electricity_source?: string;
  water_source?: string;
  cover_image_url?: string;
}

export interface CreateEstateReviewPayload {
  rating: number;
  pros?: string;
  cons?: string;
  lived_from?: string;
  lived_to?: string;
}
