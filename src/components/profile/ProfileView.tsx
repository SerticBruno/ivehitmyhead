'use client';

import React, { useState } from 'react';
import type { GeneratedMeme, Meme } from '@/lib/types/meme';
import { ProfileTabs } from '@/components/profile/ProfileTabs';
import { ProfileAccountSettings } from '@/components/profile/ProfileAccountSettings';

type ProfileSectionId = 'memes' | 'settings';

const SECTION_CONFIG: Array<{ id: ProfileSectionId; label: string }> = [
  { id: 'memes', label: 'Your memes' },
  { id: 'settings', label: 'Account settings' },
];

interface ProfileViewProps {
  userEmail: string;
  likedMemes: Meme[];
  sharedMemes: Meme[];
  generatedMemes: GeneratedMeme[];
}

export function ProfileView({
  userEmail,
  likedMemes,
  sharedMemes,
  generatedMemes,
}: ProfileViewProps) {
  const [activeSection, setActiveSection] = useState<ProfileSectionId>('memes');

  return (
    <div className="space-y-4">
      <nav className="flex flex-wrap gap-2" aria-label="Profile sections">
        {SECTION_CONFIG.map((section) => {
          const isActive = activeSection === section.id;
          return (
            <button
              key={section.id}
              type="button"
              onClick={() => setActiveSection(section.id)}
              className={`inline-flex h-11 cursor-pointer items-center justify-center px-4 border-2 rounded-none uppercase tracking-wide font-black text-sm leading-none transition-colors ${
                isActive
                  ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white'
                  : 'bg-white text-gray-800 border-zinc-700 hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-200 dark:border-zinc-400 dark:hover:bg-gray-800'
              }`}
            >
              {section.label}
            </button>
          );
        })}
      </nav>

      {activeSection === 'memes' ? (
        <ProfileTabs
          likedMemes={likedMemes}
          sharedMemes={sharedMemes}
          generatedMemes={generatedMemes}
        />
      ) : (
        <ProfileAccountSettings userEmail={userEmail} />
      )}
    </div>
  );
}
