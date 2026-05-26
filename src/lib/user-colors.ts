/*
 * Per-user accent colors — stable per user.id, warm palette.
 * Returns Tailwind class fragments + a hex/oklch string for inline styles.
 *
 * Family convention (current): admin = orange, others rotate violet/green/sky/rose.
 * If a user is in `allProfiles`, their slot index drives the choice.
 */

import type { Profile } from '@/types/auth'

type AccentSlot = 1 | 2 | 3 | 4 | 5

interface UserAccent {
  slot: AccentSlot
  /** CSS variable name set in index.css (e.g. `--color-user-1`) */
  cssVar: string
  /** Tailwind utility-friendly bg class for the dot */
  dotClass: string
  /** Tailwind utility for the left border on entry cards */
  borderClass: string
  /** Soft tint background (for badges) */
  softBgClass: string
}

const SLOTS: Record<AccentSlot, UserAccent> = {
  1: { slot: 1, cssVar: '--color-user-1', dotClass: 'bg-[var(--color-user-1)]', borderClass: 'border-l-[var(--color-user-1)]', softBgClass: 'bg-[color-mix(in_oklch,var(--color-user-1)_15%,transparent)]' },
  2: { slot: 2, cssVar: '--color-user-2', dotClass: 'bg-[var(--color-user-2)]', borderClass: 'border-l-[var(--color-user-2)]', softBgClass: 'bg-[color-mix(in_oklch,var(--color-user-2)_15%,transparent)]' },
  3: { slot: 3, cssVar: '--color-user-3', dotClass: 'bg-[var(--color-user-3)]', borderClass: 'border-l-[var(--color-user-3)]', softBgClass: 'bg-[color-mix(in_oklch,var(--color-user-3)_15%,transparent)]' },
  4: { slot: 4, cssVar: '--color-user-4', dotClass: 'bg-[var(--color-user-4)]', borderClass: 'border-l-[var(--color-user-4)]', softBgClass: 'bg-[color-mix(in_oklch,var(--color-user-4)_15%,transparent)]' },
  5: { slot: 5, cssVar: '--color-user-5', dotClass: 'bg-[var(--color-user-5)]', borderClass: 'border-l-[var(--color-user-5)]', softBgClass: 'bg-[color-mix(in_oklch,var(--color-user-5)_15%,transparent)]' },
}

export function getUserAccent(userId: string | null | undefined, allProfiles: Profile[]): UserAccent {
  if (!userId) return SLOTS[4]
  // Admin always gets slot 1 (orange) for consistency
  const admin = allProfiles.find((p) => p.role === 'admin')
  if (admin && admin.id === userId) return SLOTS[1]

  // Non-admins: stable slot based on creation order (excluding admin)
  const nonAdmins = allProfiles
    .filter((p) => p.role !== 'admin')
    .sort((a, b) => a.created_at.localeCompare(b.created_at))
  const idx = nonAdmins.findIndex((p) => p.id === userId)
  if (idx === -1) return SLOTS[4]
  return SLOTS[(((idx % 4) + 2) as AccentSlot)] // slots 2,3,4,5 rotation
}
