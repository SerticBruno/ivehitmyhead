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
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:border-gray-800 dark:bg-gray-950/95">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2 cursor-pointer" onClick={closeMobileMenu}>
              <span className="text-xl font-bold">IVEHITMYHEAD</span>
            </Link>
          </div>

          {/* Search Bar - Hidden on mobile when menu is open */}
          {showSearch && (
            <div className={`flex-1 max-w-md mx-4 ${isMobileMenuOpen ? 'hidden' : 'block'}`}>
              <form onSubmit={handleSearch} className="relative">
                <Input
                  name="search"
                  placeholder="Search memes..."
                  className="pr-10"
                />
                <Button
                  type="submit"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
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
                    className="flex items-center gap-1.5"
                  >
                    <Shield className="h-4 w-4" />
                    <span>Admin</span>
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleLogout}
                  className="flex items-center gap-1.5"
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
            className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-800"
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
            <div className="px-2 pt-2 pb-3 space-y-1 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950">
              {/* Mobile Search Bar */}
              {showSearch && (
                <div className="px-3 py-2">
                  <form onSubmit={handleSearch} className="relative">
                    <Input
                      name="search"
                      placeholder="Search memes..."
                      className="pr-10"
                    />
                    <Button
                      type="submit"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
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
                    className={`block px-3 py-2 text-base font-medium rounded-md transition-colors duration-150 ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-gray-800'
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
                    className={`block px-3 py-2 text-base font-medium rounded-md transition-colors duration-150 flex items-center gap-2 ${
                      pathname?.startsWith('/admin')
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-gray-800'
                    }`}
                    onClick={closeMobileMenu}
                  >
                    <Shield className="h-4 w-4" />
                    <span>Admin</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors duration-150 flex items-center gap-2"
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