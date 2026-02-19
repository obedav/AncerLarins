import { baseApi } from './baseApi';
import type { ApiResponse, PaginatedResponse } from '@/types/api';
import type {
  PropertyRequestListItem,
  PropertyRequestDetail,
  CreatePropertyRequestPayload,
  RespondToRequestPayload,
} from '@/types/request';

export const requestApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Public: browse active requests (for agents)
    getPropertyRequests: builder.query<PaginatedResponse<PropertyRequestListItem>, Record<string, unknown> | void>({
      query: (params) => ({
        url: '/property-requests',
        params: params || undefined,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'PropertyRequest' as const, id })),
              { type: 'PropertyRequest', id: 'LIST' },
            ]
          : [{ type: 'PropertyRequest', id: 'LIST' }],
    }),

    // Auth: user's own requests
    getMyRequests: builder.query<PaginatedResponse<PropertyRequestListItem>, Record<string, unknown> | void>({
      query: (params) => ({
        url: '/my-requests',
        params: params || undefined,
      }),
      providesTags: [{ type: 'PropertyRequest', id: 'MY_LIST' }],
    }),

    // Public: single request detail
    getPropertyRequest: builder.query<ApiResponse<PropertyRequestDetail>, string>({
      query: (id) => `/property-requests/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'PropertyRequest', id }],
    }),

    // Auth: create a request
    createPropertyRequest: builder.mutation<ApiResponse<PropertyRequestDetail>, CreatePropertyRequestPayload>({
      query: (body) => ({ url: '/property-requests', method: 'POST', body }),
      invalidatesTags: [
        { type: 'PropertyRequest', id: 'LIST' },
        { type: 'PropertyRequest', id: 'MY_LIST' },
      ],
    }),

    // Agent: respond to a request
    respondToRequest: builder.mutation<ApiResponse<unknown>, { requestId: string; data: RespondToRequestPayload }>({
      query: ({ requestId, data }) => ({
        url: `/agent/property-requests/${requestId}/respond`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_r, _e, { requestId }) => [{ type: 'PropertyRequest', id: requestId }],
    }),

    // Owner: accept a response
    acceptRequestResponse: builder.mutation<ApiResponse<null>, { requestId: string; responseId: string }>({
      query: ({ requestId, responseId }) => ({
        url: `/property-requests/${requestId}/responses/${responseId}/accept`,
        method: 'POST',
      }),
      invalidatesTags: (_r, _e, { requestId }) => [
        { type: 'PropertyRequest', id: requestId },
        { type: 'PropertyRequest', id: 'MY_LIST' },
      ],
    }),

    // Owner: delete a request
    deletePropertyRequest: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({ url: `/property-requests/${id}`, method: 'DELETE' }),
      invalidatesTags: [
        { type: 'PropertyRequest', id: 'LIST' },
        { type: 'PropertyRequest', id: 'MY_LIST' },
      ],
    }),

    // Admin endpoints
    getAdminPropertyRequests: builder.query<PaginatedResponse<PropertyRequestListItem>, Record<string, unknown> | void>({
      query: (params) => ({
        url: '/admin/property-requests',
        params: params || undefined,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'PropertyRequest' as const, id })),
              { type: 'PropertyRequest', id: 'ADMIN_LIST' },
            ]
          : [{ type: 'PropertyRequest', id: 'ADMIN_LIST' }],
    }),

    getAdminPropertyRequest: builder.query<ApiResponse<PropertyRequestDetail>, string>({
      query: (id) => `/admin/property-requests/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'PropertyRequest', id }],
    }),

    adminUpdateRequestStatus: builder.mutation<ApiResponse<PropertyRequestDetail>, { id: string; status: string }>({
      query: ({ id, status }) => ({
        url: `/admin/property-requests/${id}/status`,
        method: 'PUT',
        body: { status },
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'PropertyRequest', id },
        { type: 'PropertyRequest', id: 'ADMIN_LIST' },
        { type: 'PropertyRequest', id: 'LIST' },
      ],
    }),

    adminDeletePropertyRequest: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({ url: `/admin/property-requests/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'PropertyRequest', id: 'ADMIN_LIST' }, { type: 'PropertyRequest', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetPropertyRequestsQuery,
  useGetMyRequestsQuery,
  useGetPropertyRequestQuery,
  useCreatePropertyRequestMutation,
  useRespondToRequestMutation,
  useAcceptRequestResponseMutation,
  useDeletePropertyRequestMutation,
  useGetAdminPropertyRequestsQuery,
  useGetAdminPropertyRequestQuery,
  useAdminUpdateRequestStatusMutation,
  useAdminDeletePropertyRequestMutation,
} = requestApi;
