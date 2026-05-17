'use client';

import React, { useState } from 'react';
import { Input, type InputProps } from '@/components/ui/Input';
import { ICONS } from '@/lib/utils/categoryIcons';
import { cn } from '@/lib/utils';

type PasswordInputProps = Omit<InputProps, 'type'>;

export function PasswordInput({ className, label, id, ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative w-full">
      <Input
        id={id}
        label={label}
        type={visible ? 'text' : 'password'}
        className={cn('pr-10', className)}
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((value) => !value)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        aria-pressed={visible}
        className="absolute right-0 bottom-0 flex h-10 items-center px-3 cursor-pointer text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
      >
        {visible ? (
          <ICONS.EyeOff className="w-5 h-5" aria-hidden />
        ) : (
          <ICONS.Eye className="w-5 h-5" aria-hidden />
        )}
      </button>
    </div>
  );
}
