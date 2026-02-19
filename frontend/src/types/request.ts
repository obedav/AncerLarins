import type { ListingType } from './property';

export type PropertyRequestStatus = 'active' | 'fulfilled' | 'expired' | 'cancelled';
export type RequestResponseStatus = 'pending' | 'accepted' | 'rejected';

export interface PropertyRequestListItem {
  id: string;
  title: string;
  listing_type: ListingType;
  min_bedrooms: number | null;
  max_bedrooms: number | null;
  budget_kobo: number | null;
  status: PropertyRequestStatus;
  response_count: number;
  expires_at: string | null;
  area?: { id: string; name: string };
  city?: { id: string; name: string };
  created_at: string;
}

export interface PropertyRequestDetail extends PropertyRequestListItem {
  description: string;
  min_price_kobo: number | null;
  max_price_kobo: number | null;
  move_in_date: string | null;
  amenity_preferences: string[] | null;
  property_type?: { id: string; name: string };
  user?: { id: string; full_name: string };
  responses?: PropertyRequestResponse[];
  updated_at: string;
}

export interface PropertyRequestResponse {
  id: string;
  message: string;
  proposed_price_kobo: number | null;
  status: RequestResponseStatus;
  agent?: { id: string; company_name: string; logo_url: string | null };
  property?: { id: string; title: string; slug: string };
  created_at: string;
}

export interface CreatePropertyRequestPayload {
  title: string;
  description: string;
  listing_type: ListingType;
  property_type_id?: string;
  area_id?: string;
  city_id?: string;
  min_bedrooms?: number;
  max_bedrooms?: number;
  min_price_kobo?: number;
  max_price_kobo?: number;
  budget_kobo?: number;
  move_in_date?: string;
  amenity_preferences?: string[];
}

export interface RespondToRequestPayload {
  message: string;
  proposed_price_kobo?: number;
  property_id?: string;
}
