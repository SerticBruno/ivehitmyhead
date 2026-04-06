import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { getMemeTimePeriodStart } from '@/lib/utils/memeTimePeriod';

const MAX_LIMIT = 50;
const MAX_EXCLUDE_IDS = 250;
const RANDOM_SAMPLE_MULTIPLIER = 6;

type MemeRow = {
  id: string;
  slug?: string;
  [key: string]: unknown;
};

function readNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return 0;
}

function readDateTimestamp(value: unknown): number {
  if (typeof value !== 'string') return 0;
  const ts = Date.parse(value);
  return Number.isFinite(ts) ? ts : 0;
}

function compareHotScore(a: MemeRow, b: MemeRow, ascending: boolean): number {
  const aLikes = readNumber(a.likes_count);
  const bLikes = readNumber(b.likes_count);
  const aShares = readNumber(a.shares_count);
  const bShares = readNumber(b.shares_count);
  const aViews = readNumber(a.views);
  const bViews = readNumber(b.views);
  const aScore = aLikes + aShares;
  const bScore = bLikes + bShares;

  if (aScore !== bScore) {
    return ascending ? aScore - bScore : bScore - aScore;
  }
  if (aViews !== bViews) {
    return bViews - aViews;
  }
  return readDateTimestamp(b.created_at) - readDateTimestamp(a.created_at);
}

function parseExcludeIds(raw: string | null): string[] {
  if (!raw) return [];

  const unique = new Set<string>();
  for (const entry of raw.split(',')) {
    const trimmed = entry.trim();
    if (!trimmed) continue;
    unique.add(trimmed);
    if (unique.size >= MAX_EXCLUDE_IDS) break;
  }

  return [...unique];
}

function applyCommonFilters<
  T extends {
    eq: (column: string, value: string) => T;
    or: (filters: string) => T;
    gte: (column: string, value: string) => T;
    not: (column: string, operator: string, value: string) => T;
  }
>(
  query: T,
  params: {
    category_id: string | null;
    search: string | null;
    time_period: string | null;
    excludeIds?: string[];
  }
) {
  let nextQuery: T = query;

  // Only return memes that can be opened on /meme/[slug].
  nextQuery = nextQuery.not('slug', 'is', 'null');

  if (params.category_id) {
    nextQuery = nextQuery.eq('category_id', params.category_id);
  }

  if (params.search) {
    nextQuery = nextQuery.or(`title.ilike.%${params.search}%,tags.cs.{${params.search}}`);
  }

  const periodStart = getMemeTimePeriodStart(params.time_period);
  if (periodStart) {
    nextQuery = nextQuery.gte('created_at', periodStart.toISOString());
  }

  if (params.excludeIds && params.excludeIds.length > 0) {
    const escapedIds = params.excludeIds.map((id) => `"${id.replace(/"/g, '\\"')}"`).join(',');
    nextQuery = nextQuery.not('id', 'in', `(${escapedIds})`);
  }

  return nextQuery;
}

