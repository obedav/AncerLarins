import type { PropertyStatus } from '@/types';
import type { VerificationStatus } from '@/types';

const PROPERTY_STATUS_CONFIG: Record<PropertyStatus, { label: string; className: string }> = {
  draft: { label: 'Draft', className: 'bg-gray-100 text-gray-600' },
  pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-700' },
  approved: { label: 'Approved', className: 'bg-green-100 text-green-700' },
  rejected: { label: 'Rejected', className: 'bg-red-100 text-red-700' },
  expired: { label: 'Expired', className: 'bg-orange-100 text-orange-700' },
  rented: { label: 'Rented', className: 'bg-blue-100 text-blue-700' },
  sold: { label: 'Sold', className: 'bg-purple-100 text-purple-700' },
  archived: { label: 'Archived', className: 'bg-gray-100 text-gray-500' },
};

const VERIFICATION_STATUS_CONFIG: Record<VerificationStatus, { label: string; className: string }> = {
  unverified: { label: 'Unverified', className: 'bg-gray-100 text-gray-600' },
  pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-700' },
  verified: { label: 'Verified', className: 'bg-green-100 text-green-700' },
  rejected: { label: 'Rejected', className: 'bg-red-100 text-red-700' },
};

export function PropertyStatusBadge({ status }: { status: PropertyStatus }) {
  const config = PROPERTY_STATUS_CONFIG[status] || PROPERTY_STATUS_CONFIG.draft;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  );
}

export function VerificationBadge({ status }: { status: VerificationStatus }) {
  const config = VERIFICATION_STATUS_CONFIG[status] || VERIFICATION_STATUS_CONFIG.unverified;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  );
}

export function ReportStatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    open: { label: 'Open', className: 'bg-red-100 text-red-700' },
    investigating: { label: 'Investigating', className: 'bg-yellow-100 text-yellow-700' },
    resolved: { label: 'Resolved', className: 'bg-green-100 text-green-700' },
    dismissed: { label: 'Dismissed', className: 'bg-gray-100 text-gray-500' },
  };
  const c = config[status] || config.open;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${c.className}`}>
      {c.label}
    </span>
  );
}
