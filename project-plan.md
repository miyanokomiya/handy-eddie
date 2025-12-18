## Plan: Minimal Mobile Mouse Controller (Portrait-First, JSON Protocol)

Build a Rust web server and a Vite + Preact + TypeScript client (with Tailwind) for mobile devices to control the Windows mouse pointer (move and click) via WebSocket. The server uses `qrcodegen` to display a QR code with its fixed local IP. The client UI is minimal and portrait-first, using human-readable JSON for WebSocket messages.

### Steps
1. Set up a Rust web server to:
   - Serve static client assets.
   - Handle WebSocket connections for mouse control using human-readable JSON messages.
   - Display a QR code (with `qrcodegen`) containing the server’s fixed local IP and port.
2. Integrate a Rust crate (e.g., `enigo` or `rdev`) for mouse movement and click on Windows.
3. Build a minimal, portrait-first mobile web client with Vite + Preact + TypeScript and Tailwind CSS.
4. Implement basic pointer-based move and click controls in the client UI, delegating all pointer actions to the mouse.
5. Restrict server access to local network clients (bind to local IP, optionally check client IPs).

### JSON Protocol Definition

The JSON protocol for mouse control actions is defined as follows:

1. **Move Action**:
   ```json
   {
     "type": "move",
     "x": 100,
     "y": 200
   }
   ```
   - `type`: Specifies the action type (`move`).
   - `x`: The x-coordinate for the mouse pointer.
   - `y`: The y-coordinate for the mouse pointer.

2. **Click Action**:
   ```json
   {
     "type": "click",
     "button": "left"
   }
   ```
   - `type`: Specifies the action type (`click`).
   - `button`: The mouse button to click (`left`, `right`, or `middle`).

### Further Considerations
1. Ensure the client UI is responsive, with portrait as the primary layout.