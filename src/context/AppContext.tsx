import React, { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import type { FarmerProfile } from '@/types/farmerProfile';
import type { FinalResponse } from '@/types/recommendation';
import { CropSeqApiError, checkHealth } from '@/api/cropseqApi';

// ─── Chat Message Types ───
export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: Date;
  isWebSearch?: boolean;
  embeddedWidget?: 'sequence-results' | 'intake-flow' | 'seasonal' | 'error';
  recommendationData?: FinalResponse;
}

// ─── State ───
export interface AppState {
  farmerProfile: Partial<FarmerProfile>;
  recommendation: FinalResponse | null;
  isLoading: boolean;
  error: CropSeqApiError | null;
  currentStep: 'landing' | 'intake' | 'review' | 'loading' | 'results';
  activeTab: 'chat' | 'sequence' | 'seasonal' | 'recommendations' | 'farm';
  messages: ChatMessage[];
  isWebSearchActive: boolean;
  backendOnline: boolean | null; // null = checking, true = online, false = offline
}

const initialProfile: Partial<FarmerProfile> = {
  farm_metadata: {
    location: { latitude: 41.8781, longitude: -87.6298, region: 'Midwest', country: 'United States' },
    total_area_hectares: 45.5,
    irrigation_type: 'rainfed',
    soil_profile: {
      texture: 'silt_loam',
      ph: 6.5,
      organic_matter_percent: 2.8,
      nitrogen_n_ppm: 25,
      phosphorus_p_ppm: 15,
      potassium_k_ppm: 150,
    },
  },
  planning_horizon: {
    start_year: 2026,
    number_of_seasons: 4,
    seasons: ['Spring', 'Summer', 'Fall', 'Winter'],
  },
  historical_data: {
    previous_crops: [
      { season: 'Summer 2025', crop_name: 'Corn' },
      { season: 'Fall 2025', crop_name: 'Soybean' },
    ],
    fallow_history_seasons: 0,
  },
  constraints_and_preferences: {
    primary_objective: 'maximize_profit',
    target_crops: ['Soybean', 'Wheat', 'Corn'],
    excluded_crops: ['Tobacco'],
    risk_tolerance: 'medium',
    available_capital_usd: 12000,
    labor_availability: 'medium',
  },
};

const initialMessages: ChatMessage[] = [
  {
    id: 'welcome-1',
    sender: 'assistant',
    text: "Hello! I am CropSeq AI, your agricultural assistant powered by NASA Earth observations (SMAP soil moisture, GPM rainfall, MODIS vegetation dynamics).\n\nHow can I assist your farm today? You can ask me agronomic questions, analyze seasonal variations, or explore optimized crop sequences.",
    timestamp: new Date(),
  },
];

const initialState: AppState = {
  farmerProfile: initialProfile,
  recommendation: null,
  isLoading: false,
  error: null,
  currentStep: 'landing',
  activeTab: 'chat',
  messages: initialMessages,
  isWebSearchActive: false,
  backendOnline: null,
};

// ─── Actions ───
type AppAction =
  | { type: 'UPDATE_PROFILE'; payload: Partial<FarmerProfile> }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_RECOMMENDATION'; payload: FinalResponse }
  | { type: 'SET_ERROR'; payload: CropSeqApiError | null }
  | { type: 'SET_STEP'; payload: AppState['currentStep'] }
  | { type: 'SET_ACTIVE_TAB'; payload: AppState['activeTab'] }
  | { type: 'ADD_MESSAGE'; payload: ChatMessage }
  | { type: 'TOGGLE_WEB_SEARCH' }
  | { type: 'SET_BACKEND_STATUS'; payload: boolean }
  | { type: 'CLEAR_CHAT' }
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
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload };
    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.payload] };
    case 'TOGGLE_WEB_SEARCH':
      return { ...state, isWebSearchActive: !state.isWebSearchActive };
    case 'SET_BACKEND_STATUS':
      return { ...state, backendOnline: action.payload };
    case 'CLEAR_CHAT':
      return { ...state, messages: initialMessages };
    case 'RESET':
      return { ...initialState, messages: initialMessages };
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
  checkBackendHealth: () => Promise<boolean>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const checkBackendHealth = async (): Promise<boolean> => {
    try {
      await checkHealth();
      dispatch({ type: 'SET_BACKEND_STATUS', payload: true });
      return true;
    } catch {
      dispatch({ type: 'SET_BACKEND_STATUS', payload: false });
      return false;
    }
  };

  useEffect(() => {
    checkBackendHealth();
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch, checkBackendHealth }}>
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
