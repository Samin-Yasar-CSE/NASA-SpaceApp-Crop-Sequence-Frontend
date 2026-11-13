import { GitBranch, Scale, Sprout } from 'lucide-react';
import type { ParetoAlternative } from '@/types/recommendation';
import { formatCurrency, formatNumber } from '@/utils/formatting';

interface Props {
  alternatives: ParetoAlternative[];
}

export default function ParetoAlternatives({ alternatives }: Props) {
  if (!alternatives || !alternatives.length) return null;

  return (
    <div className="card animate-slide-up">
      <div className="flex items-center gap-2 mb-2">
        <GitBranch className="h-5 w-5 text-purple-600" />
        <h2 className="text-lg font-semibold text-gray-900">Pareto-Optimal Alternatives</h2>
      </div>
      <p className="text-sm text-gray-500 mb-6">
        Alternative strategies representing different trade-offs between competing objectives.
      </p>

      <div className="grid gap-6 lg:grid-cols-2">
        {alternatives.map((alt, index) => (
          <div
            key={index}
            className="rounded-xl border border-gray-200 p-5 hover:border-purple-300 hover:shadow-sm transition-all"
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <h3 className="font-semibold text-gray-900">{alt.strategy_name}</h3>
                <p className="text-sm text-gray-500 mt-1">{alt.trade_off_description}</p>
              </div>
              <Scale className="h-5 w-5 text-purple-400 shrink-0" />
            </div>

            {/* Sequence Pills */}
            <div className="flex flex-wrap gap-2 mb-4">
              {alt.sequence.map((s, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-700"
                >
                  <Sprout className="h-3 w-3" />
                  Y{s.year}: {s.crop}
                </span>
              ))}
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-3 rounded-lg bg-gray-50 p-3 text-center">
              <div>
                <p className="text-xs text-gray-500">Net Profit</p>
                <p className="text-sm font-semibold text-gray-900">
                  {formatCurrency(alt.metrics.total_net_profit_usd_ha)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Sustainability</p>
                <p className="text-sm font-semibold text-gray-900">
                  {formatNumber(alt.metrics.sustainability_score)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Water Eff.</p>
                <p className="text-sm font-semibold text-gray-900">
                  {alt.metrics.water_efficiency_rating}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

