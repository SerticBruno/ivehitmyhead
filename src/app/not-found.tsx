import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '404 — Page not found',
  description:
    'That URL does not exist on IVEHITMYHEAD. Try the home page or the memes feed.',
};

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[min(70vh,calc(100vh-12rem))] max-w-lg flex-col items-center justify-center px-6 py-16 text-center">
      <p className="font-mono text-sm font-medium text-gray-500 dark:text-gray-400">404</p>
      <h1 className="mt-2 text-2xl font-black uppercase tracking-wide text-gray-900 dark:text-white">
        Page not found
      </h1>
      <p className="mt-4 text-pretty text-gray-600 dark:text-gray-300">
        This path is empty—like the part of your brain that remembers why you opened this tab. Head back to
        somewhere that exists.
      </p>
      <div className="mt-10 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
        <Link
          href="/"
          className="inline-flex h-10 items-center justify-center rounded-md bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus-visible:ring-offset-gray-950"
        >
          Home
        </Link>
        <Link
          href="/memes"
          className="inline-flex h-10 items-center justify-center rounded-md border border-gray-300 bg-transparent px-4 py-2 font-medium text-gray-900 transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-800 dark:focus-visible:ring-offset-gray-950"
        >
          Browse memes
        </Link>
      </div>
    </div>
  );
}
