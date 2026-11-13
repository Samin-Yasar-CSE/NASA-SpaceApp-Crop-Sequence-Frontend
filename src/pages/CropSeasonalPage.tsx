import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  SunMedium,
  Droplets,
  Sprout,
} from 'lucide-react';
import { useAppContext } from '@/context/AppContext';

interface SeasonData {
  id: string;
  name: string;
  period: string;
  climateProfile: string;
  moistureSmap: string;
  keyCrops: Array<{ name: string; type: string; waterNeed: 'Low' | 'Medium' | 'High'; days: number }>;
  agronomicGuidance: string;
  recommendedCoverCrop: string;
}

const SEASONS: SeasonData[] = [
  {
    id: 'kharif',
    name: 'Kharif (Monsoon / Summer Wet)',
    period: 'June – October',
    climateProfile: 'High heat, heavy monsoon precipitation, peak daylight hours.',
    moistureSmap: 'NASA SMAP: High surface & root-zone moisture (0.35–0.45 m³/m³).',
    keyCrops: [
      { name: 'Paddy Rice', type: 'Primary Cereal', waterNeed: 'High', days: 120 },
      { name: 'Soybean', type: 'Legume / N-Fixer', waterNeed: 'Medium', days: 105 },
      { name: 'Maize / Corn', type: 'High Feeder Cereal', waterNeed: 'Medium', days: 110 },
      { name: 'Sorghum', type: 'Drought-Resilient Cereal', waterNeed: 'Low', days: 100 },
      { name: 'Cotton', type: 'Cash Fiber', waterNeed: 'Medium', days: 150 },
    ],
    agronomicGuidance:
      'Leverage rainfall for water-intensive cash crops. Planting legumes (Soybean) fixes 40–80 kg N/ha into the soil, reducing fertilizer costs for following Rabi cereals.',
    recommendedCoverCrop: 'Sunn Hemp or Cowpea for weed suppression.',
  },
  {
    id: 'rabi',
    name: 'Rabi (Winter / Dry Cool)',
    period: 'November – April',
    climateProfile: 'Mild days, cold nights, low relative humidity, receding soil moisture.',
    moistureSmap: 'NASA SMAP: Moderate receding moisture (0.20–0.28 m³/m³). Supplemental irrigation often beneficial.',
    keyCrops: [
      { name: 'Winter Wheat', type: 'Primary Cereal', waterNeed: 'Medium', days: 135 },
      { name: 'Chickpea / Gram', type: 'Legume / Pulse', waterNeed: 'Low', days: 100 },
      { name: 'Mustard', type: 'Oilseed Cash Crop', waterNeed: 'Low', days: 110 },
      { name: 'Barley', type: 'Hardy Grain', waterNeed: 'Low', days: 115 },
      { name: 'Potato', type: 'Root Cash Crop', waterNeed: 'Medium', days: 90 },
    ],
    agronomicGuidance:
      'Capitalize on residual soil moisture from preceding monsoon. Deep-rooted legumes break pest and nematode cycles, conditioning soil tilth.',
    recommendedCoverCrop: 'Hairy Vetch or Crimson Clover.',
  },
  {
    id: 'zaid',
    name: 'Zaid (Summer Short Season)',
    period: 'March – June',
    climateProfile: 'Intense thermal sunshine, arid air, high evapotranspiration.',
    moistureSmap: 'NASA SMAP: Low baseline moisture (<0.18 m³/m³). Requires controlled irrigation or deep taproots.',
    keyCrops: [
      { name: 'Mung Bean (Moong)', type: 'Short-Duration Pulse', waterNeed: 'Low', days: 65 },
      { name: 'Watermelon / Melons', type: 'Cucurbit Cash Crop', waterNeed: 'Medium', days: 75 },
      { name: 'Cucumber', type: 'High-Value Vegetable', waterNeed: 'Medium', days: 55 },
      { name: 'Fodder Cowpea', type: 'Livestock Biomass', waterNeed: 'Low', days: 60 },
    ],
    agronomicGuidance:
      'Prevents seasonal fallow degradation. Ultra-short duration legumes recharge soil microbial biomass and biomass carbon between primary cash seasons.',
    recommendedCoverCrop: 'Sudangrass or Buckwheat.',
  },
];

