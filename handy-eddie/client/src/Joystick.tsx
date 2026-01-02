import { useRef, useEffect, useCallback } from 'preact/hooks'

interface JoystickProps {
  connected: boolean
  mouseSensitivity: number
  onSendCommand: (action: MouseAction) => void
}

interface MouseAction {
  type: 'move' | 'click' | 'scroll' | 'system' | 'mousedown' | 'mouseup'
  x?: number
  y?: number
  button?: 'left' | 'right' | 'middle' | 'back' | 'forward'
  deltaX?: number
  deltaY?: number
  command?: string
}

export function Joystick({ connected, mouseSensitivity, onSendCommand }: JoystickProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const stickRef = useRef<HTMLDivElement>(null)
  const isDraggingRef = useRef(false)
  const activeTouchIdRef = useRef<number | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const currentOffsetRef = useRef({ x: 0, y: 0 })
  const baseRadiusRef = useRef(0)
  const stickRadiusRef = useRef(0)

  const updateMouseMovement = useCallback(() => {
    if (!isDraggingRef.current) return

    const { x, y } = currentOffsetRef.current
    const distance = Math.sqrt(x * x + y * y)
    const maxDistance = baseRadiusRef.current - stickRadiusRef.current

    if (distance > 0) {
      // Normalize and scale the movement based on distance from center
      const intensity = Math.min(distance / maxDistance, 1)
      
      // Apply exponential scaling for more precise control near center
      const scaledIntensity = Math.pow(intensity, 1.5)
      
      // Base speed multiplier - adjust this to control overall joystick speed
      const baseSpeed = 15
      const moveX = Math.round((x / distance) * scaledIntensity * baseSpeed * mouseSensitivity)
      const moveY = Math.round((y / distance) * scaledIntensity * baseSpeed * mouseSensitivity)

      if (Math.abs(moveX) > 0 || Math.abs(moveY) > 0) {
        onSendCommand({
          type: 'move',
          x: moveX,
          y: moveY
        })
      }
    }

    animationFrameRef.current = requestAnimationFrame(updateMouseMovement)
  }, [mouseSensitivity, onSendCommand])

  const updateStickPosition = useCallback((clientX: number, clientY: number) => {
    if (!containerRef.current || !stickRef.current) return

    const containerRect = containerRef.current.getBoundingClientRect()
    const centerX = containerRect.width / 2
    const centerY = containerRect.height / 2

    const offsetX = clientX - containerRect.left - centerX
    const offsetY = clientY - containerRect.top - centerY

    const distance = Math.sqrt(offsetX * offsetX + offsetY * offsetY)
    const maxDistance = baseRadiusRef.current - stickRadiusRef.current

    let finalX = offsetX
    let finalY = offsetY

    if (distance > maxDistance) {
      const angle = Math.atan2(offsetY, offsetX)
      finalX = Math.cos(angle) * maxDistance
      finalY = Math.sin(angle) * maxDistance
    }

    currentOffsetRef.current = { x: finalX, y: finalY }
    stickRef.current.style.transform = `translate(${finalX}px, ${finalY}px)`
  }, [])

  const resetStick = useCallback(() => {
    if (stickRef.current) {
      stickRef.current.style.transform = 'translate(0, 0)'
    }
    currentOffsetRef.current = { x: 0, y: 0 }
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
  }, [])

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!connected) return
    e.preventDefault()

    const touch = e.touches[e.touches.length - 1]
    activeTouchIdRef.current = touch.identifier
    isDraggingRef.current = true

    updateStickPosition(touch.clientX, touch.clientY)
    
    if (!animationFrameRef.current) {
      animationFrameRef.current = requestAnimationFrame(updateMouseMovement)
    }
  }, [connected, updateStickPosition, updateMouseMovement])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDraggingRef.current || activeTouchIdRef.current === null) return
    e.preventDefault()

    let trackedTouch: Touch | null = null
    for (let i = 0; i < e.touches.length; i++) {
      if (e.touches[i].identifier === activeTouchIdRef.current) {
        trackedTouch = e.touches[i]
        break
      }
    }

    if (trackedTouch) {
      updateStickPosition(trackedTouch.clientX, trackedTouch.clientY)
    }
  }, [updateStickPosition])

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    e.preventDefault()

    let trackedTouchStillActive = false
    if (activeTouchIdRef.current !== null) {
      for (let i = 0; i < e.touches.length; i++) {
        if (e.touches[i].identifier === activeTouchIdRef.current) {
          trackedTouchStillActive = true
          break
        }
      }
    }

    if (e.touches.length > 0 && trackedTouchStillActive) {
      return
    }

    if (e.touches.length > 0) {
      const newTouch = e.touches[e.touches.length - 1]
      activeTouchIdRef.current = newTouch.identifier
      updateStickPosition(newTouch.clientX, newTouch.clientY)
      return
    }

    isDraggingRef.current = false
    activeTouchIdRef.current = null
    resetStick()
  }, [updateStickPosition, resetStick])

  const handleMouseDown = useCallback((e: MouseEvent) => {
    if (!connected) return
    e.preventDefault()

    isDraggingRef.current = true
    updateStickPosition(e.clientX, e.clientY)

    if (!animationFrameRef.current) {
      animationFrameRef.current = requestAnimationFrame(updateMouseMovement)
    }
  }, [connected, updateStickPosition, updateMouseMovement])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDraggingRef.current) return
    e.preventDefault()

    updateStickPosition(e.clientX, e.clientY)
  }, [updateStickPosition])

  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false
    resetStick()
  }, [resetStick])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Calculate dimensions
    const containerRect = container.getBoundingClientRect()
    baseRadiusRef.current = Math.min(containerRect.width, containerRect.height) / 2
    stickRadiusRef.current = 40

    container.addEventListener('touchstart', handleTouchStart, { passive: false })
    container.addEventListener('touchmove', handleTouchMove, { passive: false })
    container.addEventListener('touchend', handleTouchEnd, { passive: false })
    container.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchmove', handleTouchMove)
      container.removeEventListener('touchend', handleTouchEnd)
      container.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [connected, handleTouchStart, handleTouchMove, handleTouchEnd, handleMouseDown, handleMouseMove, handleMouseUp])

  return (
    <div
      ref={containerRef}
      className="relative flex items-center justify-center touch-none select-none"
      style={{ width: '100%', height: '100%' }}
    >
      {/* Base circle */}
      <div className="absolute w-48 h-48 rounded-full bg-gray-700 border-4 border-gray-600 opacity-80" />
      
      {/* Stick */}
      <div
        ref={stickRef}
        className="absolute w-20 h-20 rounded-full bg-blue-600 border-4 border-blue-500 shadow-lg transition-none"
        style={{ willChange: 'transform' }}
      />
      
      {/* Center indicator */}
      <div className="absolute w-2 h-2 rounded-full bg-gray-400" />
    </div>
  )
}
