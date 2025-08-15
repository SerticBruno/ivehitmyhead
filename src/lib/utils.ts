import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generate a URL-friendly slug from a title
 * @param title - The title to convert to a slug
 * @returns A URL-friendly slug
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Generate a unique slug by appending a number if needed
 * @param title - The title to convert to a slug
 * @param existingSlugs - Array of existing slugs to check against
 * @returns A unique URL-friendly slug
 */
export function generateUniqueSlug(title: string, existingSlugs: string[]): string {
  let slug = generateSlug(title);
  let counter = 1;
  
  while (existingSlugs.includes(slug)) {
    slug = `${generateSlug(title)}-${counter}`;
    counter++;
  }
  
  return slug;
} 