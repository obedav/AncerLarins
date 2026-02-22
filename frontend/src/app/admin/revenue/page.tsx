'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  useGetCommissionsQuery,
  useGetRevenueSummaryQuery,
  useCreateCommissionMutation,
  useUpdateCommissionStatusMutation,
  useCalculateCommissionMutation,
} from '@/store/api/commissionApi';
import { formatRelativeTime } from '@/lib/utils';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  invoiced: 'bg-blue-100 text-blue-700',
  paid: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

function formatKobo(kobo: number): string {
  return '₦' + (kobo / 100).toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-surface border border-border rounded-xl p-4">
      <p className="text-xs text-text-muted uppercase tracking-wider mb-1">{label}</p>
      <p className="text-xl font-bold text-text-primary">{value}</p>
      {sub && <p className="text-xs text-text-muted mt-0.5">{sub}</p>}
    </div>
  );
}

export default function AdminRevenuePage() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  // Form state
  const [leadId, setLeadId] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [rate, setRate] = useState('2.5');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [notes, setNotes] = useState('');

  const { data: summary, isLoading: loadingSummary } = useGetRevenueSummaryQuery({ year });
  const { data: commissions, isLoading: loadingCommissions } = useGetCommissionsQuery({
    page,
    per_page: 20,
    ...(statusFilter ? { status: statusFilter } : {}),
  });
  const [createCommission, { isLoading: creating }] = useCreateCommissionMutation();
  const [updateStatus] = useUpdateCommissionStatusMutation();
  const [calcCommission] = useCalculateCommissionMutation();

  const summaryData = summary?.data;
  const items = commissions?.data || [];
  const meta = commissions?.meta;

  // Revenue bar chart (simple CSS-based)
  const maxMonthly = summaryData?.monthly_revenue?.reduce((max, m) => Math.max(max, m.total_kobo), 0) || 1;

  const handleCreate = async () => {
    if (!leadId || !salePrice) return;
    const priceKobo = Math.round(parseFloat(salePrice) * 100);
    try {
      await createCommission({
        lead_id: leadId,
        sale_price_kobo: priceKobo,
        commission_rate: parseFloat(rate),
        ...(paymentMethod ? { payment_method: paymentMethod } : {}),
        ...(notes ? { notes } : {}),
      }).unwrap();
      setShowCreate(false);
      setLeadId('');
      setSalePrice('');
      setRate('2.5');
      setPaymentMethod('');
      setNotes('');
    } catch { /* handled */ }
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      await updateStatus({ id, status: newStatus }).unwrap();
    } catch { /* handled */ }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-text-primary">Revenue & Commissions</h1>
        <div className="flex items-center gap-3">
          <select
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            className="px-3 py-1.5 border border-border rounded-lg bg-surface text-text-primary text-sm"
          >
            {Array.from({ length: 5 }, (_, i) => currentYear - i).map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="px-3 py-1.5 rounded-lg bg-accent text-primary text-sm font-medium hover:bg-accent-dark transition-colors"
          >
            + Record Commission
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      {loadingSummary ? (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-24 bg-surface rounded-xl animate-pulse" />
          ))}
        </div>
      ) : summaryData && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatCard label="Total Earned" value={formatKobo(summaryData.total_earned)} sub={`${year}`} />
          <StatCard label="Pending" value={formatKobo(summaryData.total_pending)} />
          <StatCard label="Invoiced" value={formatKobo(summaryData.total_invoiced)} />
          <StatCard label="Deals Won" value={String(summaryData.deals_won)} />
          <StatCard label="Deals Lost" value={String(summaryData.deals_lost)} />
        </div>
      )}

      {/* Monthly Revenue Bar Chart */}
      {summaryData && (
        <div className="bg-surface border border-border rounded-xl p-5">
          <h2 className="text-sm font-semibold text-text-primary mb-4">Monthly Revenue — {year}</h2>
          <div className="flex items-end gap-2 h-40">
            {summaryData.monthly_revenue.map((m) => (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full relative flex justify-center">
                  <div
                    className="w-full max-w-[40px] bg-accent/80 rounded-t transition-all duration-500"
                    style={{ height: `${Math.max((m.total_kobo / maxMonthly) * 120, 4)}px` }}
                  />
                </div>
                <span className="text-[10px] text-text-muted">{MONTHS[m.month - 1]}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Commission Form */}
      {showCreate && (
        <div className="bg-surface border border-border rounded-xl p-5 space-y-3">
          <h2 className="text-sm font-semibold text-text-primary">Record New Commission</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <input
              type="text"
              value={leadId}
              onChange={(e) => setLeadId(e.target.value)}
              placeholder="Lead ID (UUID)"
              className="px-3 py-2 border border-border rounded-lg bg-background text-text-primary text-sm"
            />
            <input
              type="number"
              value={salePrice}
              onChange={(e) => setSalePrice(e.target.value)}
              placeholder="Sale price (Naira)"
              className="px-3 py-2 border border-border rounded-lg bg-background text-text-primary text-sm"
            />
            <input
              type="number"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              placeholder="Rate %"
              step="0.5"
              className="px-3 py-2 border border-border rounded-lg bg-background text-text-primary text-sm"
            />
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="px-3 py-2 border border-border rounded-lg bg-background text-text-primary text-sm"
            >
              <option value="">Payment method</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="cash">Cash</option>
              <option value="cheque">Cheque</option>
            </select>
          </div>
          {salePrice && rate && (
            <p className="text-sm text-accent font-medium">
              Commission: {formatKobo(Math.round(parseFloat(salePrice) * 100 * parseFloat(rate) / 100))} ({rate}%)
            </p>
          )}
          <div className="flex gap-2">
            <button
              onClick={handleCreate}
              disabled={creating || !leadId || !salePrice}
              className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium disabled:opacity-50"
            >
              {creating ? 'Saving...' : 'Save Commission'}
            </button>
            <button
              onClick={() => setShowCreate(false)}
              className="px-4 py-2 rounded-lg border border-border text-sm text-text-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Commission List */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-sm font-semibold text-text-primary">All Commissions</h2>
          <div className="flex gap-1 ml-auto">
            {['', 'pending', 'invoiced', 'paid', 'cancelled'].map((s) => (
              <button
                key={s}
                onClick={() => { setStatusFilter(s); setPage(1); }}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  statusFilter === s ? 'bg-primary text-white' : 'bg-background border border-border text-text-secondary hover:bg-surface'
                }`}
              >
                {s || 'All'}
              </button>
            ))}
          </div>
        </div>

        {loadingCommissions ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 bg-surface rounded-lg animate-pulse" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12 bg-surface border border-border rounded-xl">
            <p className="text-text-muted">No commissions recorded yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((c) => (
              <div key={c.id} className="bg-surface border border-border rounded-lg p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-accent">{c.formatted_commission}</span>
                      <span className="text-xs text-text-muted">from {c.formatted_sale_price} @ {c.commission_rate}%</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${STATUS_COLORS[c.status]}`}>
                        {c.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-muted">
                      {c.lead && <span>Buyer: {c.lead.full_name}</span>}
                      {c.property && (
                        <Link href={`/properties/${c.property.slug}`} className="text-primary hover:underline truncate max-w-[200px]">
                          {c.property.title}
                        </Link>
                      )}
                      {c.payment_method && <span className="capitalize">{c.payment_method.replace(/_/g, ' ')}</span>}
                      {c.paid_at && <span>Paid: {new Date(c.paid_at).toLocaleDateString()}</span>}
                      <span>{formatRelativeTime(c.created_at)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {c.status === 'pending' && (
                      <button
                        onClick={() => handleStatusUpdate(c.id, 'invoiced')}
                        className="text-xs px-2.5 py-1 rounded bg-blue-50 text-blue-600 hover:bg-blue-100"
                      >
                        Invoice
                      </button>
                    )}
                    {c.status === 'invoiced' && (
                      <button
                        onClick={() => handleStatusUpdate(c.id, 'paid')}
                        className="text-xs px-2.5 py-1 rounded bg-green-50 text-green-600 hover:bg-green-100"
                      >
                        Mark Paid
                      </button>
                    )}
                    {(c.status === 'pending' || c.status === 'invoiced') && (
                      <button
                        onClick={() => handleStatusUpdate(c.id, 'cancelled')}
                        className="text-xs px-2.5 py-1 rounded text-red-400 hover:bg-red-50"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Pagination */}
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
      </div>
    </div>
  );
}
