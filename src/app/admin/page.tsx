'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { MemeUpload } from '@/components/ui/MemeUpload';
import { Category, Meme } from '@/lib/types/meme';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';
import { ICONS, renderCategoryIcon } from '@/lib/utils/categoryIcons';

const MEMES_ADMIN_PAGE_SIZE = 50;

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
  const [memesPage, setMemesPage] = useState(1);
  const [memesHasMore, setMemesHasMore] = useState(false);
  const [memeSearchDraft, setMemeSearchDraft] = useState('');
  const [memeSearch, setMemeSearch] = useState('');
  const [memesListNonce, setMemesListNonce] = useState(0);
  const [deleteMessage, setDeleteMessage] = useState<string | null>(null);
  const [deletingMemeId, setDeletingMemeId] = useState<string | null>(null);
  const [memeCategoryUpdatingId, setMemeCategoryUpdatingId] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  const [categorySaving, setCategorySaving] = useState(false);
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null);
  const [categoryManageError, setCategoryManageError] = useState<string | null>(null);
  const [categoryManageMessage, setCategoryManageMessage] = useState<string | null>(null);

  const loadCategories = useCallback(async (mode: 'initial' | 'refresh' = 'initial') => {
    const isInitial = mode === 'initial';
    try {
      if (isInitial) {
        setLoading(true);
        setError(null);
      }
      const response = await fetch('/api/categories');
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      const data = await response.json();
      setCategories(data.categories || []);
      if (isInitial) {
        setError(null);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      if (isInitial) {
        setError('Failed to load categories');
      } else {
        setCategoryManageError('Could not refresh categories list');
      }
    } finally {
      if (isInitial) {
        setLoading(false);
      }
    }
  }, []);

  const loadMemeList = useCallback(async () => {
    try {
      setMemesLoading(true);
      setMemesError(null);
      const params = new URLSearchParams({
        page: String(memesPage),
        limit: String(MEMES_ADMIN_PAGE_SIZE),
        sort_by: 'created_at',
        sort_order: 'desc',
      });
      const q = memeSearch.trim();
      if (q) {
        params.set('search', q);
      }
      const response = await fetch(`/api/memes?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch memes');
      }
      const data = (await response.json()) as {
        memes?: Meme[];
        pagination?: { has_more?: boolean };
      };
      setMemes((data.memes || []) as Meme[]);
      setMemesHasMore(Boolean(data.pagination?.has_more));
    } catch (err) {
      console.error('Error fetching memes:', err);
      setMemesError('Failed to load memes');
    } finally {
      setMemesLoading(false);
    }
  }, [memesPage, memeSearch]);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      router.push('/admin/login');
    }
  }, [user, isAdmin, authLoading, router]);

  useEffect(() => {
    if (isAdmin) {
      void loadCategories('initial');
    }
  }, [isAdmin, loadCategories]);

  useEffect(() => {
    if (!isAdmin) return;
    void loadMemeList();
  }, [isAdmin, memesPage, memeSearch, memesListNonce, loadMemeList]);

  const refreshMemeList = useCallback(() => {
    setMemesListNonce((n) => n + 1);
  }, []);

  const applyMemeSearch = useCallback(() => {
    setMemeSearch(memeSearchDraft.trim());
    setMemesPage(1);
  }, [memeSearchDraft]);

  const clearMemeSearch = useCallback(() => {
    setMemeSearchDraft('');
    setMemeSearch('');
    setMemesPage(1);
  }, []);

  const handleLogout = async () => {
    await signOut();
    router.push('/admin/login');
  };

  const handleUploadSuccess = () => {
    setUploadSuccess(true);
    setMemesPage(1);
    setMemesListNonce((n) => n + 1);
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

      setMemes((prev) => {
        const next = prev.filter((m) => m.id !== meme.id);
        if (next.length === 0 && memesPage > 1) {
          setMemesPage((p) => p - 1);
        }
        return next;
      });
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

  const handleMemeCategoryChange = async (meme: Meme, value: string) => {
    if (!session?.access_token) {
      setMemesError('Your admin session is missing. Please log in again.');
      return;
    }
    const nextCategoryId = value === '' ? null : value;
    const currentId = meme.category_id ?? null;
    if (nextCategoryId === currentId) {
      return;
    }

    const revertRow = { ...meme };
    const nextCategory =
      nextCategoryId === null
        ? undefined
        : categories.find((c) => c.id === nextCategoryId);

    setMemesError(null);
    setMemeCategoryUpdatingId(meme.id);
    setMemes((prev) =>
      prev.map((m) =>
        m.id === meme.id
          ? {
              ...m,
              category_id: nextCategoryId ?? undefined,
              category: nextCategory,
            }
          : m
      )
    );

    try {
      const response = await fetch(`/api/admin/memes/${meme.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ category_id: nextCategoryId }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
        meme?: Meme;
      };
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update category');
      }
      if (data.meme) {
        setMemes((prev) =>
          prev.map((m) => (m.id === meme.id ? data.meme! : m))
        );
      }
    } catch (err) {
      console.error('Error updating meme category:', err);
      setMemes((prev) =>
        prev.map((m) => (m.id === meme.id ? revertRow : m))
      );
      setMemesError(
        err instanceof Error ? err.message : 'Failed to update category'
      );
    } finally {
      setMemeCategoryUpdatingId(null);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.access_token) {
      setCategoryManageError('Your admin session is missing. Please log in again.');
      return;
    }
    setCategoryManageError(null);
    setCategoryManageMessage(null);
    setCategorySaving(true);
    try {
      const response = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          name: newCategoryName,
          description: newCategoryDescription || undefined,
        }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
        category?: Category;
      };
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create category');
      }
      setNewCategoryName('');
      setNewCategoryDescription('');
      setCategoryManageMessage(
        data.category?.name
          ? `Added category “${data.category.name}”.`
          : 'Category created.'
      );
      window.setTimeout(() => setCategoryManageMessage(null), 4000);
      await loadCategories('refresh');
    } catch (err) {
      console.error('Error creating category:', err);
      setCategoryManageError(
        err instanceof Error ? err.message : 'Failed to create category'
      );
    } finally {
      setCategorySaving(false);
    }
  };

  const handleDeleteCategory = async (category: Category) => {
    if (!session?.access_token) {
      setCategoryManageError('Your admin session is missing. Please log in again.');
      return;
    }
    const shouldDelete = window.confirm(
      `Delete category “${category.name}”?\n\nMemes using it will have no category (not deleted).`
    );
    if (!shouldDelete) return;

    setCategoryManageError(null);
    setCategoryManageMessage(null);
    setDeletingCategoryId(category.id);
    try {
      const response = await fetch(`/api/admin/categories/${category.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete category');
      }
      setCategories((prev) => prev.filter((c) => c.id !== category.id));
      setCategoryManageMessage(`Deleted category “${category.name}”.`);
      window.setTimeout(() => setCategoryManageMessage(null), 4000);
    } catch (err) {
      console.error('Error deleting category:', err);
      setCategoryManageError(
        err instanceof Error ? err.message : 'Failed to delete category'
      );
    } finally {
      setDeletingCategoryId(null);
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
                void loadCategories('initial');
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
                href="/admin/print-layout"
                className={cn(
                  'inline-flex h-10 items-center justify-center px-4 py-2 text-sm font-medium transition-colors',
                  'rounded-none border-2 border-zinc-700 dark:border-zinc-400 uppercase tracking-wide font-bold',
                  'hover:bg-gray-100 dark:hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400'
                )}
              >
                <ICONS.Image className="w-4 h-4 mr-2" aria-hidden />
                Print layout
              </Link>
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
                Manage categories
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Add lanes for uploads, or remove ones you no longer use. Deleting a category clears it from memes (they stay published). Icons are inferred from the name (folder icon when there is no dedicated mapping).
              </p>
            </div>
          </div>

          {categoryManageError && (
            <div className="mb-4 border-2 border-red-700 dark:border-red-500 bg-red-50 dark:bg-red-950/40 px-4 py-3 text-sm text-red-900 dark:text-red-100">
              {categoryManageError}
            </div>
          )}

          {categoryManageMessage && (
            <div className="mb-4 border-2 border-green-700 dark:border-green-500 bg-green-50 dark:bg-green-950/40 px-4 py-3 text-sm text-green-900 dark:text-green-100">
              {categoryManageMessage}
            </div>
          )}

          <form
            onSubmit={handleAddCategory}
            className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4 items-end border-2 border-zinc-200 dark:border-zinc-700 p-4 bg-[#f7f4ee]/60 dark:bg-gray-950/40"
          >
            <Input
              label="Name"
              value={newCategoryName}
              onChange={(ev) => setNewCategoryName(ev.target.value)}
              placeholder="e.g. Science"
              required
              maxLength={80}
              disabled={categorySaving}
              className="rounded-none border-2 border-zinc-700 dark:border-zinc-400"
            />
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description (optional)
              </label>
              <textarea
                value={newCategoryDescription}
                onChange={(ev) => setNewCategoryDescription(ev.target.value)}
                placeholder="Short blurb for the category page"
                maxLength={500}
                rows={2}
                disabled={categorySaving}
                className={cn(
                  'flex w-full rounded-none border-2 border-zinc-700 dark:border-zinc-400 bg-white px-3 py-2 text-sm',
                  'placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gray-950',
                  'disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-950 dark:placeholder:text-gray-400 dark:focus-visible:ring-gray-300'
                )}
              />
            </div>
            <div className="md:col-span-2 flex justify-end">
              <Button
                type="submit"
                disabled={categorySaving}
                className="rounded-none border-2 border-zinc-700 dark:border-zinc-400 uppercase tracking-wide font-bold"
              >
                {categorySaving ? 'Saving…' : 'Add category'}
              </Button>
            </div>
          </form>

          <div className="overflow-x-auto border-2 border-zinc-700 dark:border-zinc-400">
            <table className="w-full text-sm">
              <thead className="bg-[#f7f4ee] dark:bg-gray-950 border-b-2 border-zinc-700 dark:border-zinc-400">
                <tr>
                  <th className="text-left px-3 py-2 font-bold uppercase tracking-wide">Category</th>
                  <th className="text-left px-3 py-2 font-bold uppercase tracking-wide hidden md:table-cell">
                    Description
                  </th>
                  <th className="text-right px-3 py-2 font-bold uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-3 py-6 text-center text-gray-500 dark:text-gray-400">
                      No categories yet. Add one above.
                    </td>
                  </tr>
                ) : (
                  categories.map((category) => (
                    <tr key={category.id} className="border-t border-zinc-300 dark:border-zinc-700">
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg shrink-0" aria-hidden>
                            {renderCategoryIcon(category.name, 'w-5 h-5')}
                          </span>
                          <span className="font-medium">{category.name}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-gray-600 dark:text-gray-400 max-w-md truncate hidden md:table-cell">
                        {category.description || '—'}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => void handleDeleteCategory(category)}
                          disabled={deletingCategoryId === category.id}
                          className="rounded-none border-2 border-red-700 dark:border-red-500 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/30 uppercase tracking-wide font-bold"
                        >
                          <ICONS.Trash2 className="w-4 h-4 mr-2" aria-hidden />
                          {deletingCategoryId === category.id ? 'Deleting…' : 'Delete'}
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm text-gray-600 dark:text-gray-400">
            <p>
              Page <span className="font-mono font-semibold text-gray-900 dark:text-gray-100">{memesPage}</span>
              {memeSearch ? (
                <>
                  {' '}
                  · filter &quot;{memeSearch}&quot;
                </>
              ) : null}
              {memes.length > 0 ? (
                <>
                  {' '}
                  · {memes.length} meme{memes.length === 1 ? '' : 's'} on this page
                </>
              ) : null}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setMemesPage((p) => Math.max(1, p - 1))}
                disabled={memesLoading || memesPage <= 1}
                className="rounded-none border-2 border-zinc-700 dark:border-zinc-400 uppercase tracking-wide font-bold"
              >
                Previous
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setMemesPage((p) => p + 1)}
                disabled={memesLoading || !memesHasMore}
                className="rounded-none border-2 border-zinc-700 dark:border-zinc-400 uppercase tracking-wide font-bold"
              >
                Next
              </Button>
            </div>
          </div>
        </section>

        <section className="border-2 border-zinc-700 dark:border-zinc-400 bg-white dark:bg-gray-900 p-6 sm:p-8 shadow-[6px_6px_0px_rgba(0,0,0,0.85)] dark:shadow-[6px_6px_0px_rgba(156,163,175,0.35)] mb-10">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tight">
                Manage memes
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Reassign categories or delete memes. Page through the library or filter by title or tag.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => refreshMemeList()}
              disabled={memesLoading}
              className="rounded-none border-2 border-zinc-700 dark:border-zinc-400 uppercase tracking-wide font-bold"
            >
              <ICONS.RefreshCw className={`w-4 h-4 mr-2 ${memesLoading ? 'animate-spin' : ''}`} aria-hidden />
              Refresh
            </Button>
          </div>

          <form
            className="mb-4 flex flex-col sm:flex-row gap-2 sm:items-center"
            onSubmit={(e) => {
              e.preventDefault();
              applyMemeSearch();
            }}
          >
            <Input
              type="search"
              value={memeSearchDraft}
              onChange={(e) => setMemeSearchDraft(e.target.value)}
              placeholder="Search title or tag…"
              aria-label="Search memes"
              className="max-w-md rounded-none border-2 border-zinc-300 dark:border-zinc-600 focus:border-zinc-700 dark:focus:border-zinc-400"
            />
            <div className="flex flex-wrap gap-2">
              <Button
                type="submit"
                variant="outline"
                disabled={memesLoading}
                className="rounded-none border-2 border-zinc-700 dark:border-zinc-400 uppercase tracking-wide font-bold"
              >
                Search
              </Button>
              {memeSearch ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => clearMemeSearch()}
                  disabled={memesLoading}
                  className="rounded-none border-2 border-zinc-700 dark:border-zinc-400 uppercase tracking-wide font-bold"
                >
                  Clear
                </Button>
              ) : null}
            </div>
          </form>

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
                  <th className="text-left px-3 py-2 font-bold uppercase tracking-wide min-w-[200px]">
                    Category
                  </th>
                  <th className="text-left px-3 py-2 font-bold uppercase tracking-wide">Created</th>
                  <th className="text-right px-3 py-2 font-bold uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody>
                {memesLoading && memes.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-6 text-center text-gray-500 dark:text-gray-400">
                      Loading memes...
                    </td>
                  </tr>
                ) : memes.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-6 text-center text-gray-500 dark:text-gray-400">
                      No memes found.
                    </td>
                  </tr>
                ) : (
                  memes.map((meme) => (
                    <tr key={meme.id} className="border-t border-zinc-300 dark:border-zinc-700">
                      <td className="px-3 py-2 max-w-[320px] truncate">{meme.title}</td>
                      <td className="px-3 py-2 max-w-[220px] truncate font-mono text-xs">{meme.slug}</td>
                      <td className="px-3 py-2 align-middle">
                        <select
                          aria-label={`Category for ${meme.title}`}
                          value={meme.category_id ?? ''}
                          onChange={(ev) =>
                            void handleMemeCategoryChange(meme, ev.target.value)
                          }
                          disabled={memeCategoryUpdatingId === meme.id}
                          className={cn(
                            'max-w-[220px] w-full rounded-none border-2 border-zinc-700 dark:border-zinc-400 bg-white px-2 py-1.5 text-xs',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gray-950',
                            'disabled:opacity-60 dark:bg-gray-950 dark:focus-visible:ring-gray-300'
                          )}
                        >
                          <option value="">Uncategorized</option>
                          {categories.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </td>
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

          <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm text-gray-600 dark:text-gray-400">
            <p>
              Page <span className="font-mono font-semibold text-gray-900 dark:text-gray-100">{memesPage}</span>
              {memeSearch ? (
                <>
                  {' '}
                  · filter &quot;{memeSearch}&quot;
                </>
              ) : null}
              {memes.length > 0 ? (
                <>
                  {' '}
                  · {memes.length} meme{memes.length === 1 ? '' : 's'} on this page
                </>
              ) : null}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setMemesPage((p) => Math.max(1, p - 1))}
                disabled={memesLoading || memesPage <= 1}
                className="rounded-none border-2 border-zinc-700 dark:border-zinc-400 uppercase tracking-wide font-bold"
              >
                Previous
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setMemesPage((p) => p + 1)}
                disabled={memesLoading || !memesHasMore}
                className="rounded-none border-2 border-zinc-700 dark:border-zinc-400 uppercase tracking-wide font-bold"
              >
                Next
              </Button>
            </div>
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
