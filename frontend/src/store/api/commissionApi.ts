import { baseApi } from './baseApi';
import type { ApiResponse, PaginatedResponse } from '@/types/api';

export interface CommissionItem {
  id: string;
  sale_price_kobo: number;
  formatted_sale_price: string;
  commission_rate: number;
  commission_amount_kobo: number;
  formatted_commission: string;
  status: 'pending' | 'invoiced' | 'paid' | 'cancelled';
  payment_method: string | null;
  payment_reference: string | null;
  paid_at: string | null;
  notes: string | null;
  lead: { id: string; full_name: string; status: string } | null;
  property: { id: string; title: string; slug: string } | null;
  created_by: { id: string; full_name: string } | null;
  created_at: string;
}

export interface RevenueSummary {
  year: number;
  total_earned: number;
  total_pending: number;
  total_invoiced: number;
  deals_won: number;
  deals_lost: number;
  monthly_revenue: { month: number; total_kobo: number }[];
}

export interface CalculateResult {
  sale_price_kobo: number;
  commission_rate: number;
  commission_amount_kobo: number;
  formatted_sale_price: string;
  formatted_commission: string;
}

export const commissionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCommissions: builder.query<PaginatedResponse<CommissionItem>, Record<string, unknown> | void>({
      query: (params) => ({
        url: '/admin/commissions',
        params: params || undefined,
      }),
      providesTags: ['Commission' as never],
    }),

    getRevenueSummary: builder.query<ApiResponse<RevenueSummary>, { year?: number } | void>({
      query: (params) => ({
        url: '/admin/commissions/summary',
        params: params || undefined,
      }),
      providesTags: ['Commission' as never],
    }),

    createCommission: builder.mutation<ApiResponse<CommissionItem>, {
      lead_id: string;
      sale_price_kobo: number;
      commission_rate?: number;
      payment_method?: string;
      notes?: string;
    }>({
      query: (body) => ({
        url: '/admin/commissions',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Commission' as never],
    }),

    updateCommissionStatus: builder.mutation<ApiResponse<null>, {
      id: string;
      status: string;
      payment_reference?: string;
      notes?: string;
    }>({
      query: ({ id, ...body }) => ({
        url: `/admin/commissions/${id}/status`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Commission' as never],
    }),

    calculateCommission: builder.mutation<ApiResponse<CalculateResult>, {
      sale_price_kobo: number;
      commission_rate?: number;
    }>({
      query: (body) => ({
        url: '/admin/commissions/calculate',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const {
  useGetCommissionsQuery,
  useGetRevenueSummaryQuery,
  useCreateCommissionMutation,
  useUpdateCommissionStatusMutation,
  useCalculateCommissionMutation,
} = commissionApi;
