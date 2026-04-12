import React from 'react';
import Link from 'next/link';
import { Instagram, Facebook } from 'lucide-react';
import { ICONS } from '@/lib/utils/categoryIcons';
import { getPublicFacebookUrl, getPublicInstagramUrl } from '@/lib/socialUrls';

const instagramUrl = getPublicInstagramUrl();
const facebookUrl = getPublicFacebookUrl();
const year = new Date().getFullYear();

const Footer: React.FC = () => {
  const showSocial = Boolean(instagramUrl || facebookUrl);

  return (
    <footer className="border-t-2 border-zinc-700 dark:border-zinc-400 bg-[#f7f4ee] dark:bg-gray-950">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 border-2 border-zinc-700 dark:border-zinc-400 bg-white dark:bg-gray-900 p-6 shadow-[8px_8px_0px_rgba(0,0,0,0.85)] dark:shadow-[8px_8px_0px_rgba(156,163,175,0.42)]">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-xl font-black uppercase tracking-tight">IVEHITMYHEAD</span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md">
              Discover, share, and create the dullest memes on the internet. We said what we said.
            </p>
            {showSocial ? (
              <div className="flex items-center gap-4">
                {instagramUrl ? (
                  <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-100"
                  >
                    <span className="sr-only">Instagram</span>
                    <Instagram className="w-5 h-5" aria-hidden />
                  </a>
                ) : null}
                {facebookUrl ? (
                  <a
                    href={facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-100"
                  >
                    <span className="sr-only">Facebook</span>
                    <Facebook className="w-5 h-5" aria-hidden />
                  </a>
                ) : null}
              </div>
            ) : null}
          </div>

          <div>
            <h3 className="font-black uppercase tracking-wide mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/memes?filter=trending&time_period=month"
                  className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 cursor-pointer"
                >
                  Trending Memes
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 cursor-pointer"
                >
                  About
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-black uppercase tracking-wide mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/help"
                  className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 cursor-pointer"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 cursor-pointer"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 cursor-pointer"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 cursor-pointer"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t-2 border-zinc-700 dark:border-zinc-400 mt-8 pt-8 text-center">
          <p className="text-gray-500 dark:text-gray-400 flex items-center justify-center flex-wrap gap-x-1">
            © {year} IVEHITMYHEAD. All rights reserved. Held together with{' '}
            <ICONS.Heart className="w-4 h-4 text-red-500 shrink-0" aria-hidden /> and mild denial.
          </p>
        </div>
      </div>
    </footer>
  );
};

export { Footer };
