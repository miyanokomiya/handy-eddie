import { useRef, useEffect, useState, useCallback } from 'preact/hooks'

interface TouchpadProps {
  connected: boolean
  hasAttemptedConnection: boolean
  isReconnecting: boolean
  mouseSensitivity: number
  heldButton: 'left' | 'right' | 'middle' | null
  onSendCommand: (action: MouseAction) => void
  onReconnect: () => void
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

export function Touchpad({
  connected,
  hasAttemptedConnection,
  isReconnecting,
  mouseSensitivity,
  heldButton,
  onSendCommand,
  onReconnect
}: TouchpadProps) {
  const touchpadRef = useRef<HTMLDivElement>(null)
  const [pointerLocked, setPointerLocked] = useState(false)
  const isDraggingRef = useRef(false)
  const lastPosRef = useRef({ x: 0, y: 0 })
  const touchStartTimeRef = useRef(0)
  const touchStartPosRef = useRef({ x: 0, y: 0 })
  const hasMoved = useRef(false)
  const isMouseButtonDownRef = useRef(false)
  const activeTouchIdRef = useRef<number | null>(null)

  const handleTouchStart = useCallback((e: TouchEvent) => {
    e.preventDefault()
    
    // Get the first touch on the touchpad (or the latest if multi-touch)
    const touch = e.touches[e.touches.length - 1]
    
    // Store the touch identifier for tracking this specific touch
    activeTouchIdRef.current = touch.identifier
    
    isDraggingRef.current = true
    hasMoved.current = false
    lastPosRef.current = { x: touch.clientX, y: touch.clientY }
    
    // Only set timing for click detection if no button is held
    if (!heldButton) {
      touchStartTimeRef.current = Date.now()
      touchStartPosRef.current = { x: touch.clientX, y: touch.clientY }
    }
  }, [heldButton])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    e.preventDefault()
    if (!isDraggingRef.current || activeTouchIdRef.current === null) return

    // Find the specific touch we're tracking by ID
    let trackedTouch: Touch | null = null
    for (let i = 0; i < e.touches.length; i++) {
      if (e.touches[i].identifier === activeTouchIdRef.current) {
        trackedTouch = e.touches[i]
        break
      }
    }
    
    if (!trackedTouch) return
    
    let deltaX = trackedTouch.clientX - lastPosRef.current.x
    let deltaY = trackedTouch.clientY - lastPosRef.current.y

    const timeSinceTouchStart = Date.now() - touchStartTimeRef.current
    if (timeSinceTouchStart < 100 && !heldButton) {
      const maxInitialDelta = 2
      deltaX = Math.max(-maxInitialDelta, Math.min(maxInitialDelta, deltaX))
      deltaY = Math.max(-maxInitialDelta, Math.min(maxInitialDelta, deltaY))
    }

    const moveX = Math.round(deltaX * mouseSensitivity)
    const moveY = Math.round(deltaY * mouseSensitivity)

    if (Math.abs(moveX) > 0 || Math.abs(moveY) > 0) {
      onSendCommand({
        type: 'move',
        x: moveX,
        y: moveY
      })
    }

    const totalDelta = Math.abs(deltaX) + Math.abs(deltaY)
    if (totalDelta > 5) {
      hasMoved.current = true
    }

    lastPosRef.current = { x: trackedTouch.clientX, y: trackedTouch.clientY }
  }, [mouseSensitivity, heldButton, onSendCommand])

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    e.preventDefault()
    
    // Check if our tracked touch was released
    let trackedTouchStillActive = false
    if (activeTouchIdRef.current !== null) {
      for (let i = 0; i < e.touches.length; i++) {
        if (e.touches[i].identifier === activeTouchIdRef.current) {
          trackedTouchStillActive = true
          break
        }
      }
    }
    
    // If there are still touches remaining and our tracked touch is still active, continue
    if (e.touches.length > 0 && trackedTouchStillActive) {
      return
    }
    
    // If our tracked touch ended but others remain, pick up a new one
    if (e.touches.length > 0) {
      const newTouch = e.touches[e.touches.length - 1]
      activeTouchIdRef.current = newTouch.identifier
      lastPosRef.current = { x: newTouch.clientX, y: newTouch.clientY }
      return
    }
    
    // No more touches - end dragging
    isDraggingRef.current = false
    activeTouchIdRef.current = null

    // Only trigger click if no button is held
    if (!heldButton) {
      const touchDuration = Date.now() - touchStartTimeRef.current
      const touch = e.changedTouches[0]
      const deltaX = Math.abs(touch.clientX - touchStartPosRef.current.x)
      const deltaY = Math.abs(touch.clientY - touchStartPosRef.current.y)
      const totalMovement = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

      if (touchDuration < 300 && totalMovement < 15 && !hasMoved.current) {
        onSendCommand({ type: 'click', button: 'left' })
      }
    }
  }, [heldButton, onSendCommand])

  const handleMouseClick = useCallback(() => {
    if (!pointerLocked && touchpadRef.current) {
      touchpadRef.current.requestPointerLock()
    }
  }, [pointerLocked])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!document.pointerLockElement) return

    const moveX = Math.round(e.movementX * mouseSensitivity)
    const moveY = Math.round(e.movementY * mouseSensitivity)

    if (Math.abs(moveX) > 0 || Math.abs(moveY) > 0) {
      onSendCommand({
        type: 'move',
        x: moveX,
        y: moveY
      })
    }
  }, [mouseSensitivity, onSendCommand])

  const handleMouseDown = useCallback((e: MouseEvent) => {
    if (!document.pointerLockElement) return

    e.preventDefault()
    let button: 'left' | 'right' | 'middle'

    switch (e.button) {
      case 0:
        button = 'left'
        break
      case 1:
        button = 'middle'
        break
      case 2:
        button = 'right'
        break
      default:
        return
    }

    isMouseButtonDownRef.current = true
    onSendCommand({ type: 'mousedown', button })
  }, [onSendCommand])

  const handleMouseUp = useCallback((e: MouseEvent) => {
    if (!document.pointerLockElement) return

    e.preventDefault()
    let button: 'left' | 'right' | 'middle'

    switch (e.button) {
      case 0:
        button = 'left'
        break
      case 1:
        button = 'middle'
        break
      case 2:
        button = 'right'
        break
      default:
        return
    }

    isMouseButtonDownRef.current = false
    onSendCommand({ type: 'mouseup', button })
  }, [onSendCommand])

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault()

    onSendCommand({
      type: 'scroll',
      deltaX: e.deltaX,
      deltaY: e.deltaY
    })
  }, [onSendCommand])

  const handleContextMenu = useCallback((e: Event) => {
    e.preventDefault()
  }, [])

  const handlePointerLockChange = useCallback(() => {
    const wasLocked = pointerLocked
    const isLocked = document.pointerLockElement === touchpadRef.current
    setPointerLocked(isLocked)
    
    // Release any held mouse buttons when exiting pointer lock
    if (wasLocked && !isLocked && isMouseButtonDownRef.current) {
      onSendCommand({ type: 'mouseup', button: 'left' })
      isMouseButtonDownRef.current = false
    }
  }, [pointerLocked, onSendCommand])

  useEffect(() => {
    const touchpad = touchpadRef.current
    if (!touchpad || !connected) return

    touchpad.addEventListener('touchstart', handleTouchStart, { passive: false })
    touchpad.addEventListener('touchmove', handleTouchMove, { passive: false })
    touchpad.addEventListener('touchend', handleTouchEnd, { passive: false })
    touchpad.addEventListener('wheel', handleWheel, { passive: false })
    document.addEventListener('pointerlockchange', handlePointerLockChange)

    return () => {
      touchpad.removeEventListener('touchstart', handleTouchStart)
      touchpad.removeEventListener('touchmove', handleTouchMove)
      touchpad.removeEventListener('touchend', handleTouchEnd)
      touchpad.removeEventListener('wheel', handleWheel)
      document.removeEventListener('pointerlockchange', handlePointerLockChange)
    }
  }, [connected, handleTouchStart, handleTouchMove, handleTouchEnd, handleWheel, handlePointerLockChange])

  return (
    <div
      ref={touchpadRef}
      className={`flex-1 rounded-lg flex items-center justify-center touch-none select-none ${
        heldButton 
          ? heldButton === 'left' ? 'bg-blue-700' 
            : heldButton === 'middle' ? 'bg-purple-700' 
            : 'bg-green-700'
          : 'bg-gray-700'
      }`}
      style={{ cursor: pointerLocked ? 'none' : 'pointer' }}
      onClick={connected ? handleMouseClick : undefined}
      onMouseMove={connected ? handleMouseMove : undefined}
      onMouseDown={connected ? handleMouseDown : undefined}
      onMouseUp={connected ? handleMouseUp : undefined}
      onContextMenu={handleContextMenu}
    >
      <div className="text-gray-400 text-center pointer-events-none">
        {!connected && hasAttemptedConnection && !pointerLocked && (
          <>
            <p className="text-xl font-semibold text-red-400 mb-3">Not Connected</p>
            <button
              onClick={onReconnect}
              disabled={isReconnecting}
              className={`pointer-events-auto px-6 py-3 rounded-lg font-semibold text-lg transition-colors ${isReconnecting
                ? 'bg-yellow-600 cursor-wait'
                : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
                }`}
            >
              {isReconnecting ? 'Connecting...' : 'Reconnect'}
            </button>
          </>
        )}
        {
          connected ? (
            <>
              <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
              </svg>
              {pointerLocked ? (
                <>
                  <p className="text-xl font-semibold text-green-400 mb-1">Mouse Locked</p>
                  <p className="text-lg">Move mouse to control cursor</p>
                  <p className="text-lg">Hold and drag to select</p>
                  <p className="text-lg">Press ESC to exit</p>
                </>
              ) : (
                <>
                  <p className="text-lg">Touch: Tap to click, hold button + swipe to drag</p>
                  <p className="text-lg mt-1">Mouse: Click to lock</p>
                </>
              )}
            </>
          ) : undefined
        }
      </div>
    </div>
  )
}
