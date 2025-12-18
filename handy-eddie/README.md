# Handy Eddie - Mobile Mouse Controller

A web server and mobile web client that allows you to control your Windows mouse pointer from your mobile device via WebSocket.

## Features

- Control Windows mouse pointer from mobile device
- Portrait-first responsive UI
- WebSocket communication with human-readable JSON protocol
- QR code for easy connection
- Touch-based trackpad with relative mouse movement
- Left, right, and middle click buttons

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

Button options: `"left"`, `"right"`, `"middle"`

## Architecture

- **Server**: C# WinForms application with HttpListener for serving static files and WebSocket support
- **Client**: Vite + Preact + TypeScript + Tailwind CSS
- **Communication**: WebSocket with JSON messages
- **Mouse Control**: Windows API via P/Invoke

## Development

To run the client in development mode:

```bash
cd handy-eddie\client
npm run dev
```

Note: WebSocket connection will need to point to your running server.
