import { AlertTriangle, Info, AlertOctagon } from 'lucide-react';
import type { Warning } from '@/types/recommendation';
import { getSeverityColor } from '@/utils/formatting';

interface Props {
  warnings: Warning[];
}

export default function WarningsPanel({ warnings }: Props) {
  if (!warnings || !warnings.length) return null;

  const getIcon = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high':
      case 'critical':
        return <AlertOctagon className="h-5 w-5" />;
      case 'moderate':
      case 'medium':
        return <AlertTriangle className="h-5 w-5" />;
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  return (
    <div className="card animate-slide-up">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="h-5 w-5 text-amber-600" />
        <h2 className="text-lg font-semibold text-gray-900">Warnings &amp; Advisories</h2>
      </div>

      <div className="space-y-3">
        {warnings.map((warning, index) => (
          <div
            key={index}
            className={`flex gap-3 rounded-lg border p-4 ${getSeverityColor(warning.severity)}`}
          >
            <div className="shrink-0 mt-0.5">{getIcon(warning.severity)}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold uppercase tracking-wider opacity-75">
                  {warning.severity}
                </span>
                <span className="text-xs font-mono opacity-50">{warning.code}</span>
              </div>
              <p className="text-sm leading-relaxed">{warning.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

