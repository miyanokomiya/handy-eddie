using System.Runtime.InteropServices;

namespace handy_eddie
{
    public class MediaController
    {
        [DllImport("user32.dll")]
        private static extern uint SendInput(uint nInputs, INPUT[] pInputs, int cbSize);

        [StructLayout(LayoutKind.Sequential)]
        private struct INPUT
        {
            public uint type;
            public INPUTUNION u;
        }

        [StructLayout(LayoutKind.Explicit)]
        private struct INPUTUNION
        {
            [FieldOffset(0)]
            public MOUSEINPUT mi;
            [FieldOffset(0)]
            public KEYBDINPUT ki;
            [FieldOffset(0)]
            public HARDWAREINPUT hi;
        }

        [StructLayout(LayoutKind.Sequential)]
        private struct MOUSEINPUT
        {
            public int dx;
            public int dy;
            public uint mouseData;
            public uint dwFlags;
            public uint time;
            public IntPtr dwExtraInfo;
        }

        [StructLayout(LayoutKind.Sequential)]
        private struct KEYBDINPUT
        {
            public ushort wVk;
            public ushort wScan;
            public uint dwFlags;
            public uint time;
            public IntPtr dwExtraInfo;
        }

        [StructLayout(LayoutKind.Sequential)]
        private struct HARDWAREINPUT
        {
            public uint uMsg;
            public ushort wParamL;
            public ushort wParamH;
        }

        private const uint INPUT_KEYBOARD = 1;
        private const uint KEYEVENTF_KEYUP = 0x0002;
        private const uint KEYEVENTF_EXTENDEDKEY = 0x0001;

        // Media control virtual key codes
        private const ushort VK_MEDIA_PLAY_PAUSE = 0xB3;
        private const ushort VK_MEDIA_STOP = 0xB2;
        private const ushort VK_MEDIA_PREV_TRACK = 0xB1;
        private const ushort VK_MEDIA_NEXT_TRACK = 0xB0;
        private const ushort VK_VOLUME_MUTE = 0xAD;
        private const ushort VK_VOLUME_DOWN = 0xAE;
        private const ushort VK_VOLUME_UP = 0xAF;

        public void ExecuteMediaCommand(string command)
        {
            ushort virtualKey = command.ToLower() switch
            {
                "playpause" => VK_MEDIA_PLAY_PAUSE,
                "stop" => VK_MEDIA_STOP,
                "previous" => VK_MEDIA_PREV_TRACK,
                "next" => VK_MEDIA_NEXT_TRACK,
                "mute" => VK_VOLUME_MUTE,
                "volumedown" => VK_VOLUME_DOWN,
                "volumeup" => VK_VOLUME_UP,
                _ => 0
            };

            if (virtualKey != 0)
            {
                SendMediaKey(virtualKey);
            }
        }

        private void SendMediaKey(ushort virtualKey)
        {
            INPUT[] inputs = new INPUT[2];

            // Key down
            inputs[0] = new INPUT
            {
                type = INPUT_KEYBOARD,
                u = new INPUTUNION
                {
                    ki = new KEYBDINPUT
                    {
                        wVk = virtualKey,
                        wScan = 0,
                        dwFlags = KEYEVENTF_EXTENDEDKEY,
                        time = 0,
                        dwExtraInfo = IntPtr.Zero
                    }
                }
            };

            // Key up
            inputs[1] = new INPUT
            {
                type = INPUT_KEYBOARD,
                u = new INPUTUNION
                {
                    ki = new KEYBDINPUT
                    {
                        wVk = virtualKey,
                        wScan = 0,
                        dwFlags = KEYEVENTF_EXTENDEDKEY | KEYEVENTF_KEYUP,
                        time = 0,
                        dwExtraInfo = IntPtr.Zero
                    }
                }
            };

            SendInput(2, inputs, Marshal.SizeOf(typeof(INPUT)));
        }
    }
}
