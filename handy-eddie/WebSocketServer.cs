using System.Net;
using System.Net.Sockets;
using System.Net.WebSockets;
using System.Text;
using System.Text.Json;
using System.Diagnostics;

namespace handy_eddie
{
    public class WebSocketServer
    {
        private readonly int port;
        private readonly MouseController mouseController;
        private HttpListener? httpListener;
        private bool isRunning;
        private bool debugLogging = true;

        public event EventHandler<string>? LogMessage;

        public WebSocketServer(int port)
        {
            this.port = port;
            this.mouseController = new MouseController();
        }

        public bool DebugLogging
        {
            get => debugLogging;
            set => debugLogging = value;
        }

        public string GetLocalIPAddress()
        {
            var host = Dns.GetHostEntry(Dns.GetHostName());
            foreach (var ip in host.AddressList)
            {
                if (ip.AddressFamily == AddressFamily.InterNetwork)
                {
                    return ip.ToString();
                }
            }
            return "127.0.0.1";
        }

        private void EnsureFirewallRule()
        {
            try
            {
                var exePath = Process.GetCurrentProcess().MainModule?.FileName;
                if (string.IsNullOrEmpty(exePath))
                    return;

                // Remove any existing rule first to ensure clean state
                var removeProcess = new Process
                {
                    StartInfo = new ProcessStartInfo
                    {
                        FileName = "netsh",
                        Arguments = $"advfirewall firewall delete rule name=\"Handy Eddie Server\"",
                        UseShellExecute = false,
                        RedirectStandardOutput = true,
                        RedirectStandardError = true,
                        CreateNoWindow = true
                    }
                };

                removeProcess.Start();
                removeProcess.WaitForExit();

                // Add a comprehensive rule that allows all inbound connections on the port
                var addRuleProcess = new Process
                {
                    StartInfo = new ProcessStartInfo
                    {
                        FileName = "netsh",
                        Arguments = $"advfirewall firewall add rule name=\"Handy Eddie Server\" dir=in action=allow protocol=TCP localport={port} profile=any enable=yes",
                        UseShellExecute = false,
                        RedirectStandardOutput = true,
                        RedirectStandardError = true,
                        CreateNoWindow = true
                    }
                };

                addRuleProcess.Start();
                var output = addRuleProcess.StandardOutput.ReadToEnd();
                var error = addRuleProcess.StandardError.ReadToEnd();
                addRuleProcess.WaitForExit();
                
                if (addRuleProcess.ExitCode == 0)
                {
                    LogMessage?.Invoke(this, $"Firewall rule configured for port {port} (all profiles)");
                }
                else
                {
                    LogMessage?.Invoke(this, $"Firewall rule creation failed: {error}");
                }
            }
            catch (Exception ex)
            {
                LogMessage?.Invoke(this, $"Warning: Could not configure firewall rule: {ex.Message}");
            }
        }

        public async Task StartAsync()
        {
            if (isRunning) return;

            var localIp = GetLocalIPAddress();
            httpListener = new HttpListener();
            
            // Use + wildcard to bind to all interfaces
            // This requires either admin privileges or URL reservation
            httpListener.Prefixes.Add($"http://+:{port}/");
            
            try
            {
                EnsureFirewallRule();

                httpListener.Start();
                isRunning = true;

                LogMessage?.Invoke(this, $"Server started at http://{localIp}:{port}/");
                LogMessage?.Invoke(this, $"Listening on all interfaces - accessible from other devices");
                LogMessage?.Invoke(this, $"Test from mobile: http://{localIp}:{port}/");
                LogMessage?.Invoke(this, $"Test from PC: http://localhost:{port}/");

                _ = Task.Run(async () =>
                {
                    while (isRunning)
                    {
                        try
                        {
                            var context = await httpListener.GetContextAsync();
                            var clientIp = context.Request.RemoteEndPoint?.Address.ToString() ?? "unknown";
                            LogMessage?.Invoke(this, $"Incoming connection from: {clientIp}");
                            _ = Task.Run(() => HandleRequestAsync(context));
                        }
                        catch (Exception ex)
                        {
                            if (isRunning)
                            {
                                LogMessage?.Invoke(this, $"Error: {ex.Message}");
                            }
                        }
                    }
                });
            }
            catch (HttpListenerException ex) when (ex.ErrorCode == 5) // Access Denied
            {
                httpListener?.Close();
                httpListener = null;
                isRunning = false;
                
                throw new UnauthorizedAccessException(
                    $"Administrator privileges required. Please run as administrator or execute this command in an admin command prompt:\n\n" +
                    $"netsh http add urlacl url=http://+:{port}/ user=Everyone",
                    ex);
            }
        }