function buildMemeSelectQuery() {
  return supabaseAdmin
    .from('memes')
    .select(`
      *,
      author:profiles(username, display_name, avatar_url),
      category:categories(id, name, emoji)
    `);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '20', 10), 1), MAX_LIMIT);
    const category_id = searchParams.get('category_id');
    const sort_by = searchParams.get('sort_by') || 'created_at';
    const sort_order = searchParams.get('sort_order') || 'desc';
    const time_period = searchParams.get('time_period');
    const search = searchParams.get('search');
    const mode = searchParams.get('mode');
    const excludeIds = parseExcludeIds(searchParams.get('exclude_ids'));

    if (mode === 'random') {
      const selectedMemes: MemeRow[] = [];
      const selectedIds = new Set(excludeIds);

      let countQuery = supabaseAdmin.from('memes').select('id', { count: 'exact', head: true });
      countQuery = countQuery.not('slug', 'is', 'null');
      if (category_id) {
        countQuery = countQuery.eq('category_id', category_id);
      }
      if (search) {
        countQuery = countQuery.or(`title.ilike.%${search}%,tags.cs.{${search}}`);
      }
      const countPeriodStart = getMemeTimePeriodStart(time_period);
      if (countPeriodStart) {
        countQuery = countQuery.gte('created_at', countPeriodStart.toISOString());
      }
      if (excludeIds.length > 0) {
        const escapedIds = excludeIds.map((id) => `"${id.replace(/"/g, '\\"')}"`).join(',');
        countQuery = countQuery.not('id', 'in', `(${escapedIds})`);
      }
      const { count, error: countError } = await countQuery;
      if (countError) {
        throw countError;
      }

      const availableCount = count || 0;
      if (availableCount === 0) {
        return NextResponse.json({
          memes: [],
          pagination: {
            page,
            limit,
            total: null,
            total_pages: null,
            has_more: false
          }
        });
      }

      const targetCount = limit + 1;
      const maxRandomTries = Math.min(availableCount, Math.max(targetCount * RANDOM_SAMPLE_MULTIPLIER, 24));
      const usedOffsets = new Set<number>();

      while (selectedMemes.length < targetCount && usedOffsets.size < maxRandomTries) {
        const randomOffset = Math.floor(Math.random() * availableCount);
        if (usedOffsets.has(randomOffset)) {
          continue;
        }
        usedOffsets.add(randomOffset);

        const singleQuery = applyCommonFilters(buildMemeSelectQuery(), {
          category_id,
          search,
          time_period,
          excludeIds: [...selectedIds]
        })
          .order('created_at', { ascending: false })
          .range(randomOffset, randomOffset);

        const { data: sampledMemes, error: sampleError } = await singleQuery;
        if (sampleError) {
          throw sampleError;
        }

        const sampledMeme = sampledMemes?.[0];
        if (!sampledMeme || selectedIds.has(sampledMeme.id)) {
          continue;
        }

        selectedIds.add(sampledMeme.id);
        selectedMemes.push(sampledMeme);
      }

      if (selectedMemes.length < targetCount) {
        const fallbackQuery = applyCommonFilters(buildMemeSelectQuery(), {
          category_id,
          search,
          time_period,
          excludeIds: [...selectedIds]
        })
          .order('created_at', { ascending: false })
          .limit(targetCount - selectedMemes.length);

        const { data: fallbackMemes, error: fallbackError } = await fallbackQuery;
        if (fallbackError) {
          throw fallbackError;
        }

        for (const meme of fallbackMemes || []) {
          if (selectedIds.has(meme.id)) {
            continue;
          }
          selectedIds.add(meme.id);
          selectedMemes.push(meme);
          if (selectedMemes.length >= targetCount) {
            break;
          }
        }
      }

      // Determine has_more via a one-row probe after excluding what we've already returned.
      // This avoids false negatives from random sampling limits while preventing reload loops.
      const probeExcludeIds = [...selectedIds];
      let probeQuery = buildMemeSelectQuery();
      probeQuery = applyCommonFilters(probeQuery, {
        category_id,
        search,
        time_period,
        excludeIds: probeExcludeIds
      })
        .order('created_at', { ascending: false })
        .limit(1);

      const { data: probeMemes, error: probeError } = await probeQuery;
      if (probeError) {
        throw probeError;
      }

      const hasMore = (probeMemes || []).length > 0;
      return NextResponse.json({
        memes: selectedMemes.slice(0, limit),
        pagination: {
          page,
          limit,
          total: null,
          total_pages: null,
          has_more: hasMore
        }
      });
    }

    // Calculate offset
    const offset = (page - 1) * limit;

    // Build query
    let query = applyCommonFilters(buildMemeSelectQuery(), {
      category_id,
      search,
      time_period
    });

    // Apply primary sorting with proper tie-breaking
    if (sort_by === 'likes') {
      // "Hottest": likes + shares where each interaction counts as 1.
      const { data: memes, error } = await query;
      if (error) {
        throw error;
      }

      const ascending = sort_order === 'asc';
      const sorted = [...(memes || [])].sort((a, b) =>
        compareHotScore(a as MemeRow, b as MemeRow, ascending)
      );
      const rows = sorted.slice(offset, offset + limit + 1);
      const hasMore = rows.length > limit;
      const pagedMemes = hasMore ? rows.slice(0, limit) : rows;

      return NextResponse.json({
        memes: pagedMemes,
        pagination: {
          page,
          limit,
          total: null,
          total_pages: null,
          has_more: hasMore
        }
      });
    } else if (sort_by === 'views') {
      // Sort by views first, then shares, then likes, then date as tie-breakers
      query = query.order('views', { ascending: sort_order === 'asc' });
      query = query.order('shares_count', { ascending: false }); // Always descending for shares as tie-breaker
      query = query.order('likes_count', { ascending: false }); // Always descending for likes as tie-breaker
      query = query.order('created_at', { ascending: false }); // Always descending for date as final tie-breaker
    } else if (sort_by === 'comments') {
      query = query.order('comments_count', { ascending: sort_order === 'asc' });
      // Add tie-breaking for comments: likes then date
      query = query.order('likes_count', { ascending: false });
      query = query.order('created_at', { ascending: false });
    } else {
      // For newest (created_at), no tie-breaking needed
      query = query.order('created_at', { ascending: sort_order === 'asc' });
    }

    // Fetch one extra row to detect whether there is another page
    // without running an expensive count query.
    query = query.range(offset, offset + limit);

    const { data: memes, error } = await query;

    if (error) {
      throw error;
    }
    const rows = memes || [];
    const hasMore = rows.length > limit;
    const pagedMemes = hasMore ? rows.slice(0, limit) : rows;

    return NextResponse.json({
      memes: pagedMemes,
      pagination: {
        page,
        limit,
        total: null,
        total_pages: null,
        has_more: hasMore
      }
    });
  } catch (error) {
    console.error('Error fetching memes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch memes' },
      { status: 500 }
    );
  }
}
