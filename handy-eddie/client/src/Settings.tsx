interface SettingsProps {
  isOpen: boolean
  onClose: () => void
  mouseSensitivity: number
  onMouseSensitivityChange: (value: number) => void
  scrollSensitivity: number
  onScrollSensitivityChange: (value: number) => void
  defaultMouseSensitivity?: number
  defaultScrollSensitivity?: number
  showVideoControls: boolean
  onShowVideoControlsChange: (value: boolean) => void
  showArrowControls: boolean
  onShowArrowControlsChange: (value: boolean) => void
  useJoystick: boolean
  onUseJoystickChange: (value: boolean) => void
}

export function Settings({
  isOpen,
  onClose,
  mouseSensitivity,
  onMouseSensitivityChange,
  scrollSensitivity,
  onScrollSensitivityChange,
  defaultMouseSensitivity = 2.5,
  defaultScrollSensitivity = 3,
  showVideoControls,
  onShowVideoControlsChange,
  showArrowControls,
  onShowArrowControlsChange,
  useJoystick,
  onUseJoystickChange
}: SettingsProps) {
  if (!isOpen) return null

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
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Control Visibility Settings */}
        <div className="mb-6 space-y-3">
          <h3 className="text-white text-sm font-medium mb-3">Control Panels</h3>
          
          {/* Video Controls Toggle */}
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-white text-sm">Media Controls</span>
            <div className="relative">
              <input
                type="checkbox"
                checked={showVideoControls}
                onChange={(e) => onShowVideoControlsChange((e.target as HTMLInputElement).checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </div>
          </label>

          {/* Arrow Controls Toggle */}
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-white text-sm">Arrow Key Controls</span>
            <div className="relative">
              <input
                type="checkbox"
                checked={showArrowControls}
                onChange={(e) => onShowArrowControlsChange((e.target as HTMLInputElement).checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </div>
          </label>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 my-6"></div>

        {/* Mouse Control Mode */}
        <div className="mb-6">
          <h3 className="text-white text-sm font-medium mb-3">Mouse Control Mode</h3>
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-white text-sm">Use Joystick</span>
            <div className="relative">
              <input
                type="checkbox"
                checked={useJoystick}
                onChange={(e) => onUseJoystickChange((e.target as HTMLInputElement).checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </div>
          </label>
          <p className="text-xs text-gray-400 mt-2">
            {useJoystick ? 'Joystick mode: Drag to move cursor continuously' : 'Touchpad mode: Swipe to move cursor'}
          </p>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 my-6"></div>

        {/* Mouse Sensitivity Setting */}
        <div className="mb-6">
          <label className="block text-white text-sm font-medium mb-2">
            Mouse Sensitivity: {mouseSensitivity.toFixed(1)}x
          </label>
          <input
            type="range"
            min="0.5"
            max="10"
            step="0.1"
            value={mouseSensitivity}
            onInput={(e) => onMouseSensitivityChange(parseFloat((e.target as HTMLInputElement).value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>Slow (0.5x)</span>
            <span>Fast (10x)</span>
          </div>
        </div>

        {/* Scroll Sensitivity Setting */}
        <div className="mb-6">
          <label className="block text-white text-sm font-medium mb-2">
            Scroll Sensitivity: {scrollSensitivity.toFixed(1)}x
          </label>
          <input
            type="range"
            min="0.5"
            max="10"
            step="0.1"
            value={scrollSensitivity}
            onInput={(e) => onScrollSensitivityChange(parseFloat((e.target as HTMLInputElement).value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>Slow (0.5x)</span>
            <span>Fast (10x)</span>
          </div>
        </div>

        {/* Reset Button */}
        <div className="flex gap-2">
          <button
            onClick={() => {
              onMouseSensitivityChange(defaultMouseSensitivity)
              onScrollSensitivityChange(defaultScrollSensitivity)
            }}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Reset to Default
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