        private async Task HandleRequestAsync(HttpListenerContext context)
        {
            try
            {
                if (context.Request.IsWebSocketRequest)
                {
                    await HandleWebSocketAsync(context);
                }
                else
                {
                    await ServeStaticFileAsync(context);
                }
            }
            catch (Exception ex)
            {
                LogMessage?.Invoke(this, $"Request error: {ex.Message}");
            }
        }

        private async Task HandleWebSocketAsync(HttpListenerContext context)
        {
            HttpListenerWebSocketContext webSocketContext;
            try
            {
                webSocketContext = await context.AcceptWebSocketAsync(null);
                LogMessage?.Invoke(this, "WebSocket client connected");
            }
            catch (Exception ex)
            {
                context.Response.StatusCode = 500;
                context.Response.Close();
                LogMessage?.Invoke(this, $"WebSocket error: {ex.Message}");
                return;
            }

            var webSocket = webSocketContext.WebSocket;
            var buffer = new byte[1024];

            try
            {
                while (webSocket.State == WebSocketState.Open)
                {
                    var result = await webSocket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);

                    if (result.MessageType == WebSocketMessageType.Close)
                    {
                        await webSocket.CloseAsync(WebSocketCloseStatus.NormalClosure, "", CancellationToken.None);
                        LogMessage?.Invoke(this, "WebSocket client disconnected");
                    }
                    else if (result.MessageType == WebSocketMessageType.Text)
                    {
                        var message = Encoding.UTF8.GetString(buffer, 0, result.Count);
                        ProcessMouseCommand(message);
                    }
                }
            }
            catch (Exception ex)
            {
                LogMessage?.Invoke(this, $"WebSocket communication error: {ex.Message}");
            }
        }

        private void ProcessMouseCommand(string jsonMessage)
        {
            try
            {
                using var doc = JsonDocument.Parse(jsonMessage);
                var root = doc.RootElement;

                if (!root.TryGetProperty("type", out var typeElement))
                    return;

                var type = typeElement.GetString();

                switch (type)
                {
                    case "move":
                        if (root.TryGetProperty("x", out var xElement) &&
                            root.TryGetProperty("y", out var yElement))
                        {
                            var x = xElement.GetInt32();
                            var y = yElement.GetInt32();
                            mouseController.MoveRelative(x, y);
                            if (debugLogging)
                            {
                                LogMessage?.Invoke(this, $"Move: ({x}, {y})");
                            }
                        }
                        break;

                    case "click":
                        if (root.TryGetProperty("button", out var buttonElement))
                        {
                            var button = buttonElement.GetString() ?? "left";
                            mouseController.Click(button);
                            if (debugLogging)
                            {
                                LogMessage?.Invoke(this, $"Click: {button}");
                            }
                        }
                        break;
                }
            }
            catch (Exception ex)
            {
                LogMessage?.Invoke(this, $"Command processing error: {ex.Message}");
            }
        }

        private async Task ServeStaticFileAsync(HttpListenerContext context)
        {
            var response = context.Response;
            var path = context.Request.Url?.AbsolutePath ?? "/";

            if (path == "/")
                path = "/index.html";

            var contentType = GetContentType(path);
            response.ContentType = contentType;

            var filePath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "wwwroot", path.TrimStart('/'));

            if (File.Exists(filePath))
            {
                var content = await File.ReadAllBytesAsync(filePath);
                response.ContentLength64 = content.Length;
                await response.OutputStream.WriteAsync(content);
            }
            else
            {
                response.StatusCode = 404;
                var notFound = Encoding.UTF8.GetBytes("404 Not Found");
                response.ContentLength64 = notFound.Length;
                await response.OutputStream.WriteAsync(notFound);
            }

            response.Close();
        }

        private string GetContentType(string path)
        {
            var ext = Path.GetExtension(path).ToLower();
            return ext switch
            {
                ".html" => "text/html",
                ".css" => "text/css",
                ".js" => "application/javascript",
                ".json" => "application/json",
                ".png" => "image/png",
                ".jpg" => "image/jpeg",
                ".svg" => "image/svg+xml",
                _ => "application/octet-stream"
            };
        }

        public void Stop()
        {
            isRunning = false;
            httpListener?.Stop();
            httpListener?.Close();
            LogMessage?.Invoke(this, "Server stopped");
        }
    }
}
