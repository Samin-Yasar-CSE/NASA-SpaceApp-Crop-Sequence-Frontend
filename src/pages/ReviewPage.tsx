import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Droplets,
  Layers,
  Calendar,
  Target,
  ArrowLeft,
  Send,
  AlertCircle,
  CheckCircle2,
  Edit3,
} from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { useSubmitRecommendation } from '@/hooks/useApi';
import { validateFarmerProfile, formatFieldLabel } from '@/utils/validation';
import type { FarmerProfile } from '@/types/farmerProfile';
import ErrorDisplay from '@/components/common/ErrorDisplay';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function ReviewPage() {
  const navigate = useNavigate();
  const { state, dispatch } = useAppContext();
  const submitRecommendation = useSubmitRecommendation();
  const profile = state.farmerProfile;

  const validationErrors = validateFarmerProfile(profile);
  const isValid = validationErrors.length === 0;

  const handleSubmit = async () => {
    if (!isValid) return;
    try {
      await submitRecommendation(profile as FarmerProfile);
      navigate('/results');
    } catch {
      // Error is handled by context
    }
  };

  const handleRetry = async () => {
    dispatch({ type: 'SET_ERROR', payload: null });
    try {
      await submitRecommendation(profile as FarmerProfile);
      navigate('/results');
    } catch {
      // Error is handled by context
    }
  };

  if (state.isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20">
        <div className="card text-center py-16">
          <LoadingSpinner size="lg" message="Analyzing your farm profile with NASA Earth observation data..." />
          <p className="mt-4 text-sm text-gray-500">
            The recommendation engine is computing optimal crop sequences.
            <br />
            This may take a moment.
          </p>
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20">
        <ErrorDisplay
          error={state.error}
          onRetry={handleRetry}
          onBack={() => {
            dispatch({ type: 'SET_ERROR', payload: null });
            dispatch({ type: 'SET_STEP', payload: 'review' });
          }}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Review Your Farm Profile</h1>
        <p className="mt-2 text-gray-600">
          Please verify all information before submitting for optimization.
        </p>
      </div>

      {/* Validation Status */}
      {!isValid && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-red-800">Missing Information</h3>
              <ul className="mt-2 space-y-1">
                {validationErrors.map((err) => (
                  <li key={err.field} className="text-sm text-red-700">
                    <span className="font-medium">{formatFieldLabel(err.field)}:</span> {err.message}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {isValid && (
        <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <p className="text-sm font-medium text-green-800">
              All required fields are complete. Ready for submission.
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Location */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-5 w-5 text-crop-green-600" />
            <h2 className="text-lg font-semibold text-gray-900">Location</h2>
          </div>
          <dl className="space-y-3 text-sm">
            <DetailRow label="Latitude" value={profile.farm_metadata?.location?.latitude} />
            <DetailRow label="Longitude" value={profile.farm_metadata?.location?.longitude} />
            <DetailRow label="Region" value={profile.farm_metadata?.location?.region} />
            <DetailRow label="Country" value={profile.farm_metadata?.location?.country} />
            <DetailRow label="Total Area" value={`${profile.farm_metadata?.total_area_hectares || 0} hectares`} />
            <DetailRow label="Irrigation" value={profile.farm_metadata?.irrigation_type} />
          </dl>
        </div>

        {/* Soil Profile */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Layers className="h-5 w-5 text-earth-brown-500" />
            <h2 className="text-lg font-semibold text-gray-900">Soil Profile</h2>
          </div>
          <dl className="space-y-3 text-sm">
            <DetailRow label="Texture" value={profile.farm_metadata?.soil_profile?.texture} />
            <DetailRow label="pH" value={profile.farm_metadata?.soil_profile?.ph} />
            <DetailRow label="Organic Matter" value={`${profile.farm_metadata?.soil_profile?.organic_matter_percent || 0}%`} />
            <DetailRow label="Nitrogen (N)" value={`${profile.farm_metadata?.soil_profile?.nitrogen_n_ppm || 0} ppm`} />
            <DetailRow label="Phosphorus (P)" value={`${profile.farm_metadata?.soil_profile?.phosphorus_p_ppm || 0} ppm`} />
            <DetailRow label="Potassium (K)" value={`${profile.farm_metadata?.soil_profile?.potassium_k_ppm || 0} ppm`} />
          </dl>
        </div>

        {/* Planning */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-5 w-5 text-sky-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Planning Horizon</h2>
          </div>
          <dl className="space-y-3 text-sm">
            <DetailRow label="Start Year" value={profile.planning_horizon?.start_year} />
            <DetailRow label="Seasons" value={profile.planning_horizon?.number_of_seasons} />
            <DetailRow label="Season Types" value={profile.planning_horizon?.seasons?.join(', ') || 'None'} />
            <DetailRow
              label="Previous Crops"
              value={
                profile.historical_data?.previous_crops?.length
                  ? profile.historical_data.previous_crops
                      .map((c) => `${c.season}: ${c.crop_name}`)
                      .join(', ')
                  : 'None'
              }
            />
            <DetailRow label="Fallow Seasons" value={profile.historical_data?.fallow_history_seasons ?? 0} />
          </dl>
        </div>

        {/* Preferences */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-5 w-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900">Preferences</h2>
          </div>
          <dl className="space-y-3 text-sm">
            <DetailRow
              label="Objective"
              value={profile.constraints_and_preferences?.primary_objective?.replace(/_/g, ' ')}
            />
            <DetailRow
              label="Target Crops"
              value={profile.constraints_and_preferences?.target_crops?.join(', ') || 'None'}
            />
            <DetailRow
              label="Excluded Crops"
              value={profile.constraints_and_preferences?.excluded_crops?.join(', ') || 'None'}
            />
            <DetailRow label="Risk Tolerance" value={profile.constraints_and_preferences?.risk_tolerance} />
            <DetailRow
              label="Capital Budget"
              value={`$${profile.constraints_and_preferences?.available_capital_usd?.toLocaleString() || 0}`}
            />
            <DetailRow label="Labor Availability" value={profile.constraints_and_preferences?.labor_availability} />
          </dl>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          onClick={() => {
            dispatch({ type: 'SET_STEP', payload: 'intake' });
            navigate('/intake');
          }}
          className="btn-secondary"
        >
          <ArrowLeft className="h-4 w-4" />
          Edit Responses
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/intake')}
            className="btn-secondary"
          >
            <Edit3 className="h-4 w-4" />
            Modify
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isValid || state.isLoading}
            className="btn-primary text-base px-8 py-3"
          >
            <Send className="h-4 w-4" />
            <Droplets className="h-4 w-4 hidden" />
            Submit for Optimization
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value?: string | number | null }) {
  const display = value !== undefined && value !== null && value !== '' ? String(value) : '—';
  const isEmpty = display === '—' || display === '0' || display === '';

  return (
    <div className="flex justify-between gap-4">
      <dt className="text-gray-500">{label}</dt>
      <dd className={`font-medium text-right ${isEmpty ? 'text-gray-400 italic' : 'text-gray-900'}`}>
        {display}
      </dd>
    </div>
  );
}

