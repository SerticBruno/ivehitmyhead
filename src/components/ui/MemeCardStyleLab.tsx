'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import { Button } from './Button';
import { Meme } from '@/lib/types/meme';

interface MemeCardStyleLabProps {
  memes?: Meme[];
}

type CardLook = 'all' | 'classic' | 'polaroid' | 'glass' | 'editorial';
type RenderStyle = 'original' | 'vintage' | 'comic' | 'neon';
type EditorialVariant = 'broadsheet' | 'tabloid' | 'brutalist' | 'mono';

const CARD_VARIANTS: Array<Exclude<CardLook, 'all'>> = ['classic', 'polaroid', 'glass', 'editorial'];

const RENDER_STYLES: RenderStyle[] = ['original', 'vintage', 'comic', 'neon'];
const EDITORIAL_VARIANTS: EditorialVariant[] = ['broadsheet', 'tabloid', 'brutalist', 'mono'];

const renderFilters: Record<RenderStyle, string> = {
  original: 'none',
  vintage: 'sepia(0.35) contrast(1.08) saturate(0.82)',
  comic: 'contrast(1.28) saturate(1.24)',
  neon: 'saturate(1.7) contrast(1.2) hue-rotate(18deg)',
};

function getCardContainerClasses(look: Exclude<CardLook, 'all'>) {
  if (look === 'polaroid') {
    return 'bg-[#f8f3e8] dark:bg-gray-800 border border-[#eadfc8] dark:border-gray-700 rounded-2xl p-3 pb-6 shadow-md rotate-[-1deg] hover:rotate-0 transition-transform';
  }

  if (look === 'glass') {
    return 'bg-white/65 dark:bg-gray-900/40 backdrop-blur-md border border-white/50 dark:border-gray-700/60 rounded-2xl p-3 shadow-lg';
  }

  if (look === 'editorial') {
    return 'bg-white dark:bg-gray-900 border-2 border-black dark:border-gray-300 rounded-none p-0 shadow-[8px_8px_0px_rgba(0,0,0,0.9)] dark:shadow-[8px_8px_0px_rgba(156,163,175,0.42)]';
  }

  return 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-3 shadow-md';
}

function getEditorialContainerClasses(variant: EditorialVariant) {
  if (variant === 'tabloid') {
    return 'bg-white dark:bg-gray-900 border-4 border-black dark:border-white p-0 rounded-none shadow-[6px_6px_0px_rgba(245,158,11,0.9)]';
  }
  if (variant === 'brutalist') {
    return 'bg-[#fffdf7] dark:bg-gray-900 border-2 border-black dark:border-white p-0 rounded-none shadow-none';
  }
  if (variant === 'mono') {
    return 'bg-white dark:bg-black border border-gray-900 dark:border-gray-300 p-0 rounded-none shadow-[10px_10px_0px_rgba(17,24,39,0.55)]';
  }
  return 'bg-white dark:bg-gray-900 border-2 border-black dark:border-gray-300 p-0 rounded-none shadow-[8px_8px_0px_rgba(0,0,0,0.9)] dark:shadow-[8px_8px_0px_rgba(156,163,175,0.42)]';
}

function getTitleClasses(look: Exclude<CardLook, 'all'>, editorialVariant: EditorialVariant) {
  if (look === 'editorial') {
    if (editorialVariant === 'tabloid') {
      return 'text-xl font-black uppercase tracking-tight';
    }
    if (editorialVariant === 'brutalist') {
      return 'text-base font-black uppercase tracking-[0.18em]';
    }
    if (editorialVariant === 'mono') {
      return 'text-lg font-bold uppercase tracking-wider';
    }
    return 'text-lg font-black uppercase tracking-wide';
  }
  if (look === 'polaroid') {
    return 'text-lg font-semibold tracking-wide';
  }
  return 'text-lg font-semibold';
}

