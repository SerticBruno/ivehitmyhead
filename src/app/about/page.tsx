'use client';

import React from 'react';
import { Button } from '@/components/ui';
import { PATREON_HALL_OF_FAME } from '@/lib/data/patreonHallOfFame';
import {
  getPublicFacebookUrl,
  getPublicInstagramUrl,
  getPublicKofiUrl,
  getPublicPatreonUrl,
} from '@/lib/socialUrls';

const frameClass =
  'border-2 border-zinc-700 dark:border-zinc-400 bg-white dark:bg-gray-900 shadow-[8px_8px_0px_rgba(0,0,0,0.9)] dark:shadow-[8px_8px_0px_rgba(156,163,175,0.42)]';

export default function AboutPage() {
  const instagramUrl = getPublicInstagramUrl();
  const facebookUrl = getPublicFacebookUrl();
  const patreonUrl = getPublicPatreonUrl();
  const kofiUrl = getPublicKofiUrl();
  const hall = [...PATREON_HALL_OF_FAME];
  const pinnedPatrons = hall.filter((p) => p.pinned);
  const otherPatrons = hall
    .filter((p) => !p.pinned)
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
  const patrons = [...pinnedPatrons, ...otherPatrons];

  return (
    <div className="min-h-screen bg-[#f7f4ee] dark:bg-gray-950">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        <div className="max-w-4xl mx-auto space-y-12 md:space-y-16">
          {/* Hero */}
          <header className={`text-center p-8 md:p-12 ${frameClass}`}>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-800 dark:text-amber-400 mb-3">
              The official story
            </p>
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight text-gray-900 dark:text-white mb-4">
              About{' '}
              <span className="text-blue-700 dark:text-blue-300">IVEHITMYHEAD</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Where memes go to die… and then get resurrected. Or some do not.
            </p>
          </header>

          {/* Story */}
          <section className={`p-8 md:p-10 ${frameClass}`}>
            <h2 className="text-2xl font-black uppercase tracking-tight text-gray-900 dark:text-white mb-6">
              How we got here
            </h2>
            <div className="space-y-5 text-gray-700 dark:text-gray-300 leading-relaxed">
              <p>
                This started as a way to organize the memes I kept sending to friends. Then it became a way to
                organize the memes friends kept sending to me. Now it&apos;s just a place where memes go to get
                organized, I guess. I&apos;m not sure when it got out of hand.
              </p>
              <p>
                I&apos;m mostly resharing stuff I find or that friends send me. Just a guy who likes organizing
                things in a way that doesn&apos;t make sense.
              </p>
              <p>
                The meme generator? That was born from pure spite. I was using some random meme page and
                couldn&apos;t do any of the basic stuff, and then someone told me &quot;you can&apos;t make a meme
                generator that&apos;s actually usable&quot; and I took that personally. And he was kinda right.
              </p>
              <p>
                Built with Next.js, React, and enough caffeine to power a small city. Also, I may have talked to
                my 2 dogs and a cat while debugging.
              </p>
            </div>
          </section>

          {/* Thanks */}
          <section className={`p-8 md:p-10 ${frameClass}`}>
            <h2 className="text-2xl font-black uppercase tracking-tight text-gray-900 dark:text-white mb-6">
              Thanks, I guess?
            </h2>
            <div className="space-y-5 text-gray-700 dark:text-gray-300 leading-relaxed">
              <p>
                To everyone who uses this site: you&apos;re the reason I can tell my family I&apos;m &quot;working&quot;
                instead of just &quot;messing around on the internet.&quot; Also, you&apos;re the reason I keep finding
                new bugs to fix at 2 AM. So… thanks? I think?
              </p>
              <p>
                Your support really means so much to me. I&apos;m genuinely thankful to all the people who have
                supported me and who will continue to support this ridiculous project. It&apos;s amazing to see people
                actually using something I built, even if it&apos;s just for organizing and creating memes. Thanks
                again, from the bottom of my heart.
              </p>
              <p>
                Shoutout to the actual meme creators, the developers who inspired me, my pets and my family who has
                no idea what I do.
              </p>
            </div>
          </section>

          {/* Support: Patreon */}
          <section>
            <h2 className="text-2xl font-black uppercase tracking-tight text-gray-900 dark:text-white text-center mb-8">
              Support the chaos
            </h2>
            <div className="max-w-2xl mx-auto">
              <div
                className={`p-8 text-center relative overflow-hidden ${frameClass}`}
                aria-labelledby="patreon-heading"
              >
                <div
                  className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full border-2 border-amber-600/40 dark:border-amber-500/35"
                  aria-hidden
                />
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-800 dark:text-amber-400 mb-2">
                  Recurring legends
                </p>
                <h3
                  id="patreon-heading"
                  className="text-xl font-black uppercase tracking-tight text-gray-900 dark:text-white mb-3"
                >
                  Patreon
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                  Want to back the site month to month, get early peeks at stuff, or just flex that you funded meme
                  infrastructure? Patreon is the place. Supporters who want it get their name on the{' '}
                  <span className="font-semibold text-gray-900 dark:text-white">Immortal Wall</span> below - same
                  energy as a trophy case, but for people who like JPEGs with Impact font.
                </p>
                {patreonUrl ? (
                  <Button
                    className="w-full sm:w-auto rounded-none border-2 border-zinc-700 dark:border-zinc-400 uppercase tracking-wide font-bold bg-[#ff424d] hover:bg-[#e63b45] text-white"
                    onClick={() => window.open(patreonUrl, '_blank')}
                  >
                    Join on Patreon
                  </Button>
                ) : (
                  <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                    Patreon link coming soon - set{' '}
                    <code className="text-xs font-mono not-italic">NEXT_PUBLIC_PATREON_URL</code> when you&apos;re
                    ready.
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Wall of Fame */}
          <section
            className={`p-8 md:p-10 ${frameClass} ring-2 ring-amber-600/30 dark:ring-amber-500/25`}
            aria-labelledby="wall-heading"
          >
            <div className="text-center mb-8">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-amber-800 dark:text-amber-400 mb-2">
                Forever enshrined
              </p>
              <h2
                id="wall-heading"
                className="text-3xl md:text-4xl font-black uppercase tracking-tight text-gray-900 dark:text-white"
              >
                The Immortal Wall
              </h2>
              <p className="mt-3 text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
                Patrons who asked to be listed stay here for as long as this site does. No take-backsies - only
                gratitude and questionable JPEGs.
              </p>
            </div>

            {patrons.length === 0 ? (
              <div className="rounded-none border-2 border-dashed border-zinc-400 dark:border-zinc-600 py-14 px-6 text-center">
                <p className="text-gray-600 dark:text-gray-400 mb-2">The wall is polished and waiting.</p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  When patrons roll in, their names go in{' '}
                  <code className="text-xs font-mono">src/lib/data/patreonHallOfFame.ts</code> - carved in data, not
                  stone.
                </p>
              </div>
            ) : (
              <ul className="flex flex-col gap-3 list-none p-0 m-0">
                {patrons.map((p, index) => (
                  <li
                    key={`${index}-${p.name}`}
                    className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-2 border-zinc-700 dark:border-zinc-400 bg-[#f7f4ee]/80 dark:bg-gray-950/50 px-4 py-3 shadow-[4px_4px_0px_rgba(0,0,0,0.75)] dark:shadow-[4px_4px_0px_rgba(156,163,175,0.35)]"
                  >
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 min-w-0">
                      <span className="font-bold text-gray-900 dark:text-white">{p.name}</span>
                      {p.note ? (
                        <span className="text-sm text-gray-600 dark:text-gray-400 italic">{p.note}</span>
                      ) : null}
                    </div>
                    {p.since ? (
                      <span className="text-xs font-mono uppercase text-amber-800 dark:text-amber-400 shrink-0 ml-auto sm:ml-0">
                        since {p.since}
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Ko-fi - one-time / tip jar (below the wall) */}
          <section className="max-w-2xl mx-auto">
            <div className={`p-8 text-center ${frameClass}`} aria-labelledby="kofi-heading">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#29abe0] mb-2">Quick thanks</p>
              <h3
                id="kofi-heading"
                className="text-xl font-black uppercase tracking-tight text-gray-900 dark:text-white mb-3"
              >
                Ko-fi
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                If you&apos;d just like to buy me a coffee, use the link below - it helps a lot. No subscription, no
                drama, just fuel for late-night bug hunts.
              </p>
              {kofiUrl ? (
                <Button
                  className="w-full sm:w-auto rounded-none border-2 border-zinc-700 dark:border-zinc-400 uppercase tracking-wide font-bold bg-[#FF5E5B] hover:bg-[#e55552] text-white"
                  onClick={() => window.open(kofiUrl, '_blank')}
                >
                  Buy me a coffee on Ko-fi
                </Button>
              ) : (
                <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                  Add your page URL via{' '}
                  <code className="text-xs font-mono not-italic">NEXT_PUBLIC_KOFI_URL</code> (e.g.{' '}
                  <code className="text-xs font-mono not-italic">https://ko-fi.com/yourname</code>).
                </p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">Seriously - thank you if you do.</p>
            </div>
          </section>

          {/* Contact */}
          <section className="text-center pb-4">
            <h2 className="text-2xl font-black uppercase tracking-tight text-gray-900 dark:text-white mb-4">
              Get in touch
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6 max-w-2xl mx-auto leading-relaxed">
              Found a bug? Have a suggestion? Just want to say hi? I&apos;m here, I guess. Bugs are just surprise
              features I didn&apos;t plan for, so don&apos;t feel bad about finding them. I try to find time to reply
              to each of the emails.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button
                variant="outline"
                className="rounded-none border-2 border-zinc-700 dark:border-zinc-400 font-bold uppercase tracking-wide"
                onClick={() => window.open('mailto:hello@ivehitmyhead.com', '_blank')}
              >
                Email me
              </Button>
              <Button
                variant="outline"
                className="rounded-none border-2 border-zinc-700 dark:border-zinc-400 font-bold uppercase tracking-wide"
                onClick={() => window.open(instagramUrl, '_blank')}
              >
                Instagram
              </Button>
              <Button
                variant="outline"
                className="rounded-none border-2 border-zinc-700 dark:border-zinc-400 font-bold uppercase tracking-wide"
                onClick={() => window.open(facebookUrl, '_blank')}
              >
                Facebook
              </Button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
