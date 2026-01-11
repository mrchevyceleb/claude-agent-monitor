import { useEffect } from 'react'
import { AppLayout } from './components/layout/AppLayout'
import { useAgents } from './hooks/useAgents'
import { ErrorBoundary } from './components/common/ErrorBoundary'
import { Spinner } from './components/common/Spinner'

function AppContent() {
  const { isLoading, error } = useAgents()

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-bg-base">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-text-secondary">Loading agents...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-bg-base">
        <div className="text-center">
          <div className="text-status-error text-xl mb-2">Error</div>
          <p className="text-text-secondary">{error}</p>
        </div>
      </div>
    )
  }

  return <AppLayout />
}

export default function App() {
  return (
    <ErrorBoundary>
      <div className="h-full bg-bg-base text-text-primary">
        <AppContent />
      </div>
    </ErrorBoundary>
  )
}
