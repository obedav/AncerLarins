export type CooperativeStatus = 'forming' | 'active' | 'target_reached' | 'completed' | 'dissolved';
export type CooperativeMemberRole = 'admin' | 'treasurer' | 'member';
export type CooperativeMemberStatus = 'active' | 'paused' | 'withdrawn';
export type ContributionStatus = 'pending' | 'verified' | 'failed';

export interface CooperativeListItem {
  id: string;
  name: string;
  slug: string;
  target_amount_kobo: number;
  monthly_contribution_kobo: number | null;
  status: CooperativeStatus;
  member_count: number;
  total_contributed_kobo: number;
  progress_percentage: number;
  area?: { id: string; name: string } | null;
  created_at: string;
}

export interface CooperativeDetail extends CooperativeListItem {
  description: string | null;
  start_date: string | null;
  target_date: string | null;
  admin_user?: { id: string; full_name: string };
  members?: CooperativeMember[];
  updated_at: string;
}

export interface CooperativeMember {
  id: string;
  role: CooperativeMemberRole;
  status: CooperativeMemberStatus;
  total_contributed_kobo: number;
  joined_at: string;
  user?: { id: string; full_name: string };
}

export interface CreateCooperativePayload {
  name: string;
  description?: string;
  target_amount_kobo: number;
  monthly_contribution_kobo?: number;
  property_id?: string;
  estate_id?: string;
  area_id?: string;
  start_date?: string;
  target_date?: string;
}

export interface CooperativeProgress {
  target_amount_kobo: number;
  total_contributed_kobo: number;
  progress_percentage: number;
  member_count: number;
}
