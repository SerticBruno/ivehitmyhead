/** Paths that require an admin account (prefix match). */
export function isAdminOnlyPath(path: string): boolean {
  const normalized = path.split('?')[0]?.split('#')[0] ?? path;
  return normalized === '/admin' || normalized.startsWith('/admin/');
}

/** Post-login destination: non-admins cannot be sent to admin routes. */
export function resolvePostLoginPath(next: string, isAdmin: boolean): string {
  if (!isAdmin && isAdminOnlyPath(next)) {
    return '/';
  }
  return next;
}
