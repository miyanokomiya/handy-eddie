import { useRef, useEffect, useCallback } from 'preact/hooks'

interface HorizontalScrollBarProps {
  scrollSensitivity: number
  onSendCommand: (action: ScrollAction) => void
}

interface ScrollAction {
  type: 'scroll'
  deltaX: number
  deltaY: number
}

export function HorizontalScrollBar({ scrollSensitivity, onSendCommand }: HorizontalScrollBarProps) {
  const scrollBarRef = useRef<HTMLDivElement>(null)
  const isScrollingRef = useRef(false)
  const scrollLastPosRef = useRef({ x: 0, y: 0 })

  const handleTouchStart = useCallback((e: TouchEvent) => {
    e.preventDefault()
    isScrollingRef.current = true
    const touch = e.touches[0]
    scrollLastPosRef.current = { x: touch.clientX, y: touch.clientY }
  }, [])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    e.preventDefault()
    if (!isScrollingRef.current) return

    const touch = e.touches[0]
    const deltaX = touch.clientX - scrollLastPosRef.current.x

    const scrollAmount = Math.round(deltaX * scrollSensitivity)

    if (Math.abs(scrollAmount) > 0) {
      onSendCommand({
        type: 'scroll',
        deltaX: scrollAmount,
        deltaY: 0
      })
    }

    scrollLastPosRef.current = { x: touch.clientX, y: touch.clientY }
  }, [scrollSensitivity, onSendCommand])

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    e.preventDefault()
    isScrollingRef.current = false
  }, [])

  useEffect(() => {
    const scrollBar = scrollBarRef.current
    if (scrollBar) {
      scrollBar.addEventListener('touchstart', handleTouchStart, { passive: false })
      scrollBar.addEventListener('touchmove', handleTouchMove, { passive: false })
      scrollBar.addEventListener('touchend', handleTouchEnd, { passive: false })

      return () => {
        scrollBar.removeEventListener('touchstart', handleTouchStart)
        scrollBar.removeEventListener('touchmove', handleTouchMove)
        scrollBar.removeEventListener('touchend', handleTouchEnd)
      }
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd])

  return (
    <div
      ref={scrollBarRef}
      className="h-16 bg-gray-600 rounded-lg flex items-center justify-center touch-none select-none active:bg-gray-500 mb-2"
    >
      <div className="text-gray-400 text-center pointer-events-none">
        <svg className="w-6 h-6 rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      </div>
    </div>
  )
}
