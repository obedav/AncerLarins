export interface SubscriptionPlan {
  tier: string;
  name: string;
  price_kobo: number;
  max_listings: number;
  featured_per_month: number;
  features: string[];
}

export interface CurrentSubscription {
  tier: string;
  expires_at: string | null;
  max_listings: number;
  active_listings: number;
  has_active: boolean;
  subscription: SubscriptionDetail | null;
}

export interface SubscriptionDetail {
  id: string;
  tier: string;
  amount_kobo: number;
  payment_reference: string;
  payment_provider: string;
  starts_at: string;
  ends_at: string;
  status: string;
  is_active: boolean;
  days_remaining: number;
}

export interface PaystackInitResponse {
  authorization_url: string;
  access_code: string;
  reference: string;
}
