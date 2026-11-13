import { useState } from 'react';
import {
  Sprout,
  Send,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Layers,
  MapPin,
  Target,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { useSubmitRecommendation } from '@/hooks/useApi';
import type { FarmerProfile } from '@/types/farmerProfile';
import { validateFarmerProfile } from '@/utils/validation';
import ChatIntake from '@/components/chat/ChatIntake';
import OptimizationSummaryCard from '@/components/results/OptimizationSummaryCard';
import SequenceTimeline from '@/components/results/SequenceTimeline';
import ParetoAlternatives from '@/components/results/ParetoAlternatives';
import WarningsPanel from '@/components/results/WarningsPanel';
import FutureQA from '@/components/results/FutureQA';
import ErrorDisplay from '@/components/common/ErrorDisplay';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';
import { formatTimestamp } from '@/utils/formatting';

export default function CropSequencePage() {
  const { state } = useAppContext();
  const submitRecommendation = useSubmitRecommendation();
  const [activeView, setActiveView] = useState<'dashboard' | 'intake' | 'review'>('dashboard');

  const profile = state.farmerProfile;
  const validationErrors = validateFarmerProfile(profile);
  const isValid = validationErrors.length === 0;

  const handleRunOptimization = async () => {
    try {
      await submitRecommendation(profile as FarmerProfile);
      setActiveView('dashboard');
    } catch {
      // Handled in context
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-4 space-y-5 animate-fade-in">
      {/* Mobile-First Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-crop-green-100 text-crop-green-700">
              <Sprout className="h-4 w-4" />
            </span>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900">
              Crop Sequence Optimization
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Multi-season crop sequence modeling powered by NASA Earth observations.
          </p>
        </div>

        {/* View Switcher Chips */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl self-start sm:self-auto text-xs">
          <button
            onClick={() => setActiveView('dashboard')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeView === 'dashboard'
                ? 'bg-white text-crop-green-800 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveView('review')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeView === 'review'
                ? 'bg-white text-crop-green-800 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Review &amp; Run
          </button>
          <button
            onClick={() => setActiveView('intake')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeView === 'intake'
                ? 'bg-white text-crop-green-800 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Guided Setup
          </button>
        </div>
      </div>

      {/* ─── 1. Guided Setup View ─── */}
      {activeView === 'intake' && (
        <div className="animate-fade-in">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Step-by-Step Questionnaire
            </span>
            <button
              onClick={() => setActiveView('review')}
              className="text-xs text-crop-green-600 font-medium hover:underline"
            >
              Skip to Review &amp; Run →
            </button>
          </div>
          <ChatIntake />
        </div>
      )}

      {/* ─── 2. Review & Run Optimization View ─── */}
      {activeView === 'review' && (
        <div className="space-y-4 animate-fade-in">
          {/* Validation Notice */}
          {!isValid ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs">
              <div className="flex items-start gap-2 text-red-800 font-semibold mb-1">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-600" />
                <span>Incomplete Parameters</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-red-700">
                {validationErrors.map((err) => (
                  <li key={err.field}>{err.message}</li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-emerald-800 font-medium">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>All farm telemetry &amp; constraints validated.</span>
              </div>
              <button
                onClick={handleRunOptimization}
                disabled={state.isLoading}
                className="btn-primary py-2 px-4 text-xs font-semibold"
              >
                <Send className="h-3.5 w-3.5" />
                Run Optimization Now
              </button>
            </div>
          )}

          {/* Farm Parameters Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="card p-4 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <MapPin className="h-4 w-4 text-crop-green-600" />
                Location &amp; Area
              </div>
              <div className="text-slate-600 space-y-1">
                <div>Region: <span className="font-semibold text-slate-900">{profile.farm_metadata?.location?.region || '—'}</span></div>
                <div>Coordinates: <span className="font-semibold text-slate-900">{profile.farm_metadata?.location?.latitude}, {profile.farm_metadata?.location?.longitude}</span></div>
                <div>Total Area: <span className="font-semibold text-slate-900">{profile.farm_metadata?.total_area_hectares} hectares</span></div>
                <div>Irrigation: <span className="font-semibold text-slate-900 capitalize">{profile.farm_metadata?.irrigation_type}</span></div>
              </div>
            </div>

            <div className="card p-4 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <Layers className="h-4 w-4 text-earth-brown-500" />
                Soil Chemistry
              </div>
              <div className="text-slate-600 space-y-1">
                <div>Texture: <span className="font-semibold text-slate-900 capitalize">{profile.farm_metadata?.soil_profile?.texture?.replace(/_/g, ' ')}</span></div>
                <div>pH Level: <span className="font-semibold text-slate-900">{profile.farm_metadata?.soil_profile?.ph}</span></div>
                <div>Organic Matter: <span className="font-semibold text-slate-900">{profile.farm_metadata?.soil_profile?.organic_matter_percent}%</span></div>
                <div>NPK (ppm): <span className="font-semibold text-slate-900">{profile.farm_metadata?.soil_profile?.nitrogen_n_ppm}N - {profile.farm_metadata?.soil_profile?.phosphorus_p_ppm}P - {profile.farm_metadata?.soil_profile?.potassium_k_ppm}K</span></div>
              </div>
            </div>

            <div className="card p-4 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <Calendar className="h-4 w-4 text-sky-blue-600" />
                Planning Horizon
              </div>
              <div className="text-slate-600 space-y-1">
                <div>Start Year: <span className="font-semibold text-slate-900">{profile.planning_horizon?.start_year}</span></div>
                <div>Number of Seasons: <span className="font-semibold text-slate-900">{profile.planning_horizon?.number_of_seasons} seasons</span></div>
                <div>Seasons: <span className="font-semibold text-slate-900">{profile.planning_horizon?.seasons?.join(', ')}</span></div>
                <div>Fallow History: <span className="font-semibold text-slate-900">{profile.historical_data?.fallow_history_seasons} seasons</span></div>
              </div>
            </div>

            <div className="card p-4 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <Target className="h-4 w-4 text-purple-600" />
                Preferences &amp; Goals
              </div>
              <div className="text-slate-600 space-y-1">
                <div>Primary Goal: <span className="font-semibold text-slate-900 capitalize">{profile.constraints_and_preferences?.primary_objective?.replace(/_/g, ' ')}</span></div>
                <div>Target Crops: <span className="font-semibold text-slate-900">{profile.constraints_and_preferences?.target_crops?.join(', ') || 'None'}</span></div>
                <div>Excluded: <span className="font-semibold text-slate-900">{profile.constraints_and_preferences?.excluded_crops?.join(', ') || 'None'}</span></div>
                <div>Risk Tolerance: <span className="font-semibold text-slate-900 capitalize">{profile.constraints_and_preferences?.risk_tolerance}</span></div>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-2">
            <button
              onClick={() => setActiveView('intake')}
              className="btn-secondary text-xs"
            >
              Modify with Guided Chat
            </button>
            <button
              onClick={handleRunOptimization}
              disabled={!isValid || state.isLoading}
              className="btn-primary text-xs"
            >
              <Send className="h-3.5 w-3.5" />
              Dispatch to Optimization Engine
            </button>
          </div>
        </div>
      )}

      {/* ─── 3. Dashboard View ─── */}
      {activeView === 'dashboard' && (
        <div className="space-y-6">
          {/* Loading State */}
          {state.isLoading && (
            <div className="card text-center py-12">
              <LoadingSpinner size="lg" message="Computing optimal crop sequence with NASA Earth observations..." />
              <p className="mt-2 text-xs text-slate-500">
                Evaluating multi-objective Pareto trade-offs across {profile.planning_horizon?.number_of_seasons || 4} seasons...
              </p>
            </div>
          )}

          {/* Connection Error State */}
          {state.error && !state.isLoading && (
            <ErrorDisplay
              error={state.error}
              onRetry={handleRunOptimization}
              onBack={() => setActiveView('review')}
            />
          )}

          {/* Real FinalResponse Results */}
          {!state.isLoading && !state.error && state.recommendation && (
            <div className="space-y-6 animate-fade-in">
              {/* Header banner */}
              <div className="card bg-gradient-to-r from-crop-green-900 to-crop-green-800 text-white p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-crop-green-300" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-crop-green-200">
                      Optimization Completed
                    </span>
                  </div>
                  {state.recommendation.timestamp && (
                    <span className="text-[11px] text-crop-green-200">
                      {formatTimestamp(state.recommendation.timestamp)}
                    </span>
                  )}
                </div>
                <h2 className="text-base sm:text-lg font-bold mt-1 text-white">
                  Multi-Season Sequence Schedule
                </h2>
                <p className="text-xs text-crop-green-100/90 mt-0.5">
                  Derived from NASA SMAP moisture anomalies, GPM precipitation, and soil balance equations.
                </p>
              </div>

              {/* Summary Cards */}
              <OptimizationSummaryCard summary={state.recommendation.data.optimization_summary} />

              {/* Timeline */}
              <SequenceTimeline sequence={state.recommendation.data.recommended_sequence} />

              {/* Pareto Alternatives */}
              {state.recommendation.pareto_optimal_alternatives && (
                <ParetoAlternatives alternatives={state.recommendation.pareto_optimal_alternatives} />
              )}

              {/* Warnings */}
              {state.recommendation.warnings && (
                <WarningsPanel warnings={state.recommendation.warnings} />
              )}

              {/* Future Q&A */}
              <FutureQA />

              <div className="flex justify-center pt-2">
                <button
                  onClick={() => setActiveView('review')}
                  className="btn-secondary text-xs"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reconfigure Inputs &amp; Re-optimize
                </button>
              </div>
            </div>
          )}

          {/* Empty State when no recommendation exists */}
          {!state.isLoading && !state.error && !state.recommendation && (
            <EmptyState
              title="No Crop Sequence Computed Yet"
              description="Review your farm conditions or complete the guided intake to compute an optimized multi-season sequence."
              actionLabel="Configure &amp; Optimize Farm"
              actionTo="/sequence"
            />
          )}
        </div>
      )}
    </div>
  );
}
