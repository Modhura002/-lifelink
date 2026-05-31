/**
 * Returns true if the given email belongs to a demo/seeded account.
 * Demo accounts keep their mock data; all other users see real DB data.
 * No DB schema change required — purely email-based.
 */
const DEMO_EMAILS = new Set([
  'patient@lifelink.com',
  'driver@lifelink.com',
  'hospital@lifelink.com',
  'admin@lifelink.com',
]);

export function isDemoUser(email?: string | null): boolean {
  if (!email) return false;
  return DEMO_EMAILS.has(email.toLowerCase());
}
