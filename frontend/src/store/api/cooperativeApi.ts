import { baseApi } from './baseApi';
import type { ApiResponse, PaginatedResponse } from '@/types/api';
import type {
  CooperativeListItem,
  CooperativeDetail,
  CreateCooperativePayload,
  CooperativeProgress,
} from '@/types/cooperative';

export const cooperativeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCooperatives: builder.query<PaginatedResponse<CooperativeListItem>, Record<string, unknown> | void>({
      query: (params) => ({
        url: '/cooperatives',
        params: params || undefined,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'Cooperative' as const, id })),
              { type: 'Cooperative', id: 'LIST' },
            ]
          : [{ type: 'Cooperative', id: 'LIST' }],
    }),

    getCooperative: builder.query<ApiResponse<CooperativeDetail>, string>({
      query: (id) => `/cooperatives/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Cooperative', id }],
    }),

    getMyCooperatives: builder.query<PaginatedResponse<CooperativeListItem>, Record<string, unknown> | void>({
      query: (params) => ({
        url: '/my-cooperatives',
        params: params || undefined,
      }),
      providesTags: [{ type: 'Cooperative', id: 'MY_LIST' }],
    }),

    createCooperative: builder.mutation<ApiResponse<CooperativeDetail>, CreateCooperativePayload>({
      query: (body) => ({ url: '/cooperatives', method: 'POST', body }),
      invalidatesTags: [
        { type: 'Cooperative', id: 'LIST' },
        { type: 'Cooperative', id: 'MY_LIST' },
      ],
    }),

    joinCooperative: builder.mutation<ApiResponse<unknown>, string>({
      query: (id) => ({ url: `/cooperatives/${id}/join`, method: 'POST' }),
      invalidatesTags: (_r, _e, id) => [
        { type: 'Cooperative', id },
        { type: 'Cooperative', id: 'MY_LIST' },
      ],
    }),

    contributeToCooperative: builder.mutation<
      ApiResponse<{ authorization_url: string; payment_reference: string }>,
      { cooperativeId: string; amount_kobo: number }
    >({
      query: ({ cooperativeId, amount_kobo }) => ({
        url: `/cooperatives/${cooperativeId}/contribute`,
        method: 'POST',
        body: { amount_kobo },
      }),
    }),

    verifyContribution: builder.mutation<ApiResponse<{ status: string; amount_kobo: number }>, string>({
      query: (reference) => ({
        url: '/cooperatives/verify-contribution',
        method: 'POST',
        body: { reference },
      }),
      invalidatesTags: [{ type: 'Cooperative', id: 'MY_LIST' }],
    }),

    getCooperativeProgress: builder.query<ApiResponse<CooperativeProgress>, string>({
      query: (id) => `/cooperatives/${id}/progress`,
    }),

    // Admin endpoints
    getAdminCooperatives: builder.query<PaginatedResponse<CooperativeListItem>, Record<string, unknown> | void>({
      query: (params) => ({
        url: '/admin/cooperatives',
        params: params || undefined,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'Cooperative' as const, id })),
              { type: 'Cooperative', id: 'ADMIN_LIST' },
            ]
          : [{ type: 'Cooperative', id: 'ADMIN_LIST' }],
    }),

    getAdminCooperative: builder.query<ApiResponse<CooperativeDetail>, string>({
      query: (id) => `/admin/cooperatives/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Cooperative', id }],
    }),

    updateCooperativeStatus: builder.mutation<ApiResponse<CooperativeDetail>, { id: string; status: string }>({
      query: ({ id, status }) => ({
        url: `/admin/cooperatives/${id}/status`,
        method: 'PUT',
        body: { status },
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'Cooperative', id },
        { type: 'Cooperative', id: 'ADMIN_LIST' },
        { type: 'Cooperative', id: 'LIST' },
      ],
    }),

    deleteCooperative: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({ url: `/admin/cooperatives/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Cooperative', id: 'ADMIN_LIST' }, { type: 'Cooperative', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetCooperativesQuery,
  useGetCooperativeQuery,
  useGetMyCooperativesQuery,
  useCreateCooperativeMutation,
  useJoinCooperativeMutation,
  useContributeToCooperativeMutation,
  useVerifyContributionMutation,
  useGetCooperativeProgressQuery,
  useGetAdminCooperativesQuery,
  useGetAdminCooperativeQuery,
  useUpdateCooperativeStatusMutation,
  useDeleteCooperativeMutation,
} = cooperativeApi;
