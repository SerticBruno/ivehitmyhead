'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LogOut, Shield } from 'lucide-react';
import { useAuth } from '@/lib/contexts/AuthContext';

interface HeaderProps {
  showSearch?: boolean;
}

function HamburgerBar() {
  return (
    <svg
      viewBox="0 0 20 4"
      width={20}
      height={4}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="block h-1 w-5 shrink-0"
      aria-hidden
    >
      <line
        x1={0}
        y1={2}
        x2={20}
        y2={2}
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Three stacked bar SVGs morph into an X when the menu opens. */
function MobileMenuIcon({ open }: { open: boolean }) {
  const dur = 'duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none';

  return (
    <div
      className="pointer-events-none flex h-[18px] w-5 flex-col justify-between"
      aria-hidden
    >
      <div
        className={`origin-center transition-transform ${dur} ${open ? 'translate-y-[7px] rotate-45' : 'translate-y-0 rotate-0'}`}
      >
        <HamburgerBar />
      </div>
      <div className={`transition-opacity duration-200 ease-out motion-reduce:transition-none ${open ? 'opacity-0' : 'opacity-100'}`}>
        <HamburgerBar />
      </div>
      <div
        className={`origin-center transition-transform ${dur} ${open ? '-translate-y-[7px] -rotate-45' : 'translate-y-0 rotate-0'}`}
      >
        <HamburgerBar />
      </div>
    </div>
  );
}

const Header: React.FC<HeaderProps> = ({ showSearch = true }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAdmin, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isMobileMenuOpen]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get('search') as string;
    if (query.trim()) {
      router.push(`/memes?search=${encodeURIComponent(query.trim())}`);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    await signOut();
    closeMobileMenu();
    router.push('/');
  };

  const navigationItems = [
    { href: '/memes', label: 'Memes' },
    { href: '/random', label: 'Random' },
    { href: '/meme-generator', label: 'Generator' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b-2 border-zinc-700 dark:border-zinc-400 bg-[#f7f4ee] dark:bg-gray-950">
      <div className="relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2 cursor-pointer" onClick={closeMobileMenu}>
                <span className="text-xl font-black uppercase tracking-tight">IVEHITMYHEAD</span>
              </Link>
            </div>

            {showSearch && (
              <div className={`flex-1 max-w-md mx-4 ${isMobileMenuOpen ? 'hidden' : 'block'}`}>
                <form onSubmit={handleSearch} className="relative">
                  <Input
                    name="search"
                    placeholder="Search the archive..."
                    className="pr-10 rounded-none border-2 border-zinc-700 dark:border-zinc-400 bg-white dark:bg-gray-900"
                  />
                  <Button
                    type="submit"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 rounded-none"
                  >
                    🔍
                  </Button>
                </form>
              </div>
            )}

            <nav className="hidden md:flex items-center space-x-4">
              {navigationItems.map((item) => {
                const isActive =
                  pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
                return (
                  <Link key={item.href} href={item.href} className="cursor-pointer">
                    <Button
                      variant={isActive ? 'primary' : 'ghost'}
                      size="sm"
                      className={`rounded-none border-2 uppercase tracking-wide font-bold ${isActive ? 'border-black dark:border-white' : 'border-transparent'}`}
                    >
                      {item.label}
                    </Button>
                  </Link>
                );
              })}

              {user && isAdmin && (
                <>
                  <Link href="/admin" className="cursor-pointer">
                    <Button
                      variant={pathname?.startsWith('/admin') ? 'primary' : 'ghost'}
                      size="sm"
                      className="flex items-center gap-1.5 rounded-none border-2 border-transparent uppercase tracking-wide font-bold"
                    >
                      <Shield className="h-4 w-4" />
                      <span>Admin</span>
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 rounded-none border-2 border-transparent uppercase tracking-wide font-bold"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </Button>
                </>
              )}
            </nav>

            <button
              type="button"
              onClick={toggleMobileMenu}
              className="md:hidden relative z-[70] h-10 w-10 inline-flex items-center justify-center p-0 rounded-none border-2 border-zinc-700 dark:border-zinc-400 text-gray-700 hover:text-black hover:bg-white dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-900"
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-nav-panel"
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              <MobileMenuIcon open={isMobileMenuOpen} />
            </button>
          </div>
        </div>

        <>
          <button
            type="button"
            aria-label="Close menu"
            className={`md:hidden fixed inset-0 top-16 z-[55] bg-black/25 dark:bg-black/40 border-0 cursor-pointer p-0 m-0 w-full transition-opacity duration-300 ease-out motion-reduce:transition-none ${
              isMobileMenuOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
            }`}
            onClick={closeMobileMenu}
            aria-hidden={!isMobileMenuOpen}
          />
          <nav
            id="mobile-nav-panel"
            className="md:hidden absolute left-0 right-0 top-full z-[65] grid border-t-2 border-zinc-700 dark:border-zinc-400 bg-[#f7f4ee] dark:bg-gray-950 shadow-[0_16px_40px_rgba(0,0,0,0.18)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.45)] transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none"
            style={{ gridTemplateRows: isMobileMenuOpen ? '1fr' : '0fr' }}
            aria-label="Mobile navigation"
            aria-hidden={!isMobileMenuOpen}
          >
            <div className="min-h-0 overflow-hidden">
              <div
                className={`max-h-[min(75dvh,calc(100dvh-4rem))] overflow-y-auto overscroll-contain transition-[opacity,transform] duration-300 ease-out motion-reduce:transition-none ${
                  isMobileMenuOpen
                    ? 'translate-y-0 opacity-100'
                    : 'pointer-events-none -translate-y-2 opacity-0'
                }`}
              >
              <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 pb-4 space-y-1">
                {showSearch && (
                  <div className="px-1 py-2">
                    <form onSubmit={handleSearch} className="relative">
                      <Input
                        name="search"
                        placeholder="Search the archive..."
                        className="pr-10 rounded-none border-2 border-zinc-700 dark:border-zinc-400 bg-white dark:bg-gray-900"
                      />
                      <Button
                        type="submit"
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 rounded-none"
                      >
                        🔍
                      </Button>
                    </form>
                  </div>
                )}

                {navigationItems.map((item) => {
                  const isActive =
                    pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`block px-3 py-2 text-base font-bold uppercase tracking-wide rounded-none border-2 transition-colors duration-150 ${
                        isActive
                          ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white'
                          : 'text-gray-800 border-zinc-700 hover:bg-white dark:text-gray-200 dark:border-zinc-400 dark:hover:bg-gray-900'
                      }`}
                      onClick={closeMobileMenu}
                    >
                      {item.label}
                    </Link>
                  );
                })}

                {user && isAdmin && (
                  <>
                    <Link
                      href="/admin"
                      className={`block px-3 py-2 text-base font-bold uppercase tracking-wide rounded-none border-2 transition-colors duration-150 flex items-center gap-2 ${
                        pathname?.startsWith('/admin')
                          ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white'
                          : 'text-gray-800 border-zinc-700 hover:bg-white dark:text-gray-200 dark:border-zinc-400 dark:hover:bg-gray-900'
                      }`}
                      onClick={closeMobileMenu}
                    >
                      <Shield className="h-4 w-4" />
                      <span>Admin</span>
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 text-base font-bold uppercase tracking-wide text-gray-800 border-2 border-zinc-700 hover:bg-white dark:text-gray-200 dark:border-zinc-400 dark:hover:bg-gray-900 rounded-none transition-colors duration-150 flex items-center gap-2"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </button>
                  </>
                )}
              </div>
              </div>
            </div>
          </nav>
        </>
      </div>
    </header>
  );
};

export { Header };
export type { HeaderProps };
