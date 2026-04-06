'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { MemeUpload } from '@/components/ui/MemeUpload';
import { Category, Meme } from '@/lib/types/meme';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { ICONS } from '@/lib/utils/categoryIcons';

export default function AdminDashboard() {
  const { user, session, isAdmin, loading: authLoading, signOut } = useAuth();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [memes, setMemes] = useState<Meme[]>([]);
  const [memesLoading, setMemesLoading] = useState(false);
  const [memesError, setMemesError] = useState<string | null>(null);
  const [deleteMessage, setDeleteMessage] = useState<string | null>(null);
  const [deletingMemeId, setDeletingMemeId] = useState<string | null>(null);

  const fetchMemes = async () => {
    try {
      setMemesLoading(true);
      setMemesError(null);
      const response = await fetch('/api/memes?page=1&limit=20&sort_by=created_at&sort_order=desc');
      if (!response.ok) {
        throw new Error('Failed to fetch memes');
      }
      const data = await response.json();
      setMemes((data.memes || []) as Meme[]);
    } catch (err) {
      console.error('Error fetching memes:', err);
      setMemesError('Failed to load memes');
    } finally {
      setMemesLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      router.push('/admin/login');
    }
  }, [user, isAdmin, authLoading, router]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        const data = await response.json();
        setCategories(data.categories || []);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to load categories');
      } finally {
        setLoading(false);
      }
    };

    if (isAdmin) {
      fetchCategories();
      void fetchMemes();
    }
  }, [isAdmin]);

  const handleLogout = async () => {
    await signOut();
    router.push('/admin/login');
  };

  const handleUploadSuccess = () => {
    setUploadSuccess(true);
    void fetchMemes();
    window.setTimeout(() => setUploadSuccess(false), 5000);
  };

  const handleDeleteMeme = async (meme: Meme) => {
    if (!session?.access_token) {
      setMemesError('Your admin session is missing. Please log in again.');
      return;
    }

    const shouldDelete = window.confirm(
      `Delete meme "${meme.title}"?\n\nThis cannot be undone.`
    );
    if (!shouldDelete) return;

    try {
      setDeletingMemeId(meme.id);
      setDeleteMessage(null);
      setMemesError(null);

      const response = await fetch(`/api/admin/memes/${meme.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const message =
          (errorData as { error?: string }).error || 'Failed to delete meme';
        throw new Error(message);
      }

      setMemes((prev) => prev.filter((m) => m.id !== meme.id));
      setDeleteMessage(`Deleted "${meme.title}".`);
      window.setTimeout(() => setDeleteMessage(null), 4000);
    } catch (err) {
      console.error('Error deleting meme:', err);
      setMemesError(
        err instanceof Error ? err.message : 'Failed to delete meme'
      );
    } finally {
      setDeletingMemeId(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="bg-[#f7f4ee] dark:bg-gray-950 min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8 border-2 border-zinc-700 dark:border-zinc-400 bg-white dark:bg-gray-900 p-8 shadow-[8px_8px_0px_rgba(0,0,0,0.9)] dark:shadow-[8px_8px_0px_rgba(156,163,175,0.42)] animate-pulse">
            <div className="h-10 bg-zinc-200 dark:bg-zinc-700 max-w-md mb-4" />
            <div className="h-5 bg-zinc-200 dark:bg-zinc-700 max-w-lg" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="border-2 border-zinc-700 dark:border-zinc-400 bg-white dark:bg-gray-900 p-6 h-24 animate-pulse"
              >
                <div className="h-4 bg-zinc-200 dark:bg-zinc-700 w-24 mb-2" />
                <div className="h-8 bg-zinc-200 dark:bg-zinc-700 w-16" />
              </div>
            ))}
          </div>
          <div className="border-2 border-zinc-700 dark:border-zinc-400 bg-white dark:bg-gray-900 p-8 min-h-[320px] animate-pulse shadow-[6px_6px_0px_rgba(0,0,0,0.85)] dark:shadow-[6px_6px_0px_rgba(156,163,175,0.35)]">
            <div className="h-8 bg-zinc-200 dark:bg-zinc-700 max-w-xs mb-6" />
            <div className="h-40 bg-zinc-100 dark:bg-zinc-800" />
          </div>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  if (error) {
    return (
      <div className="bg-[#f7f4ee] dark:bg-gray-950 min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-xl mx-auto text-center border-2 border-zinc-700 dark:border-zinc-400 bg-white dark:bg-gray-900 p-10 shadow-[8px_8px_0px_rgba(0,0,0,0.9)] dark:shadow-[8px_8px_0px_rgba(156,163,175,0.42)]">
            <div className="flex justify-center mb-4 text-red-600 dark:text-red-400">
              <ICONS.AlertCircle className="w-14 h-14" aria-hidden />
            </div>
            <h1 className="text-2xl font-black uppercase tracking-tight mb-2">
              Could not load admin data
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
            <Button
              onClick={() => {
                setError(null);
                setLoading(true);
                void (async () => {
                  try {
                    const response = await fetch('/api/categories');
                    if (!response.ok) throw new Error('Failed to fetch categories');
                    const data = await response.json();
                    setCategories(data.categories || []);
                    setError(null);
                  } catch {
                    setError('Failed to load categories');
                  } finally {
                    setLoading(false);
                  }
                })();
              }}
              className="rounded-none border-2 border-zinc-700 dark:border-zinc-400 uppercase tracking-wide font-bold"
            >
              Try again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f7f4ee] dark:bg-gray-950 min-h-screen pb-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-10 border-2 border-zinc-700 dark:border-zinc-400 bg-white dark:bg-gray-900 p-6 sm:p-8 shadow-[8px_8px_0px_rgba(0,0,0,0.9)] dark:shadow-[8px_8px_0px_rgba(156,163,175,0.42)]">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex gap-4">
              <div className="hidden sm:flex h-14 w-14 shrink-0 items-center justify-center border-2 border-zinc-700 dark:border-zinc-400 bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-200">
                <ICONS.Upload className="w-7 h-7" aria-hidden />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-blue-700 dark:text-blue-300 mb-1">
                  Staff only
                </p>
                <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-gray-900 dark:text-white">
                  Admin dashboard
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400 max-w-xl">
                  Upload memes, assign categories, send more dull content into the world.
                </p>
                {user?.email && (
                  <p className="mt-3 text-sm text-gray-500 dark:text-gray-500">
                    Signed in as <span className="font-mono text-gray-800 dark:text-gray-300">{user.email}</span>
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <Link
                href="/"
                className={cn(
                  'inline-flex h-10 items-center justify-center px-4 py-2 text-sm font-medium transition-colors',
                  'rounded-none border-2 border-zinc-700 dark:border-zinc-400 uppercase tracking-wide font-bold',
                  'hover:bg-gray-100 dark:hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400'
                )}
              >
                <ICONS.ArrowRight className="w-4 h-4 mr-2 rotate-180" aria-hidden />
                Back to site
              </Link>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="rounded-none border-2 border-zinc-700 dark:border-zinc-400 uppercase tracking-wide font-bold"
              >
                Log out
              </Button>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <div className="border-2 border-zinc-700 dark:border-zinc-400 bg-white dark:bg-gray-900 p-6 shadow-[4px_4px_0px_rgba(0,0,0,0.85)] dark:shadow-[4px_4px_0px_rgba(156,163,175,0.35)]">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">
              <ICONS.FolderOpen className="w-4 h-4" aria-hidden />
              Categories
            </div>
            <p className="text-3xl font-black tabular-nums">{categories.length}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Available for tagging</p>
          </div>
          <div className="border-2 border-zinc-700 dark:border-zinc-400 bg-white dark:bg-gray-900 p-6 shadow-[4px_4px_0px_rgba(0,0,0,0.85)] dark:shadow-[4px_4px_0px_rgba(156,163,175,0.35)]">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">
              <ICONS.Image className="w-4 h-4" aria-hidden />
              Upload flow
            </div>
            <p className="text-3xl font-black">One</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Form below, no surprises</p>
          </div>
          <div className="border-2 border-zinc-700 dark:border-zinc-400 bg-white dark:bg-gray-900 p-6 shadow-[4px_4px_0px_rgba(0,0,0,0.85)] dark:shadow-[4px_4px_0px_rgba(156,163,175,0.35)] sm:col-span-1">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">
              <ICONS.Star className="w-4 h-4" aria-hidden />
              Quality bar
            </div>
            <p className="text-3xl font-black">Low</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">By design. Stay on brand.</p>
          </div>
        </div>

        <section className="border-2 border-zinc-700 dark:border-zinc-400 bg-white dark:bg-gray-900 p-6 sm:p-8 shadow-[6px_6px_0px_rgba(0,0,0,0.85)] dark:shadow-[6px_6px_0px_rgba(156,163,175,0.35)] mb-10">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tight">
                Manage memes
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Delete recent memes directly from admin.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => void fetchMemes()}
              disabled={memesLoading}
              className="rounded-none border-2 border-zinc-700 dark:border-zinc-400 uppercase tracking-wide font-bold"
            >
              <ICONS.RefreshCw className={`w-4 h-4 mr-2 ${memesLoading ? 'animate-spin' : ''}`} aria-hidden />
              Refresh
            </Button>
          </div>

          {memesError && (
            <div className="mb-4 border-2 border-red-700 dark:border-red-500 bg-red-50 dark:bg-red-950/40 px-4 py-3 text-sm text-red-900 dark:text-red-100">
              {memesError}
            </div>
          )}

          {deleteMessage && (
            <div className="mb-4 border-2 border-green-700 dark:border-green-500 bg-green-50 dark:bg-green-950/40 px-4 py-3 text-sm text-green-900 dark:text-green-100">
              {deleteMessage}
            </div>
          )}

          <div className="overflow-x-auto border-2 border-zinc-700 dark:border-zinc-400">
            <table className="w-full text-sm">
              <thead className="bg-[#f7f4ee] dark:bg-gray-950 border-b-2 border-zinc-700 dark:border-zinc-400">
                <tr>
                  <th className="text-left px-3 py-2 font-bold uppercase tracking-wide">Title</th>
                  <th className="text-left px-3 py-2 font-bold uppercase tracking-wide">Slug</th>
                  <th className="text-left px-3 py-2 font-bold uppercase tracking-wide">Created</th>
                  <th className="text-right px-3 py-2 font-bold uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody>
                {memesLoading && memes.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-3 py-6 text-center text-gray-500 dark:text-gray-400">
                      Loading memes...
                    </td>
                  </tr>
                ) : memes.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-3 py-6 text-center text-gray-500 dark:text-gray-400">
                      No memes found.
                    </td>
                  </tr>
                ) : (
                  memes.map((meme) => (
                    <tr key={meme.id} className="border-t border-zinc-300 dark:border-zinc-700">
                      <td className="px-3 py-2 max-w-[320px] truncate">{meme.title}</td>
                      <td className="px-3 py-2 max-w-[220px] truncate font-mono text-xs">{meme.slug}</td>
                      <td className="px-3 py-2 text-xs text-gray-600 dark:text-gray-400">
                        {new Date(meme.created_at).toLocaleString()}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => void handleDeleteMeme(meme)}
                          disabled={deletingMemeId === meme.id}
                          className="rounded-none border-2 border-red-700 dark:border-red-500 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/30 uppercase tracking-wide font-bold"
                        >
                          <ICONS.Trash2 className="w-4 h-4 mr-2" aria-hidden />
                          {deletingMemeId === meme.id ? 'Deleting...' : 'Delete'}
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="border-2 border-zinc-700 dark:border-zinc-400 bg-white dark:bg-gray-900 p-6 sm:p-8 shadow-[6px_6px_0px_rgba(0,0,0,0.85)] dark:shadow-[6px_6px_0px_rgba(156,163,175,0.35)]">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tight">Upload a meme</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Image, title, optional category and tags. Max 10MB.
              </p>
            </div>
          </div>

          {uploadSuccess && (
            <div
              className="mb-6 border-2 border-green-700 dark:border-green-500 bg-green-50 dark:bg-green-950/40 px-4 py-3 flex items-start gap-3"
              role="status"
            >
              <ICONS.ThumbsUp className="w-5 h-5 text-green-700 dark:text-green-400 shrink-0 mt-0.5" aria-hidden />
              <p className="text-sm font-medium text-green-900 dark:text-green-100">
                Meme uploaded successfully. It should appear in the feed shortly.
              </p>
            </div>
          )}

          <MemeUpload
            categories={categories}
            onUploadSuccess={handleUploadSuccess}
            sharpCorners
            className="max-w-2xl shadow-none"
          />
        </section>
      </div>
    </div>
  );
}
