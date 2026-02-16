import { baseApi } from './baseApi';
import type {
  ApiResponse,
  PaginatedResponse,
  AgentListItem,
  AgentDetail,
  AgentReview,
  PropertyListItem,
  PropertyDetail,
  Lead,
} from '@/types';

export const agentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAgents: builder.query<PaginatedResponse<AgentListItem>, Record<string, unknown> | void>({
      query: (params) => ({ url: '/agents', params: params || undefined }),
      providesTags: [{ type: 'Agent', id: 'LIST' }],
    }),

    getAgent: builder.query<ApiResponse<AgentDetail>, string>({
      query: (id) => `/agents/${id}`,
      providesTags: (_result, _err, id) => [{ type: 'Agent', id }],
    }),

    getAgentListings: builder.query<PaginatedResponse<PropertyListItem>, { id: string; page?: number }>({
      query: ({ id, ...params }) => ({ url: `/agents/${id}/listings`, params }),
    }),

    getAgentReviews: builder.query<PaginatedResponse<AgentReview>, { id: string; page?: number }>({
      query: ({ id, ...params }) => ({ url: `/agents/${id}/reviews`, params }),
    }),

    getAgentDashboard: builder.query<ApiResponse<Record<string, unknown>>, void>({
      query: () => '/agent/dashboard',
    }),

    getAgentLeads: builder.query<PaginatedResponse<Lead>, Record<string, unknown> | void>({
      query: (params) => ({ url: '/agent/leads', params: params || undefined }),
      providesTags: ['Lead'],
    }),

    // Agent's own listings management
    getMyListings: builder.query<PaginatedResponse<PropertyListItem>, Record<string, unknown> | void>({
      query: (params) => ({ url: '/agent/properties', params: params || undefined }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'Property' as const, id })),
              { type: 'Property', id: 'MY_LIST' },
            ]
          : [{ type: 'Property', id: 'MY_LIST' }],
    }),

    getMyPropertyById: builder.query<ApiResponse<PropertyDetail>, string>({
      query: (id) => `/agent/properties/${id}`,
      providesTags: (_result, _err, id) => [{ type: 'Property', id }],
    }),

    // Agent profile management
    updateAgentProfile: builder.mutation<ApiResponse<AgentDetail>, Partial<{
      company_name: string;
      bio: string;
      whatsapp_number: string;
      office_address: string;
      website: string;
      specializations: string[];
      years_experience: number;
    }>>({
      query: (body) => ({ url: '/agent/profile', method: 'PUT', body }),
      invalidatesTags: [{ type: 'Agent', id: 'LIST' }],
    }),

    submitVerification: builder.mutation<ApiResponse<unknown>, FormData>({
      query: (formData) => ({
        url: '/agent/verification',
        method: 'POST',
        body: formData,
      }),
    }),

    // Property image management
    uploadPropertyImages: builder.mutation<ApiResponse<unknown>, { propertyId: string; formData: FormData }>({
      query: ({ propertyId, formData }) => ({
        url: `/agent/properties/${propertyId}/images`,
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: (_result, _err, { propertyId }) => [{ type: 'Property', id: propertyId }],
    }),

    deletePropertyImage: builder.mutation<ApiResponse<null>, { propertyId: string; imageId: string }>({
      query: ({ propertyId, imageId }) => ({
        url: `/agent/properties/${propertyId}/images/${imageId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _err, { propertyId }) => [{ type: 'Property', id: propertyId }],
    }),

    setCoverImage: builder.mutation<ApiResponse<unknown>, { propertyId: string; imageId: string }>({
      query: ({ propertyId, imageId }) => ({
        url: `/agent/properties/${propertyId}/images/${imageId}/cover`,
        method: 'PUT',
      }),
      invalidatesTags: (_result, _err, { propertyId }) => [{ type: 'Property', id: propertyId }],
    }),

    // Lead management
    respondToLead: builder.mutation<ApiResponse<Lead>, string>({
      query: (leadId) => ({
        url: `/agent/leads/${leadId}/respond`,
        method: 'PUT',
      }),
      invalidatesTags: ['Lead'],
    }),
  }),
});

export const {
  useGetAgentsQuery,
  useGetAgentQuery,
  useGetAgentListingsQuery,
  useGetAgentReviewsQuery,
  useGetAgentDashboardQuery,
  useGetAgentLeadsQuery,
  useGetMyListingsQuery,
  useGetMyPropertyByIdQuery,
  useUpdateAgentProfileMutation,
  useSubmitVerificationMutation,
  useUploadPropertyImagesMutation,
  useDeletePropertyImageMutation,
  useSetCoverImageMutation,
  useRespondToLeadMutation,
} = agentApi;
