'use client';

import Image from 'next/image';
import { ConversationContext } from '@/types/app';

interface ScrapedWebsitesListProps {
  conversationContext: ConversationContext;
}

export default function ScrapedWebsitesList({ conversationContext }: ScrapedWebsitesListProps) {
  if (conversationContext.scrapedWebsites.length === 0) {
    return null;
  }

  return (
    <div className="p-4 bg-card">
      <div className="flex flex-col gap-2">
        {conversationContext.scrapedWebsites.map((site, idx) => {
          // Extract favicon and site info from the scraped data
          const metadata = site.content?.metadata || {};
          const sourceURL = metadata.sourceURL || site.url;
          const favicon =
            metadata.favicon ||
            `https://www.google.com/s2/favicons?domain=${new URL(sourceURL).hostname}&sz=32`;
          const siteName =
            metadata.ogSiteName ||
            metadata.title ||
            new URL(sourceURL).hostname;

          return (
            <div key={idx} className="flex items-center gap-2 text-sm">
              <Image
                src={favicon}
                alt={siteName}
                width={16}
                height={16}
                className="rounded"
                onError={e => {
                  e.currentTarget.src = `https://www.google.com/s2/favicons?domain=${new URL(sourceURL).hostname}&sz=32`;
                }}
              />
              <a
                href={sourceURL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-black hover:text-gray-700 truncate max-w-[250px]"
                title={sourceURL}
              >
                {siteName}
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}
