'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import PrintLayoutEditor from '@/components/print-layout/PrintLayoutEditor';
import { useAuth } from '@/lib/contexts/AuthContext';
import { ICONS } from '@/lib/utils/categoryIcons';

export default function AdminPrintLayoutPage() {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push('/admin/login');
    }
  }, [loading, user, isAdmin, router]);

  if (loading) {
    return (
      <div className="bg-[#f7f4ee] dark:bg-gray-950 min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="h-20 animate-pulse bg-zinc-200 dark:bg-zinc-700 border-2 border-zinc-700 dark:border-zinc-400" />
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="bg-[#f7f4ee] dark:bg-gray-950 min-h-screen pb-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-8 border-2 border-zinc-700 dark:border-zinc-400 bg-white dark:bg-gray-900 p-6 shadow-[8px_8px_0px_rgba(0,0,0,0.9)] dark:shadow-[8px_8px_0px_rgba(156,163,175,0.42)]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black uppercase tracking-tight">A4 Print Composer</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Place images in 40x60mm and 49x69mm guides, then export a print-ready A4 PNG.
              </p>
            </div>
            <Link href="/admin">
              <Button
                variant="outline"
                className="rounded-none border-2 border-zinc-700 dark:border-zinc-400 uppercase tracking-wide font-bold"
              >
                <ICONS.ArrowRight className="w-4 h-4 mr-2 rotate-180" aria-hidden />
                Back to admin
              </Button>
            </Link>
          </div>
        </header>

        <PrintLayoutEditor />
      </div>
    </div>
  );
}
