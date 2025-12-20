interface ArrowControlsProps {
  onSendCommand: (action: KeyboardAction) => void
  connected: boolean
}

interface KeyboardAction {
  type: 'keyboard'
  key: string
}

export function ArrowControls({ onSendCommand, connected }: ArrowControlsProps) {
  const handleArrowKey = (key: string) => {
    onSendCommand({ type: 'keyboard', key })
  }

  return (
    <div className="bg-gray-700 rounded-lg p-2 mb-2">
      {/* Arrow Keys Layout - 3 columns: Left, Up/Down, Right */}
      <div className="grid grid-cols-3 gap-2">
        {/* Left Arrow */}
        <button
          onClick={() => handleArrowKey('ArrowLeft')}
          disabled={!connected}
          className="bg-gray-600 hover:bg-gray-700 active:bg-gray-800 disabled:bg-gray-800 disabled:text-gray-600 text-white font-semibold py-3 px-4 rounded-lg shadow-lg transition-colors flex items-center justify-center h-full"
          title="Left Arrow (YouTube: -5s)"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        {/* Up and Down Arrows stacked */}
        <div className="flex flex-col gap-1 h-full">
          <button
            onClick={() => handleArrowKey('ArrowUp')}
            disabled={!connected}
            className="bg-gray-600 hover:bg-gray-700 active:bg-gray-800 disabled:bg-gray-800 disabled:text-gray-600 text-white font-semibold py-1 px-4 rounded-lg shadow-lg transition-colors flex items-center justify-center flex-1"
            title="Up Arrow"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
          
          <button
            onClick={() => handleArrowKey('ArrowDown')}
            disabled={!connected}
            className="bg-gray-600 hover:bg-gray-700 active:bg-gray-800 disabled:bg-gray-800 disabled:text-gray-600 text-white font-semibold py-1 px-4 rounded-lg shadow-lg transition-colors flex items-center justify-center flex-1"
            title="Down Arrow"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
        
        {/* Right Arrow */}
        <button
          onClick={() => handleArrowKey('ArrowRight')}
          disabled={!connected}
          className="bg-gray-600 hover:bg-gray-700 active:bg-gray-800 disabled:bg-gray-800 disabled:text-gray-600 text-white font-semibold py-3 px-4 rounded-lg shadow-lg transition-colors flex items-center justify-center h-full"
          title="Right Arrow (YouTube: +5s)"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  )
}
