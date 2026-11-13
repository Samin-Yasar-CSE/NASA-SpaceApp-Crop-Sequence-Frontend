import { Inbox } from 'lucide-react';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  actionTo?: string;
}

export default function EmptyState({
  title = 'No Recommendations Yet',
  description = 'Complete the farmer intake process to receive AI-powered crop sequence recommendations based on NASA Earth observations.',
  actionLabel = 'Get Started',
  actionTo = '/intake',
}: EmptyStateProps) {
  return (
    <div className="mx-auto max-w-md text-center py-16 animate-fade-in">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
        <Inbox className="h-10 w-10 text-gray-400" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-sm text-gray-500 leading-relaxed">{description}</p>
      {actionTo && (
        <Link to={actionTo} className="btn-primary mt-6 inline-flex">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
