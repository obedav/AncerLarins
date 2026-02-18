'use client';

import { useState } from 'react';
import { useGetActivityLogsQuery } from '@/store/api/adminApi';

export default function AdminActivityPage() {
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const { data, isLoading } = useGetActivityLogsQuery({ ...filters, page, per_page: 50 });

  const logs = data?.data || [];
  const meta = data?.meta;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Activity Logs</h1>
        <p className="text-text-secondary mt-1">Track all user actions on the platform</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Filter by action (e.g., POST, GET)"
          className="px-3 py-2 border border-border rounded-lg bg-surface text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-dark/30"
          onChange={(e) => {
            setFilters((f) => ({ ...f, action: e.target.value }));
            setPage(1);
          }}
        />
        <input
          type="date"
          className="px-3 py-2 border border-border rounded-lg bg-surface text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-dark/30"
          onChange={(e) => {
            setFilters((f) => ({ ...f, date_from: e.target.value }));
            setPage(1);
          }}
        />
        <input
          type="date"
          className="px-3 py-2 border border-border rounded-lg bg-surface text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-dark/30"
          onChange={(e) => {
            setFilters((f) => ({ ...f, date_to: e.target.value }));
            setPage(1);
          }}
        />
      </div>

      {/* Table */}
      <div className="bg-surface border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-background border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 text-text-secondary font-medium">User</th>
                <th className="text-left px-4 py-3 text-text-secondary font-medium">Action</th>
                <th className="text-left px-4 py-3 text-text-secondary font-medium">Target</th>
                <th className="text-left px-4 py-3 text-text-secondary font-medium">IP</th>
                <th className="text-left px-4 py-3 text-text-secondary font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-border rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-text-muted">
                    No activity logs found.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-background/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-text-primary">{log.user?.full_name || 'Unknown'}</div>
                      <div className="text-xs text-text-muted">{log.user?.role}</div>
                    </td>
                    <td className="px-4 py-3">
                      <code className="text-xs bg-background px-2 py-1 rounded text-text-secondary">
                        {log.action}
                      </code>
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      {log.target_type ? (
                        <span className="text-xs">
                          {log.target_type}: {log.target_id?.slice(0, 8)}...
                        </span>
                      ) : (
                        <span className="text-text-muted">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-text-muted text-xs font-mono">{log.ip_address}</td>
                    <td className="px-4 py-3 text-text-muted text-xs">
                      {new Date(log.created_at).toLocaleString('en-NG', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta && meta.last_page > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-sm text-text-muted">
              Page {meta.current_page} of {meta.last_page} ({meta.total} total)
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1.5 text-sm rounded-lg border border-border hover:bg-background disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= (meta.last_page || 1)}
                className="px-3 py-1.5 text-sm rounded-lg border border-border hover:bg-background disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
