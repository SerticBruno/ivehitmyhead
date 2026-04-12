/**
 * Patrons engraved on the site “forever” - edit this list as people support the project.
 * Keep names exactly as patrons want them shown (or use first name + initial).
 */
export type HallOfFamePatron = {
  name: string;
  /** Shown in small type next to the name, e.g. a parenthetical shout-out */
  note?: string;
  /** Shown in small type, e.g. "2024" */
  since?: string;
  /** Listed first, above everyone else (order among pinned = array order). */
  pinned?: boolean;
};

export const PATREON_HALL_OF_FAME: HallOfFamePatron[] = [
  // Number-one supporter (still not sure what this site is, but she believes in you)
  {
    name: 'Mom and Dad',
    pinned: true,
    note: '(even if they have no clue what do I do, thanks <3)',
  },
  // Example:
  // { name: 'Alex M.', since: '2025' },
];
