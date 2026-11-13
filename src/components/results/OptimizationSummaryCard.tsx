import { TrendingUp, Leaf, Droplets, Target } from 'lucide-react';
import type { OptimizationSummary } from '@/types/recommendation';
import { formatCurrency } from '@/utils/formatting';

interface Props {
  summary: OptimizationSummary;
}

export default function OptimizationSummaryCard({ summary }: Props) {
  return (
    <div className="card animate-slide-up">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Optimization Summary</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricTile
          icon={<Target className="h-5 w-5" />}
          label="Objective Achieved"
          value={summary.primary_objective_achieved.replace(/_/g, ' ')}
          color="text-purple-600 bg-purple-50"
        />
        <MetricTile
          icon={<TrendingUp className="h-5 w-5" />}
          label="Projected Net Return"
          value={formatCurrency(summary.projected_cumulative_net_return_usd)}
          color="text-crop-green-700 bg-crop-green-50"
        />
        <MetricTile
          icon={<Leaf className="h-5 w-5" />}
          label="Soil Health Delta"
          value={summary.soil_health_index_delta}
          color="text-earth-brown-600 bg-earth-brown-50"
        />
        <MetricTile
          icon={<Droplets className="h-5 w-5" />}
          label="Water Footprint"
          value={`${(summary.water_footprint_liters / 1000).toFixed(0)}k L`}
          color="text-sky-blue-700 bg-sky-blue-50"
        />
      </div>
    </div>
  );
}

function MetricTile({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className={`rounded-xl p-4 ${color}`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs font-medium uppercase tracking-wider opacity-80">{label}</span>
      </div>
      <p className="text-lg font-bold capitalize">{value}</p>
    </div>
  );
}

