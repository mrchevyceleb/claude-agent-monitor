import { useEffect } from 'react'
import { useAgentStore } from '../stores/agentStore'

export function useAgents() {
  const { agents, isLoading, error, setAgents, updateAgent, updateTasks, setError } =
    useAgentStore()

  useEffect(() => {
    // Initial load
    async function loadAgents() {
      try {
        const agents = await window.electronAPI.getAgents()
        setAgents(agents)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load agents')
      }
    }

    loadAgents()

    // Subscribe to updates
    const unsubAgentsChanged = window.electronAPI.onAgentsChanged((agents) => {
      setAgents(agents)
    })

    const unsubAgentUpdated = window.electronAPI.onAgentUpdated((agent) => {
      updateAgent(agent)
    })

    const unsubTasksUpdated = window.electronAPI.onTasksUpdated((agentId, tasks) => {
      updateTasks(agentId, tasks)
    })

    return () => {
      unsubAgentsChanged()
      unsubAgentUpdated()
      unsubTasksUpdated()
    }
  }, [setAgents, updateAgent, updateTasks, setError])

  return { agents, isLoading, error }
}

export function useAgent(id: string | null) {
  const agent = useAgentStore((state) => (id ? state.getAgent(id) : undefined))
  return agent
}

export function useAgentActions() {
  const refresh = async () => {
    await window.electronAPI.refresh()
  }

  const stopAgent = async (id: string) => {
    await window.electronAPI.stopAgent(id)
  }

  const killAgent = async (id: string) => {
    await window.electronAPI.killAgent(id)
  }

  return { refresh, stopAgent, killAgent }
}
