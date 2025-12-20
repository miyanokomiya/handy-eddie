using System.Diagnostics;
using System.Runtime.InteropServices;

namespace handy_eddie
{
    public class SystemController
    {
        [DllImport("user32.dll")]
        private static extern bool LockWorkStation();

        [DllImport("powrprof.dll", SetLastError = true)]
        private static extern bool SetSuspendState(bool hibernate, bool forceCritical, bool disableWakeEvent);

        public event EventHandler<string>? LogMessage;

        public void ExecuteCommand(string command)
        {
            try
            {
                switch (command.ToLower())
                {
                    case "sleep":
                        Sleep();
                        break;
                    case "shutdown":
                        Shutdown();
                        break;
                    case "restart":
                        Restart();
                        break;
                    case "lock":
                        Lock();
                        break;
                    default:
                        LogMessage?.Invoke(this, $"Unknown system command: {command}");
                        break;
                }
            }
            catch (Exception ex)
            {
                LogMessage?.Invoke(this, $"Error executing system command '{command}': {ex.Message}");
            }
        }

        private void Sleep()
        {
            LogMessage?.Invoke(this, "Putting system to sleep...");
            SetSuspendState(false, true, true);
        }

        private void Shutdown()
        {
            LogMessage?.Invoke(this, "Shutting down system...");
            var process = new Process
            {
                StartInfo = new ProcessStartInfo
                {
                    FileName = "shutdown",
                    Arguments = "/s /t 0",
                    UseShellExecute = false,
                    CreateNoWindow = true
                }
            };
            process.Start();
        }

        private void Restart()
        {
            LogMessage?.Invoke(this, "Restarting system...");
            var process = new Process
            {
                StartInfo = new ProcessStartInfo
                {
                    FileName = "shutdown",
                    Arguments = "/r /t 0",
                    UseShellExecute = false,
                    CreateNoWindow = true
                }
            };
            process.Start();
        }

        private void Lock()
        {
            LogMessage?.Invoke(this, "Locking workstation...");
            LockWorkStation();
        }
    }
}
