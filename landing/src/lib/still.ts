/**
 * "Still" mode — disables perpetual animation (auto-carousels, looping floats).
 * Enabled via `?still` in the URL, or when the visitor prefers reduced motion.
 * Used for snapshots, previews, and accessibility.
 */
export const STILL =
  typeof window !== 'undefined' &&
  (new URLSearchParams(window.location.search).has('still') ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches);
