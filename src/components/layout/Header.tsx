'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Menu, X, LogOut, Shield } from 'lucide-react';
import { useAuth } from '@/lib/contexts/AuthContext';

interface HeaderProps {
  showSearch?: boolean;
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
              className="md:hidden relative z-[70] p-2 rounded-none border-2 border-zinc-700 dark:border-zinc-400 text-gray-700 hover:text-black hover:bg-white dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-900"
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-nav-panel"
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {isMobileMenuOpen ? (
          <>
            <button
              type="button"
              aria-label="Close menu"
              className="md:hidden fixed inset-0 top-16 z-[55] bg-black/25 dark:bg-black/40 border-0 cursor-pointer p-0 m-0 w-full"
              onClick={closeMobileMenu}
            />
            <nav
              id="mobile-nav-panel"
              className="md:hidden absolute left-0 right-0 top-full z-[65] max-h-[min(75dvh,calc(100dvh-4rem))] overflow-y-auto overscroll-contain border-t-2 border-zinc-700 dark:border-zinc-400 bg-[#f7f4ee] dark:bg-gray-950 shadow-[0_16px_40px_rgba(0,0,0,0.18)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.45)]"
              aria-label="Mobile navigation"
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
            </nav>
          </>
        ) : null}
      </div>
    </header>
  );
};

export { Header };
export type { HeaderProps };
