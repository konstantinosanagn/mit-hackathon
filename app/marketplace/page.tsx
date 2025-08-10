'use client';

import { useRouter } from 'next/navigation';
import FilterRow from '@/components/FilterRow';
import NewsLeaderboardColumn from '@/components/NewsLeaderboardColumn';
import ExhibitionColumn from '@/components/ExhibitionColumn';
import { FilterProvider } from '@/components/FilterProvider';

export default function MarketplacePage() {
  const router = useRouter();

  return (
    <FilterProvider>
      <div id="marketplace-page" className="h-screen bg-white flex flex-col">
        {/* Header */}
        <div id="marketplace-header" className="bg-card px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div
            className="h-8 flex items-center text-[#36322F] font-semibold text-lg cursor-pointer hover:text-[#171310] transition-colors"
            onClick={() => router.push('/')}
            title="Go to Homepage"
          >
            Replicate Hub
          </div>
        </div>

                            <div className="absolute left-1/2 transform -translate-x-1/2">
                      <a
                        href="/marketplace"
                        className="font-ui font-medium text-lg text-blue-700 hover:text-blue-900 transition-colors duration-200 cursor-pointer tracking-wider flex items-center gap-2 group"
                      >
                        <img 
                          src="/palette-logo.svg"
                          alt="Palette icon"
                          className="w-5 h-5 palette-icon-blue transition-all duration-300 group-hover:rotate-360"
                        />
                        <span className="terminal-text">the_exhibition</span>
                      </a>
                    </div>

        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-2 bg-[#36322F] text-white px-3 py-2 rounded-[10px] text-sm font-medium [box-shadow:inset_0px_-2px_0px_0px_#171310,_0px_1px_6px_0px_rgba(58,_33,_8,_58%)] hover:translate-y-[1px] hover:scale-[0.98] hover:[box-shadow:inset_0px_-1px_0px_0px_#171310,_0px_1px_3px_0px_rgba(58,_33,_8,_40%)] active:translate-y-[2px] active:scale-[0.97] active:[box-shadow:inset_0px_1px_1px_0px_#171310,_0px_1px_2px_0px_rgba(58,_33,_8,_30%)] transition-all duration-200">
            <span>Sign In</span>
          </button>
        </div>
      </div>

      {/* Filter Row */}
      <FilterRow />

      {/* Main Content - Two Columns */}
      <div id="marketplace-main-content" className="flex-1 flex gap-6 px-6 py-6 overflow-hidden">
        <NewsLeaderboardColumn />
        <ExhibitionColumn />
      </div>
    </div>
    </FilterProvider>
  );
}
