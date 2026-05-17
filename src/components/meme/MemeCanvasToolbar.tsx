'use client';

import React from 'react';
import { BookmarkPlus, Download, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Shared layout for every control — avoids fighting the shared Button size/variant styles. */
const TOOLBAR_BTN_BASE =
  'inline-flex h-10 min-h-10 w-full min-w-0 cursor-pointer items-center justify-center gap-1.5 rounded-none border-2 px-2.5 text-xs font-semibold leading-tight transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:gap-2 sm:px-3 md:text-sm';

const BTN_OUTLINE =
  'border-zinc-700 bg-white text-gray-800 dark:border-zinc-400 dark:bg-gray-900 dark:text-gray-200 [@media(hover:hover)]:hover:bg-[#f7f4ee] dark:[@media(hover:hover)]:hover:bg-gray-800';

const BTN_PRIMARY =
  'border-blue-700 bg-blue-600 text-white dark:border-blue-400 dark:bg-blue-500 [@media(hover:hover)]:hover:bg-blue-700 dark:[@media(hover:hover)]:hover:bg-blue-600';

const TOGGLE_ON =
  'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black';

interface ToolbarButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'outline' | 'primary' | 'toggle';
  pressed?: boolean;
}

function ToolbarButton({
  variant = 'outline',
  pressed = false,
  className,
  children,
  ...props
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        TOOLBAR_BTN_BASE,
        variant === 'primary' && BTN_PRIMARY,
        variant === 'toggle' && (pressed ? TOGGLE_ON : BTN_OUTLINE),
        variant === 'outline' && BTN_OUTLINE,
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export interface MemeCanvasToolbarProps {
  hasTemplate: boolean;
  addTopCaptionArea: boolean;
  addBottomCaptionArea: boolean;
  onTopCaptionAreaChange: (checked: boolean) => void;
  onBottomCaptionAreaChange: (checked: boolean) => void;
  canDelete: boolean;
  onAddText: () => void;
  onDeleteSelected: () => void;
  onDownload: () => void;
  onSaveToGallery: () => void;
  isSavingToGallery: boolean;
  savedToGallery: boolean;
  saveGalleryError: string | null;
}

export function MemeCanvasToolbar({
  hasTemplate,
  addTopCaptionArea,
  addBottomCaptionArea,
  onTopCaptionAreaChange,
  onBottomCaptionAreaChange,
  canDelete,
  onAddText,
  onDeleteSelected,
  onDownload,
  onSaveToGallery,
  isSavingToGallery,
  savedToGallery,
  saveGalleryError,
}: MemeCanvasToolbarProps) {
  const galleryShortLabel = isSavingToGallery
    ? 'Saving'
    : savedToGallery
      ? 'Saved'
      : 'Gallery';
  const galleryLongLabel = isSavingToGallery
    ? 'Saving…'
    : savedToGallery
      ? 'Saved'
      : 'Save to gallery';
  const galleryTitle =
    saveGalleryError ??
    (isSavingToGallery ? 'Saving…' : savedToGallery ? 'Saved to gallery' : 'Save to gallery');
  const disabled = !hasTemplate;

  return (
    <div
      role="toolbar"
      aria-label="Canvas tools"
      className="mt-1.5 grid shrink-0 grid-cols-2 gap-2 sm:grid-cols-3 md:mt-2 2xl:grid-cols-6"
    >
      <ToolbarButton
        variant="toggle"
        role="checkbox"
        aria-checked={addTopCaptionArea}
        title="White caption bar on top"
        disabled={disabled}
        pressed={addTopCaptionArea}
        onClick={() => onTopCaptionAreaChange(!addTopCaptionArea)}
      >
        Top bar
      </ToolbarButton>
      <ToolbarButton
        variant="toggle"
        role="checkbox"
        aria-checked={addBottomCaptionArea}
        title="White caption bar on bottom"
        disabled={disabled}
        pressed={addBottomCaptionArea}
        onClick={() => onBottomCaptionAreaChange(!addBottomCaptionArea)}
      >
        Bottom bar
      </ToolbarButton>
      <ToolbarButton
        variant="outline"
        disabled={disabled}
        onClick={onAddText}
      >
        <Plus className="h-4 w-4 shrink-0" aria-hidden />
        <span className="truncate">Add text</span>
      </ToolbarButton>
      <ToolbarButton
        variant="outline"
        disabled={!canDelete}
        onClick={onDeleteSelected}
      >
        <Trash2 className="h-4 w-4 shrink-0" aria-hidden />
        <span className="truncate">Delete</span>
      </ToolbarButton>
      <ToolbarButton
        variant="primary"
        disabled={disabled}
        onClick={onDownload}
      >
        <Download className="h-4 w-4 shrink-0" aria-hidden />
        <span className="truncate">Download</span>
      </ToolbarButton>
      <ToolbarButton
        variant="outline"
        disabled={disabled || isSavingToGallery}
        onClick={onSaveToGallery}
        title={galleryTitle}
        aria-label={galleryLongLabel}
      >
        <BookmarkPlus className="h-4 w-4 shrink-0" aria-hidden />
        <span className="truncate 2xl:hidden">{galleryShortLabel}</span>
        <span className="hidden truncate 2xl:inline">{galleryLongLabel}</span>
      </ToolbarButton>
    </div>
  );
}
