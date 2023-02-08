import { useRouter } from "next/router";
import React from "react";
import useSWR from 'swr/immutable'

const fetcher = (...args) => fetch(...args).then(res => res.json())

const fallbackRuntimeConfig = {
  NEXT_PUBLIC_ENTRYPOINT: process.env.NEXT_PUBLIC_ENTRYPOINT || '',
  NEXT_PUBLIC_GENERANGERURL: process.env.NEXT_PUBLIC_GENERANGERURL || '',
}

const RuntimeConfigContext = React.createContext(fallbackRuntimeConfig)

export function RuntimeConfig({ children }) {
  const router = useRouter()
  const { data: runtimeConfig } = useSWR(() => router.isReady ? `${router.basePath}/api/runtimeConfig` : undefined, fetcher)
  return (
    <RuntimeConfigContext.Provider value={runtimeConfig || fallbackRuntimeConfig}>
      {children}
    </RuntimeConfigContext.Provider>
  )
}

export function useRuntimeConfig() {
  return React.useContext(RuntimeConfigContext)
}
