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
  embeddedWidget?: 'sequence-results' | 'error';
  recommendationData?: FinalResponse;
}

// ─── State ───
export interface AppState {
  farmerProfile: Partial<FarmerProfile>;
  recommendation: FinalResponse | null;
  isLoading: boolean;
  error: CropSeqApiError | null;
  messages: ChatMessage[];
  backendOnline: boolean | null; // null = checking, true = online, false = offline
}

const initialMessages: ChatMessage[] = [
  {
    id: 'welcome-1',
    sender: 'assistant',
    text: "Hello! 👋 I'm **CropSeq AI**, your agricultural assistant powered by NASA Earth observations (SMAP soil moisture, GPM rainfall, MODIS vegetation dynamics).\n\nI can help you generate optimized crop rotation sequences tailored to your farm's conditions.\n\nType **\"start\"** to begin your guided farm assessment, or ask me any agriculture question!",
    timestamp: new Date(),
  },
];

const initialState: AppState = {
  farmerProfile: {},
  recommendation: null,
  isLoading: false,
  error: null,
  messages: initialMessages,
  backendOnline: null,
};

// ─── Actions ───
type AppAction =
  | { type: 'UPDATE_PROFILE'; payload: Partial<FarmerProfile> }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_RECOMMENDATION'; payload: FinalResponse }
  | { type: 'SET_ERROR'; payload: CropSeqApiError | null }
  | { type: 'ADD_MESSAGE'; payload: ChatMessage }
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
      return { ...state, recommendation: action.payload, isLoading: false, error: null };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.payload] };
    case 'SET_BACKEND_STATUS':
      return { ...state, backendOnline: action.payload };
    case 'CLEAR_CHAT':
      return { ...state, messages: initialMessages };
    case 'RESET':
      return { ...initialState, messages: initialMessages, backendOnline: state.backendOnline };
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
