import type { PropertyListItem } from './property';

export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected';
export type SubscriptionTier = 'free' | 'basic' | 'pro' | 'enterprise';

export interface AgentListItem {
  id: string;
  company_name: string;
  logo_url: string | null;
  verification_status: VerificationStatus;
  subscription_tier: SubscriptionTier;
  avg_rating: number | null;
  total_reviews: number;
  years_experience: number | null;
  specializations: string[] | null;
  user?: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  };
  properties_count?: number;
}

export interface AgentDetail extends AgentListItem {
  license_number: string | null;
  bio: string | null;
  office_address: string | null;
  website: string | null;
  whatsapp_number: string | null;
  avg_response_time: number | null;
  total_listings?: number;
  total_leads?: number;
  office_area?: { id: string; name: string } | null;
  recent_properties?: PropertyListItem[];
  created_at: string;
}

export interface AgentReview {
  id: string;
  overall_rating: number;
  communication_rating: number | null;
  responsiveness_rating: number | null;
  negotiation_rating: number | null;
  comment: string | null;
  status: string;
  user?: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  };
  created_at: string;
}

export interface Lead {
  id: string;
  contact_type: 'whatsapp' | 'call' | 'form';
  source: string | null;
  responded_at: string | null;
  property?: {
    id: string;
    title: string;
    slug: string;
    cover_image?: { url: string; thumbnail_url: string } | null;
  };
  user?: {
    id: string;
    full_name: string;
    phone: string;
  } | null;
  created_at: string;
}
