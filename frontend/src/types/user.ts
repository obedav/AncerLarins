import type { AgentDetail } from './agent';

export type UserRole = 'user' | 'agent' | 'admin' | 'super_admin';
export type UserStatus = 'active' | 'suspended' | 'banned' | 'deactivated';

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  avatar_url: string | null;
  role: UserRole;
  status?: UserStatus;
  phone_verified?: boolean;
  preferred_city_id?: string | null;
  agent_profile?: AgentDetail | null;
  created_at: string;
}
