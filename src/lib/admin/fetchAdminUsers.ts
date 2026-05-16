import { supabaseAdmin } from '@/lib/supabase/server';
import type { AdminUserSummary } from '@/lib/types/adminUser';

type ProfileRow = {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  is_admin: boolean | null;
};

function countRowsByKey(
  rows: { key: string }[] | null | undefined
): Map<string, number> {
  const counts = new Map<string, number>();
  for (const row of rows ?? []) {
    counts.set(row.key, (counts.get(row.key) ?? 0) + 1);
  }
  return counts;
}

async function fetchCountMap(
  table: 'meme_shares' | 'meme_views' | 'meme_comments' | 'user_generated_memes' | 'meme_likes',
  column: string,
  userIds: string[]
): Promise<Map<string, number>> {
  if (userIds.length === 0) return new Map();

  const { data, error } = await supabaseAdmin
    .from(table)
    .select(column)
    .in(column, userIds);

  if (error) {
    console.error(`Admin users: failed to count ${table}.${column}:`, error);
    return new Map();
  }

  const rows = (data ?? []).map((row) => {
    const value = (row as unknown as Record<string, unknown>)[column];
    return { key: String(value) };
  });
  return countRowsByKey(rows);
}

export type FetchAdminUsersParams = {
  page: number;
  limit: number;
  search?: string;
};

export type FetchAdminUsersResult = {
  users: AdminUserSummary[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    has_more: boolean;
  };
};

async function profileIdsMatchingEmail(needle: string): Promise<string[]> {
  const normalized = needle.toLowerCase();
  const ids: string[] = [];
  let authPage = 1;
  const perPage = 200;

  while (true) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      page: authPage,
      perPage,
    });
    if (error) {
      console.error('Admin users: auth list failed:', error);
      break;
    }
    const batch = data.users ?? [];
    for (const authUser of batch) {
      if (authUser.email?.toLowerCase().includes(normalized)) {
        ids.push(authUser.id);
      }
    }
    if (batch.length < perPage) break;
    authPage += 1;
  }

  return ids;
}

export async function fetchAdminUsers({
  page,
  limit,
  search,
}: FetchAdminUsersParams): Promise<FetchAdminUsersResult> {
  const safePage = Math.max(1, page);
  const safeLimit = Math.min(100, Math.max(1, limit));
  const from = (safePage - 1) * safeLimit;
  const to = from + safeLimit - 1;
  const q = search?.trim() ?? '';

  let profilesQuery = supabaseAdmin
    .from('profiles')
    .select('id, username, display_name, avatar_url, created_at, is_admin', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (q.includes('@')) {
    const emailMatchIds = await profileIdsMatchingEmail(q);
    if (emailMatchIds.length === 0) {
      return {
        users: [],
        pagination: {
          page: safePage,
          limit: safeLimit,
          total: 0,
          has_more: false,
        },
      };
    }
    profilesQuery = profilesQuery.in('id', emailMatchIds);
  } else if (q) {
    const escaped = q.replace(/[%_]/g, '\\$&');
    profilesQuery = profilesQuery.or(
      `username.ilike.%${escaped}%,display_name.ilike.%${escaped}%`
    );
  }

  const { data: profileRows, error: profilesError, count } = await profilesQuery.range(
    from,
    to
  );

  if (profilesError) {
    throw new Error(profilesError.message);
  }

  const profiles = (profileRows ?? []) as ProfileRow[];
  const userIds = profiles.map((p) => p.id);

  const [
    sharesByUser,
    viewsByUser,
    commentsByUser,
    generatedByUser,
    likesByUser,
    authResults,
  ] = await Promise.all([
    fetchCountMap('meme_shares', 'user_id', userIds),
    fetchCountMap('meme_views', 'user_id', userIds),
    fetchCountMap('meme_comments', 'author_id', userIds),
    fetchCountMap('user_generated_memes', 'user_id', userIds),
    fetchCountMap('meme_likes', 'user_id', userIds),
    Promise.all(
      userIds.map(async (id) => {
        const { data, error } = await supabaseAdmin.auth.admin.getUserById(id);
        if (error || !data.user) {
          return { id, email: null as string | null, last_sign_in_at: null as string | null };
        }
        return {
          id,
          email: data.user.email ?? null,
          last_sign_in_at: data.user.last_sign_in_at ?? null,
        };
      })
    ),
  ]);

  const authById = new Map(authResults.map((row) => [row.id, row]));

  const users: AdminUserSummary[] = profiles.map((profile) => {
    const auth = authById.get(profile.id);
    return {
      id: profile.id,
      email: auth?.email ?? null,
      username: profile.username,
      display_name: profile.display_name,
      avatar_url: profile.avatar_url,
      joined_at: profile.created_at,
      last_sign_in_at: auth?.last_sign_in_at ?? null,
      is_admin: profile.is_admin === true,
      shares_count: sharesByUser.get(profile.id) ?? 0,
      views_count: viewsByUser.get(profile.id) ?? 0,
      comments_count: commentsByUser.get(profile.id) ?? 0,
      generated_memes_count: generatedByUser.get(profile.id) ?? 0,
      likes_count: likesByUser.get(profile.id) ?? 0,
    };
  });

  const total = count ?? users.length;

  return {
    users,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      has_more: from + profiles.length < total,
    },
  };
}
