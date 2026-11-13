import React, { createContext, useContext, useReducer, type ReactNode } from 'react';
import type { FarmerProfile } from '@/types/farmerProfile';
import type { FinalResponse } from '@/types/recommendation';
import { CropSeqApiError } from '@/api/cropseqApi';

// ─── State ───
export interface AppState {
  farmerProfile: Partial<FarmerProfile>;
  recommendation: FinalResponse | null;
  isLoading: boolean;
  error: CropSeqApiError | null;
  currentStep: 'landing' | 'intake' | 'review' | 'loading' | 'results';
}

const initialState: AppState = {
  farmerProfile: {
    farm_metadata: {
      location: { latitude: 0, longitude: 0, region: '', country: '' },
      total_area_hectares: 0,
      irrigation_type: '',
      soil_profile: {
        texture: '',
        ph: 7,
        organic_matter_percent: 0,
        nitrogen_n_ppm: 0,
        phosphorus_p_ppm: 0,
        potassium_k_ppm: 0,
      },
    },
    planning_horizon: {
      start_year: new Date().getFullYear(),
      number_of_seasons: 4,
      seasons: [],
    },
    historical_data: {
      previous_crops: [],
      fallow_history_seasons: 0,
    },
    constraints_and_preferences: {
      primary_objective: '',
      target_crops: [],
      excluded_crops: [],
      risk_tolerance: 'medium',
      available_capital_usd: 0,
      labor_availability: 'medium',
    },
  },
  recommendation: null,
  isLoading: false,
  error: null,
  currentStep: 'landing',
};

// ─── Actions ───
type AppAction =
  | { type: 'UPDATE_PROFILE'; payload: Partial<FarmerProfile> }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_RECOMMENDATION'; payload: FinalResponse }
  | { type: 'SET_ERROR'; payload: CropSeqApiError | null }
  | { type: 'SET_STEP'; payload: AppState['currentStep'] }
  | { type: 'RESET' };

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'UPDATE_PROFILE':
      return {
        ...state,
        farmerProfile: deepMerge(state.farmerProfile, action.payload),
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload, error: action.payload ? null : state.error };
    case 'SET_RECOMMENDATION':
      return { ...state, recommendation: action.payload, isLoading: false, error: null, currentStep: 'results' };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'SET_STEP':
      return { ...state, currentStep: action.payload };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

// Deep merge utility for nested profile updates
function deepMerge<T extends Record<string, unknown>>(target: T, source: Partial<T>): T {
  const output = { ...target };
  for (const key of Object.keys(source) as Array<keyof T>) {
    const sourceVal = source[key];
    const targetVal = target[key];
    if (
      sourceVal &&
      typeof sourceVal === 'object' &&
      !Array.isArray(sourceVal) &&
      targetVal &&
      typeof targetVal === 'object' &&
      !Array.isArray(targetVal)
    ) {
      (output as Record<string, unknown>)[key as string] = deepMerge(
        targetVal as Record<string, unknown>,
        sourceVal as Record<string, unknown>,
      );
    } else {
      (output as Record<string, unknown>)[key as string] = sourceVal;
    }
  }
  return output;
}

// ─── Context ───
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext(): AppContextType {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
