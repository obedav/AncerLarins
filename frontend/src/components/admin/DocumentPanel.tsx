'use client';

import { useState, useRef } from 'react';
import {
  useGetDocumentsQuery,
  useUploadDocumentMutation,
  useDeleteDocumentMutation,
  useUpdateDocumentStatusMutation,
} from '@/store/api/documentApi';
import type { DocumentItem } from '@/store/api/documentApi';

const DOC_TYPES = [
  { value: 'buyer_agreement', label: 'Buyer Agreement' },
  { value: 'proof_of_funds', label: 'Proof of Funds' },
  { value: 'id_verification', label: 'ID Verification' },
  { value: 'offer_letter', label: 'Offer Letter' },
  { value: 'other', label: 'Other' },
];

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DocumentPanel({ leadId }: { leadId: string }) {
  const { data, isLoading } = useGetDocumentsQuery(leadId);
  const [uploadDoc, { isLoading: uploading }] = useUploadDocumentMutation();
  const [deleteDoc] = useDeleteDocumentMutation();
  const [updateDocStatus] = useUpdateDocumentStatusMutation();

  const [showUpload, setShowUpload] = useState(false);
  const [docType, setDocType] = useState('buyer_agreement');
  const [docTitle, setDocTitle] = useState('');
  const [docNotes, setDocNotes] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const documents = data?.data || [];

  const handleUpload = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file || !docTitle.trim()) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', docType);
    formData.append('title', docTitle.trim());
    if (docNotes.trim()) formData.append('notes', docNotes.trim());

    try {
      await uploadDoc({ leadId, formData }).unwrap();
      setShowUpload(false);
      setDocTitle('');
      setDocNotes('');
      if (fileRef.current) fileRef.current.value = '';
    } catch { /* handled */ }
  };

  const handleStatusChange = async (doc: DocumentItem, status: string) => {
    try {
      await updateDocStatus({ id: doc.id, status }).unwrap();
    } catch { /* handled */ }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-text-primary">Documents</p>
        <button
          onClick={() => setShowUpload(!showUpload)}
          className="text-xs text-accent hover:text-accent-dark font-medium"
        >
          {showUpload ? 'Cancel' : '+ Upload'}
        </button>
      </div>

      {/* Upload form */}
      {showUpload && (
        <div className="bg-background border border-border rounded-lg p-3 mb-3 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="px-2.5 py-1.5 border border-border rounded-lg bg-surface text-text-primary text-sm"
            >
              {DOC_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            <input
              type="text"
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
              placeholder="Document title"
              className="px-2.5 py-1.5 border border-border rounded-lg bg-surface text-text-primary text-sm"
            />
          </div>
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            className="w-full text-xs text-text-muted file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-accent/10 file:text-accent file:text-xs file:font-medium file:cursor-pointer"
          />
          <textarea
            value={docNotes}
            onChange={(e) => setDocNotes(e.target.value)}
            placeholder="Notes (optional)"
            rows={2}
            className="w-full px-2.5 py-1.5 border border-border rounded-lg bg-surface text-text-primary text-sm resize-none"
          />
          <button
            onClick={handleUpload}
            disabled={uploading || !docTitle.trim()}
            className="px-3 py-1.5 rounded-lg bg-primary text-white text-sm font-medium disabled:opacity-50"
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      )}

      {/* Document list */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-14 bg-background rounded-lg animate-pulse" />
          ))}
        </div>
      ) : documents.length === 0 ? (
        <p className="text-xs text-text-muted py-3 text-center">No documents uploaded yet.</p>
      ) : (
        <div className="space-y-2">
          {documents.map((doc) => (
            <div key={doc.id} className="bg-background border border-border rounded-lg p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-medium text-text-primary truncate">{doc.title}</p>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded capitalize ${STATUS_COLORS[doc.status]}`}>
                      {doc.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-text-muted">
                    <span className="capitalize">{doc.type.replace(/_/g, ' ')}</span>
                    <span>{doc.file_name}</span>
                    <span>{formatFileSize(doc.file_size)}</span>
                  </div>
                  {doc.notes && <p className="text-xs text-text-muted mt-1">{doc.notes}</p>}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {doc.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleStatusChange(doc, 'approved')}
                        className="text-[10px] px-2 py-1 rounded bg-green-50 text-green-600 hover:bg-green-100"
                        title="Approve"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleStatusChange(doc, 'rejected')}
                        className="text-[10px] px-2 py-1 rounded bg-red-50 text-red-600 hover:bg-red-100"
                        title="Reject"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => deleteDoc({ id: doc.id, leadId })}
                    className="text-[10px] px-2 py-1 rounded text-red-400 hover:bg-red-50"
                    title="Delete"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
