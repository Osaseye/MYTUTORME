// Timestamp when email verification enforcement went live (May 18, 2026 00:00:00 UTC).
// Users with createdAt before this date are treated as "legacy" — they get a soft
// dismissible banner on their Settings page instead of a hard block on protected routes.
export const LEGACY_CUTOFF_TS = 1747526400000;

// Safely converts any Firestore createdAt value (number, Timestamp, or undefined) to millis.
const toMillis = (createdAt: unknown): number => {
  if (!createdAt) return 0; // missing/falsy → treat as a very old account
  if (typeof createdAt === 'number') return createdAt;
  if (typeof (createdAt as any).toMillis === 'function') return (createdAt as any).toMillis();
  if (typeof (createdAt as any).seconds === 'number') return (createdAt as any).seconds * 1000;
  return 0;
};

export const isNewUser = (createdAt: unknown): boolean => toMillis(createdAt) >= LEGACY_CUTOFF_TS;

export const isLegacyUser = (createdAt: unknown): boolean => toMillis(createdAt) < LEGACY_CUTOFF_TS;
