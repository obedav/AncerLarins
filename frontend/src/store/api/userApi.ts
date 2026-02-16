import { baseApi } from './baseApi';
import type { ApiResponse, PaginatedResponse, Notification, SavedSearch } from '@/types';

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Notifications
    getNotifications: builder.query<PaginatedResponse<Notification>, { page?: number; per_page?: number } | void>({
      query: (params) => ({
        url: '/me/notifications',
        params: params || undefined,
      }),
      providesTags: ['Notification'],
    }),

    getUnreadCount: builder.query<ApiResponse<{ count: number }>, void>({
      query: () => '/me/notifications/unread-count',
      providesTags: ['Notification'],
    }),

    markNotificationRead: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({
        url: `/me/notifications/${id}/read`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Notification'],
    }),

    markAllNotificationsRead: builder.mutation<ApiResponse<null>, void>({
      query: () => ({
        url: '/me/notifications/read-all',
        method: 'POST',
      }),
      invalidatesTags: ['Notification'],
    }),

    // Saved searches
    getSavedSearches: builder.query<ApiResponse<SavedSearch[]>, void>({
      query: () => '/me/saved-searches',
      providesTags: ['SavedSearch'],
    }),

    createSavedSearch: builder.mutation<
      ApiResponse<SavedSearch>,
      {
        name: string;
        listing_type?: string;
        property_type_id?: string;
        city_id?: string;
        area_ids?: string[];
        min_price?: number;
        max_price?: number;
        min_bedrooms?: number;
        max_bedrooms?: number;
        notification_frequency?: string;
      }
    >({
      query: (body) => ({
        url: '/me/saved-searches',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['SavedSearch'],
    }),

    deleteSavedSearch: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({
        url: `/me/saved-searches/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['SavedSearch'],
    }),

    // Push tokens
    registerPushToken: builder.mutation<ApiResponse<null>, { token: string; device_type: string }>({
      query: (body) => ({
        url: '/me/push-tokens',
        method: 'POST',
        body,
      }),
    }),

    removePushToken: builder.mutation<ApiResponse<null>, { token: string }>({
      query: (body) => ({
        url: '/me/push-tokens',
        method: 'DELETE',
        body,
      }),
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useGetSavedSearchesQuery,
  useCreateSavedSearchMutation,
  useDeleteSavedSearchMutation,
  useRegisterPushTokenMutation,
  useRemovePushTokenMutation,
} = userApi;