export default function CropSeasonalPage() {
  const navigate = useNavigate();
  const { state, dispatch } = useAppContext();
  const [selectedSeason, setSelectedSeason] = useState<string>('kharif');

  const currentSeason = SEASONS.find((s) => s.id === selectedSeason) || SEASONS[0];

  const handleApplySeason = (seasonName: string) => {
    // Add season to active planning horizon
    const existing = state.farmerProfile.planning_horizon?.seasons || [];
    if (!existing.includes(seasonName)) {
      dispatch({
        type: 'UPDATE_PROFILE',
        payload: {
          planning_horizon: {
            ...state.farmerProfile.planning_horizon!,
            seasons: [...existing, seasonName],
          },
        },
      });
    }
    navigate('/sequence');
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-4 space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <SunMedium className="h-4 w-4" />
            </span>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900">
              Crop Seasonal Variation
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Understand dynamic planting windows, water demands, and climate adaptation.
          </p>
        </div>
      </div>

      {/* Season Selector Tabs */}
      <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-2xl text-xs">
        {SEASONS.map((season) => (
          <button
            key={season.id}
            onClick={() => setSelectedSeason(season.id)}
            className={`py-2 px-3 rounded-xl font-semibold transition-all text-center ${
              selectedSeason === season.id
                ? 'bg-white text-crop-green-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <div className="truncate">{season.name.split(' ')[0]}</div>
            <div className="text-[10px] text-slate-400 font-normal truncate">{season.period}</div>
          </button>
        ))}
      </div>

      {/* Season Detail Card */}
      <div className="card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">{currentSeason.name}</h2>
            <p className="text-xs text-crop-green-700 font-medium">{currentSeason.period}</p>
          </div>
          <button
            onClick={() => handleApplySeason(currentSeason.name.split(' ')[0])}
            className="btn-primary py-2 px-3 text-xs self-start sm:self-auto"
          >
            <Sprout className="h-3.5 w-3.5" />
            Add to Sequence Optimizer
          </button>
        </div>

        {/* Environmental Telemetry */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/60">
            <div className="flex items-center gap-1.5 font-bold text-amber-900 mb-1">
              <SunMedium className="h-4 w-4 text-amber-600" />
              Climate Dynamics
            </div>
            <p className="text-amber-800/90 leading-relaxed">{currentSeason.climateProfile}</p>
          </div>

          <div className="p-3 rounded-xl bg-sky-blue-50/60 border border-sky-blue-200/60">
            <div className="flex items-center gap-1.5 font-bold text-sky-blue-900 mb-1">
              <Droplets className="h-4 w-4 text-sky-blue-600" />
              NASA Earth Telemetry
            </div>
            <p className="text-sky-blue-800/90 leading-relaxed">{currentSeason.moistureSmap}</p>
          </div>
        </div>

        {/* Recommended Crops for this Season */}
        <div>
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
            Top Seasonal Crops &amp; Varieties
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {currentSeason.keyCrops.map((crop, i) => (
              <div
                key={i}
                className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs">{crop.name}</span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        crop.waterNeed === 'High'
                          ? 'bg-blue-100 text-blue-800'
                          : crop.waterNeed === 'Medium'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {crop.waterNeed} Water
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">{crop.type}</p>
                </div>
                <div className="mt-2 text-[10px] text-slate-400 font-mono">
                  Cycle: ~{crop.days} days to harvest
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Agronomic Strategy */}
        <div className="p-3.5 rounded-xl bg-crop-green-50/60 border border-crop-green-200/60 text-xs space-y-1.5">
          <div className="flex items-center gap-1.5 font-bold text-crop-green-900">
            <Sprout className="h-4 w-4 text-crop-green-700" />
            Seasonal Agronomic Guidance
          </div>
          <p className="text-crop-green-900/90 leading-relaxed">{currentSeason.agronomicGuidance}</p>
          <div className="text-[11px] text-crop-green-800 pt-1">
            <span className="font-semibold">Recommended Cover Crop:</span> {currentSeason.recommendedCoverCrop}
          </div>
        </div>
      </div>
    </div>
  );
}
