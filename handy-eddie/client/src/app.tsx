import { useState, useEffect, useRef } from 'preact/hooks'
import { Header } from './Header'
import { Settings } from './Settings'
import { SystemCommands } from './SystemCommands'
import { Touchpad } from './Touchpad'
import { VerticalScrollBar } from './VerticalScrollBar'
import { HorizontalScrollBar } from './HorizontalScrollBar'
import { MouseButtons } from './MouseButtons'
import { TextInput, TextInputHandle } from './TextInput'

interface MouseAction {
  type: 'move' | 'click' | 'scroll' | 'system' | 'keyboard'
  x?: number
  y?: number
  button?: 'left' | 'right' | 'middle' | 'back' | 'forward'
  deltaX?: number
  deltaY?: number
  command?: string
  text?: string
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
  const reconnectTimeoutRef = useRef<number | null>(null)
  const textInputRef = useRef<TextInputHandle>(null)

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
    
    // Blur the text input when any command is sent (except keyboard commands)
    if (action.type !== 'keyboard') {
      textInputRef.current?.blur()
    }
  }

  const sendSystemCommand = (command: string) => {
    sendCommand({ type: 'system', command })
  }

  const handleReconnect = () => {
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    connectWebSocket()
  }

  return (
    <div className="flex flex-col h-dvh text-white">
      <Header
        connected={connected}
        isReconnecting={isReconnecting}
        status={status}
        onOpenSystemDialog={() => setOpenDialog('system')}
        onOpenSettingsDialog={() => setOpenDialog('settings')}
      />

      {/* Main Content Area with Touchpad and Scroll Bars */}
      <div className="flex-1 flex m-2 gap-2">
        <Touchpad
          connected={connected}
          hasAttemptedConnection={hasAttemptedConnection}
          isReconnecting={isReconnecting}
          mouseSensitivity={mouseSensitivity}
          onSendCommand={sendCommand}
          onReconnect={handleReconnect}
        />

        {isTouchDevice && (
          <VerticalScrollBar
            scrollSensitivity={scrollSensitivity}
            onSendCommand={sendCommand}
          />
        )}
      </div>

      {/* Horizontal Scroll Bar and Button Controls */}
      <div className="px-2 pb-2">
        {isTouchDevice && (
          <HorizontalScrollBar
            scrollSensitivity={scrollSensitivity}
            onSendCommand={sendCommand}
          />
        )}

        <MouseButtons onSendCommand={sendCommand} />
        
        <TextInput ref={textInputRef} onSendCommand={sendCommand} connected={connected} />
      </div>

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

      <SystemCommands
        isOpen={openDialog === 'system'}
        onClose={() => setOpenDialog('none')}
        onExecuteCommand={sendSystemCommand}
        connected={connected}
      />
    </div>
  )
}