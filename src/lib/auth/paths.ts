export const UPDATE_PASSWORD_PATH = '/update-password';

export function updatePasswordRedirectUrl(origin: string): string {
  return `${origin}${UPDATE_PASSWORD_PATH}`;
}
