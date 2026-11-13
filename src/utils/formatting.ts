export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatNumber(value: number, decimals = 1): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatPercentage(value: string | number): string {
  if (typeof value === 'string') return value;
  return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
}

export function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export function getSeverityColor(severity: string): string {
  switch (severity.toLowerCase()) {
    case 'high':
    case 'critical':
      return 'text-red-700 bg-red-50 border-red-200';
    case 'moderate':
    case 'medium':
      return 'text-amber-700 bg-amber-50 border-amber-200';
    case 'low':
      return 'text-blue-700 bg-blue-50 border-blue-200';
    default:
      return 'text-gray-700 bg-gray-50 border-gray-200';
  }
}

export function getConfidenceColor(score: number): string {
  if (score >= 0.85) return 'text-green-700';
  if (score >= 0.7) return 'text-amber-600';
  return 'text-red-600';
}

export function getWaterEfficiencyColor(rating: string): string {
  switch (rating.toLowerCase()) {
    case 'very high':
    case 'high':
      return 'text-sky-blue-700 bg-sky-blue-50';
    case 'moderate':
      return 'text-amber-700 bg-amber-50';
    case 'low':
      return 'text-red-700 bg-red-50';
    default:
      return 'text-gray-700 bg-gray-50';
  }
}
