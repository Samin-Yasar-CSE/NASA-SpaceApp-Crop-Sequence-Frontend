import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Send,
  Sprout,
  SunMedium,
  Layers,
  Tractor,
  Globe,
  Plus,
  Bot,
  User,
  ArrowRight,
  RefreshCw,
  ChevronRight,
} from 'lucide-react';
import { useAppContext, type ChatMessage } from '@/context/AppContext';
import { useSubmitRecommendation } from '@/hooks/useApi';
import type { FarmerProfile } from '@/types/farmerProfile';
import SequenceTimeline from '@/components/results/SequenceTimeline';
import OptimizationSummaryCard from '@/components/results/OptimizationSummaryCard';
import WarningsPanel from '@/components/results/WarningsPanel';
import ParetoAlternatives from '@/components/results/ParetoAlternatives';

export default function ChatAssistantPage() {
  const navigate = useNavigate();
  const { state, dispatch } = useAppContext();
  const submitRecommendation = useSubmitRecommendation();
  const [inputText, setInputText] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [showFeatureMenu, setShowFeatureMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [state.messages, isThinking]);

  // Adjust textarea height automatically
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  const handleSend = async (customPrompt?: string) => {
    const textToSend = (customPrompt || inputText).trim();
    if (!textToSend || isThinking) return;

    setInputText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date(),
      isWebSearch: state.isWebSearchActive,
    };

    dispatch({ type: 'ADD_MESSAGE', payload: userMessage });
    setIsThinking(true);

    const lower = textToSend.toLowerCase();

    // Check if the user is asking to optimize or run crop sequence
    if (
      lower.includes('optimize') ||
      lower.includes('recommend sequence') ||
      lower.includes('run sequence') ||
      lower.includes('crop sequence') ||
      lower.includes('rotation')
    ) {
      try {
        const response = await submitRecommendation(state.farmerProfile as FarmerProfile);
        setIsThinking(false);
        const aiMessage: ChatMessage = {
          id: `ai-${Date.now()}`,
          sender: 'assistant',
          text: `I have analyzed your farm conditions using NASA SMAP soil moisture telemetry, historical rainfall patterns, and your soil profile (${state.farmerProfile.farm_metadata?.soil_profile?.texture || 'silt loam'}, pH ${state.farmerProfile.farm_metadata?.soil_profile?.ph || 6.5}).\n\nHere is your optimized multi-season sequence recommendation:`,
          timestamp: new Date(),
          embeddedWidget: 'sequence-results',
          recommendationData: response,
        };
        dispatch({ type: 'ADD_MESSAGE', payload: aiMessage });
      } catch (err) {
        setIsThinking(false);
        const aiMessage: ChatMessage = {
          id: `ai-${Date.now()}`,
          sender: 'assistant',
          text: `⚠️ **Unable to connect to CropSeq Optimization Engine**\n\nThe backend service is currently not running at \`${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'}\`.\n\nYou can start your backend service or navigate to the guided sequence setup to verify all farm telemetry before retrying.`,
          timestamp: new Date(),
          embeddedWidget: 'error',
        };
        dispatch({ type: 'ADD_MESSAGE', payload: aiMessage });
      }
      return;
    }

    // Natural agronomic response handling based on agriculture topics
    setTimeout(() => {
      setIsThinking(false);
      let responseText = '';

      if (lower.includes('seasonal') || lower.includes('season') || lower.includes('kharif') || lower.includes('rabi')) {
        responseText = `🌤️ **Seasonal Agricultural Assessment**\n\n- **Kharif (Monsoon/Summer)**: Optimal for high-water and high-heat crops like Rice, Corn, Soybean, and Sorghum. NASA GPM indicates heavy seasonal precipitation windows.\n- **Rabi (Winter/Spring)**: Suited for cooler temperature crops relying on residual moisture such as Wheat, Mustard, Chickpea, and Barley.\n- **Zaid (Summer Short Season)**: Best utilized for short-duration pulses (Moong, Urad) or deep-rooted cucurbits to prevent fallow depletion.\n\nWould you like me to tailor a multi-season sequence for your farm? Tap **Crop Sequence** below to launch the optimizer.`;
      } else if (lower.includes('ph') || lower.includes('soil') || lower.includes('nitrogen') || lower.includes('fertilizer')) {
        const ph = state.farmerProfile.farm_metadata?.soil_profile?.ph || 6.5;
        responseText = `🔬 **Soil Telemetry Insight**\n\nYour active farm profile records a soil **pH of ${ph}** with texture **${state.farmerProfile.farm_metadata?.soil_profile?.texture || 'silt loam'}**.\n\n- **Nutrient Availability**: At pH ${ph}, essential macro-nutrients (Nitrogen, Phosphorus, Potassium) show high bioavailability. Micronutrients like Iron and Zinc remain balanced without toxic solubilization.\n- **Microbial Nodulation**: Rhizobium bacteria achieve optimal nitrogen-fixing symbiosis between pH 6.0 and 7.2. Rotating with a legume (Soybean or Field Pea) can supply natural nitrates for following cereal crops.`;
      } else if (lower.includes('water') || lower.includes('irrigation') || lower.includes('drought') || lower.includes('smap')) {
        responseText = `💧 **Hydrological & NASA SMAP Telemetry**\n\nNASA SMAP (Soil Moisture Active Passive) tracks root-zone soil moisture anomalies. Under your **${state.farmerProfile.farm_metadata?.irrigation_type || 'rainfed'}** management:\n\n- **Conservation Advice**: Implementing cover crops (such as Cereal Rye or Clover) increases soil organic matter, significantly improving water retention capacity by up to 18%.\n- **Drought Adaptation**: Consider including drought-tolerant species like Pearl Millet or Sorghum in warm, low-rainfall seasons.`;
      } else {
        responseText = `Thank you for your inquiry about "${textToSend}".\n\nAs your agricultural co-pilot, I synthesize real-time NASA Earth Observation data (SMAP, GPM, MODIS) with local soil science. You can:\n\n1. **Run Multi-Season Sequence Optimization** to maximize yield and net return.\n2. **Review Seasonal Suitability** for upcoming planting cycles.\n3. **Explore Companion & Cash Crops** tailored to your soil pH.\n\nFeel free to choose one of the dedicated features below or ask a more specific question!`;
      }

      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: responseText,
        timestamp: new Date(),
        isWebSearch: state.isWebSearchActive,
      };
      dispatch({ type: 'ADD_MESSAGE', payload: aiMessage });
    }, 700);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isConversationEmpty = state.messages.length <= 1;

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto w-full px-2 sm:px-4 relative">
      {/* ─── Chat Messages Stream ─── */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4 no-scrollbar">
        {/* Welcome Section when starting fresh */}
        {isConversationEmpty && (
          <div className="py-6 sm:py-8 text-center animate-fade-in max-w-xl mx-auto px-2">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-crop-green-600 text-white shadow-md shadow-crop-green-600/20 mb-3">
              <Sprout className="h-7 w-7" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              CropSeq AI Assistant
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              Your mobile agricultural decision assistant powered by NASA Earth observations &amp; agronomic models.
            </p>

            {/* ─── Feature Shortcuts Section (Required 5 Features) ─── */}
            <div className="mt-6 text-left">
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Agricultural Features
                </span>
                <span className="text-[11px] text-crop-green-600 font-medium">Quick Access</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* 1. Crop Sequence Recommendation */}
                <button
                  onClick={() => navigate('/sequence')}
                  className="card-hover p-3.5 flex items-start gap-3 text-left border-slate-200 bg-white"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-crop-green-50 text-crop-green-700">
                    <Sprout className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-slate-900 truncate">Crop Sequence Recommendation</h3>
                      <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 leading-snug">
                      Multi-season crop rotation optimization powered by NASA SMAP and soil telemetry.
                    </p>
                  </div>
                </button>

                {/* 2. Crop Seasonal Variation */}
                <button
                  onClick={() => navigate('/seasonal')}
                  className="card-hover p-3.5 flex items-start gap-3 text-left border-slate-200 bg-white"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                    <SunMedium className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-slate-900 truncate">Crop Seasonal Variation</h3>
                      <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 leading-snug">
                      Compare Kharif, Rabi &amp; Zaid suitability, planting windows, and climate adaptation.
                    </p>
                  </div>
                </button>

                {/* 3. Further Crop Recommendations */}
                <button
                  onClick={() => navigate('/recommendations')}
                  className="card-hover p-3.5 flex items-start gap-3 text-left border-slate-200 bg-white"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                    <Layers className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-slate-900 truncate">Further Crop Recommendations</h3>
                      <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 leading-snug">
                      Explore companion crops, nitrogen fixers, and high-value cash crop varieties.
                    </p>
                  </div>
                </button>

                {/* 4. Farmer Features */}
                <button
                  onClick={() => navigate('/farm')}
                  className="card-hover p-3.5 flex items-start gap-3 text-left border-slate-200 bg-white"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-blue-50 text-sky-blue-700">
                    <Tractor className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-slate-900 truncate">Farmer Features &amp; Profile</h3>
                      <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 leading-snug">
                      Soil pH gauges, NPK telemetry, farm boundaries, and capital budgeting.
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* Prompt Suggestion Chips */}
            <div className="mt-5 text-left">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2 px-1">
                Suggested Prompts
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  '🌾 Recommend a 4-season sequence for loamy soil',
                  '🌤️ What crops perform best in Rabi season?',
                  '💧 How can I reduce my farm water footprint?',
                  '🔬 How does soil pH affect nitrogen fixation?',
                ].map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(prompt)}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 shadow-sm transition-all hover:border-crop-green-400 hover:text-crop-green-700 active:scale-[0.98]"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Conversation Stream */}
        {state.messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 animate-slide-up ${
              msg.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.sender === 'assistant' && (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-crop-green-600 text-white shadow-sm mt-0.5">
                <Bot className="h-4 w-4" />
              </div>
            )}

            <div
              className={`max-w-[90%] sm:max-w-[82%] ${
                msg.sender === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'
              }`}
            >
              {/* Web search indicator badge if query used web search */}
              {msg.isWebSearch && (
                <div className="mb-2 inline-flex items-center gap-1 rounded-full bg-sky-blue-50 border border-sky-blue-200 px-2 py-0.5 text-[10px] font-medium text-sky-blue-700">
                  <Globe className="h-3 w-3" />
                  Web Search Augmented
                </div>
              )}

              {/* Message text with basic paragraph formatting */}
              <div className="whitespace-pre-wrap leading-relaxed text-xs sm:text-sm">
                {msg.text}
              </div>

              {/* ─── Embedded Sequence Recommendation Widget ─── */}
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
                  <div className="pt-2 text-center">
                    <button
                      onClick={() => navigate('/sequence')}
                      className="btn-primary text-xs w-full sm:w-auto"
                    >
                      Open Full Results Dashboard
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* ─── Embedded Error / Retry Widget ─── */}
              {msg.embeddedWidget === 'error' && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    onClick={() => handleSend('Recommend a 4-season sequence')}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-crop-green-50 border border-crop-green-200 px-3 py-1.5 text-xs font-semibold text-crop-green-800 hover:bg-crop-green-100"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Retry Connection
                  </button>
                  <button
                    onClick={() => navigate('/sequence')}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Review Farm Parameters
                  </button>
                </div>
              )}
            </div>

            {msg.sender === 'user' && (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-white shadow-sm mt-0.5">
                <User className="h-4 w-4" />
              </div>
            )}
          </div>
        ))}

        {/* Thinking Indicator */}
        {isThinking && (
          <div className="flex gap-3 animate-fade-in items-center">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-crop-green-600 text-white shadow-sm">
              <Bot className="h-4 w-4" />
            </div>
            <div className="chat-bubble-ai flex items-center gap-2.5 py-3 px-4">
              <div className="flex space-x-1">
                <div className="h-2 w-2 rounded-full bg-crop-green-600 animate-bounce [animation-delay:-0.3s]" />
                <div className="h-2 w-2 rounded-full bg-crop-green-600 animate-bounce [animation-delay:-0.15s]" />
                <div className="h-2 w-2 rounded-full bg-crop-green-600 animate-bounce" />
              </div>
              <span className="text-xs text-slate-500 font-medium">
                CropSeq is analyzing NASA soil telemetry &amp; constraints...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} className="h-2" />
      </div>

      {/* ─── Floating/Fixed Bottom Message Input Area ─── */}
      <div className="py-2 z-20 bg-slate-50/90 backdrop-blur-sm sticky bottom-0">
        {/* Feature Quick Popover / Sheet */}
        {showFeatureMenu && (
          <div className="mb-2 p-2 rounded-2xl border border-slate-200 bg-white shadow-xl animate-slide-up grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                setShowFeatureMenu(false);
                navigate('/sequence');
              }}
              className="flex items-center gap-2.5 p-2 rounded-xl text-left hover:bg-slate-50 text-xs font-medium text-slate-800"
            >
              <Sprout className="h-4 w-4 text-crop-green-600 shrink-0" />
              <span className="truncate">Crop Sequence</span>
            </button>
            <button
              onClick={() => {
                setShowFeatureMenu(false);
                navigate('/seasonal');
              }}
              className="flex items-center gap-2.5 p-2 rounded-xl text-left hover:bg-slate-50 text-xs font-medium text-slate-800"
            >
              <SunMedium className="h-4 w-4 text-amber-600 shrink-0" />
              <span className="truncate">Seasonal Variation</span>
            </button>
            <button
              onClick={() => {
                setShowFeatureMenu(false);
                navigate('/recommendations');
              }}
              className="flex items-center gap-2.5 p-2 rounded-xl text-left hover:bg-slate-50 text-xs font-medium text-slate-800"
            >
              <Layers className="h-4 w-4 text-emerald-600 shrink-0" />
              <span className="truncate">Further Crops</span>
            </button>
            <button
              onClick={() => {
                setShowFeatureMenu(false);
                navigate('/farm');
              }}
              className="flex items-center gap-2.5 p-2 rounded-xl text-left hover:bg-slate-50 text-xs font-medium text-slate-800"
            >
              <Tractor className="h-4 w-4 text-sky-blue-600 shrink-0" />
              <span className="truncate">Farmer Profile</span>
            </button>
          </div>
        )}

        {/* Input Bar Container */}
        <div className="rounded-2xl border border-slate-300/80 bg-white p-2 shadow-sm focus-within:border-crop-green-500 focus-within:ring-2 focus-within:ring-crop-green-500/20 transition-all">
          <textarea
            ref={textareaRef}
            rows={1}
            value={inputText}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask CropSeq anything or type 'optimize sequence'..."
            className="w-full resize-none border-0 bg-transparent px-2.5 pt-1 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-0 max-h-32"
          />

          <div className="flex items-center justify-between pt-1 border-t border-slate-100 mt-1">
            <div className="flex items-center gap-1.5">
              {/* Feature shortcut popover toggle */}
              <button
                type="button"
                onClick={() => setShowFeatureMenu(!showFeatureMenu)}
                className={`p-1.5 rounded-xl text-xs font-medium transition-colors ${
                  showFeatureMenu
                    ? 'bg-crop-green-100 text-crop-green-800'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                }`}
                title="Features &amp; Tools"
              >
                <Plus className="h-4 w-4" />
              </button>

              {/* 5. Web Search Toggle (ChatGPT Style) */}
              <button
                type="button"
                onClick={() => dispatch({ type: 'TOGGLE_WEB_SEARCH' })}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium transition-all ${
                  state.isWebSearchActive
                    ? 'bg-sky-blue-500 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
                title="Toggle Web Search"
              >
                <Globe className="h-3.5 w-3.5" />
                <span className="text-[11px]">Search</span>
              </button>
            </div>

            {/* Send Button */}
            <button
              type="button"
              onClick={() => handleSend()}
              disabled={!inputText.trim() || isThinking}
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-crop-green-600 text-white shadow-xs transition-all active:scale-95 hover:bg-crop-green-700 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
              aria-label="Send message"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <p className="text-[10px] text-center text-slate-400 mt-1.5">
          CropSeq combines NASA SMAP, GPM &amp; MODIS Earth observations. Always consult local extension offices.
        </p>
      </div>
    </div>
  );
}
