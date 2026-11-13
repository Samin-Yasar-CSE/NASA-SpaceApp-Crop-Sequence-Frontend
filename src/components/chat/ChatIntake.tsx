import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Bot, User, ChevronDown } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import type { FarmerProfile } from '@/types/farmerProfile';

// ─── Step Definitions ───

interface IntakeStep {
  id: string;
  question: string;
  type: 'text' | 'number' | 'select' | 'multi-select' | 'coordinates' | 'previous-crops';
  field: string;
  options?: string[];
  placeholder?: string;
  validation?: (value: string) => string | null;
  helperText?: string;
}

const INTAKE_STEPS: IntakeStep[] = [
  {
    id: 'latitude',
    question: 'What is your farm\'s latitude coordinate?',
    type: 'number',
    field: 'farm_metadata.location.latitude',
    placeholder: 'e.g., 41.8781',
    helperText: 'Decimal degrees, between -90 and 90',
    validation: (v) => {
      const n = parseFloat(v);
      if (isNaN(n)) return 'Please enter a valid number.';
      if (n < -90 || n > 90) return 'Latitude must be between -90 and 90.';
      return null;
    },
  },
  {
    id: 'longitude',
    question: 'What is your farm\'s longitude coordinate?',
    type: 'number',
    field: 'farm_metadata.location.longitude',
    placeholder: 'e.g., -87.6298',
    helperText: 'Decimal degrees, between -180 and 180',
    validation: (v) => {
      const n = parseFloat(v);
      if (isNaN(n)) return 'Please enter a valid number.';
      if (n < -180 || n > 180) return 'Longitude must be between -180 and 180.';
      return null;
    },
  },
  {
    id: 'region',
    question: 'What region is your farm located in?',
    type: 'text',
    field: 'farm_metadata.location.region',
    placeholder: 'e.g., Midwest, Punjab, Mato Grosso',
    validation: (v) => (!v.trim() ? 'Region is required.' : null),
  },
  {
    id: 'country',
    question: 'What country is your farm in?',
    type: 'text',
    field: 'farm_metadata.location.country',
    placeholder: 'e.g., United States, India, Brazil',
    validation: (v) => (!v.trim() ? 'Country is required.' : null),
  },
  {
    id: 'area',
    question: 'What is the total area of your farm in hectares?',
    type: 'number',
    field: 'farm_metadata.total_area_hectares',
    placeholder: 'e.g., 45.5',
    validation: (v) => {
      const n = parseFloat(v);
      if (isNaN(n) || n <= 0) return 'Please enter a positive number.';
      return null;
    },
  },
  {
    id: 'irrigation',
    question: 'What type of irrigation does your farm use?',
    type: 'select',
    field: 'farm_metadata.irrigation_type',
    options: ['rainfed', 'drip', 'sprinkler', 'flood', 'center_pivot', 'furrow'],
  },
  {
    id: 'soil_texture',
    question: 'What is your soil texture type?',
    type: 'select',
    field: 'farm_metadata.soil_profile.texture',
    options: ['clay', 'clay_loam', 'loam', 'sandy_loam', 'silt_loam', 'sandy', 'silty_clay', 'peat'],
  },
  {
    id: 'soil_ph',
    question: 'What is your soil pH level?',
    type: 'number',
    field: 'farm_metadata.soil_profile.ph',
    placeholder: 'e.g., 6.5',
    helperText: 'Between 0 and 14. Most crops prefer 6.0-7.5.',
    validation: (v) => {
      const n = parseFloat(v);
      if (isNaN(n)) return 'Please enter a valid number.';
      if (n < 0 || n > 14) return 'pH must be between 0 and 14.';
      return null;
    },
  },
  {
    id: 'organic_matter',
    question: 'What is the organic matter percentage of your soil?',
    type: 'number',
    field: 'farm_metadata.soil_profile.organic_matter_percent',
    placeholder: 'e.g., 2.8',
    helperText: 'Typical range: 1-6%',
    validation: (v) => {
      const n = parseFloat(v);
      if (isNaN(n) || n < 0) return 'Please enter a valid positive number.';
      return null;
    },
  },
  {
    id: 'nitrogen',
    question: 'What is the nitrogen level in your soil (ppm)?',
    type: 'number',
    field: 'farm_metadata.soil_profile.nitrogen_n_ppm',
    placeholder: 'e.g., 25',
    helperText: 'Enter 0 if unknown',
    validation: (v) => {
      const n = parseFloat(v);
      if (isNaN(n) || n < 0) return 'Please enter a valid non-negative number.';
      return null;
    },
  },
  {
    id: 'phosphorus',
    question: 'What is the phosphorus level in your soil (ppm)?',
    type: 'number',
    field: 'farm_metadata.soil_profile.phosphorus_p_ppm',
    placeholder: 'e.g., 15',
    helperText: 'Enter 0 if unknown',
    validation: (v) => {
      const n = parseFloat(v);
      if (isNaN(n) || n < 0) return 'Please enter a valid non-negative number.';
      return null;
    },
  },
  {
    id: 'potassium',
    question: 'What is the potassium level in your soil (ppm)?',
    type: 'number',
    field: 'farm_metadata.soil_profile.potassium_k_ppm',
    placeholder: 'e.g., 150',
    helperText: 'Enter 0 if unknown',
    validation: (v) => {
      const n = parseFloat(v);
      if (isNaN(n) || n < 0) return 'Please enter a valid non-negative number.';
      return null;
    },
  },
  {
    id: 'start_year',
    question: 'What year should the crop sequence start?',
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
    question: 'How many seasons should the rotation plan cover?',
    type: 'number',
    field: 'planning_horizon.number_of_seasons',
    placeholder: 'e.g., 4',
    helperText: 'Recommended: 3-8 seasons',
    validation: (v) => {
      const n = parseInt(v, 10);
      if (isNaN(n) || n < 1 || n > 20) return 'Please enter between 1 and 20 seasons.';
      return null;
    },
  },
  {
    id: 'seasons',
    question: 'Which growing seasons are applicable to your farm?',
    type: 'multi-select',
    field: 'planning_horizon.seasons',
    options: ['Kharif', 'Rabi', 'Spring', 'Summer', 'Fall', 'Winter', 'Wet Season', 'Dry Season'],
  },
  {
    id: 'previous_crops',
    question: 'What crops have you grown in recent seasons? (Enter as "Season: Crop", one per line, or type "none")',
    type: 'previous-crops',
    field: 'historical_data.previous_crops',
    placeholder: 'e.g., Kharif 2025: Rice\nRabi 2024-25: Wheat',
    helperText: 'Format: "Season: Crop" on each line. Type "none" if no history.',
  },
  {
    id: 'fallow',
    question: 'How many recent seasons has the field been left fallow (uncultivated)?',
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
    question: 'What is your primary optimization objective?',
    type: 'select',
    field: 'constraints_and_preferences.primary_objective',
    options: ['maximize_profit', 'soil_restoration', 'water_conservation', 'balanced', 'maximize_yield', 'carbon_sequestration'],
  },
  {
    id: 'target_crops',
    question: 'Are there specific crops you\'d like to include? (comma-separated, or type "none")',
    type: 'text',
    field: 'constraints_and_preferences.target_crops',
    placeholder: 'e.g., Wheat, Soybean, Corn',
    helperText: 'Leave empty or type "none" if no preference.',
  },
  {
    id: 'excluded_crops',
    question: 'Are there crops you want to exclude? (comma-separated, or type "none")',
    type: 'text',
    field: 'constraints_and_preferences.excluded_crops',
    placeholder: 'e.g., Tobacco, Cotton',
    helperText: 'Leave empty or type "none" if no exclusions.',
  },
  {
    id: 'risk_tolerance',
    question: 'What is your risk tolerance level?',
    type: 'select',
    field: 'constraints_and_preferences.risk_tolerance',
    options: ['low', 'medium', 'high'],
  },
  {
    id: 'capital',
    question: 'What is your available capital budget in USD?',
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
    question: 'What is your labor availability level?',
    type: 'select',
    field: 'constraints_and_preferences.labor_availability',
    options: ['low', 'medium', 'high'],
  },
];

