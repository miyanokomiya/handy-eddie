# Handy Eddie - Mobile Mouse Controller

A web server and mobile web client that allows you to control your Windows mouse pointer and keyboard from your mobile device via WebSocket.

## Features

- Control Windows mouse pointer from mobile device
- Send keyboard text input to the server PC
- Media controls (play/pause, volume, track navigation)
- Arrow key controls for video seeking and navigation
- Portrait-first responsive UI
- WebSocket communication with human-readable JSON protocol
- QR code for easy connection
- Touch-based trackpad with relative mouse movement
- Left, right, middle, back, and forward click buttons
- Vertical and horizontal scrolling
- System commands (sleep, shutdown, restart, lock)
- Customizable sensitivity settings

## Documentation

- **[Quick Start Guide](documents/QUICKSTART.md)** - Get started quickly
- **[User Guide - Controls](documents/USER_GUIDE_CONTROLS.md)** - Learn how to use media and arrow controls
- **[Project Structure](documents/PROJECT-STRUCTURE.md)** - Understand the codebase
- **[Implementation Details](documents/VIDEO_CONTROLS_IMPLEMENTATION.md)** - Technical documentation

## Setup Instructions

### Prerequisites

- .NET 10 SDK
- Node.js (for building the client)

### Building the Client

1. Navigate to the client directory:
   ```bash
   cd handy-eddie\client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the client (output goes to `wwwroot`):
   ```bash
   npm run build
   ```

### Running the Server

1. Build and run the .NET application:
   ```bash
   dotnet build
   dotnet run
   ```

2. Click "Start Server" in the application window

3. Scan the QR code with your mobile device or manually enter the URL shown

4. Use your mobile device to control the mouse!

## JSON Protocol

### Move Action (Relative Movement)
```json
{
  "type": "move",
  "x": 10,
  "y": 5
}
```

### Click Action
```json
{
  "type": "click",
  "button": "left"
}
```

Button options: `"left"`, `"right"`, `"middle"`, `"back"`, `"forward"`

### Keyboard Action
```json
{
  "type": "keyboard",
  "text": "Hello, World!"
}
```

### Scroll Action
```json
{
  "type": "scroll",
  "deltaX": 0,
  "deltaY": 120
}
```

### System Command Action
```json
{
  "type": "system",
  "command": "sleep"
}
```

Commands: `"sleep"`, `"shutdown"`, `"restart"`, `"lock"`

## Architecture

- **Server**: C# WinForms application with HttpListener for serving static files and WebSocket support
- **Client**: Vite + Preact + TypeScript + Tailwind CSS
- **Communication**: WebSocket with JSON messages
- **Input Control**: Windows API via P/Invoke (mouse, keyboard, and system commands)

## Development

To run the client in development mode:

```bash
cd handy-eddie\client
npm run dev
```

Note: WebSocket connection will need to point to your running server.
