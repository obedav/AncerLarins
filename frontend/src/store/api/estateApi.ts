import { baseApi } from './baseApi';
import type { ApiResponse, PaginatedResponse } from '@/types/api';
import type { EstateListItem, EstateDetail, EstateReview, CreateEstateReviewPayload } from '@/types/estate';

export const estateApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getEstates: builder.query<PaginatedResponse<EstateListItem>, Record<string, unknown> | void>({
      query: (params) => ({
        url: '/estates',
        params: params || undefined,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'Estate' as const, id })),
              { type: 'Estate', id: 'LIST' },
            ]
          : [{ type: 'Estate', id: 'LIST' }],
    }),

    getEstateBySlug: builder.query<ApiResponse<EstateDetail>, string>({
      query: (slug) => `/estates/${slug}`,
      providesTags: (_r, _e, slug) => [{ type: 'Estate', id: slug }],
    }),

    createEstateReview: builder.mutation<ApiResponse<EstateReview>, { estateId: string; data: CreateEstateReviewPayload }>({
      query: ({ estateId, data }) => ({
        url: `/estates/${estateId}/reviews`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_r, _e, { estateId }) => [{ type: 'Estate', id: estateId }],
    }),
  }),
});

export const {
  useGetEstatesQuery,
  useGetEstateBySlugQuery,
  useCreateEstateReviewMutation,
} = estateApi;
