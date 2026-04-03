import Link from 'next/link';
import type { ReactNode } from 'react';

type LegalPageShellProps = {
  title: string;
  children: ReactNode;
};

export function LegalPageShell({ title, children }: LegalPageShellProps) {
  return (
    <div className="min-h-screen bg-[#f7f4ee] dark:bg-gray-950">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="max-w-3xl mx-auto border-2 border-zinc-700 dark:border-zinc-400 bg-white dark:bg-gray-900 p-8 shadow-[8px_8px_0px_rgba(0,0,0,0.85)] dark:shadow-[8px_8px_0px_rgba(156,163,175,0.42)]">
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-gray-900 dark:text-white mb-8">
            {title}
          </h1>
          <div className="max-w-none text-gray-700 dark:text-gray-300 space-y-4 text-sm leading-relaxed">
            {children}
          </div>
          <p className="mt-10 pt-6 border-t-2 border-zinc-200 dark:border-zinc-600">
            <Link
              href="/"
              className="text-sm font-bold uppercase tracking-wide text-zinc-800 dark:text-zinc-200 hover:underline"
            >
              Back home
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
