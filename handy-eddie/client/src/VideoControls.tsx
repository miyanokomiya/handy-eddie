interface VideoControlsProps {
  onSendCommand: (action: MediaAction) => void
  connected: boolean
}

interface MediaAction {
  type: 'media'
  command: string
}

export function VideoControls({ onSendCommand, connected }: VideoControlsProps) {
  const handleMediaCommand = (command: string) => {
    onSendCommand({ type: 'media', command })
  }

  return (
    <div className="bg-gray-700 rounded-lg p-2 mb-2">
      {/* Playback Controls */}
      <div className="grid grid-cols-5 gap-2 mb-2">
        <button
          onClick={() => handleMediaCommand('previous')}
          disabled={!connected}
          className="bg-gray-600 hover:bg-gray-700 active:bg-gray-800 disabled:bg-gray-800 disabled:text-gray-600 text-white font-semibold py-2 px-2 rounded-lg shadow-lg transition-colors flex items-center justify-center"
          title="Previous/Skip Back 10s"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
        
        <button
          onClick={() => handleMediaCommand('playpause')}
          disabled={!connected}
          className="col-span-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-gray-800 disabled:text-gray-600 text-white font-semibold py-2 px-4 rounded-lg shadow-lg transition-colors flex items-center justify-center"
          title="Play/Pause"
        >
          <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z"/>
          </svg>
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
          </svg>
        </button>
        
        <button
          onClick={() => handleMediaCommand('next')}
          disabled={!connected}
          className="bg-gray-600 hover:bg-gray-700 active:bg-gray-800 disabled:bg-gray-800 disabled:text-gray-600 text-white font-semibold py-2 px-2 rounded-lg shadow-lg transition-colors flex items-center justify-center"
          title="Next/Skip Forward 10s"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Volume Controls */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => handleMediaCommand('volumedown')}
          disabled={!connected}
          className="bg-gray-600 hover:bg-gray-700 active:bg-gray-800 disabled:bg-gray-800 disabled:text-gray-600 text-white font-semibold py-2 px-3 rounded-lg shadow-lg transition-colors flex items-center justify-center"
          title="Volume Down"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          </svg>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>
        
        <button
          onClick={() => handleMediaCommand('mute')}
          disabled={!connected}
          className="bg-purple-600 hover:bg-purple-700 active:bg-purple-800 disabled:bg-gray-800 disabled:text-gray-600 text-white font-semibold py-2 px-3 rounded-lg shadow-lg transition-colors flex items-center justify-center"
          title="Mute/Unmute"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
          </svg>
        </button>
        
        <button
          onClick={() => handleMediaCommand('volumeup')}
          disabled={!connected}
          className="bg-gray-600 hover:bg-gray-700 active:bg-gray-800 disabled:bg-gray-800 disabled:text-gray-600 text-white font-semibold py-2 px-3 rounded-lg shadow-lg transition-colors flex items-center justify-center"
          title="Volume Up"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          </svg>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    </div>
  )
}
