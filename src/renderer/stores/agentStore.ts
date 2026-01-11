import { create } from 'zustand'

interface AgentStore {
  agents: AgentState[]
  isLoading: boolean
  error: string | null

  // Actions
  setAgents: (agents: AgentState[]) => void
  updateAgent: (agent: AgentState) => void
  updateTasks: (agentId: string, tasks: TodoItem[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void

  // Selectors
  getAgent: (id: string) => AgentState | undefined
  getRunningAgents: () => AgentState[]
  getIdleAgents: () => AgentState[]
  getErrorAgents: () => AgentState[]
}

export const useAgentStore = create<AgentStore>((set, get) => ({
  agents: [],
  isLoading: true,
  error: null,

  setAgents: (agents) => set({ agents, isLoading: false }),

  updateAgent: (updatedAgent) =>
    set((state) => ({
      agents: state.agents.map((agent) =>
        agent.id === updatedAgent.id ? updatedAgent : agent
      ),
    })),

  updateTasks: (agentId, tasks) =>
    set((state) => ({
      agents: state.agents.map((agent) =>
        agent.id === agentId
          ? {
              ...agent,
              tasks,
              taskProgress: {
                completed: tasks.filter((t) => t.status === 'completed').length,
                total: tasks.length,
              },
              status: tasks.some((t) => t.status === 'in_progress')
                ? 'running'
                : agent.status === 'running'
                ? 'idle'
                : agent.status,
            }
          : agent
      ),
    })),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error, isLoading: false }),

  getAgent: (id) => get().agents.find((a) => a.id === id),

  getRunningAgents: () => get().agents.filter((a) => a.status === 'running'),

  getIdleAgents: () => get().agents.filter((a) => a.status === 'idle'),

  getErrorAgents: () => get().agents.filter((a) => a.status === 'error'),
}))
