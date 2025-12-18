# Quick Start Guide

## First Time Setup

1. **Build the Client Application**
   
   Run ONE of these commands in the `handy-eddie` directory:
   
   **Windows Batch:**
   ```cmd
   build-client.bat
   ```
   
   **PowerShell:**
   ```powershell
   .\build-client.ps1
   ```
   
   **Manual:**
   ```cmd
   cd client
   npm install
   npm run build
   cd ..
   ```

2. **Run the Application**
   
   - Open the solution in Visual Studio
   - Press F5 or click "Start"
   - OR use command line:
     ```cmd
     dotnet run --project handy-eddie\handy-eddie.csproj
     ```

3. **Start the Server**
   
   - Click the "Start Server" button in the application window
   - A QR code will appear with the server URL

4. **Connect from Mobile**
   
   - Scan the QR code with your mobile device's camera
   - Or manually type the URL shown in the application
   - The mobile web interface will load

5. **Control Your Mouse**
   
   - Touch and drag on the touchpad area to move the mouse
   - Use the bottom buttons for left/right/middle clicks

## Troubleshooting

### "404 Not Found" or "Build Required" page appears
- The client hasn't been built yet
- Run `build-client.bat` or `build-client.ps1`

### Cannot connect from mobile device
- Ensure your mobile device is on the same WiFi network
- Check Windows Firewall settings (may need to allow the application)
- Try manually entering the IP address shown in the application

### Mouse not moving
- Check the log messages in the application
- Ensure WebSocket connection shows as "Connected" on mobile
- Try clicking "Stop Server" then "Start Server" again

## Network Security

The server only accepts connections from devices on your local network. The IP address is automatically detected and displayed with a QR code for easy mobile access.

## Development

To modify the client interface:

1. Start the Vite dev server:
   ```cmd
   cd client
   npm run dev
   ```

2. Access at `http://localhost:5173` (or port shown)

3. When finished, rebuild for production:
   ```cmd
   npm run build
   ```
