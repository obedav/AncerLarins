import { baseApi } from './baseApi';
import type { ApiResponse, PaginatedResponse } from '@/types/api';
import type { InquiryListItem, InquiryDetail, CreateInquiryPayload } from '@/types/inquiry';

export const inquiryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Public — guest or authenticated
    submitInquiry: builder.mutation<ApiResponse<{ inquiry_id: string }>, CreateInquiryPayload>({
      query: (body) => ({
        url: '/inquiries',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Inquiry', id: 'ADMIN_LIST' }],
    }),

    // Admin
    getAdminInquiries: builder.query<PaginatedResponse<InquiryListItem>, Record<string, unknown> | void>({
      query: (params) => ({
        url: '/admin/inquiries',
        params: params || undefined,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'Inquiry' as const, id })),
              { type: 'Inquiry', id: 'ADMIN_LIST' },
            ]
          : [{ type: 'Inquiry', id: 'ADMIN_LIST' }],
    }),

    getAdminInquiry: builder.query<ApiResponse<InquiryDetail>, string>({
      query: (id) => `/admin/inquiries/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Inquiry', id }],
    }),

    updateInquiryStatus: builder.mutation<ApiResponse<null>, { id: string; status: string; qualification?: string | null; staff_notes?: string }>({
      query: ({ id, ...body }) => ({
        url: `/admin/inquiries/${id}/status`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'Inquiry', id },
        { type: 'Inquiry', id: 'ADMIN_LIST' },
      ],
    }),

    assignInquiry: builder.mutation<ApiResponse<null>, { id: string; assigned_to: string }>({
      query: ({ id, assigned_to }) => ({
        url: `/admin/inquiries/${id}/assign`,
        method: 'PUT',
        body: { assigned_to },
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'Inquiry', id },
        { type: 'Inquiry', id: 'ADMIN_LIST' },
      ],
    }),
  }),
});

export const {
  useSubmitInquiryMutation,
  useGetAdminInquiriesQuery,
  useGetAdminInquiryQuery,
  useUpdateInquiryStatusMutation,
  useAssignInquiryMutation,
} = inquiryApi;
