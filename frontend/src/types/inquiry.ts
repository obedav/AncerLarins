export type InquiryStatus =
  | 'new'
  | 'contacted'
  | 'qualified'
  | 'agreement_signed'
  | 'inspection_scheduled'
  | 'negotiating'
  | 'offer_made'
  | 'closed_won'
  | 'closed_lost';

export interface InquiryListItem {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  budget_range: string | null;
  timeline: string | null;
  financing_type: string | null;
  status: InquiryStatus;
  assigned_to: { id: string; full_name: string } | null;
  property: { id: string; title: string; slug: string; formatted_price: string } | null;
  created_at: string;
}

export interface InquiryDetail extends InquiryListItem {
  message: string | null;
  staff_notes: string | null;
  agent: { company_name: string; user_name: string } | null;
  user: { id: string; full_name: string } | null;
  qualified_at: string | null;
  inspection_at: string | null;
  closed_at: string | null;
}

export interface CreateInquiryPayload {
  property_id: string;
  full_name?: string;
  email?: string;
  phone?: string;
  budget_range?: string;
  timeline?: string;
  financing_type?: string;
  message?: string;
  source?: string;
}
