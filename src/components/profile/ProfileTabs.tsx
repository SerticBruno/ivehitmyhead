'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { GeneratedMeme, Meme } from '@/lib/types/meme';

type ProfileTabId = 'liked' | 'shared' | 'generated';

interface ProfileTabsProps {
  likedMemes: Meme[];
  generatedMemes: GeneratedMeme[];
}

const TAB_CONFIG: Array<{ id: ProfileTabId; label: string }> = [
  { id: 'liked', label: 'Liked' },
  { id: 'shared', label: 'Shared' },
  { id: 'generated', label: 'Generated' },
];

export function ProfileTabs({ likedMemes, generatedMemes }: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<ProfileTabId>('liked');

  return (
    <section className="border-2 border-zinc-700 dark:border-zinc-400 bg-white dark:bg-gray-900 shadow-[8px_8px_0px_rgba(0,0,0,0.9)] dark:shadow-[8px_8px_0px_rgba(156,163,175,0.42)] [&_a]:cursor-pointer">
      <div className="border-b-2 border-zinc-700 dark:border-zinc-400 p-3 sm:p-4">
        <div className="flex flex-wrap gap-2">
          {TAB_CONFIG.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`cursor-pointer px-4 py-2 border-2 rounded-none uppercase tracking-wide font-black text-sm transition-colors ${
                  isActive
                    ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white'
                    : 'bg-transparent text-gray-800 border-zinc-700 hover:bg-gray-100 dark:text-gray-200 dark:border-zinc-400 dark:hover:bg-gray-800'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-4 sm:p-6">
        {activeTab === 'liked' && (
          <>
            {likedMemes.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-xl font-black uppercase tracking-wide mb-2">No liked memes yet</h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
                  You haven&apos;t liked any memes yet. Start exploring and tap that heart.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {likedMemes.map((meme) => (
                  <article
                    key={meme.id}
                    className="flex h-full flex-col border-2 border-zinc-700 dark:border-zinc-400 bg-[#f7f4ee] dark:bg-gray-950 shadow-[6px_6px_0px_rgba(0,0,0,0.82)] dark:shadow-[6px_6px_0px_rgba(156,163,175,0.35)] overflow-hidden"
                  >
                    <Link
                      href={`/meme/${meme.slug}`}
                      className="flex min-h-[12rem] max-h-[min(85vh,900px)] w-full flex-1 items-center justify-center border-b-2 border-zinc-700 bg-white py-3 dark:border-zinc-400 dark:bg-gray-900"
                      aria-label={`Open meme: ${meme.title}`}
                    >
                      <Image
                        src={meme.image_url}
                        alt={meme.title}
                        width={1200}
                        height={1600}
                        className="h-auto max-h-full w-full object-contain"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </Link>
                    <div className="p-3 bg-white dark:bg-gray-900">
                      <h3 className="text-sm font-black uppercase tracking-wide break-words">
                        {meme.title}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {meme.category?.name ?? 'Uncategorized'}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'shared' && (
          <div className="text-center py-12">
            <h3 className="text-xl font-black uppercase tracking-wide mb-2">Shared memes coming soon</h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
              We currently track total shares per meme, but not your personal share history yet.
            </p>
          </div>
        )}

        {activeTab === 'generated' && (
          <>
            {generatedMemes.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-xl font-black uppercase tracking-wide mb-2">No generated memes yet</h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
                  Save from the meme generator and your creations will appear here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {generatedMemes.map((meme) => (
                  <article
                    key={meme.id}
                    className="flex flex-col border-2 border-zinc-700 dark:border-zinc-400 bg-[#f7f4ee] dark:bg-gray-950 shadow-[6px_6px_0px_rgba(0,0,0,0.82)] dark:shadow-[6px_6px_0px_rgba(156,163,175,0.35)] overflow-hidden"
                  >
                    <a
                      href={meme.image_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex min-h-[12rem] max-h-[min(85vh,900px)] w-full shrink-0 items-center justify-center border-b-2 border-zinc-700 bg-white dark:border-zinc-400 dark:bg-gray-900"
                      aria-label={`View full-size: ${meme.title}`}
                    >
                      {/* Variable aspect ratios: show full meme without cropping */}
                      <Image
                        src={meme.image_url}
                        alt={meme.title}
                        width={1200}
                        height={1600}
                        className="h-auto max-h-[min(85vh,900px)] w-full object-contain"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </a>
                    <div className="p-3 bg-white dark:bg-gray-900">
                      <h3 className="text-sm font-black uppercase tracking-wide break-words">
                        {meme.title}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {meme.template_name ?? 'Custom template'}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
