import { useEffect, useCallback } from 'react'
import { useLogStore } from '../stores/logStore'
import { useUIStore } from '../stores/uiStore'

export function useLogs(agentId: string | null) {
  const { setLogs, appendLogs, setLoading } = useLogStore()
  const { logLevel, logSearch } = useUIStore()

  const logs = useLogStore((state) =>
    agentId ? state.getFilteredLogs(agentId, logLevel, logSearch) : []
  )

  const isLoading = useLogStore((state) =>
    agentId ? state.isLoading.get(agentId) ?? false : false
  )

  useEffect(() => {
    if (!agentId) return

    // Initial load
    async function loadLogs() {
      setLoading(agentId, true)
      try {
        const entries = await window.electronAPI.getLogs(agentId)
        setLogs(agentId, entries)
      } catch (err) {
        console.error('Failed to load logs:', err)
      } finally {
        setLoading(agentId, false)
      }
    }

    loadLogs()

    // Subscribe to new logs
    const unsub = window.electronAPI.onLogsAppended((id, entries) => {
      if (id === agentId) {
        appendLogs(agentId, entries)
      }
    })

    return () => {
      unsub()
    }
  }, [agentId, setLogs, appendLogs, setLoading])

  return { logs, isLoading }
}

export function useLogFilters() {
  const { logLevel, setLogLevel, logSearch, setLogSearch, autoScroll, setAutoScroll } =
    useUIStore()

  return {
    logLevel,
    setLogLevel,
    logSearch,
    setLogSearch,
    autoScroll,
    setAutoScroll,
  }
}
