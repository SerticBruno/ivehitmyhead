'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { MemeGrid } from '@/components/meme';
import { useMemes } from '@/lib/hooks/useMemes';
import { useMemeInteractions } from '@/lib/hooks/useMemeInteractions';
import { useMemesListState } from '@/lib/contexts';
import { ICONS } from '@/lib/utils/categoryIcons';
import { shareMemeWithFallback } from '@/lib/utils/shareUtils';

export function RandomFeedPanel() {
  const [likedMemes, setLikedMemes] = useState<Set<string>>(new Set());
  const processingMemesRef = useRef<Set<string>>(new Set());

  const {
    memes: listMemes,
    updateMemeLikeCount,
    updateMemeShareCount,
    updateMemeLikedState,
  } = useMemesListState();
  const listMemesRef = useRef(listMemes);
  listMemesRef.current = listMemes;

  const { memes, loading, error, hasMore, loadMore } = useMemes({
    limit: 7,
    mode: 'random',
  });

  useEffect(() => {
    const fetchLikedMemes = async () => {
      try {
        const response = await fetch('/api/memes/liked');
        if (!response.ok) {
          setLikedMemes(new Set());
          return;
        }

        const data = await response.json();
        const likedSlugs: string[] = data.likedMemes || [];
        setLikedMemes(new Set(likedSlugs));

        const snapshot = listMemesRef.current;
        if (snapshot.length === 0) return;
        snapshot.forEach((meme) => {
          const isLiked = likedSlugs.includes(meme.slug);
          if (meme.is_liked !== isLiked) {
            updateMemeLikedState(meme.slug, isLiked);
          }
        });
      } catch {
        setLikedMemes(new Set());
      }
    };

    fetchLikedMemes();
  }, [updateMemeLikedState]);

  useEffect(() => {
    if (likedMemes.size === 0 || listMemes.length === 0) return;
    listMemes.forEach((meme) => {
      const isLiked = likedMemes.has(meme.slug);
      if (meme.is_liked !== isLiked) {
        updateMemeLikedState(meme.slug, isLiked);
      }
    });
  }, [likedMemes, listMemes, updateMemeLikedState]);

  const { likeMeme } = useMemeInteractions();

  const handleLike = useCallback(async (slug: string) => {
    if (processingMemesRef.current.has(slug)) {
      return;
    }

    try {
      processingMemesRef.current.add(slug);
      const originalMeme = listMemes.find((meme) => meme.slug === slug);
      if (!originalMeme) return;

      const originalLikeCount = Math.max(0, originalMeme.likes_count || 0);
      const actualIsLiked = await likeMeme(slug);
      const finalLikeCount = actualIsLiked
        ? originalLikeCount + 1
        : Math.max(0, originalLikeCount - 1);

      updateMemeLikeCount(slug, finalLikeCount);
      updateMemeLikedState(slug, actualIsLiked);

      setLikedMemes((prev) => {
        const next = new Set(prev);
        if (actualIsLiked) {
          next.add(slug);
        } else {
          next.delete(slug);
        }
        return next;
      });
    } finally {
      processingMemesRef.current.delete(slug);
    }
  }, [likeMeme, listMemes, updateMemeLikeCount, updateMemeLikedState]);

  const handleShare = useCallback(async (id: string) => {
    const meme = listMemes.find((m) => m.id === id);
    if (!meme) return;

    const wasShared = await shareMemeWithFallback(meme.title, meme.slug);
    if (!wasShared) return;

    const newShareCount = (meme.shares_count || 0) + 1;
    updateMemeShareCount(meme.slug, newShareCount);
  }, [listMemes, updateMemeShareCount]);

  const displayMemes = useMemo(() => memes, [memes]);

  return (
    <>
      <section className="text-center mb-12 border-2 border-zinc-700 dark:border-zinc-400 bg-white dark:bg-gray-900 p-8 shadow-[8px_8px_0px_rgba(0,0,0,0.9)] dark:shadow-[8px_8px_0px_rgba(156,163,175,0.42)]">
        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-4">
          Random Memes
        </h1>
        <p className="text-xl text-gray-700 dark:text-gray-300 mb-2 max-w-2xl mx-auto min-h-[3.5rem]">
          Fresh chaos on every reload. No filters, no control, just random.
        </p>
      </section>

      <div className="mx-auto w-full max-w-2xl">
      {error ? (
        <div className="text-center py-12 border-2 border-zinc-700 dark:border-zinc-400 bg-white dark:bg-gray-900 p-6 shadow-[6px_6px_0px_rgba(0,0,0,0.85)] dark:shadow-[6px_6px_0px_rgba(156,163,175,0.42)]">
          <div className="text-4xl mb-4 flex justify-center">
            <ICONS.Star className="w-16 h-16 text-gray-400" />
          </div>
          <h3 className="text-xl font-black uppercase tracking-wide mb-2">Failed to load memes</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">{error}</p>
        </div>
      ) : (
        <MemeGrid
          memes={displayMemes}
          onLike={handleLike}
          onShare={handleShare}
          loading={loading}
          showLoadMore={true}
          onLoadMore={loadMore}
          hasMore={hasMore}
          layout="vertical"
          emptyStateDescription="No memes available right now. Try again in a bit."
        />
      )}
      </div>
    </>
  );
}
