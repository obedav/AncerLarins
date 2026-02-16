import { baseApi } from './baseApi';
import type {
  ApiResponse,
  PaginatedResponse,
  AdminProperty,
  AdminAgent,
  AdminDashboardStats,
  Report,
  User,
} from '@/types';

export const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminDashboard: builder.query<ApiResponse<AdminDashboardStats>, void>({
      query: () => '/admin/dashboard',
    }),

    // Property management
    getAdminProperties: builder.query<PaginatedResponse<AdminProperty>, Record<string, unknown> | void>({
      query: (params) => ({ url: '/admin/properties', params: params || undefined }),
      providesTags: [{ type: 'Property', id: 'ADMIN_LIST' }],
    }),

    approveProperty: builder.mutation<ApiResponse<unknown>, { property_id: string }>({
      query: (body) => ({ url: '/admin/properties/approve', method: 'POST', body }),
      invalidatesTags: [{ type: 'Property', id: 'LIST' }, { type: 'Property', id: 'ADMIN_LIST' }],
    }),

    rejectProperty: builder.mutation<ApiResponse<unknown>, { property_id: string; rejection_reason: string }>({
      query: (body) => ({ url: '/admin/properties/reject', method: 'POST', body }),
      invalidatesTags: [{ type: 'Property', id: 'LIST' }, { type: 'Property', id: 'ADMIN_LIST' }],
    }),

    // Agent management
    getAdminAgents: builder.query<PaginatedResponse<AdminAgent>, Record<string, unknown> | void>({
      query: (params) => ({ url: '/admin/agents', params: params || undefined }),
      providesTags: [{ type: 'Agent', id: 'ADMIN_LIST' }],
    }),

    verifyAgent: builder.mutation<ApiResponse<unknown>, { agent_profile_id: string }>({
      query: (body) => ({ url: '/admin/agents/verify', method: 'POST', body }),
      invalidatesTags: [{ type: 'Agent', id: 'LIST' }, { type: 'Agent', id: 'ADMIN_LIST' }],
    }),

    rejectAgent: builder.mutation<ApiResponse<unknown>, { agent_profile_id: string; rejection_reason: string }>({
      query: (body) => ({ url: '/admin/agents/reject', method: 'POST', body }),
      invalidatesTags: [{ type: 'Agent', id: 'LIST' }, { type: 'Agent', id: 'ADMIN_LIST' }],
    }),

    // User management
    getAdminUsers: builder.query<PaginatedResponse<User>, Record<string, unknown> | void>({
      query: (params) => ({ url: '/admin/users', params: params || undefined }),
      providesTags: [{ type: 'User', id: 'ADMIN_LIST' }],
    }),

    banUser: builder.mutation<ApiResponse<unknown>, { user_id: string; ban_reason: string }>({
      query: (body) => ({ url: '/admin/users/ban', method: 'POST', body }),
      invalidatesTags: [{ type: 'User', id: 'ADMIN_LIST' }],
    }),

    unbanUser: builder.mutation<ApiResponse<unknown>, { user_id: string }>({
      query: (body) => ({ url: '/admin/users/unban', method: 'POST', body }),
      invalidatesTags: [{ type: 'User', id: 'ADMIN_LIST' }],
    }),

    // Report management
    getAdminReports: builder.query<PaginatedResponse<Report>, Record<string, unknown> | void>({
      query: (params) => ({ url: '/admin/reports', params: params || undefined }),
    }),

    resolveReport: builder.mutation<ApiResponse<unknown>, { id: string; resolution_note: string }>({
      query: ({ id, ...body }) => ({
        url: `/admin/reports/${id}/resolve`,
        method: 'PUT',
        body,
      }),
    }),

    dismissReport: builder.mutation<ApiResponse<unknown>, string>({
      query: (id) => ({
        url: `/admin/reports/${id}/dismiss`,
        method: 'PUT',
      }),
    }),
  }),
});

export const {
  useGetAdminDashboardQuery,
  useGetAdminPropertiesQuery,
  useApprovePropertyMutation,
  useRejectPropertyMutation,
  useGetAdminAgentsQuery,
  useVerifyAgentMutation,
  useRejectAgentMutation,
  useGetAdminUsersQuery,
  useBanUserMutation,
  useUnbanUserMutation,
  useGetAdminReportsQuery,
  useResolveReportMutation,
  useDismissReportMutation,
} = adminApi;
