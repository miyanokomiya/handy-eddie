using QRCoder;
using System.Drawing;

namespace handy_eddie
{
    public partial class Form1 : Form
    {
        private WebSocketServer? server;

        public Form1()
        {
            InitializeComponent();
        }

        private void Form1_Load(object sender, EventArgs e)
        {
            checkBoxDebugLog.Checked = System.Diagnostics.Debugger.IsAttached;
            LogMessage("Ready to start server");
        }

        private async void buttonStart_Click(object sender, EventArgs e)
        {
            try
            {
                int port = (int)numericUpDownPort.Value;
                bool secureMode = checkBoxSecureMode.Checked;
                
                server = new WebSocketServer(port, secureMode);
                server.DebugLogging = checkBoxDebugLog.Checked;
                server.LogMessage += (s, msg) => LogMessage(msg);

                await server.StartAsync();

                var url = $"http://{server.GetLocalIPAddress()}:{port}/";
                if (secureMode && !string.IsNullOrEmpty(server.SecurityCode))
                {
                    url += $"?code={server.SecurityCode}";
                }
                
                labelUrl.Text = $"Server URL: {url}";

                GenerateQRCode(url);

                buttonStart.Enabled = false;
                buttonStop.Enabled = true;
                numericUpDownPort.Enabled = false;
                checkBoxSecureMode.Enabled = false;

                if (secureMode)
                {
                    LogMessage($"Secure mode enabled with code: {server.SecurityCode}");
                }
                LogMessage("Server started successfully");
            }
            catch (UnauthorizedAccessException ex)
            {
                int port = (int)numericUpDownPort.Value;
                LogMessage($"Error starting server: {ex.Message}");
                MessageBox.Show(
                    $"Administrator privileges required to start the server.\n\n" +
                    $"Please either:\n" +
                    $"1. Run this application as Administrator, OR\n" +
                    $"2. Open Command Prompt as Administrator and run:\n\n" +
                    $"   netsh http add urlacl url=http://+:{port}/ user=Everyone\n\n" +
                    $"Then restart the application.",
                    "Administrator Privileges Required",
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Warning);
            }
            catch (Exception ex)
            {
                LogMessage($"Error starting server: {ex.Message}");
                MessageBox.Show($"Failed to start server: {ex.Message}", "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        private void buttonStop_Click(object sender, EventArgs e)
        {
            StopServer();
        }

        private void checkBoxDebugLog_CheckedChanged(object sender, EventArgs e)
        {
            if (server != null)
            {
                server.DebugLogging = checkBoxDebugLog.Checked;
                LogMessage($"Debug logging {(checkBoxDebugLog.Checked ? "enabled" : "disabled")}");
            }
        }

        private void StopServer()
        {
            if (server != null)
            {
                server.Stop();
                server = null;
                pictureBoxQR.Image = null;
                labelUrl.Text = "Server URL: ";
                buttonStart.Enabled = true;
                buttonStop.Enabled = false;
                numericUpDownPort.Enabled = true;
                checkBoxSecureMode.Enabled = true;
                LogMessage("Server stopped");
            }
        }

        private void GenerateQRCode(string url)
        {
            try
            {
                using var qrGenerator = new QRCodeGenerator();
                var qrCodeData = qrGenerator.CreateQrCode(url, QRCodeGenerator.ECCLevel.Q);
                using var qrCode = new QRCode(qrCodeData);
                var qrCodeImage = qrCode.GetGraphic(20);
                pictureBoxQR.Image = qrCodeImage;
            }
            catch (Exception ex)
            {
                LogMessage($"Error generating QR code: {ex.Message}");
            }
        }

        private void LogMessage(string message)
        {
            if (textBoxLog.InvokeRequired)
            {
                textBoxLog.Invoke(() => LogMessage(message));
            }
            else
            {
                textBoxLog.AppendText($"[{DateTime.Now:HH:mm:ss}] {message}{Environment.NewLine}");
            }
        }

        private void Form1_FormClosing(object sender, FormClosingEventArgs e)
        {
            StopServer();
        }
    }
}
