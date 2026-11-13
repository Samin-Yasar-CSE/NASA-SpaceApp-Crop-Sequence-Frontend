import { Sprout, DollarSign, BarChart3, BookOpen } from 'lucide-react';
import type { SequenceEntry } from '@/types/recommendation';
import { formatCurrency, formatNumber, getConfidenceColor } from '@/utils/formatting';

interface Props {
  sequence: SequenceEntry[];
}

export default function SequenceTimeline({ sequence }: Props) {
  return (
    <div className="card animate-slide-up">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Recommended Crop Sequence</h2>
      <div className="space-y-0">
        {sequence.map((entry, index) => (
          <div key={entry.sequence_index} className="relative">
            {/* Connector Line */}
            {index < sequence.length - 1 && (
              <div className="absolute left-6 top-14 bottom-0 w-0.5 bg-crop-green-200" />
            )}
            <div className="flex gap-4 pb-8">
              {/* Timeline Dot */}
              <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-crop-green-100 text-crop-green-700 ring-4 ring-white">
                <Sprout className="h-5 w-5" />
              </div>

              {/* Content */}
              <div className="flex-1 pt-1">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-crop-green-600 bg-crop-green-50 px-2.5 py-0.5 rounded-full">
                    {entry.season}
                  </span>
                  <span className={`text-xs font-medium ${getConfidenceColor(entry.confidence_score)}`}>
                    {(entry.confidence_score * 100).toFixed(0)}% confidence
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-gray-900">{entry.recommended_crop}</h3>
                {entry.variety && (
                  <p className="text-sm text-gray-500 italic">{entry.variety}</p>
                )}

                <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <BarChart3 className="h-3.5 w-3.5" />
                    <span>{formatNumber(entry.expected_yield_tons_per_hectare)} t/ha</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <DollarSign className="h-3.5 w-3.5" />
                    <span>{formatCurrency(entry.projected_revenue_usd)} rev.</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <DollarSign className="h-3.5 w-3.5 text-red-400" />
                    <span>{formatCurrency(entry.projected_input_costs_usd)} cost</span>
                  </div>
                </div>

                {entry.agronomic_rationale && (
                  <div className="mt-3 flex gap-2 rounded-lg bg-gray-50 border border-gray-100 p-3">
                    <BookOpen className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                    <p className="text-sm text-gray-600 leading-relaxed">{entry.agronomic_rationale}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

