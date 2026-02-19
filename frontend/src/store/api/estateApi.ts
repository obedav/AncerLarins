import { baseApi } from './baseApi';
import type { ApiResponse, PaginatedResponse } from '@/types/api';
import type { EstateListItem, EstateDetail, EstateReview, CreateEstateReviewPayload, CreateEstatePayload } from '@/types/estate';

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

    // Admin endpoints
    getAdminEstates: builder.query<PaginatedResponse<EstateListItem>, Record<string, unknown> | void>({
      query: (params) => ({
        url: '/admin/estates',
        params: params || undefined,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'Estate' as const, id })),
              { type: 'Estate', id: 'ADMIN_LIST' },
            ]
          : [{ type: 'Estate', id: 'ADMIN_LIST' }],
    }),

    createEstate: builder.mutation<ApiResponse<EstateDetail>, CreateEstatePayload>({
      query: (body) => ({ url: '/admin/estates', method: 'POST', body }),
      invalidatesTags: [{ type: 'Estate', id: 'ADMIN_LIST' }, { type: 'Estate', id: 'LIST' }],
    }),

    updateEstate: builder.mutation<ApiResponse<EstateDetail>, { id: string; data: Partial<CreateEstatePayload> }>({
      query: ({ id, data }) => ({ url: `/admin/estates/${id}`, method: 'PUT', body: data }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Estate', id }, { type: 'Estate', id: 'ADMIN_LIST' }, { type: 'Estate', id: 'LIST' }],
    }),

    deleteEstate: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({ url: `/admin/estates/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Estate', id: 'ADMIN_LIST' }, { type: 'Estate', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetEstatesQuery,
  useGetEstateBySlugQuery,
  useCreateEstateReviewMutation,
  useGetAdminEstatesQuery,
  useCreateEstateMutation,
  useUpdateEstateMutation,
  useDeleteEstateMutation,
} = estateApi;
