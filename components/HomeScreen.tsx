'use client';

import { motion } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import { appConfig } from '@/config/app.config';

interface HomeScreenProps {
  showHomeScreen: boolean;
  homeScreenFading: boolean;
  homeUrlInput: string;
  homeContextInput: string;
  aiModel: string;
  onClose: () => void;
  onNewProjectClick: () => void;
  onModelChange: (model: string) => void;
}

export default function HomeScreen({
  showHomeScreen,
  homeScreenFading,
  // homeUrlInput,
  // homeContextInput,
  aiModel,
  onClose,
  onNewProjectClick,
  onModelChange,
}: HomeScreenProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  if (!showHomeScreen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 transition-opacity duration-500 ${homeScreenFading ? 'opacity-0' : 'opacity-100'}`}
    >
      {/* Simple Sun Gradient Background */}
      <div className="absolute inset-0 bg-white overflow-hidden">
        {/* Main Sun - Pulsing */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-orange-400/50 via-orange-300/30 to-transparent rounded-full blur-[80px] animate-[sunPulse_4s_ease-in-out_infinite]" />

        {/* Inner Sun Core - Brighter */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-radial from-yellow-300/40 via-orange-400/30 to-transparent rounded-full blur-[40px] animate-[sunPulse_4s_ease-in-out_infinite_0.5s]" />

        {/* Outer Glow - Subtle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] bg-gradient-radial from-orange-200/20 to-transparent rounded-full blur-[120px]" />

        {/* Giant Glowing Orb - Center Bottom */}
        <div
          className="absolute bottom-0 left-1/2 w-[800px] h-[800px] animate-[orbShrink_3s_ease-out_forwards]"
          style={{ transform: 'translateX(-50%) translateY(45%)' }}
        >
          <div className="relative w-full h-full">
            <div className="absolute inset-0 bg-orange-600 rounded-full blur-[100px] opacity-30 animate-pulse"></div>
            <div
              className="absolute inset-16 bg-orange-500 rounded-full blur-[80px] opacity-40 animate-pulse"
              style={{ animationDelay: '0.3s' }}
            ></div>
            <div
              className="absolute inset-32 bg-orange-400 rounded-full blur-[60px] opacity-50 animate-pulse"
              style={{ animationDelay: '0.6s' }}
            ></div>
            <div className="absolute inset-48 bg-yellow-300 rounded-full blur-[40px] opacity-60"></div>
          </div>
        </div>
      </div>

      {/* Close button on hover */}
      <button
        onClick={onClose}
        className="absolute top-8 right-8 text-gray-500 hover:text-gray-700 transition-all duration-300 opacity-0 hover:opacity-100 bg-white/80 backdrop-blur-sm p-2 rounded-lg shadow-sm"
        style={{ opacity: 0 }}
        onMouseEnter={e => (e.currentTarget.style.opacity = '0.8')}
        onMouseLeave={e => (e.currentTarget.style.opacity = '0')}
      >
        <svg
          className="w-8 h-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 px-6 py-4 flex items-center justify-between animate-[fadeIn_0.8s_ease-out]">
        <div className="h-8 flex items-center text-[#36322F] font-semibold text-lg">
          Replicate Hub
        </div>
        <button className="inline-flex items-center gap-2 bg-[#36322F] text-white px-3 py-2 rounded-[10px] text-sm font-medium [box-shadow:inset_0px_-2px_0px_0px_#171310,_0px_1px_6px_0px_rgba(58,_33,_8,_58%)] hover:translate-y-[1px] hover:scale-[0.98] hover:[box-shadow:inset_0px_-1px_0px_0px_#171310,_0px_1px_3px_0px_rgba(58,_33,_8,_40%)] active:translate-y-[2px] active:scale-[0.97] active:[box-shadow:inset_0px_1px_1px_0px_#171310,_0px_1px_2px_0px_rgba(58,_33,_8,_30%)] transition-all duration-200">
          <span>Sign In</span>
        </button>
      </div>

      {/* Main content */}
      <div className="relative z-10 h-full flex items-center justify-center px-4">
        <div className="text-center max-w-4xl min-w-[600px] mx-auto">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-[2.5rem] lg:text-[3.8rem] text-center text-[#36322F] font-semibold tracking-tight leading-[0.9] animate-[fadeIn_0.8s_ease-out]">
              <span className="hidden md:inline">Replicate Hub</span>
              <span className="md:hidden">Replicate Hub</span>
            </h1>
            <motion.p
              className="text-base lg:text-lg max-w-lg mx-auto mt-2.5 text-zinc-500 text-center text-balance"
              animate={{
                opacity: 1,
              }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              Code, Create, Collaborate. Your AI Playground.
            </motion.p>
          </div>

          <div className="mt-5 max-w-3xl mx-auto">
            <div className="w-full relative group">
              <button
                type="button"
                onClick={onNewProjectClick}
                className="h-[3.25rem] w-full flex items-center justify-center gap-3 focus-visible:outline-none focus-visible:ring-orange-500 focus-visible:ring-2 rounded-[18px] text-sm text-[#36322F] px-4 border-[.75px] border-border bg-white hover:bg-gray-50 transition-all duration-200 cursor-pointer"
                style={{
                  boxShadow:
                    '0 0 0 1px #e3e1de66, 0 1px 2px #5f4a2e14, 0 4px 6px #5f4a2e0a, 0 40px 40px -24px #684b2514',
                  filter:
                    'drop-shadow(rgba(249, 224, 184, 0.3) -0.731317px -0.731317px 35.6517px)',
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4.5v15m7.5-7.5h-15"
                  />
                </svg>
                <span>New Project</span>
              </button>
            </div>
          </div>

          {/* Model Selector */}
          <div className="mt-6 flex items-center justify-center animate-[fadeIn_1s_ease-out]">
            <select
              value={aiModel}
              onChange={e => {
                const newModel = e.target.value;
                onModelChange(newModel);
                const params = new URLSearchParams(searchParams);
                params.set('model', newModel);
                router.push(`/?${params.toString()}`);
              }}
              className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#36322F] focus:border-transparent"
              style={{
                boxShadow: '0 0 0 1px #e3e1de66, 0 1px 2px #5f4a2e14',
              }}
            >
              {appConfig.ai.availableModels.map(model => (
                <option key={model} value={model}>
                  {appConfig.ai.modelDisplayNames[model] || model}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
