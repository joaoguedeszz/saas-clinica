"use client"

import { SWRConfig } from "swr"

const globalFetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) {
    const error = new Error("Erro ao carregar dados")
    throw error
  }
  return res.json()
}

export function SWRProvider({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        fetcher: globalFetcher,
        revalidateOnFocus: false,
        revalidateIfStale: false,
        dedupingInterval: 60000,
        keepPreviousData: true,
        revalidateOnReconnect: true,
      }}
    >
      {children}
    </SWRConfig>
  )
}
