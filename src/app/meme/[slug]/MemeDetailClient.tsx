'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { cn, formatDateDDMMYYYY, formatFullDateTime, formatRelativeTime, formatTime } from '@/lib/utils';
import { Meme } from '@/lib/types/meme';
import { useMemeInteractions } from '@/lib/hooks/useMemeInteractions';
import { useMemesListState } from '@/lib/contexts';
import { ICONS, renderCategoryIcon } from '@/lib/utils/categoryIcons';
import { recordShare, shareMemeWithFallback } from '@/lib/utils/shareUtils';

const MEME_DETAIL_CARD =
  'bg-white dark:bg-gray-900 rounded-none border-2 border-zinc-700 dark:border-zinc-400 shadow-[8px_8px_0px_rgba(0,0,0,0.88)] dark:shadow-[8px_8px_0px_rgba(156,163,175,0.42)] overflow-hidden';

const MEME_DETAIL_IMAGE_FRAME =
  'relative w-full h-[calc(100vh-300px)] min-h-[400px] max-h-[800px] bg-[#f7f4ee] dark:bg-gray-950 border-y-2 border-zinc-700 dark:border-zinc-400';

export interface MemeDetailClientProps {
  slug: string;
}

export function MemeDetailClient({ slug }: MemeDetailClientProps) {
  const router = useRouter();

  const [meme, setMeme] = useState<Meme | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [sharesCount, setSharesCount] = useState(0);
  const [isCheckingLikeStatus, setIsCheckingLikeStatus] = useState(true);
  const [isLiking, setIsLiking] = useState(false);
  const [isLoadingRandom, setIsLoadingRandom] = useState(false);

  const { likeMeme, recordView } = useMemeInteractions();
  const { memes: listMemes, updateMemeLikeCount, updateMemeShareCount, updateMemeLikedState } =
    useMemesListState();
  const hasRecordedView = useRef(false);
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setShareUrl(`${window.location.origin}/meme/${slug}`);
    }
  }, [slug]);

  const checkLikeStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/memes/liked');
      if (response.ok) {
        const data = await response.json();
        const likedMemes = data.likedMemes || [];
        const isCurrentlyLiked = likedMemes.includes(slug);
        setIsLiked(isCurrentlyLiked);
      } else {
        setIsLiked(false);
      }
    } catch {
      setIsLiked(false);
    } finally {
      setIsCheckingLikeStatus(false);
    }
  }, [slug]);

  useEffect(() => {
    const fetchMeme = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/memes/${slug}`);

        if (!response.ok) {
          if (response.status === 404) {
            setError('Meme not found');
          } else {
            throw new Error(`Failed to fetch meme: ${response.statusText}`);
          }
          return;
        }

        const data = await response.json();
        setMeme(data.meme);

        const contextMeme = listMemes.find((m) => m.slug === slug);
        if (contextMeme) {
          setLikesCount(contextMeme.likes_count || 0);
          setSharesCount(contextMeme.shares_count || 0);
        } else {
          setLikesCount(data.meme.likes_count || 0);
          setSharesCount(data.meme.shares_count || 0);
        }

        await checkLikeStatus();

        if (!hasRecordedView.current) {
          recordView(slug);
          hasRecordedView.current = true;
        }
      } catch (err) {
        console.error('Error fetching meme:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch meme');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchMeme();
    }
    hasRecordedView.current = false;
  }, [slug, recordView, checkLikeStatus, listMemes]);

  const handleLike = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!meme || isLiking) return;

    try {
      setIsLiking(true);
      const liked = await likeMeme(slug);
      setIsLiked(liked);

      let newLikeCount: number;
      if (liked) {
        newLikeCount = likesCount + 1;
      } else {
        newLikeCount = Math.max(0, likesCount - 1);
      }

      setLikesCount(newLikeCount);
      updateMemeLikeCount(slug, newLikeCount);
      updateMemeLikedState(slug, liked);
    } catch (err) {
      console.error('Failed to like meme:', err);
    } finally {
      setIsLiking(false);
    }
  };

  const handleShare = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!meme) return;

    const wasShared = await shareMemeWithFallback(meme.title, meme.slug);

    if (wasShared) {
      const newShareCount = sharesCount + 1;
      setSharesCount(newShareCount);
      updateMemeShareCount(slug, newShareCount);
    }
  };

  const handleCopyLink = async () => {
    if (!meme) return;

    const url =
      shareUrl ||
      (typeof window !== 'undefined'
        ? `${window.location.origin}/meme/${meme.slug}`
        : '');

    if (!url) return;

    try {
      await navigator.clipboard.writeText(url);
      const newShareCount = sharesCount + 1;
      setSharesCount(newShareCount);
      updateMemeShareCount(slug, newShareCount);
      void recordShare(slug);
    } catch (err) {
      console.error('Failed to copy meme link:', err);
    }
  };

  const handleRandom = useCallback(async () => {
    if (isLoadingRandom) return;

    const sessionKey = 'randomDetailSeenIds';
    const parseStoredIds = (raw: string | null) => {
      if (!raw) return [];
      try {
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        return parsed.filter((value): value is string => typeof value === 'string');
      } catch {
        return [];
      }
    };

    const fetchRandomMeme = async (excludeIds: string[]) => {
      const params = new URLSearchParams({
        mode: 'random',
        limit: '1',
      });

      if (excludeIds.length > 0) {
        params.set('exclude_ids', excludeIds.slice(0, 200).join(','));
      }

      const response = await fetch(`/api/memes?${params}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch random meme: ${response.statusText}`);
      }

      const data = await response.json();
      return Array.isArray(data.memes) ? data.memes[0] : null;
    };

    try {
      setIsLoadingRandom(true);
      const storedIds =
        typeof window === 'undefined'
          ? []
          : parseStoredIds(sessionStorage.getItem(sessionKey));

      const currentExclusions = new Set<string>(storedIds);
      if (meme?.id) {
        currentExclusions.add(meme.id);
      }

      let randomMeme = await fetchRandomMeme([...currentExclusions]);

      // If exclusions are exhausted in a tiny dataset, reset once and try again.
      if (!randomMeme && typeof window !== 'undefined') {
        sessionStorage.removeItem(sessionKey);
        randomMeme = await fetchRandomMeme(meme?.id ? [meme.id] : []);
      }

      if (!randomMeme?.slug) {
        return;
      }

      if (typeof window !== 'undefined') {
        const nextIds = [...currentExclusions];
        if (randomMeme.id) {
          nextIds.push(randomMeme.id);
        }
        sessionStorage.setItem(sessionKey, JSON.stringify(nextIds.slice(0, 500)));
      }

      router.push(`/meme/${randomMeme.slug}`);
    } catch (err) {
      console.error('Failed to load random meme:', err);
    } finally {
      setIsLoadingRandom(false);
    }
  }, [isLoadingRandom, meme?.id, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f4ee] dark:bg-gray-950">
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <section className="max-w-5xl mx-auto">
            <div className={`animate-pulse ${MEME_DETAIL_CARD}`}>
              <div className="px-6 pt-6 pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 mb-2" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 w-1/2" />
                  </div>
                  <div className="w-24 flex-shrink-0">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 mb-2" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700" />
                  </div>
                </div>
              </div>

              <div className={`${MEME_DETAIL_IMAGE_FRAME} bg-gray-200/90 dark:bg-gray-800`} />

              <div className="p-6 pt-4 space-y-4">
                <div className="flex flex-wrap gap-2">
                  <div className="h-7 w-24 bg-gray-200 dark:bg-gray-700 border border-zinc-700/40 dark:border-zinc-500/40" />
                  <div className="h-7 w-20 bg-gray-200 dark:bg-gray-700 border border-zinc-700/40 dark:border-zinc-500/40" />
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700" />
                    <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700" />
                    <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700" />
                  </div>
                  <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 self-start sm:self-auto" />
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch sm:gap-3">
                  <div className="h-10 flex-1 bg-gray-200 dark:bg-gray-700 border-2 border-zinc-700 dark:border-zinc-400 min-w-0" />
                  <div className="h-10 w-full sm:w-28 bg-gray-200 dark:bg-gray-700 border-2 border-zinc-700 dark:border-zinc-400 shrink-0" />
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    );
  }

  if (error || !meme) {
    return (
      <div className="min-h-screen bg-[#f7f4ee] dark:bg-gray-950">
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-20">
            <div className="text-4xl mb-4 flex justify-center">
              <ICONS.Star className="w-16 h-16 text-gray-400" />
            </div>
            <h1 className="text-2xl font-black uppercase tracking-tight mb-4 text-gray-900 dark:text-white">
              {error || 'Meme not found'}
            </h1>
            <Button
              onClick={() => router.push('/memes')}
              className="rounded-none border-2 border-zinc-700 dark:border-zinc-400 uppercase tracking-wide font-bold"
            >
              Back to Memes
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f4ee] dark:bg-gray-950">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <section className="max-w-5xl mx-auto">
          <article className={MEME_DETAIL_CARD}>
            <header className="px-6 pt-6 pb-2 flex-shrink-0">
              <div className="flex items-start gap-2">
                <h1 className="font-black uppercase tracking-tight text-2xl md:text-3xl leading-tight flex-1 min-w-0">
                  {meme.title}
                </h1>
                <div
                  className="flex-shrink-0 text-right"
                  title={formatFullDateTime(meme.created_at)}
                >
                  <div className="text-sm text-gray-700 dark:text-gray-300 font-semibold uppercase tracking-wide">
                    {formatRelativeTime(meme.created_at)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatTime(meme.created_at)} • {formatDateDDMMYYYY(meme.created_at)}
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                by {meme.author?.display_name || meme.author?.username || 'Unknown'}
              </p>
            </header>

            <div className={cn(MEME_DETAIL_IMAGE_FRAME, 'p-2 sm:p-4')}>
              <div className="relative h-full w-full min-h-[120px]">
                <Image
                  src={meme.image_url}
                  alt={meme.title}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 60vw"
                  priority
                />
              </div>
            </div>

            <footer className="p-6 pt-4 flex-shrink-0 space-y-4">
              {meme.tags && meme.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {meme.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-1 text-xs font-semibold uppercase tracking-wide bg-white text-gray-800 dark:bg-gray-900 dark:text-gray-200 border border-zinc-700 dark:border-zinc-400"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300 overflow-x-auto whitespace-nowrap">
                <div className="flex items-center gap-4 shrink-0">
                  <button
                    type="button"
                    onClick={handleLike}
                    aria-disabled={isCheckingLikeStatus || isLiking}
                    className={cn(
                      'flex items-center gap-1 rounded-none border-2 border-transparent uppercase tracking-wide font-semibold transition-colors cursor-pointer',
                      isLiked && 'text-red-500',
                      !isLiked && 'hover:text-red-500',
                    )}
                  >
                    {isCheckingLikeStatus || isLiking ? (
                      <span className="inline-flex h-4 w-4 shrink-0 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <ICONS.Heart className={cn('w-4 h-4 shrink-0', isLiked && 'fill-current')} />
                    )}
                    <span>{likesCount.toLocaleString()}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleShare}
                    className="flex items-center gap-1 rounded-none border-2 border-transparent uppercase tracking-wide font-semibold transition-colors cursor-pointer"
                  >
                    <ICONS.Share2 className="w-4 h-4 shrink-0" />
                    <span>{sharesCount.toLocaleString()}</span>
                  </button>
                  <div className="flex items-center gap-1 text-gray-500">
                    <ICONS.Eye className="w-4 h-4 shrink-0" />
                    <span>{meme.views.toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2 flex-1 min-w-max">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCopyLink}
                    className="rounded-none border-2 border-zinc-700 dark:border-zinc-400 uppercase tracking-wide font-bold shrink-0 inline-flex items-center justify-center gap-2"
                  >
                    <ICONS.Copy className="w-4 h-4 shrink-0" />
                    Copy link
                  </Button>
                  <button
                    type="button"
                    onClick={handleRandom}
                    aria-disabled={isLoadingRandom}
                    className={cn(
                      'inline-flex items-center justify-center gap-2 rounded-none border-2 border-blue-700 bg-blue-600 text-white px-4 py-2 uppercase tracking-wide font-black shadow-[3px_3px_0px_rgba(29,78,216,0.7)] transition-colors cursor-pointer shrink-0',
                      isLoadingRandom
                        ? 'opacity-50 shadow-none'
                        : 'hover:bg-blue-500 hover:border-blue-600'
                    )}
                  >
                    {isLoadingRandom ? (
                      <span className="inline-flex h-4 w-4 shrink-0 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <ICONS.Dice5 className="w-4 h-4 shrink-0" />
                    )}
                    <span>Random</span>
                  </button>
                </div>
                <span className="inline-flex shrink-0 items-center text-xs text-gray-500 dark:text-gray-400 select-none cursor-default pointer-events-none">
                  {meme.category ? (
                    <>
                      {renderCategoryIcon(meme.category.name, 'w-4 h-4 shrink-0')}
                      <span className="ml-1 truncate">{meme.category.name}</span>
                    </>
                  ) : (
                    <>
                      <ICONS.FolderOpen className="w-4 h-4 shrink-0" aria-hidden />
                      <span className="ml-1 truncate">Uncategorized</span>
                    </>
                  )}
                </span>
              </div>

            </footer>
          </article>
        </section>
      </main>
    </div>
  );
}
