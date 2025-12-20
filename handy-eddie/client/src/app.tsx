import { useState, useEffect, useRef } from 'preact/hooks'
import { Settings } from './Settings'
import { SystemCommands } from './SystemCommands'

interface MouseAction {
  type: 'move' | 'click' | 'scroll' | 'system'
  x?: number
  y?: number
  button?: 'left' | 'right' | 'middle'
  deltaX?: number
  deltaY?: number
  command?: string
}

const STORAGE_KEYS = {
  MOUSE_SENSITIVITY: 'handy-eddie_mouseSensitivity',
  SCROLL_SENSITIVITY: 'handy-eddie_scrollSensitivity'
} as const

const DEFAULT_SENSITIVITY = {
  MOUSE: 2.5,
  SCROLL: 3
} as const

type DialogType = 'none' | 'settings' | 'system'

export function App() {
  const [connected, setConnected] = useState(false)
  const [status, setStatus] = useState('Disconnected')
  const [isReconnecting, setIsReconnecting] = useState(false)
  const [hasAttemptedConnection, setHasAttemptedConnection] = useState(false)
  const [pointerLocked, setPointerLocked] = useState(false)
  const [isTouchDevice, setIsTouchDevice] = useState(false)
  const [openDialog, setOpenDialog] = useState<DialogType>('none')
  const [mouseSensitivity, setMouseSensitivity] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MOUSE_SENSITIVITY)
    return saved ? parseFloat(saved) : DEFAULT_SENSITIVITY.MOUSE
  })
  const [scrollSensitivity, setScrollSensitivity] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SCROLL_SENSITIVITY)
    return saved ? parseFloat(saved) : DEFAULT_SENSITIVITY.SCROLL
  })
  const wsRef = useRef<WebSocket | null>(null)
  const touchpadRef = useRef<HTMLDivElement>(null)
  const vScrollBarRef = useRef<HTMLDivElement>(null)
  const hScrollBarRef = useRef<HTMLDivElement>(null)
  const isDraggingRef = useRef(false)
  const lastPosRef = useRef({ x: 0, y: 0 })
  const touchStartTimeRef = useRef(0)
  const touchStartPosRef = useRef({ x: 0, y: 0 })
  const hasMoved = useRef(false)
  const reconnectTimeoutRef = useRef<number | null>(null)
  const isScrollingRef = useRef(false)
  const scrollLastPosRef = useRef({ x: 0, y: 0 })

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MOUSE_SENSITIVITY, mouseSensitivity.toString())
  }, [mouseSensitivity])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SCROLL_SENSITIVITY, scrollSensitivity.toString())
  }, [scrollSensitivity])

  const connectWebSocket = () => {
    if (wsRef.current && wsRef.current.readyState !== WebSocket.CLOSED) return

    // Clear any pending reconnection timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }

    setStatus('Connecting...')
    setIsReconnecting(true)

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsUrl = `${protocol}//${window.location.host}/`
    const ws = new WebSocket(wsUrl)

    ws.onopen = () => {
      setConnected(true)
      setStatus('Connected')
      setIsReconnecting(false)
      setHasAttemptedConnection(true)
      wsRef.current = ws
    }

    ws.onclose = () => {
      setConnected(false)
      setStatus('Disconnected')
      setIsReconnecting(false)
      setHasAttemptedConnection(true)
      wsRef.current = null
      reconnectTimeoutRef.current = setTimeout(connectWebSocket, 3000) as any
    }

    ws.onerror = () => {
      setStatus('Connection Error')
      setIsReconnecting(false)
      setHasAttemptedConnection(true)
    }
  }

  useEffect(() => {
    // Detect if device has touch capability
    const hasTouchSupport = 'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      (navigator as any).msMaxTouchPoints > 0
    setIsTouchDevice(hasTouchSupport)

    connectWebSocket()

    // Handle visibility change to reconnect when tab becomes active
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        connectWebSocket()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [])

  const sendCommand = (action: MouseAction) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(action))
    } else {
      console.log(action)
    }
  }

  const sendSystemCommand = (command: string) => {
    sendCommand({ type: 'system', command })
  }

  const handleTouchStart = (e: TouchEvent) => {
    e.preventDefault()
    isDraggingRef.current = true
    hasMoved.current = false
    const touch = e.touches[0]
    lastPosRef.current = { x: touch.clientX, y: touch.clientY }
    touchStartTimeRef.current = Date.now()
    touchStartPosRef.current = { x: touch.clientX, y: touch.clientY }
  }

  const handleTouchMove = (e: TouchEvent) => {
    e.preventDefault()
    if (!isDraggingRef.current) return

    const touch = e.touches[0]
    let deltaX = touch.clientX - lastPosRef.current.x
    let deltaY = touch.clientY - lastPosRef.current.y

    // Apply clamping only for the first 0.5 seconds to prevent initial jump
    const timeSinceTouchStart = Date.now() - touchStartTimeRef.current
    if (timeSinceTouchStart < 100) {
      const maxInitialDelta = 2 // Maximum pixels for any single movement
      deltaX = Math.max(-maxInitialDelta, Math.min(maxInitialDelta, deltaX))
      deltaY = Math.max(-maxInitialDelta, Math.min(maxInitialDelta, deltaY))
    }

    const moveX = Math.round(deltaX * mouseSensitivity)
    const moveY = Math.round(deltaY * mouseSensitivity)

    if (Math.abs(moveX) > 0 || Math.abs(moveY) > 0) {
      sendCommand({
        type: 'move',
        x: moveX,
        y: moveY
      })
    }

    const totalDelta = Math.abs(deltaX) + Math.abs(deltaY)
    if (totalDelta > 5) {
      hasMoved.current = true
    }

    lastPosRef.current = { x: touch.clientX, y: touch.clientY }
  }

  const handleTouchEnd = (e: TouchEvent) => {
    e.preventDefault()
    isDraggingRef.current = false

    const touchDuration = Date.now() - touchStartTimeRef.current
    const touch = e.changedTouches[0]
    const deltaX = Math.abs(touch.clientX - touchStartPosRef.current.x)
    const deltaY = Math.abs(touch.clientY - touchStartPosRef.current.y)
    const totalMovement = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

    if (touchDuration < 300 && totalMovement < 15 && !hasMoved.current) {
      sendCommand({ type: 'click', button: 'left' })
    }
  }

  const handleVScrollTouchStart = (e: TouchEvent) => {
    e.preventDefault()
    isScrollingRef.current = true
    const touch = e.touches[0]
    scrollLastPosRef.current = { x: touch.clientX, y: touch.clientY }
  }

  const handleVScrollTouchMove = (e: TouchEvent) => {
    e.preventDefault()
    if (!isScrollingRef.current) return

    const touch = e.touches[0]
    const deltaY = touch.clientY - scrollLastPosRef.current.y

    const scrollAmount = Math.round(deltaY * scrollSensitivity)

    if (Math.abs(scrollAmount) > 0) {
      sendCommand({
        type: 'scroll',
        deltaX: 0,
        deltaY: scrollAmount
      })
    }

    scrollLastPosRef.current = { x: touch.clientX, y: touch.clientY }
  }

  const handleVScrollTouchEnd = (e: TouchEvent) => {
    e.preventDefault()
    isScrollingRef.current = false
  }

  const handleHScrollTouchStart = (e: TouchEvent) => {
    e.preventDefault()
    isScrollingRef.current = true
    const touch = e.touches[0]
    scrollLastPosRef.current = { x: touch.clientX, y: touch.clientY }
  }

  const handleHScrollTouchMove = (e: TouchEvent) => {
    e.preventDefault()
    if (!isScrollingRef.current) return

    const touch = e.touches[0]
    const deltaX = touch.clientX - scrollLastPosRef.current.x

    const scrollAmount = Math.round(deltaX * scrollSensitivity)

    if (Math.abs(scrollAmount) > 0) {
      sendCommand({
        type: 'scroll',
        deltaX: scrollAmount,
        deltaY: 0
      })
    }

    scrollLastPosRef.current = { x: touch.clientX, y: touch.clientY }
  }

  const handleHScrollTouchEnd = (e: TouchEvent) => {
    e.preventDefault()
    isScrollingRef.current = false
  }

  const handleMouseClick = () => {
    if (!pointerLocked && touchpadRef.current) {
      touchpadRef.current.requestPointerLock()
    }
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!document.pointerLockElement) return

    const moveX = Math.round(e.movementX * mouseSensitivity)
    const moveY = Math.round(e.movementY * mouseSensitivity)

    if (Math.abs(moveX) > 0 || Math.abs(moveY) > 0) {
      sendCommand({
        type: 'move',
        x: moveX,
        y: moveY
      })
    }
  }

  const handleMouseDown = (e: MouseEvent) => {
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

    sendCommand({ type: 'click', button })
  }

  const handleWheel = (e: WheelEvent) => {
    e.preventDefault()

    sendCommand({
      type: 'scroll',
      deltaX: e.deltaX,
      deltaY: e.deltaY
    })
  }

  const handlePointerLockChange = () => {
    setPointerLocked(document.pointerLockElement === touchpadRef.current)
  }

  useEffect(() => {
    const touchpad = touchpadRef.current
    if (touchpad) {
      touchpad.addEventListener('touchstart', handleTouchStart, { passive: false })
      touchpad.addEventListener('touchmove', handleTouchMove, { passive: false })
      touchpad.addEventListener('touchend', handleTouchEnd, { passive: false })
      touchpad.addEventListener('click', handleMouseClick as any)
      touchpad.addEventListener('mousemove', handleMouseMove as any)
      touchpad.addEventListener('mousedown', handleMouseDown as any)
      touchpad.addEventListener('wheel', handleWheel as any, { passive: false })
      touchpad.addEventListener('contextmenu', (e) => e.preventDefault())
      document.addEventListener('pointerlockchange', handlePointerLockChange)

      return () => {
        touchpad.removeEventListener('touchstart', handleTouchStart)
        touchpad.removeEventListener('touchmove', handleTouchMove)
        touchpad.removeEventListener('touchend', handleTouchEnd)
        touchpad.removeEventListener('click', handleMouseClick as any)
        touchpad.removeEventListener('mousemove', handleMouseMove as any)
        touchpad.removeEventListener('mousedown', handleMouseDown as any)
        touchpad.removeEventListener('wheel', handleWheel as any)
        touchpad.removeEventListener('contextmenu', (e) => e.preventDefault())
        document.removeEventListener('pointerlockchange', handlePointerLockChange)
      }
    }
  }, [mouseSensitivity])

  useEffect(() => {
    const vScrollBar = vScrollBarRef.current
    if (vScrollBar && isTouchDevice) {
      vScrollBar.addEventListener('touchstart', handleVScrollTouchStart, { passive: false })
      vScrollBar.addEventListener('touchmove', handleVScrollTouchMove, { passive: false })
      vScrollBar.addEventListener('touchend', handleVScrollTouchEnd, { passive: false })

      return () => {
        vScrollBar.removeEventListener('touchstart', handleVScrollTouchStart)
        vScrollBar.removeEventListener('touchmove', handleVScrollTouchMove)
        vScrollBar.removeEventListener('touchend', handleVScrollTouchEnd)
      }
    }
  }, [isTouchDevice, scrollSensitivity])

  useEffect(() => {
    const hScrollBar = hScrollBarRef.current
    if (hScrollBar && isTouchDevice) {
      hScrollBar.addEventListener('touchstart', handleHScrollTouchStart, { passive: false })
      hScrollBar.addEventListener('touchmove', handleHScrollTouchMove, { passive: false })
      hScrollBar.addEventListener('touchend', handleHScrollTouchEnd, { passive: false })

      return () => {
        hScrollBar.removeEventListener('touchstart', handleHScrollTouchStart)
        hScrollBar.removeEventListener('touchmove', handleHScrollTouchMove)
        hScrollBar.removeEventListener('touchend', handleHScrollTouchEnd)
      }
    }
  }, [isTouchDevice, scrollSensitivity])

  const handleClick = (button: 'left' | 'right' | 'middle') => {
    sendCommand({ type: 'click', button })
  }

  const handleReconnect = () => {
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    connectWebSocket()
  }

  return (
    <div className="flex flex-col h-svh bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 px-4 py-1 shadow-lg">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setOpenDialog('system')}
            className="text-gray-400 hover:text-white transition-colors p-1"
            title="System Commands"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </button>
          <div className={`text-center text-lg mt-1 ${connected ? 'text-green-400' : isReconnecting ? 'text-yellow-400' : 'text-red-400'}`}>
            {status}
          </div>
          <button
            onClick={() => setOpenDialog('settings')}
            className="text-gray-400 hover:text-white transition-colors p-1"
            title="Settings"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Content Area with Touchpad and Scroll Bars */}
      <div className="flex-1 flex m-2 gap-2">
        {/* Touchpad Area */}
        <div
          ref={touchpadRef}
          className="flex-1 bg-gray-700 rounded-lg flex items-center justify-center touch-none select-none"
          style={{ cursor: pointerLocked ? 'none' : 'pointer' }}
        >
          <div className="text-gray-400 text-center pointer-events-none">
            {!connected && hasAttemptedConnection && !pointerLocked && (
              <>
                <p className="text-xl font-semibold text-red-400 mb-3">Not Connected</p>
                <button
                  onClick={handleReconnect}
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
                      <p className="text-lg">Press ESC to exit</p>
                    </>
                  ) : (
                    <>
                      <p className="text-lg">Touch and drag to move cursor</p>
                      <p className="text-lg mt-1">Or click to lock mouse</p>
                    </>
                  )}
                </>
              ) : undefined
            }
          </div>
        </div>

        {/* Vertical Scroll Bar - Only on touch devices */}
        {isTouchDevice && (
          <div
            ref={vScrollBarRef}
            className="w-16 bg-gray-600 rounded-lg flex items-center justify-center touch-none select-none active:bg-gray-500"
          >
            <div className="text-gray-400 text-center pointer-events-none">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Horizontal Scroll Bar - Only on touch devices */}
      <div className="px-2 pb-2">
        {isTouchDevice && (
          <div
            ref={hScrollBarRef}
            className="h-16 bg-gray-600 rounded-lg flex items-center justify-center touch-none select-none active:bg-gray-500 mb-2"
          >
            <div className="text-gray-400 text-center pointer-events-none">
              <svg className="w-6 h-6 rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            </div>
          </div>
        )}

        {/* Button Controls */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => handleClick('left')}
            className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold py-2 px-4 rounded-lg shadow-lg transition-colors"
          >
            Left Click
          </button>
          <button
            onClick={() => handleClick('middle')}
            className="bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-semibold py-2 px-4 rounded-lg shadow-lg transition-colors"
          >
            Middle
          </button>
          <button
            onClick={() => handleClick('right')}
            className="bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-semibold py-2 px-4 rounded-lg shadow-lg transition-colors"
          >
            Right Click
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      <Settings
        isOpen={openDialog === 'settings'}
        onClose={() => setOpenDialog('none')}
        mouseSensitivity={mouseSensitivity}
        onMouseSensitivityChange={setMouseSensitivity}
        scrollSensitivity={scrollSensitivity}
        onScrollSensitivityChange={setScrollSensitivity}
        defaultMouseSensitivity={DEFAULT_SENSITIVITY.MOUSE}
        defaultScrollSensitivity={DEFAULT_SENSITIVITY.SCROLL}
      />

      {/* System Commands Panel */}
      <SystemCommands
        isOpen={openDialog === 'system'}
        onClose={() => setOpenDialog('none')}
        onExecuteCommand={sendSystemCommand}
        connected={connected}
      />
    </div>
  )
}