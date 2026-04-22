'use client';

import Image from 'next/image';
import { Button } from './Button';

interface MemeGeneratorShowcaseProps {
  screenshots?: string[];
}

export function MemeGeneratorShowcase({ screenshots = [] }: MemeGeneratorShowcaseProps) {
  const defaultScreenshots =
    screenshots.length > 0
      ? screenshots
      : [
          '/images/homepage/ivehitmyhead-featured-epic.png',
          '/images/homepage/ivehitmyhead-featured-pika.png',
        ];

  return (
    <section className="py-8 md:py-12 bg-[#f7f4ee] dark:bg-gray-950 mb-12 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="space-y-5">

            <div className="relative w-full pt-[min(4.5vw,28px)] pr-[min(5vw,32px)] pb-[min(4.5vw,28px)] pl-[min(3vw,18px)]">
              <div className="relative aspect-[16/10] overflow-hidden border-2 border-zinc-700 dark:border-zinc-400 bg-white dark:bg-gray-900 opacity-95 shadow-[6px_6px_0px_rgba(0,0,0,0.8)] dark:shadow-[6px_6px_0px_rgba(156,163,175,0.35)] translate-x-[min(4.5vw,30px)] translate-y-[min(3.5vw,22px)] rotate-2">
                <Image
                  src={defaultScreenshots[1]}
                  alt="Meme generator preview background"
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority={false}
                />
              </div>

              <div className="absolute inset-0 overflow-hidden border-2 border-zinc-700 dark:border-zinc-400 bg-white dark:bg-gray-900 z-10 shadow-[10px_10px_0px_rgba(0,0,0,0.88)] dark:shadow-[10px_10px_0px_rgba(156,163,175,0.4)] -rotate-1">
                <Image
                  src={defaultScreenshots[0]}
                  alt="Meme generator preview foreground"
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight leading-tight">
              Make something low effort. Fast.
            </h2>

            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
              Pick a template, throw text on it, and export before you start overthinking. It is quick, a little chaotic, and perfect for posting something dumb in under a minute.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Button
                size="lg"
                className="w-full sm:w-auto rounded-none border-2 border-black dark:border-white uppercase tracking-wide font-bold"
                onClick={() => (window.location.href = '/meme-generator')}
              >
                Open the editor
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto rounded-none border-2 border-black dark:border-white uppercase tracking-wide font-bold"
                onClick={() => (window.location.href = '/memes')}
              >
                Stare at the feed
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

