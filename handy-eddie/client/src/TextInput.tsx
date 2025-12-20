import { useState, useRef, useImperativeHandle, forwardRef } from 'preact/compat'

interface TextInputProps {
  onSendCommand: (action: KeyboardAction) => void
  connected: boolean
}

interface KeyboardAction {
  type: 'keyboard'
  text: string
  sendEnter?: boolean
}

export interface TextInputHandle {
  blur: () => void
}

export const TextInput = forwardRef<TextInputHandle, TextInputProps>(
  ({ onSendCommand, connected }, ref) => {
    const [text, setText] = useState('')
    const inputRef = useRef<HTMLInputElement>(null)

    useImperativeHandle(ref, () => ({
      blur: () => {
        inputRef.current?.blur()
      }
    }))

    const handleSubmit = (e: Event) => {
      e.preventDefault()
      if (!connected) return

      if (text.trim()) {
        // Send text without Enter
        onSendCommand({ type: 'keyboard', text, sendEnter: false })
        setText('')
      } else {
        // Empty text - just send Enter key
        onSendCommand({ type: 'keyboard', text: '\n', sendEnter: false })
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSubmit(e)
      }
    }

    return (
      <div className="mt-2">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={text}
            onInput={(e) => setText((e.target as HTMLInputElement).value)}
            onKeyDown={handleKeyDown}
            placeholder={connected ? "Type text or press Enter..." : "Not connected"}
            disabled={!connected}
            className="flex-1 bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-800 disabled:text-gray-500"
          />
          <button
            type="submit"
            disabled={!connected}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold px-6 py-2 rounded-lg transition-colors flex items-center justify-center"
          >
            {text.trim() ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </button>
        </form>
      </div>
    )
  }
)
