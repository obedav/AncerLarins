'use client';

import { useState } from 'react';
import {
  useGetAdminPropertyRequestsQuery,
  useGetAdminPropertyRequestQuery,
  useAdminUpdateRequestStatusMutation,
  useAdminDeletePropertyRequestMutation,
} from '@/store/api/requestApi';
import { formatDate, formatPrice } from '@/lib/utils';
import type { PropertyRequestStatus } from '@/types/request';
import type { ListingType } from '@/types/property';

const STATUS_TABS: { value: '' | PropertyRequestStatus; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'fulfilled', label: 'Fulfilled' },
  { value: 'expired', label: 'Expired' },
  { value: 'cancelled', label: 'Cancelled' },
];

const LISTING_TYPE_OPTIONS: { value: '' | ListingType; label: string }[] = [
  { value: '', label: 'All Types' },
  { value: 'rent', label: 'Rent' },
  { value: 'sale', label: 'Sale' },
  { value: 'short_let', label: 'Short Let' },
];

const STATUS_COLORS: Record<PropertyRequestStatus, string> = {
  active: 'bg-green-100 text-green-700',
  fulfilled: 'bg-blue-100 text-blue-700',
  expired: 'bg-amber-100 text-amber-700',
  cancelled: 'bg-red-100 text-red-700',
};

const LISTING_COLORS: Record<ListingType, string> = {
  rent: 'bg-purple-100 text-purple-700',
  sale: 'bg-teal-100 text-teal-700',
  short_let: 'bg-orange-100 text-orange-700',
};

