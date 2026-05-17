/** True while signing out from /budasevo* so route guards skip the login redirect. */
let budasevoSignOutInProgress = false;

export function markBudasevoSignOutInProgress(): void {
  budasevoSignOutInProgress = true;
}

export function isBudasevoSignOutInProgress(): boolean {
  return budasevoSignOutInProgress;
}
