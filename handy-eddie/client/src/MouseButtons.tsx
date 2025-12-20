interface MouseButtonsProps {
  onSendCommand: (action: ClickAction) => void
}

interface ClickAction {
  type: 'click'
  button: 'left' | 'right' | 'middle' | 'back' | 'forward'
}

export function MouseButtons({ onSendCommand }: MouseButtonsProps) {
  const handleClick = (button: 'left' | 'right' | 'middle' | 'back' | 'forward') => {
    onSendCommand({ type: 'click', button })
  }

  return (
    <div className="grid grid-cols-5 gap-2">
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
        onClick={() => handleClick('left')}
        className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold py-2 px-4 rounded-lg shadow-lg transition-colors"
      >
        Left
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
        Right
      </button>
    </div>
  )
}
