'use client';

import React, { useState } from 'react';
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
  
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get('search') as string;
    if (query.trim()) {
      // Navigate to memes page with search query
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
    <header className="sticky top-0 z-50 w-full border-b-2 border-black dark:border-white bg-[#f7f4ee] dark:bg-gray-950">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2 cursor-pointer" onClick={closeMobileMenu}>
              <span className="text-xl font-black uppercase tracking-tight">IVEHITMYHEAD</span>
            </Link>
          </div>

          {/* Search Bar - Hidden on mobile when menu is open */}
          {showSearch && (
            <div className={`flex-1 max-w-md mx-4 ${isMobileMenuOpen ? 'hidden' : 'block'}`}>
              <form onSubmit={handleSearch} className="relative">
                <Input
                  name="search"
                  placeholder="Search the archive..."
                  className="pr-10 rounded-none border-2 border-black dark:border-white bg-white dark:bg-gray-900"
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

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
              return (
                <Link key={item.href} href={item.href} className="cursor-pointer">
                  <Button
                    variant={isActive ? "primary" : "ghost"}
                    size="sm"
                    className={`rounded-none border-2 uppercase tracking-wide font-bold ${isActive ? 'border-black dark:border-white' : 'border-transparent'}`}
                  >
                    {item.label}
                  </Button>
                </Link>
              );
            })}
            
            {/* Admin Indicator and Logout */}
            {user && isAdmin && (
              <>
                <Link href="/admin" className="cursor-pointer">
                  <Button
                    variant={pathname?.startsWith('/admin') ? "primary" : "ghost"}
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

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 rounded-none border-2 border-black dark:border-white text-gray-700 hover:text-black hover:bg-white dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-900"
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 border-t-2 border-black dark:border-white bg-[#f7f4ee] dark:bg-gray-950">
              {/* Mobile Search Bar */}
              {showSearch && (
                <div className="px-3 py-2">
                  <form onSubmit={handleSearch} className="relative">
                    <Input
                      name="search"
                      placeholder="Search the archive..."
                      className="pr-10 rounded-none border-2 border-black dark:border-white bg-white dark:bg-gray-900"
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
              
              {/* Mobile Navigation Items */}
              {navigationItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`block px-3 py-2 text-base font-bold uppercase tracking-wide rounded-none border-2 transition-colors duration-150 ${
                      isActive
                        ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white'
                        : 'text-gray-800 border-black hover:bg-white dark:text-gray-200 dark:border-white dark:hover:bg-gray-900'
                    }`}
                    onClick={closeMobileMenu}
                  >
                    {item.label}
                  </Link>
                );
              })}
              
              {/* Mobile Admin Indicator and Logout */}
              {user && isAdmin && (
                <>
                  <Link
                    href="/admin"
                    className={`block px-3 py-2 text-base font-bold uppercase tracking-wide rounded-none border-2 transition-colors duration-150 flex items-center gap-2 ${
                      pathname?.startsWith('/admin')
                        ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white'
                        : 'text-gray-800 border-black hover:bg-white dark:text-gray-200 dark:border-white dark:hover:bg-gray-900'
                    }`}
                    onClick={closeMobileMenu}
                  >
                    <Shield className="h-4 w-4" />
                    <span>Admin</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-base font-bold uppercase tracking-wide text-gray-800 border-2 border-black hover:bg-white dark:text-gray-200 dark:border-white dark:hover:bg-gray-900 rounded-none transition-colors duration-150 flex items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export { Header };
export type { HeaderProps }; 