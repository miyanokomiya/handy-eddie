interface SystemCommandsProps {
  isOpen: boolean
  onClose: () => void
  onExecuteCommand: (command: string) => void
  connected: boolean
}

export function SystemCommands({
  isOpen,
  onClose,
  onExecuteCommand,
  connected
}: SystemCommandsProps) {
  if (!isOpen) return null

  const handleCommand = (command: string, confirmMessage: string) => {
    if (window.confirm(confirmMessage)) {
      onExecuteCommand(command)
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-gray-800 rounded-lg p-6 w-11/12 max-w-md shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">System Commands</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Warning Message */}
        <div className="bg-yellow-900 bg-opacity-50 border border-yellow-600 rounded-lg p-3 mb-4">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-yellow-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-yellow-500 text-sm font-semibold">Warning</p>
              <p className="text-yellow-200 text-xs mt-1">These commands will affect the server PC. Use with caution.</p>
            </div>
          </div>
        </div>

        {/* Connection Status Warning */}
        {!connected && (
          <div className="bg-red-900 bg-opacity-50 border border-red-600 rounded-lg p-3 mb-4">
            <p className="text-red-400 text-sm font-semibold">Not Connected</p>
            <p className="text-red-200 text-xs mt-1">Connect to the server before executing commands.</p>
          </div>
        )}

        {/* Command Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => handleCommand('sleep', 'Put the server PC to sleep?')}
            disabled={!connected}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
            Sleep
          </button>

          <button
            onClick={() => handleCommand('shutdown', 'Shutdown the server PC? This will close all programs.')}
            disabled={!connected}
            className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Shutdown
          </button>

          <button
            onClick={() => handleCommand('restart', 'Restart the server PC? This will close all programs.')}
            disabled={!connected}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Restart
          </button>

          <button
            onClick={() => handleCommand('lock', 'Lock the server PC?')}
            disabled={!connected}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Lock Screen
          </button>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full mt-4 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
