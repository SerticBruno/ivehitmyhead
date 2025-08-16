import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface HeaderProps {
  onSearch?: (query: string) => void;
  showSearch?: boolean;
}

const Header: React.FC<HeaderProps> = ({ onSearch, showSearch = true }) => {
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get('search') as string;
    onSearch?.(query);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:border-gray-800 dark:bg-gray-950/95">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2 cursor-pointer">
              <span className="text-xl font-bold">IVEHITMYHEAD</span>
            </Link>
          </div>

          {/* Search Bar */}
          {showSearch && (
            <div className="flex-1 max-w-md mx-4">
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

          {/* Navigation */}
          <nav className="flex items-center space-x-4">
            <Link href="/memes" className="cursor-pointer">
              <Button variant="ghost" size="sm">
                Memes
              </Button>
            </Link>
            <Link href="/trending" className="cursor-pointer">
              <Button variant="ghost" size="sm">
                Trending
              </Button>
            </Link>
            <Link href="/meme-generator" className="cursor-pointer">
              <Button variant="ghost" size="sm">
                Generator
              </Button>
            </Link>
            <Link href="/upload" className="cursor-pointer">
              <Button variant="ghost" size="sm">
                Upload
              </Button>
            </Link>
            <Link href="/about" className="cursor-pointer">
              <Button variant="ghost" size="sm">
                About
              </Button>
            </Link>
            <Link href="/profile" className="cursor-pointer">
              <Button variant="ghost" size="sm">
                  Profile
              </Button>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export { Header };
export type { HeaderProps }; 