import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layers,
  Sprout,
  Plus,
  Check,
  Droplets,
  ShieldCheck,
  Search,
} from 'lucide-react';
import { useAppContext } from '@/context/AppContext';

interface CropCard {
  id: string;
  name: string;
  scientificName: string;
  category: 'Legumes & N-Fixers' | 'Drought Resilient' | 'Cash Crops' | 'Cover & Soil Restorers';
  optimalPhRange: [number, number];
  waterEfficiency: 'High' | 'Moderate' | 'Low';
  rootDepth: 'Shallow' | 'Medium' | 'Deep';
  benefits: string;
}

const EXTENDED_CROPS: CropCard[] = [
  {
    id: 'cereal_rye',
    name: 'Cereal Rye',
    scientificName: 'Secale cereale',
    category: 'Cover & Soil Restorers',
    optimalPhRange: [5.0, 7.0],
    waterEfficiency: 'High',
    rootDepth: 'Deep',
    benefits: 'Scavenges residual nitrogen, breaks nematode cycles, suppresses persistent spring weeds.',
  },
  {
    id: 'chickpea',
    name: 'Chickpea (Gram)',
    scientificName: 'Cicer arietinum',
    category: 'Legumes & N-Fixers',
    optimalPhRange: [6.0, 7.5],
    waterEfficiency: 'High',
    rootDepth: 'Deep',
    benefits: 'Fixes up to 85 kg N/ha, excellent drought adaptability, high domestic commodity value.',
  },
  {
    id: 'sorghum',
    name: 'Grain Sorghum',
    scientificName: 'Sorghum bicolor',
    category: 'Drought Resilient',
    optimalPhRange: [5.5, 7.5],
    waterEfficiency: 'High',
    rootDepth: 'Deep',
    benefits: 'Consumes 30% less water than maize, tolerates high thermal stress, provides substantial stover.',
  },
  {
    id: 'soybean',
    name: 'Soybean',
    scientificName: 'Glycine max',
    category: 'Legumes & N-Fixers',
    optimalPhRange: [6.0, 7.0],
    waterEfficiency: 'Moderate',
    rootDepth: 'Medium',
    benefits: 'Superb cash liquidity, provides 40–50 kg residual nitrogen for follow-up cereal rotations.',
  },
  {
    id: 'sunflower',
    name: 'Sunflower',
    scientificName: 'Helianthus annuus',
    category: 'Cash Crops',
    optimalPhRange: [6.0, 7.5],
    waterEfficiency: 'High',
    rootDepth: 'Deep',
    benefits: 'Deep taproot mines subsoil moisture and nutrients unreachable by shallow grains.',
  },
  {
    id: 'crimson_clover',
    name: 'Crimson Clover',
    scientificName: 'Trifolium incarnatum',
    category: 'Cover & Soil Restorers',
    optimalPhRange: [6.0, 7.0],
    waterEfficiency: 'Moderate',
    rootDepth: 'Medium',
    benefits: 'Rapid biomass producer, pollinator magnet, releases organic nitrogen rapidly upon termination.',
  },
  {
    id: 'pearl_millet',
    name: 'Pearl Millet (Bajra)',
    scientificName: 'Pennisetum glaucum',
    category: 'Drought Resilient',
    optimalPhRange: [5.5, 8.0],
    waterEfficiency: 'High',
    rootDepth: 'Deep',
    benefits: 'Extremely resilient in sandy soils and arid climates with high salinity tolerance.',
  },
  {
    id: 'mustard',
    name: 'Mustard (Brassica)',
    scientificName: 'Brassica juncea',
    category: 'Cash Crops',
    optimalPhRange: [6.0, 7.5],
    waterEfficiency: 'Moderate',
    rootDepth: 'Medium',
    benefits: 'Bio-fumigant root exudates suppress soil-borne fungal pathogens prior to planting cereals.',
  },
];

export default function FurtherCropsPage() {
  const navigate = useNavigate();
  const { state, dispatch } = useAppContext();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const targetCrops = state.farmerProfile.constraints_and_preferences?.target_crops || [];
  const farmPh = state.farmerProfile.farm_metadata?.soil_profile?.ph ?? 6.5;

  const toggleTargetCrop = (cropName: string) => {
    let updated: string[];
    if (targetCrops.includes(cropName)) {
      updated = targetCrops.filter((c) => c !== cropName);
    } else {
      updated = [...targetCrops, cropName];
    }

    dispatch({
      type: 'UPDATE_PROFILE',
      payload: {
        constraints_and_preferences: {
          ...state.farmerProfile.constraints_and_preferences!,
          target_crops: updated,
        },
      },
    });
  };

  const categories = ['All', 'Legumes & N-Fixers', 'Drought Resilient', 'Cash Crops', 'Cover & Soil Restorers'];

  const filteredCrops = EXTENDED_CROPS.filter((crop) => {
    const matchesCategory = selectedCategory === 'All' || crop.category === selectedCategory;
    const matchesSearch =
      crop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      crop.scientificName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      crop.benefits.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-4 space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <Layers className="h-4 w-4" />
            </span>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900">
              Further Crop Recommendations
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Discover alternative crops and companion species compatible with your soil conditions.
          </p>
        </div>

        <button
          onClick={() => navigate('/sequence')}
          className="btn-primary py-2 px-3 text-xs self-start sm:self-auto"
        >
          <Sprout className="h-3.5 w-3.5" />
          Sequence Optimizer ({targetCrops.length} selected)
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search crop name, benefits, or species..."
            className="input-field pl-9 py-2 text-xs"
          />
        </div>

        <div className="flex gap-1 overflow-x-auto no-scrollbar pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-crop-green-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Crops Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filteredCrops.map((crop) => {
          const isSelected = targetCrops.includes(crop.name);
          const isPhCompatible = farmPh >= crop.optimalPhRange[0] && farmPh <= crop.optimalPhRange[1];

          return (
            <div
              key={crop.id}
              className={`card p-4 flex flex-col justify-between transition-all ${
                isSelected ? 'border-crop-green-500 bg-crop-green-50/20 shadow-xs' : ''
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{crop.name}</h3>
                    <p className="text-[11px] text-slate-400 italic">{crop.scientificName}</p>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {crop.category}
                  </span>
                </div>

                <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">
                  {crop.benefits}
                </p>

                {/* Compatibility tags */}
                <div className="mt-3 flex flex-wrap gap-2 text-[10px]">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-medium ${
                      isPhCompatible
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                        : 'bg-amber-50 text-amber-700 border border-amber-200/60'
                    }`}
                  >
                    <ShieldCheck className="h-3 w-3" />
                    pH {crop.optimalPhRange[0]}–{crop.optimalPhRange[1]} {isPhCompatible ? '(Optimal)' : '(Marginal)'}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-medium bg-sky-blue-50 text-sky-blue-700 border border-sky-blue-200/60">
                    <Droplets className="h-3 w-3" />
                    {crop.waterEfficiency} Water Efficiency
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  {isSelected ? 'Included in optimization' : 'Available for rotation'}
                </span>
                <button
                  onClick={() => toggleTargetCrop(crop.name)}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-crop-green-600 text-white'
                      : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {isSelected ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      Selected
                    </>
                  ) : (
                    <>
                      <Plus className="h-3.5 w-3.5" />
                      Add to Target
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
