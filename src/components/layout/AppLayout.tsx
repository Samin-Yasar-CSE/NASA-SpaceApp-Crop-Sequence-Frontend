import { useState, type ReactNode } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  Sprout,
  SunMedium,
  Layers,
  Tractor,
  Menu,
  X,
  PlusCircle,
  Satellite,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { useAppContext } from '@/context/AppContext';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { state, dispatch, checkBackendHealth } = useAppContext();
  const [isPinging, setIsPinging] = useState(false);

  const handlePing = async () => {
    setIsPinging(true);
    await checkBackendHealth();
    setTimeout(() => setIsPinging(false), 500);
  };

  const navItems = [
    {
      to: '/',
      label: 'AI Assistant',
      shortLabel: 'Assistant',
      icon: MessageSquare,
      description: 'Conversational agronomic co-pilot',
    },
    {
      to: '/sequence',
      label: 'Crop Sequence',
      shortLabel: 'Optimizer',
      icon: Sprout,
      description: 'Multi-season rotation optimizer',
    },
    {
      to: '/seasonal',
      label: 'Seasonal Variation',
      shortLabel: 'Seasonal',
      icon: SunMedium,
      description: 'Kharif, Rabi & Zaid dynamics',
    },
    {
      to: '/recommendations',
      label: 'Further Crops',
      shortLabel: 'Crops',
      icon: Layers,
      description: 'Companion & cash crops',
    },
    {
      to: '/farm',
      label: 'Farmer Features',
      shortLabel: 'My Farm',
      icon: Tractor,
      description: 'Soil telemetry & farm metadata',
    },
  ];

  const handleNewChat = () => {
    dispatch({ type: 'CLEAR_CHAT' });
    navigate('/');
    setMobileDrawerOpen(false);
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 text-slate-900 overflow-hidden font-sans">
      {/* ─── Desktop Left Sidebar ─── */}
      <aside className="hidden md:flex flex-col w-72 lg:w-80 shrink-0 border-r border-slate-200 bg-white">
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-crop-green-600 text-white shadow-sm">
              <Sprout className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900 text-base leading-none">CropSeq AI</span>
                <span className="rounded-full bg-crop-green-100 px-1.5 py-0.5 text-[10px] font-semibold text-crop-green-800">
                  NASA
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">Agriculture Intelligence</p>
            </div>
          </div>
        </div>

        {/* New Chat Action */}
        <div className="p-3">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-xs font-semibold hover:bg-slate-100 hover:border-slate-300 transition-all active:scale-[0.99]"
          >
            <span className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4 text-crop-green-600" />
              New Assessment / Chat
            </span>
            <span className="text-[10px] font-mono text-slate-400">Ctrl+K</span>
          </button>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto no-scrollbar py-2">
          <div className="px-3 py-1 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            Assistant &amp; Features
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`flex items-start gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-crop-green-50 text-crop-green-800 font-semibold shadow-sm border border-crop-green-200/60'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${isActive ? 'text-crop-green-600' : 'text-slate-400'}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="truncate">{item.label}</span>
                    {isActive && <span className="h-1.5 w-1.5 rounded-full bg-crop-green-600" />}
                  </div>
                  <p className="text-[10px] text-slate-400 font-normal truncate mt-0.5">
                    {item.description}
                  </p>
                </div>
              </NavLink>
            );
          })}
        </nav>

        {/* Farm Quick Overview Widget */}
        <div className="p-3 mx-3 mb-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-slate-700 flex items-center gap-1.5 text-[11px]">
              <Tractor className="h-3.5 w-3.5 text-crop-green-600" />
              Active Farm Profile
            </span>
            <NavLink to="/farm" className="text-[10px] text-crop-green-600 hover:underline">
              Edit
            </NavLink>
          </div>
          <div className="space-y-1 text-[11px] text-slate-600">
            <div className="flex justify-between">
              <span className="text-slate-400">Area:</span>
              <span className="font-medium text-slate-800">
                {state.farmerProfile.farm_metadata?.total_area_hectares || 0} ha
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Soil pH:</span>
              <span className="font-medium text-slate-800">
                {state.farmerProfile.farm_metadata?.soil_profile?.ph ?? '—'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Objective:</span>
              <span className="font-medium text-slate-800 capitalize truncate max-w-[120px]">
                {state.farmerProfile.constraints_and_preferences?.primary_objective?.replace(/_/g, ' ') || '—'}
              </span>
            </div>
          </div>
        </div>

        {/* Backend API Status Indicator */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                state.backendOnline === true
                  ? 'bg-emerald-500 animate-pulse'
                  : state.backendOnline === false
                  ? 'bg-amber-500'
                  : 'bg-slate-300'
              }`}
            />
            <span className="text-[11px] text-slate-600">
              {state.backendOnline === true
                ? 'Backend API Connected'
                : state.backendOnline === false
                ? 'Backend Offline (Ready)'
                : 'Checking API...'}
            </span>
          </div>
          <button
            onClick={handlePing}
            disabled={isPinging}
            title="Check API Health"
            className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-colors"
          >
            <RefreshCw className={`h-3 w-3 ${isPinging ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </aside>

      {/* ─── Mobile Slide-over Drawer ─── */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileDrawerOpen(false)}
          />
          {/* Drawer content */}
          <div className="relative flex flex-col w-4/5 max-w-xs bg-white h-full shadow-2xl z-10 animate-fade-in">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between safe-area-top">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-crop-green-600 text-white">
                  <Sprout className="h-4 w-4" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 text-sm">CropSeq AI</span>
                  <p className="text-[10px] text-slate-500">NASA Earth Assistant</p>
                </div>
              </div>
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-3">
              <button
                onClick={handleNewChat}
                className="w-full flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-crop-green-600 text-white text-xs font-semibold shadow-sm active:scale-[0.98]"
              >
                <PlusCircle className="h-4 w-4" />
                New Chat / Reset
              </button>
            </div>

            <nav className="flex-1 px-3 space-y-1 overflow-y-auto py-2">
              <div className="px-3 py-1 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                Features &amp; Views
              </div>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.to;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileDrawerOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-crop-green-50 text-crop-green-800 font-semibold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? 'text-crop-green-600' : 'text-slate-400'}`} />
                    <span className="flex-1">{item.label}</span>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
                  </NavLink>
                );
              })}
            </nav>

            <div className="p-4 border-t border-slate-100 bg-slate-50 safe-area-bottom">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Satellite className="h-3.5 w-3.5 text-crop-green-600" />
                  NASA Space Apps 2026
                </span>
                <span
                  className={`inline-block h-2 w-2 rounded-full ${
                    state.backendOnline ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Main Content Canvas ─── */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative">
        {/* Mobile Header Bar */}
        <header className="md:hidden flex h-14 shrink-0 items-center justify-between px-3 border-b border-slate-200 bg-white/95 backdrop-blur-sm z-30 safe-area-top">
          <button
            onClick={() => setMobileDrawerOpen(true)}
            className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 active:scale-95 transition-transform"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-crop-green-600 text-white">
              <Sprout className="h-4 w-4" />
            </div>
            <div className="text-center">
              <div className="flex items-center gap-1">
                <span className="font-bold text-slate-900 text-sm">CropSeq AI</span>
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    state.backendOnline === true
                      ? 'bg-emerald-500'
                      : state.backendOnline === false
                      ? 'bg-amber-500'
                      : 'bg-slate-300'
                  }`}
                  title={state.backendOnline ? 'Backend Online' : 'Backend Ready'}
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleNewChat}
            className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 active:scale-95 transition-transform"
            aria-label="New chat"
            title="Start New Chat"
          >
            <PlusCircle className="h-5 w-5 text-crop-green-600" />
          </button>
        </header>

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto no-scrollbar pb-16 md:pb-0">
          {children}
        </main>

        {/* ─── Mobile Bottom Navigation Bar (Android / iOS Style) ─── */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 border-t border-slate-200/90 bg-white/95 backdrop-blur-md flex items-center justify-around px-2 z-40 safe-area-bottom">
          {navItems.slice(0, 4).map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-all ${
                  isActive
                    ? 'text-crop-green-700 font-semibold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <div
                  className={`flex h-7 w-12 items-center justify-center rounded-full transition-colors ${
                    isActive ? 'bg-crop-green-100/80 text-crop-green-700' : ''
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-[10px] mt-0.5 tracking-tight">{item.shortLabel}</span>
              </NavLink>
            );
          })}
          {/* 5th Tab: Farm Profile */}
          <NavLink
            to="/farm"
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-all ${
              location.pathname === '/farm'
                ? 'text-crop-green-700 font-semibold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <div
              className={`flex h-7 w-12 items-center justify-center rounded-full transition-colors ${
                location.pathname === '/farm' ? 'bg-crop-green-100/80 text-crop-green-700' : ''
              }`}
            >
              <Tractor className="h-4 w-4" />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight">My Farm</span>
          </NavLink>
        </nav>
      </div>
    </div>
  );
}
