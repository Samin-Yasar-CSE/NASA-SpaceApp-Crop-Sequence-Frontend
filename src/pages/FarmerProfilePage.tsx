import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Tractor,
  MapPin,
  Target,
  Sprout,
  Save,
  CheckCircle2,
  Activity,
} from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import type { FarmerProfile } from '@/types/farmerProfile';

export default function FarmerProfilePage() {
  const navigate = useNavigate();
  const { state, dispatch } = useAppContext();
  const [profile, setProfile] = useState<Partial<FarmerProfile>>(state.farmerProfile);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    dispatch({ type: 'UPDATE_PROFILE', payload: profile });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleLaunchOptimizer = () => {
    dispatch({ type: 'UPDATE_PROFILE', payload: profile });
    navigate('/sequence');
  };

  const soilPh = profile.farm_metadata?.soil_profile?.ph ?? 6.5;

  const getPhStatus = (ph: number) => {
    if (ph < 5.5) return { label: 'Strongly Acidic', color: 'text-amber-700 bg-amber-50 border-amber-200' };
    if (ph < 6.5) return { label: 'Slightly Acidic (Favorable)', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    if (ph <= 7.5) return { label: 'Optimal Neutral', color: 'text-crop-green-700 bg-crop-green-50 border-crop-green-200' };
    return { label: 'Alkaline', color: 'text-blue-700 bg-blue-50 border-blue-200' };
  };

  const phStatus = getPhStatus(soilPh);

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-4 space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-blue-100 text-sky-blue-700">
              <Tractor className="h-4 w-4" />
            </span>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900">
              Farmer Features &amp; Telemetry
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your land attributes, soil chemical telemetry, and resource constraints.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleSave}
            className="btn-secondary py-2 px-3 text-xs"
          >
            {isSaved ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 text-crop-green-600" />
                Saved
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5" />
                Save Changes
              </>
            )}
          </button>
          <button
            onClick={handleLaunchOptimizer}
            className="btn-primary py-2 px-3 text-xs"
          >
            <Sprout className="h-3.5 w-3.5" />
            Run Sequence Optimizer
          </button>
        </div>
      </div>

      {/* ─── Soil Health Telemetry Card ─── */}
      <div className="card space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
            <Activity className="h-4 w-4 text-crop-green-600" />
            Soil Health Telemetry &amp; Chemical Gauges
          </div>
          <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${phStatus.color}`}>
            {phStatus.label}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {/* pH gauge */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
            <span className="text-[11px] text-slate-500 font-medium">Soil Reaction (pH)</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-extrabold text-slate-900">{soilPh}</span>
              <span className="text-[10px] text-slate-400">/ 14.0</span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-crop-green-600 h-full rounded-full transition-all"
                style={{ width: `${Math.min((soilPh / 14) * 100, 100)}%` }}
              />
            </div>
          </div>

          {/* Organic Matter */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
            <span className="text-[11px] text-slate-500 font-medium">Organic Matter (SOM)</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-extrabold text-slate-900">
                {profile.farm_metadata?.soil_profile?.organic_matter_percent ?? 2.8}%
              </span>
              <span className="text-[10px] text-emerald-600 font-medium">Good biological activity</span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full"
                style={{
                  width: `${Math.min(
                    ((profile.farm_metadata?.soil_profile?.organic_matter_percent ?? 2.8) / 6) * 100,
                    100,
                  )}%`,
                }}
              />
            </div>
          </div>

          {/* Primary Texture */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
            <span className="text-[11px] text-slate-500 font-medium">Soil Texture Classification</span>
            <div className="text-base font-bold text-slate-900 mt-1 capitalize">
              {profile.farm_metadata?.soil_profile?.texture?.replace(/_/g, ' ') || 'Silt Loam'}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              High cation exchange capacity &amp; balanced drainage.
            </p>
          </div>
        </div>

        {/* NPK Values */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
          <span className="text-[11px] font-bold text-slate-700 block mb-2 uppercase tracking-wider">
            Available Macro-Nutrients (NPK)
          </span>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-white p-2 rounded-lg border border-slate-200">
              <span className="text-slate-400 text-[10px]">Nitrogen (N)</span>
              <p className="font-bold text-slate-900 text-sm">
                {profile.farm_metadata?.soil_profile?.nitrogen_n_ppm ?? 25} ppm
              </p>
            </div>
            <div className="bg-white p-2 rounded-lg border border-slate-200">
              <span className="text-slate-400 text-[10px]">Phosphorus (P)</span>
              <p className="font-bold text-slate-900 text-sm">
                {profile.farm_metadata?.soil_profile?.phosphorus_p_ppm ?? 15} ppm
              </p>
            </div>
            <div className="bg-white p-2 rounded-lg border border-slate-200">
              <span className="text-slate-400 text-[10px]">Potassium (K)</span>
              <p className="font-bold text-slate-900 text-sm">
                {profile.farm_metadata?.soil_profile?.potassium_k_ppm ?? 150} ppm
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Farm Metadata & Location Form ─── */}
      <div className="card space-y-4">
        <div className="flex items-center gap-2 font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
          <MapPin className="h-4 w-4 text-crop-green-600" />
          Geographical Coordinates &amp; Land Boundary
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block text-slate-500 font-medium mb-1">Latitude</label>
            <input
              type="number"
              step="any"
              value={profile.farm_metadata?.location?.latitude ?? 0}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  farm_metadata: {
                    ...profile.farm_metadata!,
                    location: {
                      ...profile.farm_metadata!.location,
                      latitude: parseFloat(e.target.value) || 0,
                    },
                  },
                })
              }
              className="input-field text-xs py-2"
            />
          </div>

          <div>
            <label className="block text-slate-500 font-medium mb-1">Longitude</label>
            <input
              type="number"
              step="any"
              value={profile.farm_metadata?.location?.longitude ?? 0}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  farm_metadata: {
                    ...profile.farm_metadata!,
                    location: {
                      ...profile.farm_metadata!.location,
                      longitude: parseFloat(e.target.value) || 0,
                    },
                  },
                })
              }
              className="input-field text-xs py-2"
            />
          </div>

          <div>
            <label className="block text-slate-500 font-medium mb-1">Region / Province</label>
            <input
              type="text"
              value={profile.farm_metadata?.location?.region || ''}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  farm_metadata: {
                    ...profile.farm_metadata!,
                    location: {
                      ...profile.farm_metadata!.location,
                      region: e.target.value,
                    },
                  },
                })
              }
              className="input-field text-xs py-2"
            />
          </div>

          <div>
            <label className="block text-slate-500 font-medium mb-1">Total Area (Hectares)</label>
            <input
              type="number"
              step="any"
              value={profile.farm_metadata?.total_area_hectares ?? 0}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  farm_metadata: {
                    ...profile.farm_metadata!,
                    total_area_hectares: parseFloat(e.target.value) || 0,
                  },
                })
              }
              className="input-field text-xs py-2"
            />
          </div>
        </div>
      </div>

      {/* ─── Operational Objectives & Constraints ─── */}
      <div className="card space-y-4">
        <div className="flex items-center gap-2 font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
          <Target className="h-4 w-4 text-purple-600" />
          Optimization Objectives &amp; Capital
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block text-slate-500 font-medium mb-1">Primary Objective</label>
            <select
              value={profile.constraints_and_preferences?.primary_objective || 'maximize_profit'}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  constraints_and_preferences: {
                    ...profile.constraints_and_preferences!,
                    primary_objective: e.target.value,
                  },
                })
              }
              className="select-field text-xs py-2"
            >
              <option value="maximize_profit">Maximize Profit</option>
              <option value="soil_restoration">Soil Restoration</option>
              <option value="water_conservation">Water Conservation</option>
              <option value="balanced">Balanced Sustainability</option>
              <option value="maximize_yield">Maximize Gross Yield</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-500 font-medium mb-1">Available Capital (USD)</label>
            <input
              type="number"
              value={profile.constraints_and_preferences?.available_capital_usd ?? 0}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  constraints_and_preferences: {
                    ...profile.constraints_and_preferences!,
                    available_capital_usd: parseFloat(e.target.value) || 0,
                  },
                })
              }
              className="input-field text-xs py-2"
            />
          </div>

          <div>
            <label className="block text-slate-500 font-medium mb-1">Risk Tolerance</label>
            <select
              value={profile.constraints_and_preferences?.risk_tolerance || 'medium'}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  constraints_and_preferences: {
                    ...profile.constraints_and_preferences!,
                    risk_tolerance: e.target.value,
                  },
                })
              }
              className="select-field text-xs py-2"
            >
              <option value="low">Low (Conservative)</option>
              <option value="medium">Medium (Balanced)</option>
              <option value="high">High (Maximum Return)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
