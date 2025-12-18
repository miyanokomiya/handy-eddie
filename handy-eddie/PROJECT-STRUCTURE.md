# Project Structure

```
handy-eddie/
Ñ•ÑüÑü handy-eddie/                    # .NET WinForms Server Application
Ñ†   Ñ•ÑüÑü Form1.cs                    # Main form with UI logic
Ñ†   Ñ•ÑüÑü Form1.Designer.cs           # Form designer code
Ñ†   Ñ•ÑüÑü Program.cs                  # Application entry point
Ñ†   Ñ•ÑüÑü MouseController.cs          # Windows mouse control via P/Invoke
Ñ†   Ñ•ÑüÑü WebSocketServer.cs          # HTTP + WebSocket server
Ñ†   Ñ•ÑüÑü handy-eddie.csproj          # Project file
Ñ†   Ñ•ÑüÑü wwwroot/                    # Static web files (served to mobile)
Ñ†   Ñ†   Ñ§ÑüÑü index.html              # Built client (or placeholder)
Ñ†   Ñ•ÑüÑü client/                     # Vite + Preact Client Source
Ñ†   Ñ†   Ñ•ÑüÑü src/
Ñ†   Ñ†   Ñ†   Ñ•ÑüÑü main.tsx            # Client entry point
Ñ†   Ñ†   Ñ†   Ñ•ÑüÑü app.tsx             # Main mobile app component
Ñ†   Ñ†   Ñ†   Ñ§ÑüÑü index.css           # Tailwind CSS
Ñ†   Ñ†   Ñ•ÑüÑü index.html              # HTML template
Ñ†   Ñ†   Ñ•ÑüÑü package.json            # Node dependencies
Ñ†   Ñ†   Ñ•ÑüÑü vite.config.ts          # Vite configuration
Ñ†   Ñ†   Ñ•ÑüÑü tsconfig.json           # TypeScript configuration
Ñ†   Ñ†   Ñ•ÑüÑü tailwind.config.js      # Tailwind CSS configuration
Ñ†   Ñ†   Ñ§ÑüÑü postcss.config.js       # PostCSS configuration
Ñ†   Ñ•ÑüÑü build-client.bat            # Windows batch build script
Ñ†   Ñ•ÑüÑü build-client.ps1            # PowerShell build script
Ñ†   Ñ•ÑüÑü README.md                   # Main documentation
Ñ†   Ñ•ÑüÑü QUICKSTART.md               # Quick start guide
Ñ†   Ñ§ÑüÑü project-plan.md             # Original project plan
```

## Key Components

### Server Side (.NET)

- **Form1**: Main WinForms UI with QR code display, server controls, and logging
- **WebSocketServer**: HTTP server for static files + WebSocket handler for mouse commands
- **MouseController**: Windows API wrapper for mouse control (SetCursorPos, mouse_event)

### Client Side (Vite + Preact + TypeScript)

- **App Component**: 
  - Touch-based trackpad area (relative mouse movement)
  - WebSocket client connection
  - Click buttons (left, right, middle)
  - Connection status indicator
  - Portrait-first responsive design using Tailwind CSS

## Communication Flow

1. User starts server Å® QR code generated with local IP
2. Mobile device scans QR Å® loads client from `wwwroot`
3. Client establishes WebSocket connection
4. Touch/click events Å® JSON messages Å® WebSocket Å® Server
5. Server processes JSON Å® MouseController Å® Windows API

## JSON Protocol

All messages are human-readable JSON:

**Move (relative):**
```json
{"type": "move", "x": 10, "y": 5}
```

**Click:**
```json
{"type": "click", "button": "left"}
```

## Build Process

1. Client: `npm run build` Å® outputs to `wwwroot/`
2. Server: `dotnet build` Å® compiles .NET application
3. Runtime: Server serves files from `wwwroot/` and handles WebSocket commands
