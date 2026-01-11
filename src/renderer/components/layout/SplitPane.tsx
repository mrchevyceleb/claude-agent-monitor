import { useRef, useCallback, useState, useEffect } from 'react'
import { cn } from '../../utils/cn'

interface SplitPaneProps {
  left: React.ReactNode
  right: React.ReactNode
  defaultLeftWidth?: number
  minLeftWidth?: number
  maxLeftWidth?: number
  onWidthChange?: (width: number) => void
}

export function SplitPane({
  left,
  right,
  defaultLeftWidth = 280,
  minLeftWidth = 200,
  maxLeftWidth = 400,
  onWidthChange,
}: SplitPaneProps) {
  const [leftWidth, setLeftWidth] = useState(defaultLeftWidth)
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return

      const containerRect = containerRef.current.getBoundingClientRect()
      const newWidth = e.clientX - containerRect.left

      const clampedWidth = Math.max(minLeftWidth, Math.min(maxLeftWidth, newWidth))
      setLeftWidth(clampedWidth)
      onWidthChange?.(clampedWidth)
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, minLeftWidth, maxLeftWidth, onWidthChange])

  return (
    <div ref={containerRef} className="flex h-full overflow-hidden">
      {/* Left panel */}
      <div
        className="flex-shrink-0 overflow-hidden"
        style={{ width: leftWidth }}
      >
        {left}
      </div>

      {/* Resize handle */}
      <div
        className={cn(
          'w-1 flex-shrink-0 cursor-col-resize bg-border hover:bg-accent transition-colors',
          isDragging && 'bg-accent'
        )}
        onMouseDown={handleMouseDown}
      />

      {/* Right panel */}
      <div className="flex-1 overflow-hidden">
        {right}
      </div>

      {/* Overlay when dragging to prevent iframe issues */}
      {isDragging && (
        <div className="fixed inset-0 z-50 cursor-col-resize" />
      )}
    </div>
  )
}
