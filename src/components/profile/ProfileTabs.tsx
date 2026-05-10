'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { GeneratedMeme, Meme } from '@/lib/types/meme';

type ProfileTabId = 'liked' | 'shared' | 'generated';

interface ProfileTabsProps {
  likedMemes: Meme[];
  sharedMemes: Meme[];
  generatedMemes: GeneratedMeme[];
}

interface GalleryItem {
  id: string;
  title: string;
  imageUrl: string;
  subtitle: string;
  href: string;
  external?: boolean;
}

interface GallerySectionProps {
  items: GalleryItem[];
  emptyTitle: string;
  emptyDescription: string;
}

const TAB_CONFIG: Array<{ id: ProfileTabId; label: string }> = [
  { id: 'liked', label: 'Liked' },
  { id: 'shared', label: 'Shared' },
  { id: 'generated', label: 'Generated' },
];

function GallerySection({ items, emptyTitle, emptyDescription }: GallerySectionProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-black uppercase tracking-wide mb-2">{emptyTitle}</h3>
        <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto">{emptyDescription}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((item) => (
        <article
          key={item.id}
          className="flex h-full flex-col border-2 border-zinc-700 dark:border-zinc-400 bg-[#f7f4ee] dark:bg-gray-950 shadow-[6px_6px_0px_rgba(0,0,0,0.82)] dark:shadow-[6px_6px_0px_rgba(156,163,175,0.35)] overflow-hidden"
        >
          {item.external ? (
            <a
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-[12rem] max-h-[min(85vh,900px)] w-full flex-1 items-center justify-center border-b-2 border-zinc-700 bg-white py-3 dark:border-zinc-400 dark:bg-gray-900"
              aria-label={`Open meme: ${item.title}`}
            >
              <Image
                src={item.imageUrl}
                alt={item.title}
                width={1200}
                height={1600}
                className="h-auto max-h-full w-full object-contain"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </a>
          ) : (
            <Link
              href={item.href}
              className="flex min-h-[12rem] max-h-[min(85vh,900px)] w-full flex-1 items-center justify-center border-b-2 border-zinc-700 bg-white py-3 dark:border-zinc-400 dark:bg-gray-900"
              aria-label={`Open meme: ${item.title}`}
            >
              <Image
                src={item.imageUrl}
                alt={item.title}
                width={1200}
                height={1600}
                className="h-auto max-h-full w-full object-contain"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </Link>
          )}
          <div className="p-3 bg-white dark:bg-gray-900">
            <h3 className="text-sm font-black uppercase tracking-wide break-words">{item.title}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.subtitle}</p>
          </div>
        </article>
      ))}
    </div>
  );
}

export function ProfileTabs({ likedMemes, sharedMemes, generatedMemes }: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<ProfileTabId>('liked');
  const likedItems: GalleryItem[] = likedMemes.map((meme) => ({
    id: meme.id,
    title: meme.title,
    imageUrl: meme.image_url,
    subtitle: meme.category?.name ?? 'Uncategorized',
    href: `/meme/${meme.slug}`,
  }));

  const generatedItems: GalleryItem[] = generatedMemes.map((meme) => ({
    id: meme.id,
    title: meme.title,
    imageUrl: meme.image_url,
    subtitle: meme.template_name ?? 'Custom template',
    href: meme.image_url,
    external: true,
  }));
  const sharedItems: GalleryItem[] = sharedMemes.map((meme) => ({
    id: meme.id,
    title: meme.title,
    imageUrl: meme.image_url,
    subtitle: meme.category?.name ?? 'Uncategorized',
    href: `/meme/${meme.slug}`,
  }));

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
                className={`inline-flex h-11 cursor-pointer items-center justify-center px-4 border-2 rounded-none uppercase tracking-wide font-black text-sm leading-none transition-colors ${
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
          <GallerySection
            items={likedItems}
            emptyTitle="No liked memes yet"
            emptyDescription="You haven&apos;t liked any memes yet. Start exploring and tap that heart."
          />
        )}

        {activeTab === 'shared' && (
          <GallerySection
            items={sharedItems}
            emptyTitle="No shared memes yet"
            emptyDescription="Share memes from the feed and they will appear here."
          />
        )}

        {activeTab === 'generated' && (
          <GallerySection
            items={generatedItems}
            emptyTitle="No generated memes yet"
            emptyDescription="Save from the meme generator and your creations will appear here."
          />
        )}
      </div>
    </section>
  );
}
