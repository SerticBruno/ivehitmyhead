export type AdminUserSummary = {
  id: string;
  email: string | null;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  joined_at: string;
  last_sign_in_at: string | null;
  is_admin: boolean;
  shares_count: number;
  views_count: number;
  comments_count: number;
  generated_memes_count: number;
  /** Likes stored under profile UUID (legacy); browser-session likes are not attributed here. */
  likes_count: number;
};