export function MemeCardStyleLab({ memes = [] }: MemeCardStyleLabProps) {
  const [activeLook, setActiveLook] = useState<CardLook>('editorial');
  const [activeRenderStyle, setActiveRenderStyle] = useState<RenderStyle>('original');
  const [mixedRender, setMixedRender] = useState(false);
  const [activeEditorialVariant, setActiveEditorialVariant] = useState<EditorialVariant>('broadsheet');

  const sampleMemes = useMemo(() => {
    if (memes.length > 0) {
      return memes.slice(0, 4);
    }

    return [
      {
        id: 'sample-1',
        slug: 'sample-1',
        title: 'When prod deploy goes fine',
        image_url: '/images/meme-generator/screenshot1.png',
        tags: ['devlife'],
      },
      {
        id: 'sample-2',
        slug: 'sample-2',
        title: 'Pushed without testing',
        image_url: '/images/meme-generator/screenshot3.png',
        tags: ['bugs'],
      },
      {
        id: 'sample-3',
        slug: 'sample-3',
        title: 'CSS fixed after 2 hours',
        image_url: '/images/meme-generator/screenshot1.png',
        tags: ['frontend'],
      },
      {
        id: 'sample-4',
        slug: 'sample-4',
        title: 'Meeting could be email',
        image_url: '/images/meme-generator/screenshot3.png',
        tags: ['office'],
      },
    ] as Array<Pick<Meme, 'id' | 'slug' | 'title' | 'image_url' | 'tags'>>;
  }, [memes]);

  const looksToRender = activeLook === 'all' ? CARD_VARIANTS : [activeLook];
  const editorialToRender = activeLook === 'editorial' ? EDITORIAL_VARIANTS : [activeEditorialVariant];

  return (
    <section className="mb-12 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 md:p-7">
      <div className="mb-6 flex flex-col gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold">Meme Card Style Lab</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            Compare card shells and image render treatments before picking your feed default.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {(['all', ...CARD_VARIANTS] as CardLook[]).map((look) => (
            <Button
              key={look}
              size="sm"
              variant={activeLook === look ? 'default' : 'outline'}
              onClick={() => setActiveLook(look)}
            >
              {look === 'all' ? 'All looks' : `${look} card`}
            </Button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant={mixedRender ? 'default' : 'outline'}
            onClick={() => setMixedRender((prev) => !prev)}
          >
            {mixedRender ? 'Mixed render on' : 'Mixed render off'}
          </Button>
          {RENDER_STYLES.map((style) => (
            <Button
              key={style}
              size="sm"
              variant={activeRenderStyle === style ? 'default' : 'outline'}
              onClick={() => setActiveRenderStyle(style)}
            >
              {style}
            </Button>
          ))}
        </div>

        {activeLook === 'editorial' && (
          <div className="flex flex-wrap items-center gap-2">
            {EDITORIAL_VARIANTS.map((variant) => (
              <Button
                key={variant}
                size="sm"
                variant={activeEditorialVariant === variant ? 'default' : 'outline'}
                onClick={() => setActiveEditorialVariant(variant)}
              >
                {variant}
              </Button>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {looksToRender.flatMap((look, lookIndex) => {
          const variants = look === 'editorial' ? editorialToRender : [activeEditorialVariant];

          return variants.map((variant, variantIndex) => {
            const cardIndex = lookIndex + variantIndex;
            const meme = sampleMemes[cardIndex % sampleMemes.length];
            const style = mixedRender ? RENDER_STYLES[cardIndex % RENDER_STYLES.length] : activeRenderStyle;
            const imageFilter =
              look === 'editorial' && variant === 'mono'
                ? `${renderFilters[style]} grayscale(1) contrast(1.18)`
                : renderFilters[style];

            return (
              <article
                key={`${look}-${variant}-${meme.id}-${cardIndex}`}
                className={look === 'editorial' ? getEditorialContainerClasses(variant) : getCardContainerClasses(look)}
              >
                <div
                  className={`relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-900 ${
                    look === 'editorial' ? 'rounded-none' : 'rounded-lg'
                  }`}
                >
                  <Image
                    src={meme.image_url}
                    alt={meme.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover"
                    style={{ filter: imageFilter }}
                  />
                  {look === 'glass' && (
                    <div className="absolute bottom-2 left-2 right-2 rounded-lg bg-black/35 backdrop-blur-sm px-2 py-1 text-xs text-white">
                      Glass overlay meta
                    </div>
                  )}
                  {look === 'editorial' && variant === 'tabloid' && (
                    <div className="absolute top-0 left-0 right-0 bg-amber-400 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-black">
                      Breaking Meme
                    </div>
                  )}
                </div>

                <div className={look === 'editorial' ? 'px-4 py-3' : 'pt-3'}>
                  <p className={getTitleClasses(look, variant)}>{meme.title}</p>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="inline-flex rounded-full bg-blue-50 dark:bg-blue-900/30 px-2 py-1 font-medium text-blue-700 dark:text-blue-300">
                      {look === 'editorial' ? `editorial: ${variant}` : look}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">render: {style}</span>
                  </div>
                </div>
              </article>
            );
          });
        })}
      </div>
    </section>
  );
}
