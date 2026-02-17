import type { PropertyStatus } from '@/types';
import type { VerificationStatus } from '@/types';

const PROPERTY_STATUS_CONFIG: Record<PropertyStatus, { label: string; className: string }> = {
  draft: { label: 'Draft', className: 'bg-border/50 text-text-secondary' },
  pending: { label: 'Pending', className: 'bg-accent/20 text-accent-dark' },
  approved: { label: 'Approved', className: 'bg-success/10 text-success' },
  rejected: { label: 'Rejected', className: 'bg-error/10 text-error' },
  expired: { label: 'Expired', className: 'bg-accent/10 text-accent-dark' },
  rented: { label: 'Rented', className: 'bg-accent-dark/10 text-accent-dark' },
  sold: { label: 'Sold', className: 'bg-accent-dark/15 text-accent-dark' },
  archived: { label: 'Archived', className: 'bg-border/50 text-text-muted' },
};

const VERIFICATION_STATUS_CONFIG: Record<VerificationStatus, { label: string; className: string }> = {
  unverified: { label: 'Unverified', className: 'bg-border/50 text-text-secondary' },
  pending: { label: 'Pending', className: 'bg-accent/20 text-accent-dark' },
  verified: { label: 'Verified', className: 'bg-success/10 text-success' },
  rejected: { label: 'Rejected', className: 'bg-error/10 text-error' },
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
    open: { label: 'Open', className: 'bg-error/10 text-error' },
    investigating: { label: 'Investigating', className: 'bg-accent/20 text-accent-dark' },
    resolved: { label: 'Resolved', className: 'bg-success/10 text-success' },
    dismissed: { label: 'Dismissed', className: 'bg-border/50 text-text-muted' },
  };
  const c = config[status] || config.open;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${c.className}`}>
      {c.label}
    </span>
  );
}
