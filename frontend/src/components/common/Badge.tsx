import React from 'react';

interface BadgeProps {
  status: string;
  className?: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ status, className = '', size = 'md' }) => {
  const cleanStatus = status.toUpperCase();

  const getStyle = () => {
    switch (cleanStatus) {
      case 'APPROVED':
      case 'VERIFIED':
      case 'SAFE':
      case 'ACTIVE':
      case 'PASS':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'SUBMITTED':
      case 'UNDER_REVIEW':
      case 'DOCUMENT_VERIFICATION':
      case 'ELIGIBILITY_REVIEW':
      case 'IN_PROGRESS':
      case 'WAITING_FOR_STUDENT':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'REJECTED':
      case 'CRITICAL':
      case 'FAIL':
      case 'EXPIRED':
      case 'SUSPENDED':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'REUPLOAD_REQUIRED':
      case 'ADDITIONAL_DOCUMENTS_REQUIRED':
      case 'WARNING':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'DRAFT':
      case 'PENDING':
      case 'OPEN':
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getLabel = () => {
    return status.replace(/_/g, ' ');
  };

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-semibold';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${sizeClasses} ${getStyle()} ${className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {getLabel()}
    </span>
  );
};