export default function AdminRequestsPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<'' | PropertyRequestStatus>('');
  const [listingTypeFilter, setListingTypeFilter] = useState<'' | ListingType>('');
  const [detailId, setDetailId] = useState<string | null>(null);
  const [statusChangeId, setStatusChangeId] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState<PropertyRequestStatus>('active');

  const { data, isLoading } = useGetAdminPropertyRequestsQuery({
    page,
    per_page: 20,
    ...(statusFilter ? { status: statusFilter } : {}),
    ...(listingTypeFilter ? { listing_type: listingTypeFilter } : {}),
  });
  const { data: detailData } = useGetAdminPropertyRequestQuery(detailId!, { skip: !detailId });
  const [updateStatus, { isLoading: updatingStatus }] = useAdminUpdateRequestStatusMutation();
  const [deleteRequest] = useAdminDeletePropertyRequestMutation();

  const requests = data?.data || [];
  const meta = data?.meta;
  const detail = detailData?.data;

  const handleStatusUpdate = async (id: string) => {
    try {
      await updateStatus({ id, status: newStatus }).unwrap();
      setStatusChangeId(null);
    } catch { /* RTK handles */ }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this property request?')) return;
    try {
      await deleteRequest(id).unwrap();
    } catch { /* RTK handles */ }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-text-primary">Property Request Management</h1>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-2">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => { setStatusFilter(tab.value); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === tab.value
                  ? 'bg-primary text-white'
                  : 'bg-surface border border-border text-text-secondary hover:bg-background'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <select
          value={listingTypeFilter}
          onChange={(e) => { setListingTypeFilter(e.target.value as '' | ListingType); setPage(1); }}
          className="px-3 py-1.5 border border-border rounded-lg bg-background text-text-primary text-sm"
        >
          {LISTING_TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-surface border border-border rounded-xl p-4 animate-pulse h-20" />
          ))}
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-16 bg-surface border border-border rounded-xl">
          <p className="text-text-muted">No property requests found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <div key={req.id} className="bg-surface border border-border rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-text-primary truncate">{req.title}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${LISTING_COLORS[req.listing_type]}`}>
                      {req.listing_type.replace(/_/g, ' ')}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${STATUS_COLORS[req.status]}`}>
                      {req.status}
                    </span>
                    {req.budget_kobo && <span className="text-xs text-text-muted">{formatPrice(req.budget_kobo)}</span>}
                    <span className="text-xs text-text-muted">{req.response_count} responses</span>
                    {req.area && <span className="text-xs text-text-muted">{req.area.name}</span>}
                    {req.expires_at && <span className="text-xs text-text-muted">Expires: {formatDate(req.expires_at)}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setDetailId(req.id)}
                    className="text-xs text-primary hover:underline px-2 py-1"
                  >
                    View
                  </button>
                  <button
                    onClick={() => { setStatusChangeId(statusChangeId === req.id ? null : req.id); setNewStatus(req.status); }}
                    className="text-xs text-amber-600 hover:underline px-2 py-1"
                  >
                    Status
                  </button>
                  <button
                    onClick={() => handleDelete(req.id)}
                    className="text-xs text-error hover:underline px-2 py-1"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Inline status change */}
              {statusChangeId === req.id && (
                <div className="flex items-center gap-2 pt-2 border-t border-border">
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as PropertyRequestStatus)}
                    className="px-3 py-1.5 border border-border rounded-lg bg-background text-text-primary text-sm"
                  >
                    {STATUS_TABS.filter((t) => t.value).map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleStatusUpdate(req.id)}
                    disabled={updatingStatus}
                    className="px-3 py-1.5 rounded-lg bg-primary text-white text-sm font-medium disabled:opacity-50"
                  >
                    Update
                  </button>
                  <button
                    onClick={() => setStatusChangeId(null)}
                    className="px-3 py-1.5 rounded-lg border border-border text-sm text-text-secondary"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          ))}

          {meta && meta.last_page > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-xs text-text-muted">Page {meta.current_page} of {meta.last_page}</p>
              <div className="flex gap-2">
                <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="px-3 py-1 rounded-lg border border-border text-xs disabled:opacity-40">Previous</button>
                <button onClick={() => setPage(Math.min(meta.last_page, page + 1))} disabled={page === meta.last_page} className="px-3 py-1 rounded-lg border border-border text-xs disabled:opacity-40">Next</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Detail Modal */}
      {detailId && detail && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setDetailId(null)}>
          <div className="bg-surface border border-border rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-text-primary">{detail.title}</h2>
              <button onClick={() => setDetailId(null)} className="text-text-muted hover:text-text-primary text-xl">&times;</button>
            </div>

            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${LISTING_COLORS[detail.listing_type]}`}>
                  {detail.listing_type.replace(/_/g, ' ')}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${STATUS_COLORS[detail.status]}`}>
                  {detail.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                {detail.user && <div><span className="text-text-muted">Requester:</span> <span className="text-text-primary">{detail.user.full_name}</span></div>}
                {detail.budget_kobo && <div><span className="text-text-muted">Budget:</span> <span className="text-text-primary">{formatPrice(detail.budget_kobo)}</span></div>}
                {detail.min_bedrooms != null && <div><span className="text-text-muted">Bedrooms:</span> <span className="text-text-primary">{detail.min_bedrooms}{detail.max_bedrooms ? ` - ${detail.max_bedrooms}` : '+'}</span></div>}
                {detail.min_price_kobo && <div><span className="text-text-muted">Price Range:</span> <span className="text-text-primary">{formatPrice(detail.min_price_kobo)}{detail.max_price_kobo ? ` - ${formatPrice(detail.max_price_kobo)}` : '+'}</span></div>}
                {detail.area && <div><span className="text-text-muted">Area:</span> <span className="text-text-primary">{detail.area.name}</span></div>}
                {detail.city && <div><span className="text-text-muted">City:</span> <span className="text-text-primary">{detail.city.name}</span></div>}
                {detail.property_type && <div><span className="text-text-muted">Type:</span> <span className="text-text-primary">{detail.property_type.name}</span></div>}
                {detail.move_in_date && <div><span className="text-text-muted">Move-in:</span> <span className="text-text-primary">{formatDate(detail.move_in_date)}</span></div>}
                {detail.expires_at && <div><span className="text-text-muted">Expires:</span> <span className="text-text-primary">{formatDate(detail.expires_at)}</span></div>}
                <div><span className="text-text-muted">Created:</span> <span className="text-text-primary">{formatDate(detail.created_at)}</span></div>
              </div>

              {detail.description && (
                <div>
                  <p className="text-sm text-text-muted mb-1">Description</p>
                  <p className="text-sm text-text-primary">{detail.description}</p>
                </div>
              )}

              {detail.amenity_preferences && detail.amenity_preferences.length > 0 && (
                <div>
                  <p className="text-sm text-text-muted mb-1">Amenity Preferences</p>
                  <div className="flex flex-wrap gap-1">
                    {detail.amenity_preferences.map((amenity) => (
                      <span key={amenity} className="text-xs bg-accent/15 text-accent-dark px-2 py-0.5 rounded-full">{amenity}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Responses list */}
              {detail.responses && detail.responses.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-text-primary mb-2">Responses ({detail.responses.length})</p>
                  <div className="space-y-2">
                    {detail.responses.map((resp) => (
                      <div key={resp.id} className="bg-background rounded-lg p-3 text-sm space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-text-primary">{resp.agent?.company_name || 'Unknown Agent'}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                            resp.status === 'accepted' ? 'bg-green-100 text-green-700' :
                            resp.status === 'rejected' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>{resp.status}</span>
                        </div>
                        <p className="text-text-secondary">{resp.message}</p>
                        <div className="flex items-center gap-3 text-xs text-text-muted">
                          {resp.proposed_price_kobo && <span>Proposed: {formatPrice(resp.proposed_price_kobo)}</span>}
                          {resp.property && <span>Property: {resp.property.title}</span>}
                          <span>{formatDate(resp.created_at)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
