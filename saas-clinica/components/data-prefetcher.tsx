"use client"

import useSWR from "swr"

/**
 * Silently prefetch shared data that's used across multiple pages.
 * This warms the SWR cache on first mount so navigating between pages is instant.
 */
export function DataPrefetcher() {
  useSWR("/api/profissionais")
  useSWR("/api/pacientes")
  return null
}
