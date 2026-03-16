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

const STATUS_BORDER: Record<PropertyRequestStatus, string> = {
  active: 'border-l-green-500',
  fulfilled: 'border-l-blue-500',
  expired: 'border-l-amber-500',
  cancelled: 'border-l-red-500',
};

const LISTING_COLORS: Record<ListingType, string> = {
  rent: 'bg-purple-100 text-purple-700',
  sale: 'bg-teal-100 text-teal-700',
  short_let: 'bg-orange-100 text-orange-700',
};

/* --- SVG Icons --- */

const ClipboardIcon = () => (
  <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
  </svg>
);

const HouseIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
  </svg>
);

const DollarIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
  </svg>
);

const XIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const EyeIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const PencilIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zM16.862 4.487L19.5 7.125" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
  </svg>
);

const UserIcon = () => (
  <svg className="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
  </svg>
);

const MapPinIcon = () => (
  <svg className="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
  </svg>
);

const BanknotesIcon = () => (
  <svg className="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
  </svg>
);

const InboxIcon = () => (
  <svg className="w-10 h-10 text-text-muted" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H6.911a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661z" />
  </svg>
);

const ChatBubbleIcon = () => (
  <svg className="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
  </svg>
);

const LISTING_ICON: Record<ListingType, React.ReactNode> = {
  rent: <HouseIcon />,
  sale: <DollarIcon />,
  short_let: <CalendarIcon />,
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
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="bg-primary/10 rounded-lg p-2.5">
          <ClipboardIcon />
        </div>
        <div>
          <h1 className="text-xl font-bold text-text-primary">Property Request Management</h1>
          <p className="text-sm text-text-muted">
            {meta?.total !== undefined ? `${meta.total} total requests` : 'Manage buyer and tenant requests'}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="bg-surface border border-border rounded-xl p-1 flex flex-wrap gap-1">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => { setStatusFilter(tab.value); setPage(1); }}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === tab.value
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-text-secondary hover:text-text-primary hover:bg-background'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <select
          value={listingTypeFilter}
          onChange={(e) => { setListingTypeFilter(e.target.value as '' | ListingType); setPage(1); }}
          className="px-3 py-1.5 border border-border rounded-lg bg-background text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
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
            <div key={i} className="bg-surface border border-border rounded-xl p-4 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-9 h-9 bg-border/60 rounded-lg shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-border/60 rounded w-1/3" />
                  <div className="flex gap-2">
                    <div className="h-3 bg-border/40 rounded-full w-16" />
                    <div className="h-3 bg-border/40 rounded-full w-14" />
                    <div className="h-3 bg-border/40 rounded-full w-20" />
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <div className="h-7 w-16 bg-border/40 rounded-lg" />
                  <div className="h-7 w-16 bg-border/40 rounded-lg" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : requests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-surface border border-border rounded-xl">
          <div className="bg-background rounded-full p-4 mb-4">
            <InboxIcon />
          </div>
          <h3 className="text-base font-semibold text-text-primary mb-1">No requests found</h3>
          <p className="text-sm text-text-muted">
            {statusFilter
              ? `No ${statusFilter} property requests at the moment.`
              : 'There are no property requests to display.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <div
              key={req.id}
              className={`bg-surface border border-border rounded-xl p-4 space-y-2 border-l-4 ${STATUS_BORDER[req.status]} hover:border-accent-dark/20 transition-colors`}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {/* Listing type icon */}
                  <div className={`shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${LISTING_COLORS[req.listing_type]}`}>
                    {LISTING_ICON[req.listing_type]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-text-primary truncate">{req.title}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className={`text-xs px-2 py-0.5 rounded-full capitalize font-medium ${LISTING_COLORS[req.listing_type]}`}>
                        {req.listing_type.replace(/_/g, ' ')}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full capitalize font-medium ${STATUS_COLORS[req.status]}`}>
                        {req.status}
                      </span>
                      {req.budget_kobo && (
                        <span className="text-xs text-text-muted flex items-center gap-1">
                          <BanknotesIcon />{formatPrice(req.budget_kobo)}
                        </span>
                      )}
                      <span className="text-xs text-text-muted flex items-center gap-1">
                        <ChatBubbleIcon />{req.response_count} responses
                      </span>
                      {req.area && (
                        <span className="text-xs text-text-muted flex items-center gap-1">
                          <MapPinIcon />{req.area.name}
                        </span>
                      )}
                      {req.expires_at && (
                        <span className="text-xs text-text-muted">
                          Expires: {formatDate(req.expires_at)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => setDetailId(req.id)}
                    className="inline-flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-lg px-2.5 py-1.5 transition-colors"
                  >
                    <EyeIcon />
                    View
                  </button>
                  <button
                    onClick={() => { setStatusChangeId(statusChangeId === req.id ? null : req.id); setNewStatus(req.status); }}
                    className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-lg px-2.5 py-1.5 transition-colors"
                  >
                    <PencilIcon />
                    Status
                  </button>
                  <button
                    onClick={() => handleDelete(req.id)}
                    className="inline-flex items-center gap-1 text-xs font-medium text-error bg-error/10 hover:bg-error/20 rounded-lg px-2.5 py-1.5 transition-colors"
                  >
                    <TrashIcon />
                    Delete
                  </button>
                </div>
              </div>

              {/* Inline status change */}
              {statusChangeId === req.id && (
                <div className="flex items-center gap-2 pt-3 mt-2 border-t border-border">
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as PropertyRequestStatus)}
                    className="px-3 py-1.5 border border-border rounded-lg bg-background text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    {STATUS_TABS.filter((t) => t.value).map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleStatusUpdate(req.id)}
                    disabled={updatingStatus}
                    className="px-3.5 py-1.5 rounded-lg bg-primary text-white text-sm font-medium disabled:opacity-50 hover:bg-primary/90 transition-colors"
                  >
                    {updatingStatus ? 'Updating...' : 'Update'}
                  </button>
                  <button
                    onClick={() => setStatusChangeId(null)}
                    className="px-3.5 py-1.5 rounded-lg border border-border text-sm text-text-secondary hover:bg-background transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          ))}

          {/* Pagination */}
          {meta && meta.last_page > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-text-muted">
                Page <span className="font-medium text-text-primary">{meta.current_page}</span> of <span className="font-medium text-text-primary">{meta.last_page}</span>
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-3.5 py-1.5 rounded-lg border border-border text-sm font-medium text-text-secondary hover:bg-surface disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(Math.min(meta.last_page, page + 1))}
                  disabled={page === meta.last_page}
                  className="px-3.5 py-1.5 rounded-lg border border-border text-sm font-medium text-text-secondary hover:bg-surface disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Detail Modal */}
      {detailId && detail && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setDetailId(null)}
        >
          <div
            className="bg-surface border border-border rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="sticky top-0 bg-surface border-b border-border rounded-t-2xl px-6 py-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${LISTING_COLORS[detail.listing_type]}`}>
                  {LISTING_ICON[detail.listing_type]}
                </div>
                <h2 className="text-lg font-bold text-text-primary truncate">{detail.title}</h2>
              </div>
              <button
                onClick={() => setDetailId(null)}
                className="shrink-0 w-8 h-8 rounded-lg bg-background hover:bg-border/40 flex items-center justify-center text-text-muted hover:text-text-primary transition-colors"
              >
                <XIcon />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Status badges */}
              <div className="flex flex-wrap gap-2">
                <span className={`text-xs px-2.5 py-1 rounded-full capitalize font-medium ${LISTING_COLORS[detail.listing_type]}`}>
                  {detail.listing_type.replace(/_/g, ' ')}
                </span>
                <span className={`text-xs px-2.5 py-1 rounded-full capitalize font-medium ${STATUS_COLORS[detail.status]}`}>
                  {detail.status}
                </span>
              </div>

              {/* Detail grid */}
              <div className="bg-background rounded-xl p-4">
                <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                  {detail.user && (
                    <div className="flex items-center gap-2">
                      <UserIcon />
                      <div>
                        <span className="text-text-muted text-xs block">Requester</span>
                        <span className="text-text-primary font-medium">{detail.user.full_name}</span>
                      </div>
                    </div>
                  )}
                  {detail.budget_kobo && (
                    <div className="flex items-center gap-2">
                      <BanknotesIcon />
                      <div>
                        <span className="text-text-muted text-xs block">Budget</span>
                        <span className="text-text-primary font-medium">{formatPrice(detail.budget_kobo)}</span>
                      </div>
                    </div>
                  )}
                  {detail.min_bedrooms != null && (
                    <div className="flex items-center gap-2">
                      <HouseIcon />
                      <div>
                        <span className="text-text-muted text-xs block">Bedrooms</span>
                        <span className="text-text-primary font-medium">{detail.min_bedrooms}{detail.max_bedrooms ? ` - ${detail.max_bedrooms}` : '+'}</span>
                      </div>
                    </div>
                  )}
                  {detail.min_price_kobo && (
                    <div className="flex items-center gap-2">
                      <DollarIcon />
                      <div>
                        <span className="text-text-muted text-xs block">Price Range</span>
                        <span className="text-text-primary font-medium">{formatPrice(detail.min_price_kobo)}{detail.max_price_kobo ? ` - ${formatPrice(detail.max_price_kobo)}` : '+'}</span>
                      </div>
                    </div>
                  )}
                  {detail.area && (
                    <div className="flex items-center gap-2">
                      <MapPinIcon />
                      <div>
                        <span className="text-text-muted text-xs block">Area</span>
                        <span className="text-text-primary font-medium">{detail.area.name}</span>
                      </div>
                    </div>
                  )}
                  {detail.city && (
                    <div className="flex items-center gap-2">
                      <MapPinIcon />
                      <div>
                        <span className="text-text-muted text-xs block">City</span>
                        <span className="text-text-primary font-medium">{detail.city.name}</span>
                      </div>
                    </div>
                  )}
                  {detail.property_type && (
                    <div className="flex items-center gap-2">
                      <HouseIcon />
                      <div>
                        <span className="text-text-muted text-xs block">Type</span>
                        <span className="text-text-primary font-medium">{detail.property_type.name}</span>
                      </div>
                    </div>
                  )}
                  {detail.move_in_date && (
                    <div className="flex items-center gap-2">
                      <CalendarIcon />
                      <div>
                        <span className="text-text-muted text-xs block">Move-in</span>
                        <span className="text-text-primary font-medium">{formatDate(detail.move_in_date)}</span>
                      </div>
                    </div>
                  )}
                  {detail.expires_at && (
                    <div className="flex items-center gap-2">
                      <CalendarIcon />
                      <div>
                        <span className="text-text-muted text-xs block">Expires</span>
                        <span className="text-text-primary font-medium">{formatDate(detail.expires_at)}</span>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <CalendarIcon />
                    <div>
                      <span className="text-text-muted text-xs block">Created</span>
                      <span className="text-text-primary font-medium">{formatDate(detail.created_at)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              {detail.description && (
                <div>
                  <p className="text-sm font-semibold text-text-primary mb-2">Description</p>
                  <p className="text-sm text-text-secondary leading-relaxed bg-background rounded-xl p-4">{detail.description}</p>
                </div>
              )}

              {/* Amenity preferences */}
              {detail.amenity_preferences && detail.amenity_preferences.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-text-primary mb-2">Amenity Preferences</p>
                  <div className="flex flex-wrap gap-1.5">
                    {detail.amenity_preferences.map((amenity) => (
                      <span key={amenity} className="text-xs bg-accent/15 text-accent-dark px-2.5 py-1 rounded-full font-medium">{amenity}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Responses list */}
              {detail.responses && detail.responses.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                    <ChatBubbleIcon />
                    Responses ({detail.responses.length})
                  </p>
                  <div className="space-y-2">
                    {detail.responses.map((resp) => (
                      <div key={resp.id} className="bg-background rounded-xl p-4 text-sm space-y-2 border border-border/50">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-text-primary">{resp.agent?.company_name || 'Unknown Agent'}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full capitalize font-medium ${
                            resp.status === 'accepted' ? 'bg-green-100 text-green-700' :
                            resp.status === 'rejected' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>{resp.status}</span>
                        </div>
                        <p className="text-text-secondary leading-relaxed">{resp.message}</p>
                        <div className="flex items-center gap-3 text-xs text-text-muted pt-1 border-t border-border/50">
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
