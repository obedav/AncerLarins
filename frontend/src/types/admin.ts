import type { PropertyListItem, PropertyStatus } from './property';
import type { AgentListItem, VerificationStatus } from './agent';
import type { User, UserStatus } from './user';

export interface AdminProperty extends PropertyListItem {
  rejection_reason: string | null;
  approved_by: string | null;
  agent_detail?: {
    id: string;
    company_name: string;
    verification_status: VerificationStatus;
    user?: { id: string; full_name: string };
  } | null;
  created_at: string;
}

export interface AdminAgent extends AgentListItem {
  active_listings: number;
  total_leads: number;
  user?: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    phone: string | null;
    email: string | null;
    status: UserStatus;
    created_at: string;
  };
  created_at: string;
}

export interface Report {
  id: string;
  reportable_type: 'property' | 'agent_profile' | 'review';
  reportable_id: string;
  reason: string;
  description: string | null;
  status: 'open' | 'investigating' | 'resolved' | 'dismissed';
  resolution_note: string | null;
  reporter?: {
    id: string;
    full_name: string;
  };
  reportable?: {
    id: string;
    title?: string;
    company_name?: string;
    slug?: string;
  } | null;
  created_at: string;
}

export interface AdminDashboardStats {
  total_properties: number;
  properties_by_status: Record<PropertyStatus, number>;
  total_agents: number;
  agents_by_verification: Record<VerificationStatus, number>;
  total_users: number;
  leads_this_week: number;
  pending_approvals: number;
  open_reports: number;
  new_listings_this_week: number;
  new_users_this_week: number;
}

export interface LocationState {
  id: string;
  name: string;
  slug: string;
}

export interface LocationCity {
  id: string;
  name: string;
  slug: string;
  state_id: string;
}

export interface LocationArea {
  id: string;
  name: string;
  slug: string;
  city_id: string;
}
