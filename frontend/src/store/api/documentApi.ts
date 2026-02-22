import { baseApi } from './baseApi';
import type { ApiResponse } from '@/types/api';

export interface DocumentItem {
  id: string;
  type: string;
  title: string;
  file_name: string;
  mime_type: string | null;
  file_size: number;
  notes: string | null;
  status: 'pending' | 'approved' | 'rejected';
  uploaded_by: { id: string; full_name: string } | null;
  created_at: string;
}

export const documentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDocuments: builder.query<ApiResponse<DocumentItem[]>, string>({
      query: (leadId) => `/admin/inquiries/${leadId}/documents`,
      providesTags: (_r, _e, leadId) => [{ type: 'Document' as never, id: leadId }],
    }),

    uploadDocument: builder.mutation<ApiResponse<DocumentItem>, { leadId: string; formData: FormData }>({
      query: ({ leadId, formData }) => ({
        url: `/admin/inquiries/${leadId}/documents`,
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: (_r, _e, { leadId }) => [{ type: 'Document' as never, id: leadId }],
    }),

    updateDocumentStatus: builder.mutation<ApiResponse<null>, { id: string; status: string; notes?: string }>({
      query: ({ id, ...body }) => ({
        url: `/admin/documents/${id}/status`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Inquiry'],
    }),

    deleteDocument: builder.mutation<void, { id: string; leadId: string }>({
      query: ({ id }) => ({
        url: `/admin/documents/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_r, _e, { leadId }) => [{ type: 'Document' as never, id: leadId }],
    }),
  }),
});

export const {
  useGetDocumentsQuery,
  useUploadDocumentMutation,
  useUpdateDocumentStatusMutation,
  useDeleteDocumentMutation,
} = documentApi;
