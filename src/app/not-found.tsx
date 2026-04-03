import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '404 — Page not found',
  description:
    'That URL does not exist on IVEHITMYHEAD. Try the home page or the memes feed.',
};

const linkBase =
  'inline-flex h-11 min-w-[9rem] items-center justify-center px-5 text-sm font-bold uppercase tracking-wide transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-700 focus-visible:ring-offset-2 dark:focus-visible:ring-zinc-400 dark:focus-visible:ring-offset-gray-950';

export default function NotFound() {
  return (
    <div className="min-h-[min(70vh,calc(100vh-12rem))] bg-[#f7f4ee] dark:bg-gray-950">
      <div className="container mx-auto px-4 py-12 sm:px-6 md:py-16 lg:px-8">
        <section className="mx-auto max-w-xl border-2 border-zinc-700 bg-white p-8 text-center shadow-[8px_8px_0px_rgba(0,0,0,0.9)] dark:border-zinc-400 dark:bg-gray-900 dark:shadow-[8px_8px_0px_rgba(156,163,175,0.42)] md:p-10">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-600 dark:text-gray-400">
            Error 404
          </p>
          <h1 className="mt-3 text-3xl font-black uppercase tracking-tight text-gray-900 dark:text-white md:text-4xl">
            Page not found
          </h1>
          <p className="mt-4 text-pretty leading-relaxed text-gray-600 dark:text-gray-300">
            This path is empty—like the part of your brain that remembers why you opened this tab. Head back to
            somewhere that exists.
          </p>
          <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/"
              className={`${linkBase} rounded-none border-2 border-zinc-900 bg-zinc-900 text-white hover:bg-zinc-800 dark:border-white dark:bg-white dark:text-gray-950 dark:hover:bg-gray-200`}
            >
              Home
            </Link>
            <Link
              href="/memes"
              className={`${linkBase} rounded-none border-2 border-zinc-700 bg-transparent text-gray-900 hover:bg-[#f7f4ee] dark:border-zinc-400 dark:text-gray-100 dark:hover:bg-gray-800`}
            >
              Browse memes
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
