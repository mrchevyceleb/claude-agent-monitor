import { useEffect, useRef, useCallback, useState } from 'react'
import { FixedSizeList as List, ListChildComponentProps } from 'react-window'
import { useLogs, useLogFilters } from '../../hooks/useLogs'
import { LogLine } from './LogLine'
import { LogToolbar } from './LogToolbar'
import { EmptyState } from '../common/EmptyState'
import { Spinner } from '../common/Spinner'
import { FileText } from 'lucide-react'

interface LogViewerProps {
  agentId: string
}

const ROW_HEIGHT = 20

export function LogViewer({ agentId }: LogViewerProps) {
  const { logs, isLoading } = useLogs(agentId)
  const { logLevel, setLogLevel, logSearch, setLogSearch, autoScroll, setAutoScroll } = useLogFilters()
  const listRef = useRef<List>(null)
  const isUserScrolling = useRef(false)

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (autoScroll && logs.length > 0 && !isUserScrolling.current) {
      listRef.current?.scrollToItem(logs.length - 1, 'end')
    }
  }, [logs.length, autoScroll])

  // Handle scroll events to detect user scrolling
  const handleScroll = useCallback(
    ({ scrollOffset, scrollUpdateWasRequested }: { scrollOffset: number; scrollUpdateWasRequested: boolean }) => {
      if (!scrollUpdateWasRequested) {
        // User is scrolling
        const listHeight = listRef.current?.props.height as number || 0
        const totalHeight = logs.length * ROW_HEIGHT
        const isAtBottom = scrollOffset + listHeight >= totalHeight - ROW_HEIGHT * 2

        if (isAtBottom) {
          isUserScrolling.current = false
        } else {
          isUserScrolling.current = true
        }
      }
    },
    [logs.length]
  )

  // Row renderer
  const Row = useCallback(
    ({ index, style }: ListChildComponentProps) => {
      const entry = logs[index]
      if (!entry) return null
      return <LogLine entry={entry} style={style} searchTerm={logSearch} />
    },
    [logs, logSearch]
  )

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <LogToolbar
        logLevel={logLevel}
        onLogLevelChange={(level) => setLogLevel(level as any)}
        searchTerm={logSearch}
        onSearchChange={setLogSearch}
        autoScroll={autoScroll}
        onAutoScrollChange={setAutoScroll}
        logCount={logs.length}
      />
      <div className="flex-1">
        {logs.length === 0 ? (
          <EmptyState
            icon={<FileText className="w-8 h-8" />}
            title="No logs"
            description={logSearch ? 'No logs match your search' : 'No log entries yet'}
            className="h-full"
          />
        ) : (
          <AutoSizer>
            {({ height, width }: { height: number; width: number }) => (
              <List
                ref={listRef}
                height={height}
                width={width}
                itemCount={logs.length}
                itemSize={ROW_HEIGHT}
                onScroll={handleScroll}
                overscanCount={20}
              >
                {Row}
              </List>
            )}
          </AutoSizer>
        )}
      </div>
    </div>
  )
}

// Simple AutoSizer implementation
function AutoSizer({ children }: { children: (size: { height: number; width: number }) => React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ height: 0, width: 0 })

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (entry) {
        setSize({
          height: entry.contentRect.height,
          width: entry.contentRect.width,
        })
      }
    })

    resizeObserver.observe(container)
    return () => resizeObserver.disconnect()
  }, [])

  return (
    <div ref={containerRef} className="h-full w-full">
      {size.height > 0 && size.width > 0 && children(size)}
    </div>
  )
}
