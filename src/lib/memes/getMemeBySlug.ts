import { cache } from 'react';
import { fetchMemeBySlug } from './fetchMemeBySlug';

/** Dedupes meme fetches within a single request (e.g. metadata + page). */
export const getMemeBySlug = cache(fetchMemeBySlug);
