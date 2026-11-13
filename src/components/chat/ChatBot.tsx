import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Send,
  Bot,
  User,
  Sprout,
  Satellite,
  Loader2,
  RefreshCw,
  AlertTriangle,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { useAppContext, type ChatMessage } from '@/context/AppContext';
import { getRecommendations, CropSeqApiError } from '@/api/cropseqApi';
import type { FarmerProfile } from '@/types/farmerProfile';
import SequenceTimeline from '@/components/results/SequenceTimeline';
import OptimizationSummaryCard from '@/components/results/OptimizationSummaryCard';
import WarningsPanel from '@/components/results/WarningsPanel';
import ParetoAlternatives from '@/components/results/ParetoAlternatives';

// ─── Guided Intake Step Definitions ───

interface IntakeStep {
  id: string;
  question: string;
  type: 'text' | 'number' | 'select' | 'multi-select' | 'previous-crops';
  field: string;
  options?: string[];
  placeholder?: string;
  validation?: (value: string) => string | null;
  helperText?: string;
  optional?: boolean;
}

const INTAKE_STEPS: IntakeStep[] = [
  {
    id: 'latitude',
    question: "Let's start! What is your farm's **latitude** coordinate?",
    type: 'number',
    field: 'farm_metadata.location.latitude',
    placeholder: 'e.g., 23.8103',
    helperText: 'Decimal degrees, between −90 and 90',
    validation: (v) => {
      const n = parseFloat(v);
      if (isNaN(n)) return 'Please enter a valid number.';
      if (n < -90 || n > 90) return 'Latitude must be between −90 and 90.';
      return null;
    },
  },
  {
    id: 'longitude',
    question: "What is the **longitude** coordinate?",
    type: 'number',
    field: 'farm_metadata.location.longitude',
    placeholder: 'e.g., 90.4125',
    helperText: 'Decimal degrees, between −180 and 180',
    validation: (v) => {
      const n = parseFloat(v);
      if (isNaN(n)) return 'Please enter a valid number.';
      if (n < -180 || n > 180) return 'Longitude must be between −180 and 180.';
      return null;
    },
  },
  {
    id: 'region',
    question: 'What **region** is your farm located in?',
    type: 'text',
    field: 'farm_metadata.location.region',
    placeholder: 'e.g., Dhaka Division, Punjab, Midwest',
    validation: (v) => (!v.trim() ? 'Region is required.' : null),
  },
  {
    id: 'country',
    question: 'What **country** is your farm in?',
    type: 'text',
    field: 'farm_metadata.location.country',
    placeholder: 'e.g., Bangladesh, India, United States',
    validation: (v) => (!v.trim() ? 'Country is required.' : null),
  },
  {
    id: 'area',
    question: 'What is the **total area** of your farm in hectares?',
    type: 'number',
    field: 'farm_metadata.total_area_hectares',
    placeholder: 'e.g., 12.5',
    validation: (v) => {
      const n = parseFloat(v);
      if (isNaN(n) || n <= 0) return 'Please enter a positive number.';
      return null;
    },
  },
  {
    id: 'irrigation',
    question: 'What type of **irrigation** does your farm use?',
    type: 'select',
    field: 'farm_metadata.irrigation_type',
    options: ['rainfed', 'drip', 'sprinkler', 'flood', 'center_pivot', 'furrow'],
  },
  {
    id: 'soil_texture',
    question: 'What is your **soil texture** type?',
    type: 'select',
    field: 'farm_metadata.soil_profile.texture',
    options: ['clay', 'clay_loam', 'loam', 'sandy_loam', 'silt_loam', 'sandy', 'silty_clay', 'peat'],
  },
  {
    id: 'soil_ph',
    question: 'What is your **soil pH** level?',
    type: 'number',
    field: 'farm_metadata.soil_profile.ph',
    placeholder: 'e.g., 6.5',
    helperText: 'Between 0 and 14. Most crops prefer 6.0–7.5.',
    validation: (v) => {
      const n = parseFloat(v);
      if (isNaN(n)) return 'Please enter a valid number.';
      if (n < 0 || n > 14) return 'pH must be between 0 and 14.';
      return null;
    },
  },
  {
    id: 'organic_matter',
    question: 'What is the **organic matter** percentage of your soil?',
    type: 'number',
    field: 'farm_metadata.soil_profile.organic_matter_percent',
    placeholder: 'e.g., 2.8',
    helperText: 'Typical range: 1–6%',
    validation: (v) => {
      const n = parseFloat(v);
      if (isNaN(n) || n < 0) return 'Please enter a valid positive number.';
      return null;
    },
  },
  {
    id: 'nitrogen',
    question: 'What is the **nitrogen** level in your soil (ppm)?',
    type: 'number',
    field: 'farm_metadata.soil_profile.nitrogen_n_ppm',
    placeholder: 'e.g., 25',
    helperText: 'Enter 0 if unknown.',
    validation: (v) => {
      const n = parseFloat(v);
      if (isNaN(n) || n < 0) return 'Please enter a non-negative number.';
      return null;
    },
  },
  {
    id: 'phosphorus',
    question: 'What is the **phosphorus** level in your soil (ppm)?',
    type: 'number',
    field: 'farm_metadata.soil_profile.phosphorus_p_ppm',
    placeholder: 'e.g., 15',
    helperText: 'Enter 0 if unknown.',
    validation: (v) => {
      const n = parseFloat(v);
      if (isNaN(n) || n < 0) return 'Please enter a non-negative number.';
      return null;
    },
  },
  {
    id: 'potassium',
    question: 'What is the **potassium** level in your soil (ppm)?',
    type: 'number',
    field: 'farm_metadata.soil_profile.potassium_k_ppm',
    placeholder: 'e.g., 150',
    helperText: 'Enter 0 if unknown.',
    validation: (v) => {
      const n = parseFloat(v);
      if (isNaN(n) || n < 0) return 'Please enter a non-negative number.';
      return null;
    },
  },
  {
    id: 'start_year',
    question: 'What **year** should the crop sequence start?',
    type: 'number',
    field: 'planning_horizon.start_year',
    placeholder: `e.g., ${new Date().getFullYear()}`,
    validation: (v) => {
      const n = parseInt(v, 10);
      if (isNaN(n) || n < 2020 || n > 2050) return 'Please enter a year between 2020 and 2050.';
      return null;
    },
  },
  {
    id: 'num_seasons',
    question: 'How many **seasons** should the rotation plan cover?',
    type: 'number',
    field: 'planning_horizon.number_of_seasons',
    placeholder: 'e.g., 4',
    helperText: 'Recommended: 3–8 seasons',
    validation: (v) => {
      const n = parseInt(v, 10);
      if (isNaN(n) || n < 1 || n > 20) return 'Please enter between 1 and 20 seasons.';
      return null;
    },
  },
  {
    id: 'seasons',
    question: 'Which **growing seasons** apply to your farm?',
    type: 'multi-select',
    field: 'planning_horizon.seasons',
    options: ['Kharif', 'Rabi', 'Spring', 'Summer', 'Fall', 'Winter', 'Wet Season', 'Dry Season'],
  },
  {
    id: 'previous_crops',
    question: 'What crops have you grown recently? _(Enter as "Season: Crop", one per line, or type "none")_',
    type: 'previous-crops',
    field: 'historical_data.previous_crops',
    placeholder: 'e.g., Kharif 2025: Rice\nRabi 2024-25: Wheat',
    helperText: 'Format: "Season: Crop" each line. Type "none" if no history.',
  },
  {
    id: 'fallow',
    question: 'How many recent seasons has the field been left **fallow** (uncultivated)?',
    type: 'number',
    field: 'historical_data.fallow_history_seasons',
    placeholder: 'e.g., 0',
    validation: (v) => {
      const n = parseInt(v, 10);
      if (isNaN(n) || n < 0) return 'Please enter a non-negative number.';
      return null;
    },
  },
  {
    id: 'objective',
    question: 'What is your **primary optimization objective**?',
    type: 'select',
    field: 'constraints_and_preferences.primary_objective',
    options: ['maximize_profit', 'soil_restoration', 'water_conservation', 'balanced', 'maximize_yield', 'carbon_sequestration'],
  },
  {
    id: 'target_crops',
    question: 'Any specific crops you\'d like to **include**? _(comma-separated, or type "none")_',
    type: 'text',
    field: 'constraints_and_preferences.target_crops',
    placeholder: 'e.g., Wheat, Soybean, Corn',
    helperText: 'Leave empty or type "none" if no preference.',
    optional: true,
  },
  {
    id: 'excluded_crops',
    question: 'Any crops you want to **exclude**? _(comma-separated, or type "none")_',
    type: 'text',
    field: 'constraints_and_preferences.excluded_crops',
    placeholder: 'e.g., Tobacco, Cotton',
    helperText: 'Leave empty or type "none" if no exclusions.',
    optional: true,
  },
  {
    id: 'risk_tolerance',
    question: 'What is your **risk tolerance** level?',
    type: 'select',
    field: 'constraints_and_preferences.risk_tolerance',
    options: ['low', 'medium', 'high'],
  },
  {
    id: 'capital',
    question: 'What is your **available capital budget** in USD?',
    type: 'number',
    field: 'constraints_and_preferences.available_capital_usd',
    placeholder: 'e.g., 10000',
    helperText: 'Enter 0 if not applicable.',
    validation: (v) => {
      const n = parseFloat(v);
      if (isNaN(n) || n < 0) return 'Please enter a non-negative number.';
      return null;
    },
  },
  {
    id: 'labor',
    question: 'What is your **labor availability** level?',
    type: 'select',
    field: 'constraints_and_preferences.labor_availability',
    options: ['low', 'medium', 'high'],
  },
];

