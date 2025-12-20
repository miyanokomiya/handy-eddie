import { useRef, useEffect, useCallback } from 'preact/hooks'

interface VerticalScrollBarProps {
  scrollSensitivity: number
  onSendCommand: (action: ScrollAction) => void
}

interface ScrollAction {
  type: 'scroll'
  deltaX: number
  deltaY: number
}

export function VerticalScrollBar({ scrollSensitivity, onSendCommand }: VerticalScrollBarProps) {
  const scrollBarRef = useRef<HTMLDivElement>(null)
  const isScrollingRef = useRef(false)
  const scrollLastPosRef = useRef({ x: 0, y: 0 })

  const handleTouchStart = useCallback((e: TouchEvent) => {
    e.preventDefault()
    e.stopPropagation()
    isScrollingRef.current = true
    const touch = e.touches[0]
    scrollLastPosRef.current = { x: touch.clientX, y: touch.clientY }
  }, [])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isScrollingRef.current) return

    const touch = e.touches[0]
    const deltaY = touch.clientY - scrollLastPosRef.current.y

    const scrollAmount = Math.round(deltaY * scrollSensitivity)

    if (Math.abs(scrollAmount) > 0) {
      onSendCommand({
        type: 'scroll',
        deltaX: 0,
        deltaY: scrollAmount
      })
    }

    scrollLastPosRef.current = { x: touch.clientX, y: touch.clientY }
  }, [scrollSensitivity, onSendCommand])

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    e.preventDefault()
    e.stopPropagation()
    isScrollingRef.current = false
  }, [])

  useEffect(() => {
    const scrollBar = scrollBarRef.current
    if (scrollBar) {
      scrollBar.addEventListener('touchstart', handleTouchStart, { passive: false })
      scrollBar.addEventListener('touchmove', handleTouchMove, { passive: false })
      scrollBar.addEventListener('touchend', handleTouchEnd, { passive: false })
      scrollBar.addEventListener('touchcancel', handleTouchEnd, { passive: false })

      return () => {
        scrollBar.removeEventListener('touchstart', handleTouchStart)
        scrollBar.removeEventListener('touchmove', handleTouchMove)
        scrollBar.removeEventListener('touchend', handleTouchEnd)
        scrollBar.removeEventListener('touchcancel', handleTouchEnd)
      }
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd])

  return (
    <div
      ref={scrollBarRef}
      className="w-16 bg-gray-600 rounded-lg flex items-center justify-center touch-none select-none active:bg-gray-500"
    >
      <div className="text-gray-400 text-center pointer-events-none">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      </div>
    </div>
  )
}