// ─── Chat Message Types ───

interface ChatMessage {
  id: string;
  role: 'system' | 'user';
  content: string;
  timestamp: Date;
}

// ─── Component ───

export default function ChatIntake() {
  const navigate = useNavigate();
  const { dispatch } = useAppContext();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  const currentStep = INTAKE_STEPS[currentStepIndex];
  const isComplete = currentStepIndex >= INTAKE_STEPS.length;

  // Add initial greeting
  useEffect(() => {
    setMessages([
      {
        id: 'greeting',
        role: 'system',
        content: 'Welcome to CropSeq! I\'ll guide you through setting up your farm profile. This information will be used to generate optimized crop sequence recommendations using NASA Earth observation data. Let\'s get started!',
        timestamp: new Date(),
      },
      {
        id: `step-0-question`,
        role: 'system',
        content: INTAKE_STEPS[0].question + (INTAKE_STEPS[0].helperText ? `\n\n💡 ${INTAKE_STEPS[0].helperText}` : ''),
        timestamp: new Date(),
      },
    ]);
  }, []);

  // Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-focus input
  useEffect(() => {
    if (!isComplete) {
      inputRef.current?.focus();
    }
  }, [currentStepIndex, isComplete]);

  // Set profile value using dot-notation path
  const setNestedValue = useCallback((path: string, value: unknown) => {
    const parts = path.split('.');
    const update: Record<string, unknown> = {};
    let current = update;
    for (let i = 0; i < parts.length - 1; i++) {
      current[parts[i]] = {};
      current = current[parts[i]] as Record<string, unknown>;
    }
    current[parts[parts.length - 1]] = value;
    dispatch({ type: 'UPDATE_PROFILE', payload: update as Partial<FarmerProfile> });
  }, [dispatch]);

  const addMessage = useCallback((role: 'system' | 'user', content: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `msg-${Date.now()}-${Math.random()}`,
        role,
        content,
        timestamp: new Date(),
      },
    ]);
  }, []);

  const advanceStep = useCallback((displayValue: string, rawValue: unknown) => {
    // Add user answer
    addMessage('user', displayValue);

    // Store value
    setNestedValue(currentStep.field, rawValue);

    const nextIndex = currentStepIndex + 1;
    if (nextIndex < INTAKE_STEPS.length) {
      setCurrentStepIndex(nextIndex);
      const nextStep = INTAKE_STEPS[nextIndex];
      setTimeout(() => {
        addMessage(
          'system',
          nextStep.question + (nextStep.helperText ? `\n\n💡 ${nextStep.helperText}` : ''),
        );
      }, 300);
    } else {
      setCurrentStepIndex(nextIndex);
      setTimeout(() => {
        addMessage(
          'system',
          '✅ Great! I have all the information needed. Let me prepare your farm profile summary for review.',
        );
      }, 300);
    }

    setInputValue('');
    setSelectedOptions([]);
    setValidationError(null);
  }, [currentStep, currentStepIndex, addMessage, setNestedValue]);

  const handleSubmit = useCallback(() => {
    if (isComplete) return;

    if (currentStep.type === 'select') {
      if (!inputValue) {
        setValidationError('Please select an option.');
        return;
      }
      advanceStep(inputValue, inputValue);
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
      advanceStep(
        crops.map((c) => `${c.season}: ${c.crop_name}`).join(', '),
        crops,
      );
      return;
    }

    const trimmed = inputValue.trim();
    if (!trimmed) {
      // Handle optional text fields (target_crops, excluded_crops)
      if (currentStep.field === 'constraints_and_preferences.target_crops' ||
          currentStep.field === 'constraints_and_preferences.excluded_crops') {
        advanceStep('None', []);
        return;
      }
      setValidationError('This field is required.');
      return;
    }

    // Text fields that parse to arrays
    if (currentStep.field === 'constraints_and_preferences.target_crops' ||
        currentStep.field === 'constraints_and_preferences.excluded_crops') {
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
      const num = parseFloat(trimmed);
      advanceStep(trimmed, num);
      return;
    }

    advanceStep(trimmed, trimmed);
  }, [isComplete, currentStep, inputValue, selectedOptions, advanceStep]);

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

  // Progress
  const progress = Math.round((currentStepIndex / INTAKE_STEPS.length) * 100);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
          <span>Farm Profile Setup</span>
          <span>{progress}% complete</span>
        </div>
        <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
          <div
            className="h-full rounded-full bg-crop-green-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Chat Messages */}
      <div className="card mb-4 max-h-[60vh] overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 animate-slide-up ${
              msg.role === 'user' ? 'flex-row-reverse' : ''
            }`}
          >
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                msg.role === 'system'
                  ? 'bg-crop-green-100 text-crop-green-700'
                  : 'bg-sky-blue-100 text-sky-blue-700'
              }`}
            >
              {msg.role === 'system' ? (
                <Bot className="h-4 w-4" />
              ) : (
                <User className="h-4 w-4" />
              )}
            </div>
            <div
              className={
                msg.role === 'system' ? 'chat-bubble-system' : 'chat-bubble-user'
              }
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      {!isComplete ? (
        <div className="card p-4">
          {validationError && (
            <div className="mb-3 rounded-lg bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-700">
              {validationError}
            </div>
          )}

          {currentStep.type === 'select' && currentStep.options ? (
            <div className="space-y-3">
              <div className="relative">
                <select
                  className="select-field pr-10"
                  value={inputValue}
                  onChange={(e) => {
                    setInputValue(e.target.value);
                    setValidationError(null);
                  }}
                >
                  <option value="">Select an option...</option>
                  {currentStep.options.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
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
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                      selectedOptions.includes(opt)
                        ? 'bg-crop-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              {selectedOptions.length > 0 && (
                <p className="text-xs text-gray-500">
                  Selected: {selectedOptions.join(', ')}
                </p>
              )}
              <button onClick={handleSubmit} className="btn-primary w-full">
                <Send className="h-4 w-4" />
                Confirm Selection
              </button>
            </div>
          ) : currentStep.type === 'previous-crops' ? (
            <div className="space-y-3">
              <textarea
                ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                className="input-field min-h-[100px] resize-y"
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
            <div className="flex gap-3">
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
              <button onClick={handleSubmit} className="btn-primary px-4">
                <Send className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center mt-4">
          <button
            onClick={() => {
              dispatch({ type: 'SET_STEP', payload: 'review' });
              navigate('/review');
            }}
            className="btn-primary text-base px-10 py-4"
          >
            Review My Farm Profile
          </button>
        </div>
      )}
    </div>
  );
}
