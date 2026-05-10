# Authentication setup (Google + Supabase)

This app uses [Supabase Auth](https://supabase.com/docs/guides/auth) with Google OAuth for public sign-in (`/login`) and email/password for admin (`/admin/login`).

## Google Cloud Console

1. Create a project (or pick an existing one).
2. **APIs & Services** → **Credentials** → **Create credentials** → **OAuth client ID**.
3. Application type: **Web application**.
4. Under **Authorized redirect URIs**, add exactly:
   - `https://<your-project-ref>.supabase.co/auth/v1/callback`  
     Replace `<your-project-ref>` with the subdomain from **Project URL** in the Supabase dashboard (Settings → API).
5. Save and copy the **Client ID** and **Client secret**.

## Supabase dashboard

1. **Authentication** → **Providers** → **Google**: enable, paste Client ID and Client secret, save.
2. **Authentication** → **URL configuration**:
   - **Site URL**: production origin (e.g. `https://ivehitmyhead.com`) or `http://localhost:3000` for local dev.
   - **Redirect URLs**: add both:
     - `http://localhost:3000/auth/callback`
     - `https://<your-production-domain>/auth/callback`
3. Ensure **Email** provider remains enabled if you use password sign-in for admins.

## Environment variables

The app expects (see `.env.local`):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-only; existing admin/API routes)

No extra env vars are required for Google OAuth beyond what Supabase stores after you enable the provider.

## Optional: auto-create `profiles` on sign-up (database trigger)

The OAuth callback also defensively upserts a `profiles` row. For consistency on **any** new auth user (magic link, future providers), run this once in the Supabase SQL editor:

```sql
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, username, display_name, avatar_url)
  values (
    new.id,
    coalesce(split_part(new.email, '@', 1), substr(new.id::text, 1, 8)),
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
```

Adjust column names if your `profiles` table differs. Ensure RLS policies allow users to read/update their own profile if the app queries `profiles` from the browser.

## Smoke test

1. Open `/login`, click **Continue with Google**, finish consent.
2. You should land on `/` (or the `?next=` path) with session cookies set.
3. Header shows avatar (or placeholder) and **Sign out** for non-admins; admins still see **Admin** / **Logout** after `/admin/login`.
