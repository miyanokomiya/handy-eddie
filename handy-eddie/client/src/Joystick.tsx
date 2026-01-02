import { useRef, useEffect, useCallback, useState } from 'preact/hooks'

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
  const baseRef = useRef<HTMLDivElement>(null)
  const isDraggingRef = useRef(false)
  const activeTouchIdRef = useRef<number | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const currentOffsetRef = useRef({ x: 0, y: 0 })
  const centerPositionRef = useRef({ x: 0, y: 0 })
  const maxDistanceRef = useRef(0)
  const [isActive, setIsActive] = useState(false)

  const updateMouseMovement = useCallback(() => {
    if (!isDraggingRef.current) return

    const { x, y } = currentOffsetRef.current
    const distance = Math.sqrt(x * x + y * y)
    const maxDistance = maxDistanceRef.current

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
    if (!stickRef.current) return

    const offsetX = clientX - centerPositionRef.current.x
    const offsetY = clientY - centerPositionRef.current.y

    const distance = Math.sqrt(offsetX * offsetX + offsetY * offsetY)
    const maxDistance = maxDistanceRef.current

    let finalX = offsetX
    let finalY = offsetY

    if (distance > maxDistance) {
      const angle = Math.atan2(offsetY, offsetX)
      finalX = Math.cos(angle) * maxDistance
      finalY = Math.sin(angle) * maxDistance
    }

    currentOffsetRef.current = { x: finalX, y: finalY }
    stickRef.current.style.transform = `translate(calc(-50% + ${finalX}px), calc(-50% + ${finalY}px))`
  }, [])

  const positionJoystick = useCallback((clientX: number, clientY: number) => {
    if (!containerRef.current || !baseRef.current) return

    const containerRect = containerRef.current.getBoundingClientRect()
    
    // Calculate the joystick center position relative to the container
    let centerX = clientX - containerRect.left
    let centerY = clientY - containerRect.top

    // Clamp the joystick center to stay within container bounds (with some padding)
    const baseRadius = 96 // 192px / 2 (w-48)
    const padding = baseRadius + 10
    centerX = Math.max(padding, Math.min(containerRect.width - padding, centerX))
    centerY = Math.max(padding, Math.min(containerRect.height - padding, centerY))

    // Store the actual center position in screen coordinates
    centerPositionRef.current = { 
      x: centerX + containerRect.left, 
      y: centerY + containerRect.top 
    }
    
    // Position the base circle at the touch location
    baseRef.current.style.left = `${centerX}px`
    baseRef.current.style.top = `${centerY}px`
    
    // Position the stick at the same location initially
    if (stickRef.current) {
      stickRef.current.style.left = `${centerX}px`
      stickRef.current.style.top = `${centerY}px`
      stickRef.current.style.transform = 'translate(-50%, -50%)'
    }
    
    currentOffsetRef.current = { x: 0, y: 0 }
  }, [])

  const resetStick = useCallback(() => {
    setIsActive(false)
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
    
    // Set joystick center at touch location
    positionJoystick(touch.clientX, touch.clientY)
    setIsActive(true)
    
    // Calculate max distance (base radius - stick radius)
    maxDistanceRef.current = 96 - 40 // (192px/2 - 80px/2)
    
    if (!animationFrameRef.current) {
      animationFrameRef.current = requestAnimationFrame(updateMouseMovement)
    }
  }, [connected, positionJoystick, updateMouseMovement])

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
      positionJoystick(newTouch.clientX, newTouch.clientY)
      return
    }

    isDraggingRef.current = false
    activeTouchIdRef.current = null
    resetStick()
  }, [positionJoystick, resetStick])

  const handleMouseDown = useCallback((e: MouseEvent) => {
    if (!connected) return
    e.preventDefault()

    isDraggingRef.current = true
    
    // Set joystick center at mouse location
    positionJoystick(e.clientX, e.clientY)
    setIsActive(true)
    
    // Calculate max distance
    maxDistanceRef.current = 96 - 40
    
    if (!animationFrameRef.current) {
      animationFrameRef.current = requestAnimationFrame(updateMouseMovement)
    }
  }, [connected, positionJoystick, updateMouseMovement])

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
      <div
        ref={baseRef}
        className={`absolute w-48 h-48 rounded-full bg-gray-700 border-4 border-gray-600 transition-opacity duration-200 ${
          isActive ? 'opacity-80' : 'opacity-0'
        }`}
        style={{ 
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none'
        }}
      />
      
      {/* Stick */}
      <div
        ref={stickRef}
        className={`absolute w-20 h-20 rounded-full bg-blue-600 border-4 border-blue-500 shadow-lg transition-opacity duration-200 ${
          isActive ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ 
          willChange: 'transform',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none'
        }}
      />
      
      {/* Instruction text when not active */}
      {!isActive && (
        <div className="text-gray-400 text-center pointer-events-none">
          <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
          </svg>
          <p className="text-lg">Touch anywhere to create joystick</p>
          <p className="text-lg mt-1">Drag to move cursor</p>
        </div>
      )}
    </div>
  )
}
