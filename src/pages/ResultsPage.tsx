import { Link, useNavigate } from 'react-router-dom';
import {
  RotateCcw,
  Sparkles,
  Calendar,
  Satellite,
  User,
} from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { useSubmitRecommendation } from '@/hooks/useApi';
import type { FarmerProfile } from '@/types/farmerProfile';
import EmptyState from '@/components/common/EmptyState';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorDisplay from '@/components/common/ErrorDisplay';
import OptimizationSummaryCard from '@/components/results/OptimizationSummaryCard';
import SequenceTimeline from '@/components/results/SequenceTimeline';
import ParetoAlternatives from '@/components/results/ParetoAlternatives';
import WarningsPanel from '@/components/results/WarningsPanel';
import FutureQA from '@/components/results/FutureQA';
import { formatTimestamp } from '@/utils/formatting';

export default function ResultsPage() {
  const navigate = useNavigate();
  const { state, dispatch } = useAppContext();
  const submitRecommendation = useSubmitRecommendation();
  const { recommendation, isLoading, error, farmerProfile } = state;

  const handleRetry = async () => {
    dispatch({ type: 'SET_ERROR', payload: null });
    try {
      await submitRecommendation(farmerProfile as FarmerProfile);
    } catch {
      // Error managed in context
    }
  };

  const handleReset = () => {
    dispatch({ type: 'RESET' });
    navigate('/intake');
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20">
        <div className="card text-center py-16">
          <LoadingSpinner size="lg" message="Generating optimal crop sequences with NASA Earth observations..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20">
        <ErrorDisplay
          error={error}
          onRetry={handleRetry}
          onBack={() => navigate('/review')}
        />
      </div>
    );
  }

  if (!recommendation) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20">
        <EmptyState
          title="No Recommendation Available"
          description="You haven't submitted a farm profile yet. Complete the guided intake process to get AI-powered crop sequence recommendations."
          actionLabel="Start Guided Assessment"
          actionTo="/intake"
        />
      </div>
    );
  }

  const { data, pareto_optimal_alternatives, warnings, timestamp } = recommendation;
  const { optimization_summary, recommended_sequence, farmer_id } = data;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-crop-green-100 px-3 py-1 text-xs font-semibold text-crop-green-800">
              <Sparkles className="h-3.5 w-3.5" />
              Optimization Complete
            </span>
            {farmer_id && (
              <span className="inline-flex items-center gap-1 text-xs text-gray-500 font-mono">
                <User className="h-3.5 w-3.5" />
                {farmer_id}
              </span>
            )}
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-bold text-gray-900">
            Crop Sequence Recommendation
          </h1>
          <div className="mt-1 flex flex-wrap items-center gap-4 text-xs text-gray-500">
            {timestamp && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                Generated on {formatTimestamp(timestamp)}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Satellite className="h-3.5 w-3.5 text-crop-green-600" />
              NASA Earth Observations: SMAP, GPM, MODIS
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            className="btn-secondary"
          >
            <RotateCcw className="h-4 w-4" />
            New Assessment
          </button>
        </div>
      </div>

      {/* 1. Optimization Summary */}
      {optimization_summary && (
        <OptimizationSummaryCard summary={optimization_summary} />
      )}

      {/* 2. Recommended Sequence Timeline */}
      {recommended_sequence && recommended_sequence.length > 0 && (
        <SequenceTimeline sequence={recommended_sequence} />
      )}

      {/* 3. Pareto-Optimal Alternatives */}
      {pareto_optimal_alternatives && pareto_optimal_alternatives.length > 0 && (
        <ParetoAlternatives alternatives={pareto_optimal_alternatives} />
      )}

      {/* 4. Evidence & Environmental Data Context */}
      <div className="card animate-slide-up">
        <div className="flex items-center gap-2 mb-3">
          <Satellite className="h-5 w-5 text-sky-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">NASA Earth Data &amp; Agronomic Evidence</h2>
        </div>
        <p className="text-sm text-gray-600 leading-relaxed">
          This recommendation was computed using satellite-derived soil moisture metrics from
          NASA SMAP (Soil Moisture Active Passive), historical precipitation distributions from
          NASA GPM (Global Precipitation Measurement), and surface vegetation dynamics from MODIS.
          Crop sequencing logic considers biological nitrogen fixation breaks, soil organic matter trajectories,
          and pathogen cycle interruption.
        </p>
      </div>

      {/* 5. Warnings and Advisories */}
      {warnings && warnings.length > 0 && (
        <WarningsPanel warnings={warnings} />
      )}

      {/* 6. Disabled Future Q&A Section */}
      <FutureQA />

      {/* Bottom Actions */}
      <div className="flex justify-center pt-4">
        <Link to="/review" className="btn-secondary">
          Review Farm Inputs
        </Link>
      </div>
    </div>
  );
}

