interface MouseButtonsProps {
  onSendCommand: (action: MouseAction) => void
  heldButton: 'left' | 'right' | 'middle' | null
  onButtonHold: (button: 'left' | 'right' | 'middle' | null) => void
}

interface MouseAction {
  type: 'click' | 'mousedown' | 'mouseup'
  button: 'left' | 'right' | 'middle' | 'back' | 'forward'
}

export function MouseButtons({ onSendCommand, heldButton, onButtonHold }: MouseButtonsProps) {
  const handleClick = (button: 'left' | 'right' | 'middle' | 'back' | 'forward') => {
    onSendCommand({ type: 'click', button })
  }

  // Emulating right-click drag is problematic due to context menu issues
  const handleDragButtonDown = (button: 'left' | 'middle') => {
    // Release any previously held button
    if (heldButton && heldButton !== button) {
      onSendCommand({ type: 'mouseup', button: heldButton })
    }
    // Hold the button
    onSendCommand({ type: 'mousedown', button })
    onButtonHold(button)
  }

  const handleDragButtonUp = (button: 'left' | 'right' | 'middle') => {
    // Only release if this button is currently held
    if (heldButton === button) {
      onSendCommand({ type: 'mouseup', button })
      onButtonHold(null)
    }
  }

  return (
    <div className="grid grid-cols-5 gap-2 touch-none">
      <button
        onClick={() => handleClick('back')}
        className="bg-gray-600 hover:bg-gray-700 active:bg-gray-800 text-white font-semibold py-2 px-4 rounded-lg shadow-lg transition-colors flex items-center justify-center"
      >
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>
      <button
        onClick={() => handleClick('forward')}
        className="bg-gray-600 hover:bg-gray-700 active:bg-gray-800 text-white font-semibold py-2 px-4 rounded-lg shadow-lg transition-colors flex items-center justify-center"
      >
        Forward
        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
      <button
        onMouseDown={() => handleDragButtonDown('left')}
        onMouseUp={() => handleDragButtonUp('left')}
        onTouchStart={(e) => { e.preventDefault(); handleDragButtonDown('left'); }}
        onTouchEnd={(e) => { e.preventDefault(); handleDragButtonUp('left'); }}
        className={`${
          heldButton === 'left'
            ? 'bg-blue-800 ring-4 ring-blue-400'
            : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
        } text-white font-semibold py-2 px-4 rounded-lg shadow-lg transition-colors select-none`}
      >
        Left
      </button>
      <button
        onMouseDown={() => handleDragButtonDown('middle')}
        onMouseUp={() => handleDragButtonUp('middle')}
        onTouchStart={(e) => { e.preventDefault(); handleDragButtonDown('middle'); }}
        onTouchEnd={(e) => { e.preventDefault(); handleDragButtonUp('middle'); }}
        className={`${
          heldButton === 'middle'
            ? 'bg-purple-800 ring-4 ring-purple-400'
            : 'bg-purple-600 hover:bg-purple-700 active:bg-purple-800'
        } text-white font-semibold py-2 px-4 rounded-lg shadow-lg transition-colors select-none`}
      >
        Middle
      </button>
      <button
        onClick={() => handleClick('right')}
        className="bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-semibold py-2 px-4 rounded-lg shadow-lg transition-colors select-none"
        title="Right-click (drag disabled to prevent context menu issues)"
      >
        Right
      </button>
    </div>
  )
}
