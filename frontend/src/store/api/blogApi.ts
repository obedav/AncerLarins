import { baseApi } from './baseApi';
import type { ApiResponse, PaginatedResponse } from '@/types/api';
import type { BlogPostListItem, BlogPostDetail, CreateBlogPostPayload } from '@/types/blog';

export const blogApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPublicBlogPosts: builder.query<PaginatedResponse<BlogPostListItem>, Record<string, unknown> | void>({
      query: (params) => ({
        url: '/blog-posts',
        params: params || undefined,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'BlogPost' as const, id })),
              { type: 'BlogPost', id: 'LIST' },
            ]
          : [{ type: 'BlogPost', id: 'LIST' }],
    }),

    getBlogPostBySlug: builder.query<ApiResponse<BlogPostDetail>, string>({
      query: (slug) => `/blog-posts/${slug}`,
      providesTags: (_r, _e, slug) => [{ type: 'BlogPost', id: slug }],
    }),

    // Admin mutations
    createBlogPost: builder.mutation<ApiResponse<BlogPostDetail>, CreateBlogPostPayload>({
      query: (body) => ({ url: '/admin/blog-posts', method: 'POST', body }),
      invalidatesTags: [{ type: 'BlogPost', id: 'LIST' }],
    }),

    updateBlogPost: builder.mutation<ApiResponse<BlogPostDetail>, { id: string; data: Partial<CreateBlogPostPayload> }>({
      query: ({ id, data }) => ({ url: `/admin/blog-posts/${id}`, method: 'PUT', body: data }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'BlogPost', id }, { type: 'BlogPost', id: 'LIST' }],
    }),

    deleteBlogPost: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({ url: `/admin/blog-posts/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'BlogPost', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetPublicBlogPostsQuery,
  useGetBlogPostBySlugQuery,
  useCreateBlogPostMutation,
  useUpdateBlogPostMutation,
  useDeleteBlogPostMutation,
} = blogApi;
