using System.Runtime.InteropServices;

namespace handy_eddie
{
    public class MouseController
    {
        [DllImport("user32.dll")]
        private static extern bool SetCursorPos(int x, int y);

        [DllImport("user32.dll")]
        private static extern bool GetCursorPos(out POINT lpPoint);

        [DllImport("user32.dll")]
        private static extern void mouse_event(uint dwFlags, int dx, int dy, uint dwData, int dwExtraInfo);

        [StructLayout(LayoutKind.Sequential)]
        private struct POINT
        {
            public int X;
            public int Y;
        }

        private const uint MOUSEEVENTF_LEFTDOWN = 0x0002;
        private const uint MOUSEEVENTF_LEFTUP = 0x0004;
        private const uint MOUSEEVENTF_RIGHTDOWN = 0x0008;
        private const uint MOUSEEVENTF_RIGHTUP = 0x0010;
        private const uint MOUSEEVENTF_MIDDLEDOWN = 0x0020;
        private const uint MOUSEEVENTF_MIDDLEUP = 0x0040;
        private const uint MOUSEEVENTF_WHEEL = 0x0800;
        private const uint MOUSEEVENTF_HWHEEL = 0x01000;
        private const uint MOUSEEVENTF_XDOWN = 0x0080;
        private const uint MOUSEEVENTF_XUP = 0x0100;

        private const uint XBUTTON1 = 0x0001;
        private const uint XBUTTON2 = 0x0002;

        public void Move(int x, int y)
        {
            SetCursorPos(x, y);
        }

        public void MoveRelative(int deltaX, int deltaY)
        {
            if (GetCursorPos(out POINT currentPos))
            {
                SetCursorPos(currentPos.X + deltaX, currentPos.Y + deltaY);
            }
        }

        public void Click(string button)
        {
            uint downFlag = 0;
            uint upFlag = 0;
            uint dwData = 0;

            switch (button.ToLower())
            {
                case "left":
                    downFlag = MOUSEEVENTF_LEFTDOWN;
                    upFlag = MOUSEEVENTF_LEFTUP;
                    break;
                case "right":
                    downFlag = MOUSEEVENTF_RIGHTDOWN;
                    upFlag = MOUSEEVENTF_RIGHTUP;
                    break;
                case "middle":
                    downFlag = MOUSEEVENTF_MIDDLEDOWN;
                    upFlag = MOUSEEVENTF_MIDDLEUP;
                    break;
                case "back":
                    downFlag = MOUSEEVENTF_XDOWN;
                    upFlag = MOUSEEVENTF_XUP;
                    dwData = XBUTTON1;
                    break;
                case "forward":
                    downFlag = MOUSEEVENTF_XDOWN;
                    upFlag = MOUSEEVENTF_XUP;
                    dwData = XBUTTON2;
                    break;
                default:
                    return;
            }

            mouse_event(downFlag, 0, 0, dwData, 0);
            mouse_event(upFlag, 0, 0, dwData, 0);
        }

        public void Scroll(double deltaX, double deltaY)
        {
            if (deltaY != 0)
            {
                int scrollAmount = (int)(-deltaY);
                mouse_event(MOUSEEVENTF_WHEEL, 0, 0, (uint)scrollAmount, 0);
            }

            if (deltaX != 0)
            {
                int scrollAmount = (int)deltaX;
                mouse_event(MOUSEEVENTF_HWHEEL, 0, 0, (uint)scrollAmount, 0);
            }
        }
    }
}
