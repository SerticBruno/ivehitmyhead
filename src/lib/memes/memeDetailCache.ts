import type { Meme } from '@/lib/types/meme';

const STORAGE_KEY = 'meme-detail-cache';
const DEFAULT_MAX_AGE_MS = 5 * 60 * 1000;
const MAX_ENTRIES = 50;

type CacheMap = Record<string, { meme: Meme; cachedAt: number }>;

function readCacheMap(): CacheMap {
  if (typeof window === 'undefined') {
    return {};
  }
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as CacheMap;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeCacheMap(map: CacheMap): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    const keys = Object.keys(map);
    if (keys.length > MAX_ENTRIES) {
      const sorted = keys.sort((a, b) => map[b].cachedAt - map[a].cachedAt);
      for (const key of sorted.slice(MAX_ENTRIES)) {
        delete map[key];
      }
    }
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // Quota or private mode — ignore
  }
}

export function setMemeDetailCache(meme: Meme): void {
  const map = readCacheMap();
  map[meme.slug] = { meme, cachedAt: Date.now() };
  writeCacheMap(map);
}

export function getMemeDetailCache(
  slug: string,
  maxAgeMs: number = DEFAULT_MAX_AGE_MS,
): Meme | null {
  const entry = readCacheMap()[slug];
  if (!entry?.meme) {
    return null;
  }
  if (Date.now() - entry.cachedAt > maxAgeMs) {
    return null;
  }
  return entry.meme;
}

export function resolveMemeSeed(
  slug: string,
  options: {
    initialMeme?: Meme | null;
    listMemes?: Meme[];
  },
): Meme | null {
  if (options.initialMeme?.slug === slug) {
    return options.initialMeme;
  }
  const fromList = options.listMemes?.find((m) => m.slug === slug);
  if (fromList) {
    return fromList;
  }
  return getMemeDetailCache(slug);
}
