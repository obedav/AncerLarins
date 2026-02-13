import { baseApi } from './baseApi';
import type { ApiResponse, PaginatedResponse } from '@/types';

export const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminDashboard: builder.query<ApiResponse<Record<string, unknown>>, void>({
      query: () => '/admin/dashboard',
    }),

    getPendingProperties: builder.query<PaginatedResponse<Record<string, unknown>>, Record<string, unknown> | void>({
      query: (params) => ({ url: '/admin/properties/pending', params: params || undefined }),
    }),

    approveProperty: builder.mutation<ApiResponse<unknown>, { property_id: string }>({
      query: (body) => ({ url: '/admin/properties/approve', method: 'POST', body }),
      invalidatesTags: [{ type: 'Property', id: 'LIST' }],
    }),

    rejectProperty: builder.mutation<ApiResponse<unknown>, { property_id: string; rejection_reason: string }>({
      query: (body) => ({ url: '/admin/properties/reject', method: 'POST', body }),
      invalidatesTags: [{ type: 'Property', id: 'LIST' }],
    }),

    getPendingAgents: builder.query<PaginatedResponse<Record<string, unknown>>, Record<string, unknown> | void>({
      query: (params) => ({ url: '/admin/agents/pending', params: params || undefined }),
    }),

    verifyAgent: builder.mutation<ApiResponse<unknown>, { agent_profile_id: string }>({
      query: (body) => ({ url: '/admin/agents/verify', method: 'POST', body }),
      invalidatesTags: [{ type: 'Agent', id: 'LIST' }],
    }),

    rejectAgent: builder.mutation<ApiResponse<unknown>, { agent_profile_id: string; rejection_reason: string }>({
      query: (body) => ({ url: '/admin/agents/reject', method: 'POST', body }),
      invalidatesTags: [{ type: 'Agent', id: 'LIST' }],
    }),

    banUser: builder.mutation<ApiResponse<unknown>, { user_id: string; ban_reason: string }>({
      query: (body) => ({ url: '/admin/users/ban', method: 'POST', body }),
    }),
  }),
});

export const {
  useGetAdminDashboardQuery,
  useGetPendingPropertiesQuery,
  useApprovePropertyMutation,
  useRejectPropertyMutation,
  useGetPendingAgentsQuery,
  useVerifyAgentMutation,
  useRejectAgentMutation,
  useBanUserMutation,
} = adminApi;
