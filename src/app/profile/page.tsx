import Image from 'next/image';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerSupabase, supabaseAdmin } from '@/lib/supabase/server';
import type { GeneratedMeme, Meme } from '@/lib/types/meme';
import { ProfileTabs } from '@/components/profile/ProfileTabs';

type ProfileRow = {
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
};

function toMemeArray(data: unknown): Meme[] {
  if (!Array.isArray(data)) return [];
  return data as Meme[];
}

function toGeneratedMemeArray(data: unknown): GeneratedMeme[] {
  if (!Array.isArray(data)) return [];
  return data as GeneratedMeme[];
}

export default async function ProfilePage() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?next=%2Fprofile');
  }

  const [{ data: profileData }, { data: generatedData }, { data: sharedRows }] = await Promise.all([
    supabaseAdmin
      .from('profiles')
      .select('username, display_name, avatar_url')
      .eq('id', user.id)
      .maybeSingle(),
    supabaseAdmin
      .from('user_generated_memes')
      .select('id, user_id, title, template_name, image_url, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(100),
    supabaseAdmin
      .from('meme_shares')
      .select('meme_id')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(200),
  ]);

  const generatedMemes = toGeneratedMemeArray(generatedData);

  const cookieStore = await cookies();
  const likedSessionId = cookieStore.get('meme-session-id')?.value;
  let likedMemes: Meme[] = [];
  let sharedMemes: Meme[] = [];

  if (likedSessionId) {
    const { data: likedRows } = await supabaseAdmin
      .from('meme_likes')
      .select('meme_id')
      .eq('user_id', likedSessionId)
      .order('created_at', { ascending: false })
      .limit(200);

    const likedIds = (likedRows ?? []).map((row) => row.meme_id).filter(Boolean);

    if (likedIds.length > 0) {
      const { data: likedMemeRows } = await supabaseAdmin
        .from('memes')
        .select(`
          *,
          author:profiles(username, display_name, avatar_url),
          category:categories(id, name)
        `)
        .in('id', likedIds)
        .not('slug', 'is', 'null')
        .order('created_at', { ascending: false });

      likedMemes = toMemeArray(likedMemeRows);
    }
  }

  const sharedIds = (sharedRows ?? []).map((row) => row.meme_id).filter(Boolean);
  if (sharedIds.length > 0) {
    const { data: sharedMemeRows } = await supabaseAdmin
      .from('memes')
      .select(`
        *,
        author:profiles(username, display_name, avatar_url),
        category:categories(id, name)
      `)
      .in('id', sharedIds)
      .not('slug', 'is', 'null');

    const memesById = new Map(toMemeArray(sharedMemeRows).map((meme) => [meme.id, meme]));
    sharedMemes = sharedIds
      .map((id) => memesById.get(id))
      .filter((meme): meme is Meme => Boolean(meme));
  }

  const profile = (profileData as ProfileRow | null) ?? {
    username: user.email?.split('@')[0] ?? 'user',
    display_name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? null,
    avatar_url: typeof user.user_metadata?.avatar_url === 'string' ? user.user_metadata.avatar_url : null,
  };

  return (
    <div className="min-h-screen bg-[#f7f4ee] dark:bg-gray-950">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <section className="border-2 border-zinc-700 dark:border-zinc-400 bg-white dark:bg-gray-900 p-6 sm:p-8 shadow-[8px_8px_0px_rgba(0,0,0,0.9)] dark:shadow-[8px_8px_0px_rgba(156,163,175,0.42)]">
          <div className="flex flex-col sm:flex-row sm:items-start gap-5">
            {profile.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt={profile.display_name ?? profile.username ?? 'User avatar'}
                width={88}
                height={88}
                className="h-[88px] w-[88px] border-2 border-zinc-700 dark:border-zinc-400 object-cover rounded-none"
              />
            ) : (
              <div className="h-[88px] w-[88px] border-2 border-zinc-700 dark:border-zinc-400 bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-2xl font-black uppercase">
                {(profile.display_name ?? profile.username ?? 'U').slice(0, 1)}
              </div>
            )}

            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-widest text-blue-700 dark:text-blue-300 mb-2">
                Your profile
              </p>
              <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-gray-900 dark:text-white break-words">
                {profile.display_name ?? profile.username ?? 'Anonymous Human'}
              </h1>
              {profile.username && (
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">@{profile.username}</p>
              )}
            </div>
          </div>
        </section>

        <ProfileTabs
          likedMemes={likedMemes}
          sharedMemes={sharedMemes}
          generatedMemes={generatedMemes}
        />
      </main>
    </div>
  );
}
