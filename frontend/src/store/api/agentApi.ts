import { baseApi } from './baseApi';
import type {
  ApiResponse,
  PaginatedResponse,
  AgentListItem,
  AgentDetail,
  AgentReview,
  PropertyListItem,
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
  }),
});

export const {
  useGetAgentsQuery,
  useGetAgentQuery,
  useGetAgentListingsQuery,
  useGetAgentReviewsQuery,
  useGetAgentDashboardQuery,
  useGetAgentLeadsQuery,
} = agentApi;
