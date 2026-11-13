import { AlertTriangle, WifiOff, RefreshCw, ArrowLeft } from 'lucide-react';
import type { CropSeqApiError } from '@/api/cropseqApi';

interface ErrorDisplayProps {
  error: CropSeqApiError;
  onRetry?: () => void;
  onBack?: () => void;
}

export default function ErrorDisplay({ error, onRetry, onBack }: ErrorDisplayProps) {
  const isNetwork = error.isNetworkError;

  return (
    <div className="mx-auto max-w-lg animate-fade-in">
      <div className="card text-center">
        <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${
          isNetwork ? 'bg-amber-50' : 'bg-red-50'
        }`}>
          {isNetwork ? (
            <WifiOff className="h-8 w-8 text-amber-600" />
          ) : (
            <AlertTriangle className="h-8 w-8 text-red-600" />
          )}
        </div>

        <h3 className="mt-4 text-lg font-semibold text-gray-900">
          {isNetwork ? 'Connection Error' : 'Something Went Wrong'}
        </h3>

        <p className="mt-2 text-sm text-gray-600 leading-relaxed">
          {error.message}
        </p>

        {error.errorCode && (
          <p className="mt-1 text-xs text-gray-400 font-mono">
            Error code: {error.errorCode}
          </p>
        )}

        {error.statusCode && (
          <p className="mt-1 text-xs text-gray-400">
            HTTP {error.statusCode}
          </p>
        )}

        <div className="mt-6 flex items-center justify-center gap-3">
          {onBack && (
            <button onClick={onBack} className="btn-secondary">
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </button>
          )}
          {onRetry && (
            <button onClick={onRetry} className="btn-primary">
              <RefreshCw className="h-4 w-4" />
              Retry
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