// ─── Simple markdown bold/italic renderer ───

function renderMarkdown(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|_[^_]+_)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('_') && part.endsWith('_')) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    return <span key={i}>{part}</span>;
  });
}

// ─── Component ───

export default function ChatBot() {
  const { state, dispatch, checkBackendHealth } = useAppContext();
  const [inputValue, setInputValue] = useState('');
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [intakeStep, setIntakeStep] = useState(-1); // -1 = not started, 0..N = in progress, >= length = done
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const profileRef = useRef<Record<string, unknown>>({});

  const currentStep = intakeStep >= 0 && intakeStep < INTAKE_STEPS.length ? INTAKE_STEPS[intakeStep] : null;
  const isIntakeComplete = intakeStep >= INTAKE_STEPS.length;
  const isIntakeActive = intakeStep >= 0 && !isIntakeComplete;

  // ─── Helpers ───

  const scrollToBottom = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [state.messages, scrollToBottom]);

  useEffect(() => {
    if (isIntakeActive) {
      inputRef.current?.focus();
    }
  }, [intakeStep, isIntakeActive]);

  // Scroll button visibility
  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;
    const handleScroll = () => {
      const distFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
      setShowScrollBtn(distFromBottom > 150);
    };
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  const addMessage = useCallback(
    (sender: 'user' | 'assistant', text: string, extras?: Partial<ChatMessage>) => {
      const msg: ChatMessage = {
        id: `msg-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        sender,
        text,
        timestamp: new Date(),
        ...extras,
      };
      dispatch({ type: 'ADD_MESSAGE', payload: msg });
    },
    [dispatch],
  );

  // ─── Profile builder: set nested value ───

  const setProfileValue = useCallback((dotPath: string, value: unknown) => {
    const parts = dotPath.split('.');
    let obj = profileRef.current;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!(parts[i] in obj) || typeof obj[parts[i]] !== 'object') {
        obj[parts[i]] = {};
      }
      obj = obj[parts[i]] as Record<string, unknown>;
    }
    obj[parts[parts.length - 1]] = value;
  }, []);

  // ─── Start intake ───

  const startIntake = useCallback(() => {
    setIntakeStep(0);
    const step = INTAKE_STEPS[0];
    setTimeout(() => {
      addMessage('assistant', step.question + (step.helperText ? `\n\n💡 ${step.helperText}` : ''));
    }, 400);
  }, [addMessage]);

  // ─── Advance step ───

  const advanceStep = useCallback(
    (displayValue: string, rawValue: unknown) => {
      if (!currentStep) return;

      addMessage('user', displayValue);
      setProfileValue(currentStep.field, rawValue);

      const nextIndex = intakeStep + 1;

      if (nextIndex < INTAKE_STEPS.length) {
        setIntakeStep(nextIndex);
        const nextStep = INTAKE_STEPS[nextIndex];
        setTimeout(() => {
          addMessage('assistant', nextStep.question + (nextStep.helperText ? `\n\n💡 ${nextStep.helperText}` : ''));
        }, 350);
      } else {
        setIntakeStep(nextIndex); // marks complete
        setTimeout(() => {
          addMessage(
            'assistant',
            '✅ All done! I have your complete farm profile. Let me now analyze your data using NASA Earth observations and generate optimized crop sequence recommendations…',
          );
          // Dispatch the profile to context and auto-submit
          dispatch({ type: 'UPDATE_PROFILE', payload: profileRef.current as Partial<FarmerProfile> });
          submitToBackend();
        }, 400);
      }

      setInputValue('');
      setSelectedOptions([]);
      setValidationError(null);
    },
    [currentStep, intakeStep, addMessage, setProfileValue, dispatch],
  );

  // ─── Submit to backend ───

  const submitToBackend = useCallback(async () => {
    setIsSubmitting(true);
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      // Build the full profile from collected data
      const profile = profileRef.current as unknown as FarmerProfile;
      const response = await getRecommendations(profile);

      dispatch({ type: 'SET_RECOMMENDATION', payload: response });
      dispatch({ type: 'SET_LOADING', payload: false });

      addMessage(
        'assistant',
        `🌾 **Your Optimized Crop Sequence is Ready!**\n\nI've analyzed your farm conditions using NASA SMAP soil moisture data, GPM rainfall patterns, and MODIS vegetation indices. Here are your personalized recommendations:`,
        {
          embeddedWidget: 'sequence-results',
          recommendationData: response,
        },
      );
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });

      const apiErr = error instanceof CropSeqApiError ? error : null;
      const statusCode = apiErr?.statusCode;

      let errorMsg: string;
      if (apiErr?.isNetworkError) {
        errorMsg = `⚠️ **Cannot reach the CropSeq backend**\n\nThe server at \`${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'}\` is not responding. Please ensure the backend is running and CORS is configured.`;
      } else if (statusCode === 504) {
        errorMsg = '⚠️ **External data service unavailable**\n\nThe weather or soil data service is temporarily unavailable. This is not your fault — please retry in a minute.';
      } else if (statusCode === 400) {
        errorMsg = `⚠️ **No feasible rotation found**\n\n${apiErr?.message || 'The constraints you provided may be too restrictive. Try adjusting your preferences.'}`;
      } else if (statusCode === 422) {
        errorMsg = `⚠️ **Input validation error**\n\n${apiErr?.message || 'Some of the provided data did not pass validation. Please check your inputs.'}`;
      } else {
        errorMsg = `⚠️ **Something went wrong**\n\n${apiErr?.message || 'An unexpected error occurred. Please try again.'}`;
      }

      addMessage('assistant', errorMsg, { embeddedWidget: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  }, [addMessage, dispatch]);

  // ─── Handle chat input submit ───

  const handleSubmit = useCallback(() => {
    // If intake is active, process as intake answer
    if (isIntakeActive && currentStep) {
      if (currentStep.type === 'select') {
        if (!inputValue) {
          setValidationError('Please select an option.');
          return;
        }
        advanceStep(
          inputValue.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
          inputValue,
        );
        return;
      }

      if (currentStep.type === 'multi-select') {
        if (selectedOptions.length === 0) {
          setValidationError('Please select at least one option.');
          return;
        }
        advanceStep(selectedOptions.join(', '), selectedOptions);
        return;
      }

      if (currentStep.type === 'previous-crops') {
        const trimmed = inputValue.trim().toLowerCase();
        if (!trimmed || trimmed === 'none') {
          advanceStep('None', []);
          return;
        }
        const crops = inputValue
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean)
          .map((line) => {
            const [season, ...cropParts] = line.split(':');
            return {
              season: season?.trim() || '',
              crop_name: cropParts.join(':').trim() || '',
            };
          })
          .filter((c) => c.season && c.crop_name);
        if (crops.length === 0) {
          setValidationError('Please use "Season: Crop" format, or type "none".');
          return;
        }
        advanceStep(crops.map((c) => `${c.season}: ${c.crop_name}`).join(', '), crops);
        return;
      }

      const trimmed = inputValue.trim();
      if (!trimmed) {
        if (currentStep.optional) {
          advanceStep('None', currentStep.field.includes('crops') ? [] : '');
          return;
        }
        setValidationError('This field is required.');
        return;
      }

      // Text fields that parse to arrays
      if (
        currentStep.field === 'constraints_and_preferences.target_crops' ||
        currentStep.field === 'constraints_and_preferences.excluded_crops'
      ) {
        if (trimmed.toLowerCase() === 'none') {
          advanceStep('None', []);
          return;
        }
        const items = trimmed.split(',').map((s) => s.trim()).filter(Boolean);
        advanceStep(items.join(', '), items);
        return;
      }

      // Run validation
      if (currentStep.validation) {
        const error = currentStep.validation(trimmed);
        if (error) {
          setValidationError(error);
          return;
        }
      }

      // Parse numeric
      if (currentStep.type === 'number') {
        advanceStep(trimmed, parseFloat(trimmed));
        return;
      }

      advanceStep(trimmed, trimmed);
      return;
    }

    // Free-form chat mode (after intake, or before starting)
    const text = inputValue.trim();
    if (!text || isSubmitting) return;

    setInputValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    addMessage('user', text);

    const lower = text.toLowerCase();

    // If user wants to start or restart intake
    if (
      lower.includes('start') ||
      lower.includes('new') ||
      lower.includes('begin') ||
      lower.includes('assess') ||
      lower.includes('profile') ||
      lower.includes('set up')
    ) {
      profileRef.current = {};
      setIntakeStep(-1);
      setTimeout(() => {
        addMessage(
          'assistant',
          "Great! Let's set up your farm profile. I'll guide you through a series of questions to collect the data needed for NASA-powered crop optimization. 🛰️",
        );
        setTimeout(() => startIntake(), 500);
      }, 400);
      return;
    }

    // If user wants to optimize with existing profile
    if (
      lower.includes('optimize') ||
      lower.includes('recommend') ||
      lower.includes('run') ||
      lower.includes('sequence') ||
      lower.includes('rotation') ||
      lower.includes('retry')
    ) {
      if (Object.keys(profileRef.current).length > 0 || state.farmerProfile.farm_metadata) {
        if (Object.keys(profileRef.current).length === 0) {
          profileRef.current = state.farmerProfile as Record<string, unknown>;
        }
        setTimeout(() => {
          addMessage('assistant', 'Running optimization with your current farm profile… 🔄');
          submitToBackend();
        }, 300);
      } else {
        setTimeout(() => {
          addMessage(
            'assistant',
            "I don't have a farm profile yet. Let me guide you through the setup first!",
          );
          setTimeout(() => startIntake(), 500);
        }, 400);
      }
      return;
    }

    // Natural-language agronomic responses
    setTimeout(() => {
      let responseText: string;

      if (lower.includes('seasonal') || lower.includes('season') || lower.includes('kharif') || lower.includes('rabi')) {
        responseText = `🌤️ **Seasonal Agricultural Assessment**\n\n• **Kharif (Monsoon):** Optimal for Rice, Corn, Soybean, and Sorghum. NASA GPM indicates heavy precipitation windows.\n• **Rabi (Winter):** Suited for Wheat, Mustard, Chickpea, and Barley using residual moisture.\n• **Zaid (Summer):** Best for short-duration pulses (Moong, Urad) or cucurbits.\n\nWould you like me to generate a multi-season sequence? Just type **"optimize"** or **"start"** to set up your farm profile!`;
      } else if (lower.includes('ph') || lower.includes('soil') || lower.includes('nitrogen') || lower.includes('fertilizer')) {
        responseText = `🔬 **Soil Science Insight**\n\nSoil pH strongly controls nutrient availability. At pH 6.0–7.2:\n• Macro-nutrients (N, P, K) reach peak bioavailability\n• Rhizobium bacteria achieve optimal nitrogen fixation\n• Rotating legumes → cereals naturally replenishes nitrates\n\nType **"start"** to set up your farm and get personalized recommendations!`;
      } else if (lower.includes('water') || lower.includes('irrigation') || lower.includes('drought') || lower.includes('smap')) {
        responseText = `💧 **Water & NASA SMAP Telemetry**\n\nNASA SMAP tracks root-zone soil moisture anomalies globally.\n\n• Cover crops (Cereal Rye, Clover) improve water retention by up to 18%\n• Drought-tolerant species: Pearl Millet, Sorghum\n• Drip irrigation can reduce water use by 30–50%\n\nType **"start"** to begin your farm assessment!`;
      } else if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
        responseText = `Hello! 👋 I'm CropSeq AI, your agricultural assistant powered by NASA Earth observations.\n\nI can help you:\n🌾 Generate optimized crop rotation sequences\n🔬 Analyze soil health and nutrient management\n💧 Plan water-efficient farming strategies\n\nType **"start"** to begin your farm assessment, or ask me any agriculture question!`;
      } else {
        responseText = `Thank you for your question about "${text}".\n\nAs your agriculture co-pilot, I synthesize NASA Earth Observation data (SMAP, GPM, MODIS) with agronomic science.\n\nHere's what I can do:\n1. 🌾 **Optimize your crop sequence** — type "start" to begin\n2. 🌤️ Ask about **seasonal crop suitability**\n3. 💧 Get advice on **water management**\n4. 🔬 Learn about **soil health**\n\nType **"start"** to begin your guided farm assessment!`;
      }

      addMessage('assistant', responseText);
    }, 600);
  }, [
    isIntakeActive,
    currentStep,
    inputValue,
    selectedOptions,
    isSubmitting,
    advanceStep,
    addMessage,
    startIntake,
    submitToBackend,
    state.farmerProfile,
  ]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const toggleOption = (option: string) => {
    setSelectedOptions((prev) =>
      prev.includes(option) ? prev.filter((o) => o !== option) : [...prev, option],
    );
    setValidationError(null);
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
    setValidationError(null);
  };

  // Progress
  const progress = intakeStep >= 0 ? Math.round((Math.min(intakeStep, INTAKE_STEPS.length) / INTAKE_STEPS.length) * 100) : 0;

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {/* ─── Top Header ─── */}
      <header className="shrink-0 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl z-30">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-crop-green-500 to-crop-green-700 text-white shadow-lg shadow-crop-green-600/25">
              <Sprout className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-slate-900 text-base tracking-tight">CropSeq AI</h1>
                <span className="rounded-full bg-crop-green-100 px-2 py-0.5 text-[10px] font-bold text-crop-green-800 tracking-wide">
                  NASA
                </span>
              </div>
              <p className="text-[11px] text-slate-500 -mt-0.5">Agriculture Intelligence Assistant</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Backend status */}
            <button
              onClick={() => checkBackendHealth()}
              className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors hover:bg-slate-100"
              title="Check backend health"
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  state.backendOnline === true
                    ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50'
                    : state.backendOnline === false
                    ? 'bg-amber-500'
                    : 'bg-slate-300 animate-pulse'
                }`}
              />
              <span className="text-slate-500 hidden sm:inline">
                {state.backendOnline === true ? 'API Connected' : state.backendOnline === false ? 'API Offline' : 'Checking…'}
              </span>
            </button>

            {/* New chat */}
            <button
              onClick={() => {
                dispatch({ type: 'RESET' });
                profileRef.current = {};
                setIntakeStep(-1);
                setInputValue('');
                setSelectedOptions([]);
                setValidationError(null);
                setIsSubmitting(false);
              }}
              className="flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors active:scale-[0.97]"
              title="Start a new conversation"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">New Chat</span>
            </button>
          </div>
        </div>

        {/* Progress bar during intake */}
        {isIntakeActive && (
          <div className="max-w-3xl mx-auto px-4 pb-2">
            <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
              <span className="font-medium">Farm Profile Setup</span>
              <span className="font-mono">{progress}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-crop-green-400 to-crop-green-600 transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </header>

      {/* ─── Chat Messages ─── */}
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto no-scrollbar relative">
        <div className="max-w-3xl mx-auto px-3 sm:px-4 py-4 space-y-4">
          {/* Welcome state */}
          {state.messages.length <= 1 && intakeStep < 0 && (
            <div className="py-8 sm:py-16 text-center animate-fade-in px-4">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-crop-green-500 to-crop-green-700 text-white shadow-xl shadow-crop-green-600/30 mb-5">
                <Sprout className="h-8 w-8" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                CropSeq AI
              </h2>
              <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                Your intelligent agriculture assistant powered by NASA Earth observations.
                Optimize crop sequences, analyze soil health, and plan sustainable farming.
              </p>

              {/* Quick action chips */}
              <div className="mt-8 flex flex-wrap justify-center gap-2">
                {[
                  { emoji: '🚀', label: 'Start Farm Assessment', action: () => {
                    addMessage('user', 'Start my farm assessment');
                    setTimeout(() => {
                      addMessage(
                        'assistant',
                        "Great! Let's set up your farm profile. I'll guide you through a series of questions to collect the data needed for NASA-powered crop optimization. 🛰️",
                      );
                      setTimeout(() => startIntake(), 500);
                    }, 300);
                  }},
                  { emoji: '🌤️', label: 'Seasonal crop advice', action: () => {
                    setInputValue('What crops perform best in different seasons?');
                    setTimeout(() => handleSubmit(), 100);
                  }},
                  { emoji: '💧', label: 'Water conservation tips', action: () => {
                    setInputValue('How can I reduce water usage on my farm?');
                    setTimeout(() => handleSubmit(), 100);
                  }},
                  { emoji: '🔬', label: 'Soil health insights', action: () => {
                    setInputValue('How does soil pH affect crop growth?');
                    setTimeout(() => handleSubmit(), 100);
                  }},
                ].map((chip, i) => (
                  <button
                    key={i}
                    onClick={chip.action}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm transition-all hover:border-crop-green-300 hover:shadow-md hover:text-crop-green-700 active:scale-[0.97]"
                  >
                    {chip.emoji} {chip.label}
                  </button>
                ))}
              </div>

              {/* Powered by badge */}
              <div className="mt-10 inline-flex items-center gap-2 text-[11px] text-slate-400">
                <Satellite className="h-3.5 w-3.5" />
                <span>Powered by NASA SMAP • GPM • MODIS</span>
              </div>
            </div>
          )}

          {/* Message stream */}
          {state.messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 animate-slide-up ${
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.sender === 'assistant' && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-crop-green-500 to-crop-green-700 text-white shadow-sm mt-1">
                  <Bot className="h-4 w-4" />
                </div>
              )}

              <div
                className={`max-w-[88%] sm:max-w-[80%] ${
                  msg.sender === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'
                }`}
              >
                <div className="whitespace-pre-wrap leading-relaxed text-[13px] sm:text-sm">
                  {renderMarkdown(msg.text)}
                </div>

                {/* Embedded recommendation results */}
                {msg.embeddedWidget === 'sequence-results' && msg.recommendationData && (
                  <div className="mt-4 space-y-4 border-t border-slate-100 pt-3">
                    <OptimizationSummaryCard summary={msg.recommendationData.data.optimization_summary} />
                    <SequenceTimeline sequence={msg.recommendationData.data.recommended_sequence} />
                    {msg.recommendationData.pareto_optimal_alternatives && (
                      <ParetoAlternatives alternatives={msg.recommendationData.pareto_optimal_alternatives} />
                    )}
                    {msg.recommendationData.warnings && (
                      <WarningsPanel warnings={msg.recommendationData.warnings} />
                    )}
                  </div>
                )}

                {/* Error with retry */}
                {msg.embeddedWidget === 'error' && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        addMessage('user', 'Retry optimization');
                        submitToBackend();
                      }}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-crop-green-50 border border-crop-green-200 px-3 py-1.5 text-xs font-semibold text-crop-green-800 hover:bg-crop-green-100 transition-colors"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      Retry
                    </button>
                    <button
                      onClick={() => {
                        profileRef.current = {};
                        setIntakeStep(-1);
                        addMessage('user', 'Start over');
                        setTimeout(() => {
                          addMessage('assistant', "Let's try again from the beginning! 🔄");
                          setTimeout(() => startIntake(), 500);
                        }, 300);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      Start Over
                    </button>
                  </div>
                )}
              </div>

              {msg.sender === 'user' && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-white shadow-sm mt-1">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          ))}

          {/* Thinking/loading indicator */}
          {(state.isLoading || isSubmitting) && (
            <div className="flex gap-3 animate-fade-in items-start">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-crop-green-500 to-crop-green-700 text-white shadow-sm">
                <Bot className="h-4 w-4" />
              </div>
              <div className="chat-bubble-ai flex items-center gap-3 py-3 px-4">
                <div className="flex space-x-1">
                  <div className="h-2 w-2 rounded-full bg-crop-green-500 animate-bounce [animation-delay:-0.3s]" />
                  <div className="h-2 w-2 rounded-full bg-crop-green-500 animate-bounce [animation-delay:-0.15s]" />
                  <div className="h-2 w-2 rounded-full bg-crop-green-500 animate-bounce" />
                </div>
                <span className="text-xs text-slate-500 font-medium">
                  Analyzing NASA satellite data & optimizing…
                </span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} className="h-4" />
        </div>

        {/* Scroll to bottom button */}
        {showScrollBtn && (
          <button
            onClick={scrollToBottom}
            className="fixed bottom-28 right-6 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white border border-slate-200 shadow-lg text-slate-600 hover:bg-slate-50 transition-all animate-fade-in"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* ─── Bottom Input Area ─── */}
      <div className="shrink-0 border-t border-slate-200/80 bg-white/90 backdrop-blur-xl z-20">
        <div className="max-w-3xl mx-auto px-3 sm:px-4 py-3">
          {/* Validation error */}
          {validationError && (
            <div className="mb-2 flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700 animate-slide-up">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
              {validationError}
            </div>
          )}

          {/* Intake-specific inputs */}
          {isIntakeActive && currentStep ? (
            <div className="space-y-3">
              {currentStep.type === 'select' && currentStep.options ? (
                <div className="space-y-2">
                  <div className="relative">
                    <select
                      className="select-field pr-10"
                      value={inputValue}
                      onChange={(e) => {
                        setInputValue(e.target.value);
                        setValidationError(null);
                      }}
                    >
                      <option value="">Select an option…</option>
                      {currentStep.options.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  </div>
                  <button onClick={handleSubmit} className="btn-primary w-full">
                    <Send className="h-4 w-4" />
                    Confirm
                  </button>
                </div>
              ) : currentStep.type === 'multi-select' && currentStep.options ? (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {currentStep.options.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => toggleOption(opt)}
                        className={`rounded-full px-4 py-2 text-sm font-medium transition-all active:scale-[0.97] ${
                          selectedOptions.includes(opt)
                            ? 'bg-crop-green-600 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                  {selectedOptions.length > 0 && (
                    <p className="text-xs text-slate-500">
                      Selected: {selectedOptions.join(', ')}
                    </p>
                  )}
                  <button onClick={handleSubmit} className="btn-primary w-full">
                    <Send className="h-4 w-4" />
                    Confirm Selection
                  </button>
                </div>
              ) : currentStep.type === 'previous-crops' ? (
                <div className="space-y-2">
                  <textarea
                    ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                    className="input-field min-h-[80px] resize-y"
                    value={inputValue}
                    onChange={(e) => {
                      setInputValue(e.target.value);
                      setValidationError(null);
                    }}
                    placeholder={currentStep.placeholder}
                    rows={3}
                  />
                  <button onClick={handleSubmit} className="btn-primary w-full">
                    <Send className="h-4 w-4" />
                    Submit
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    ref={inputRef as React.RefObject<HTMLInputElement>}
                    type={currentStep.type === 'number' ? 'number' : 'text'}
                    className="input-field flex-1"
                    value={inputValue}
                    onChange={(e) => {
                      setInputValue(e.target.value);
                      setValidationError(null);
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder={currentStep.placeholder}
                    step={currentStep.type === 'number' ? 'any' : undefined}
                  />
                  <button onClick={handleSubmit} className="btn-primary px-5">
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Free-form chat input */
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm focus-within:border-crop-green-400 focus-within:ring-2 focus-within:ring-crop-green-400/20 transition-all">
              <textarea
                ref={textareaRef}
                rows={1}
                value={inputValue}
                onChange={handleTextareaChange}
                onKeyDown={handleKeyDown}
                placeholder={
                  isSubmitting
                    ? 'Analyzing your farm data…'
                    : 'Type "start" to begin, or ask an agriculture question…'
                }
                disabled={isSubmitting}
                className="w-full resize-none border-0 bg-transparent px-4 pt-3 pb-1 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-0 max-h-32 disabled:opacity-50"
              />
              <div className="flex items-center justify-between px-3 pb-2">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-slate-300" />
                  <span className="text-[10px] text-slate-400">NASA SMAP • GPM • MODIS</span>
                </div>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!inputValue.trim() || isSubmitting}
                  className="flex h-8 w-8 items-center justify-center rounded-xl bg-crop-green-600 text-white shadow-sm transition-all active:scale-95 hover:bg-crop-green-700 disabled:opacity-30 disabled:cursor-not-allowed disabled:active:scale-100"
                  aria-label="Send message"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Send className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
