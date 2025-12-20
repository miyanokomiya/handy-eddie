interface MouseButtonsProps {
  onSendCommand: (action: ClickAction) => void
}

interface ClickAction {
  type: 'click'
  button: 'left' | 'right' | 'middle'
}

export function MouseButtons({ onSendCommand }: MouseButtonsProps) {
  const handleClick = (button: 'left' | 'right' | 'middle') => {
    onSendCommand({ type: 'click', button })
  }

  return (
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
  )
}
