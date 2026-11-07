using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Diagnostics;
using System.IO;
using System.Runtime.InteropServices;
using System.Text;

namespace PLCCode.Weinview
{
    public sealed class WindowInfo
    {
        public long Hwnd { get; set; }
        public int Pid { get; set; }
        public int Id { get; set; }
        public string Class { get; set; }
        public string Title { get; set; }
        public bool Visible { get; set; }
        public bool Enabled { get; set; }
    }

    public sealed class ActivationInfo
    {
        public long MainHwnd { get; set; }
        public long ForegroundHwnd { get; set; }
        public long ActiveHwnd { get; set; }
        public long FocusHwnd { get; set; }
        public uint ThreadId { get; set; }
        public uint Flags { get; set; }
    }

    public sealed class DocumentActivationInfo
    {
        public long MainHwnd { get; set; }
        public long ViewHwnd { get; set; }
        public long MdiClientHwnd { get; set; }
        public long DocumentHwnd { get; set; }
        public long ActiveDocumentHwnd { get; set; }
        public string ViewTitle { get; set; }
        public string MainTitle { get; set; }
        public WindowInfo[] ParentChain { get; set; }
    }

    // Bound to one explicitly selected process instance. No coordinates, keys or UIA.
    public sealed class NativeControls
    {
        private readonly int pid;
        private readonly long creationTicks;
        private readonly string exePath;
        private readonly uint timeout;
        private const int TextLimit = 262144;
        private const uint WM_GETTEXT = 0x000D, WM_GETTEXTLENGTH = 0x000E;
        private const uint WM_SETTEXT = 0x000C, WM_COMMAND = 0x0111, BM_CLICK = 0x00F5;
        private const uint LB_GETCOUNT = 0x018B, LB_GETTEXTLEN = 0x018A, LB_GETTEXT = 0x0189;
        private const uint LB_SETCURSEL = 0x0186, LB_GETCURSEL = 0x0188;
        private const uint WM_MDIACTIVATE = 0x0222, WM_MDIGETACTIVE = 0x0229;
        private const uint SMTO_ABORTIFHUNG = 2, SMTO_ERRORONEXIT = 32;
        private const uint GW_OWNER = 4, GA_ROOT = 2;
        private delegate bool EnumProc(IntPtr hwnd, IntPtr param);
        [StructLayout(LayoutKind.Sequential)] private struct GuiThreadInfo
        {
            public uint Size, Flags;
            public IntPtr Active, Focus, Capture, MenuOwner, MoveSize, Caret;
            public int Left, Top, Right, Bottom;
        }

        [DllImport("user32.dll", SetLastError = true)] private static extern bool EnumWindows(EnumProc fn, IntPtr param);
        [DllImport("user32.dll", SetLastError = true)] private static extern bool EnumChildWindows(IntPtr parent, EnumProc fn, IntPtr param);
        [DllImport("user32.dll")] private static extern bool IsWindow(IntPtr hwnd);
        [DllImport("user32.dll")] private static extern bool IsWindowVisible(IntPtr hwnd);
        [DllImport("user32.dll")] private static extern bool IsWindowEnabled(IntPtr hwnd);
        [DllImport("user32.dll")] private static extern bool IsChild(IntPtr parent, IntPtr child);
        [DllImport("user32.dll")] private static extern bool IsWindowUnicode(IntPtr hwnd);
        [DllImport("user32.dll")] private static extern IntPtr GetParent(IntPtr hwnd);
        [DllImport("user32.dll", EntryPoint = "GetWindowLongW")] private static extern int GetWindowStyle(IntPtr hwnd, int index);
        [DllImport("user32.dll")] private static extern uint GetWindowThreadProcessId(IntPtr hwnd, out uint processId);
        [DllImport("user32.dll", CharSet = CharSet.Unicode)] private static extern int GetClassNameW(IntPtr hwnd, StringBuilder text, int count);
        [DllImport("user32.dll", CharSet = CharSet.Unicode)] private static extern int GetWindowTextW(IntPtr hwnd, StringBuilder text, int count);
        [DllImport("user32.dll")] private static extern int GetDlgCtrlID(IntPtr hwnd);
        [DllImport("user32.dll")] private static extern IntPtr GetWindow(IntPtr hwnd, uint command);
        [DllImport("user32.dll")] private static extern IntPtr GetAncestor(IntPtr hwnd, uint flags);
        [DllImport("user32.dll")] private static extern bool SetForegroundWindow(IntPtr hwnd);
        [DllImport("user32.dll")] private static extern IntPtr GetForegroundWindow();
        [DllImport("user32.dll", SetLastError = true)] private static extern bool AttachThreadInput(uint attach, uint attachTo, bool attachInput);
        [DllImport("user32.dll", SetLastError = true)] private static extern bool BringWindowToTop(IntPtr hwnd);
        [DllImport("user32.dll")] private static extern bool IsIconic(IntPtr hwnd);
        [DllImport("user32.dll", SetLastError = true)] private static extern bool ShowWindowAsync(IntPtr hwnd, int show);
        [DllImport("kernel32.dll")] private static extern uint GetCurrentThreadId();
        [DllImport("user32.dll", SetLastError = true)] private static extern bool GetGUIThreadInfo(uint threadId, ref GuiThreadInfo info);
        [DllImport("user32.dll", SetLastError = true)] private static extern bool PostMessageW(IntPtr hwnd, uint msg, UIntPtr wParam, IntPtr lParam);
        [DllImport("user32.dll", SetLastError = true)] private static extern IntPtr SendMessageTimeoutW(
            IntPtr hwnd, uint msg, UIntPtr wParam, IntPtr lParam, uint flags, uint ms, out UIntPtr result);

        public NativeControls(int processId, long processCreationUtcTicks, string executablePath, int timeoutMs)
        {
            if (processId <= 0 || processCreationUtcTicks <= 0) throw new ArgumentException("PID and UTC creation ticks are required.");
            if (String.IsNullOrWhiteSpace(executablePath)) throw new ArgumentException("Executable path is required.");
            if (timeoutMs < 100 || timeoutMs > 10000) throw new ArgumentOutOfRangeException("timeoutMs", "Timeout must be 100..10000 ms.");
            pid = processId; creationTicks = processCreationUtcTicks;
            exePath = Path.GetFullPath(executablePath); timeout = (uint)timeoutMs;
            ValidateProcess();
        }

        [DllImport("kernel32.dll", SetLastError = true)] private static extern IntPtr OpenProcess(uint access, bool inherit, int processId);
        [DllImport("kernel32.dll", SetLastError = true)] private static extern bool CloseHandle(IntPtr handle);
        [DllImport("kernel32.dll", SetLastError = true, CharSet = CharSet.Unicode)] private static extern bool QueryFullProcessImageNameW(IntPtr handle, uint flags, StringBuilder path, ref uint size);
        [DllImport("kernel32.dll", SetLastError = true)] private static extern bool GetProcessTimes(IntPtr handle, out long created, out long exited, out long kernel, out long user);
        [DllImport("kernel32.dll", SetLastError = true)] private static extern uint WaitForSingleObject(IntPtr handle, uint milliseconds);

        private void ValidateProcess()
        {
            // Kernel identity is available before loader modules/MainModule are ready.
            // Every identity value below comes from the same handle, never a module list.
            IntPtr handle = OpenProcess(0x00101000, false, pid); // SYNCHRONIZE | QUERY_LIMITED_INFORMATION
            if (handle == IntPtr.Zero)
                throw new InvalidOperationException("Cannot open bound process identity handle (Win32 " + Marshal.GetLastWin32Error() + ").");
            try
            {
                long created, exited, kernel, user;
                if (!GetProcessTimes(handle, out created, out exited, out kernel, out user))
                    throw new InvalidOperationException("Cannot read bound process creation time (Win32 " + Marshal.GetLastWin32Error() + ").");
                if (DateTime.FromFileTimeUtc(created).Ticks != creationTicks)
                    throw new InvalidOperationException("Bound process exited or PID was reused.");
                StringBuilder path = new StringBuilder(32768); uint size = (uint)path.Capacity;
                if (!QueryFullProcessImageNameW(handle, 0, path, ref size) || size == 0)
                    throw new InvalidOperationException("Cannot read bound process kernel image path (Win32 " + Marshal.GetLastWin32Error() + ").");
                if (!String.Equals(Path.GetFullPath(path.ToString()), exePath, StringComparison.OrdinalIgnoreCase))
                    throw new InvalidOperationException("Bound executable path changed.");
                uint state = WaitForSingleObject(handle, 0);
                if (state == 0) throw new InvalidOperationException("Bound process exited or PID was reused.");
                if (state != 0x00000102)
                    throw new InvalidOperationException("Cannot verify bound process liveness (Win32 " + Marshal.GetLastWin32Error() + ").");
            }
            finally { CloseHandle(handle); }
        }
        private sealed class WindowAbsentException : InvalidOperationException
        {
            public WindowAbsentException() : base("Window was destroyed during inspection.") { }
        }

        private bool MaySkipDestroyedWindow(IntPtr window)
        {
            ValidateProcess();
            return !IsWindow(window);
        }

        private IntPtr ValidateWindow(long handle)
        {
            ValidateProcess();
            IntPtr hwnd = new IntPtr(handle); uint actualPid;
            if (!IsWindow(hwnd)) throw new WindowAbsentException();
            if (GetWindowThreadProcessId(hwnd, out actualPid) == 0 || actualPid != (uint)pid)
            {
                // A startup/closing HWND can disappear after IsWindow and before
                // GetWindowThreadProcessId. EnumTopWindows skips only that proven
                // destroyed handle; a live handle owned by another PID stays fatal.
                if (!IsWindow(hwnd)) throw new WindowAbsentException();
                throw new InvalidOperationException("Window is absent or belongs to a different process.");
            }
            return hwnd;
        }

        private static string ClassName(IntPtr hwnd)
        {
            StringBuilder value = new StringBuilder(256);
            GetClassNameW(hwnd, value, value.Capacity);
            return value.ToString();
        }

        private long Send(IntPtr hwnd, uint msg, UIntPtr wParam, IntPtr lParam)
        {
            ValidateWindow(hwnd.ToInt64()); UIntPtr result;
            IntPtr status = SendMessageTimeoutW(hwnd, msg, wParam, lParam,
                SMTO_ABORTIFHUNG | SMTO_ERRORONEXIT, timeout, out result);
            if (status == IntPtr.Zero)
                throw new InvalidOperationException("Control message timed out or failed (message 0x" + msg.ToString("X") + ", Win32 " + Marshal.GetLastWin32Error() + ").");
            // LRESULT is pointer-sized signed, important for LB_ERR (-1).
            return IntPtr.Size == 8 ? unchecked((long)result.ToUInt64()) : unchecked((int)result.ToUInt32());
        }

        public string GetControlText(long hwnd, int maxChars)
        {
            if (maxChars < 1 || maxChars > TextLimit) throw new ArgumentOutOfRangeException("maxChars");
            IntPtr window = ValidateWindow(hwnd);
            long length = Send(window, WM_GETTEXTLENGTH, UIntPtr.Zero, IntPtr.Zero);
            if (length < 0 || length > maxChars + 1L) throw new InvalidOperationException("Control text exceeds the permitted length.");
            // Allocate the permitted length, not the observed length, to tolerate growth between messages.
            IntPtr buffer = Marshal.AllocHGlobal(checked((maxChars + 1) * 2));
            try
            {
                for (int index = 0; index <= maxChars; index++) Marshal.WriteInt16(buffer, index * 2, 0);
                long copied = Send(window, WM_GETTEXT, new UIntPtr((uint)(maxChars + 1)), buffer);
                if (copied < 0 || copied > maxChars + 1L) throw new InvalidOperationException("Invalid text length returned by control.");
                // Some BCG controls include their terminator in LRESULT. Decode bounded
                // UTF-16 to the first NUL; never trim meaningful source characters.
                int actual = 0;
                while (actual <= maxChars && Marshal.ReadInt16(buffer, actual * 2) != 0) actual++;
                if (actual > maxChars) throw new InvalidOperationException("Control omitted its bounded text terminator.");
                string text = Marshal.PtrToStringUni(buffer, actual);
                if (Send(window, WM_GETTEXTLENGTH, UIntPtr.Zero, IntPtr.Zero) > maxChars + 1L)
                    throw new InvalidOperationException("Control text grew past the permitted length.");
                return text ?? "";
            }
            finally { Marshal.FreeHGlobal(buffer); }
        }

        public static string NormalizeLF(string text)
        {
            return (text ?? "").Replace("\r\n", "\n").Replace("\r", "\n");
        }

        public void SetControlText(long hwnd, string text)
        {
            if (text == null || text.Length > TextLimit || text.IndexOf('\0') >= 0)
                throw new ArgumentException("Text must be non-null, NUL-free and within the size limit.");
            IntPtr control = ValidateWindow(hwnd);
            if (ClassName(control).IndexOf("Edit", StringComparison.OrdinalIgnoreCase) < 0)
                throw new InvalidOperationException("Text writing requires an identified Edit control.");
            EnsureInteractive(control, GetAncestor(control, GA_ROOT));
            IntPtr buffer = Marshal.StringToHGlobalUni(text);
            try
            {
                if (Send(control, WM_SETTEXT, UIntPtr.Zero, buffer) == 0)
                    throw new InvalidOperationException("Edit control rejected the text.");
            }
            finally { Marshal.FreeHGlobal(buffer); }
            if (!String.Equals(NormalizeLF(GetControlText(hwnd, TextLimit)), NormalizeLF(text), StringComparison.Ordinal))
                throw new InvalidOperationException("Text readback did not match; writing is not verified.");
        }

        private WindowInfo Describe(IntPtr window)
        {
            ValidateWindow(window.ToInt64());
            // Cross-process GetWindowText reads cached captions/ordinary labels only.
            // Never send WM_GETTEXT to every Qt/Chrome/custom child during enumeration.
            StringBuilder caption = new StringBuilder(4096);
            GetWindowTextW(window, caption, caption.Capacity);
            WindowInfo description = new WindowInfo { Hwnd = window.ToInt64(), Pid = pid, Id = GetDlgCtrlID(window),
                Class = ClassName(window), Title = caption.ToString(),
                Visible = IsWindowVisible(window), Enabled = IsWindowEnabled(window) };
            ValidateWindow(window.ToInt64());
            return description;
        }

        public WindowInfo[] EnumTopWindows()
        {
            ValidateProcess(); List<WindowInfo> rows = new List<WindowInfo>(); Exception error = null;
            EnumProc callback = delegate(IntPtr window, IntPtr ignored)
            {
                uint actualPid; GetWindowThreadProcessId(window, out actualPid);
                if (actualPid != (uint)pid) return true;
                try { rows.Add(Describe(window)); }
                catch (WindowAbsentException ex)
                {
                    // Skip only this proven-destroyed HWND while the original PID identity
                    // still verifies. A reused/live HWND or process failure remains fatal.
                    try { if (MaySkipDestroyedWindow(window)) return true; }
                    catch (Exception identityError) { error = identityError; return false; }
                    error = ex; return false;
                }
                catch (Exception ex) { error = ex; return false; }
                return true;
            };
            EnumWindows(callback, IntPtr.Zero); GC.KeepAlive(callback);
            if (error != null) throw new InvalidOperationException("Cannot inspect bound top-level windows.", error);
            ValidateProcess(); return rows.ToArray();
        }

        public WindowInfo[] EnumChildControls(long parentHwnd)
        {
            IntPtr parent = ValidateWindow(parentHwnd); List<WindowInfo> rows = new List<WindowInfo>(); Exception error = null;
            EnumProc callback = delegate(IntPtr window, IntPtr ignored)
            {
                uint actualPid; uint thread = GetWindowThreadProcessId(window, out actualPid);
                // Foreign WebView descendants are excluded from bound discovery/mutation.
                if (thread != 0 && actualPid != (uint)pid) return true;
                try { rows.Add(Describe(window)); }
                catch (WindowAbsentException ex)
                {
                    // Skip only this proven-destroyed HWND while the original PID identity
                    // still verifies. A reused/live HWND or process failure remains fatal.
                    try { if (MaySkipDestroyedWindow(window)) return true; }
                    catch (Exception identityError) { error = identityError; return false; }
                    error = ex; return false;
                }
                catch (Exception ex) { error = ex; return false; }
                return true;
            };
            EnumChildWindows(parent, callback, IntPtr.Zero); GC.KeepAlive(callback);
            if (error != null) throw new InvalidOperationException("Cannot inspect child controls.", error);
            ValidateWindow(parentHwnd); return rows.ToArray();
        }

        public WindowInfo FindUniqueWindow(string className, string title)
        {
            WindowInfo found = null;
            foreach (WindowInfo item in EnumTopWindows())
            {
                if (!item.Visible || !item.Enabled || (className != null && item.Class != className) || (title != null && item.Title != title)) continue;
                if (found != null) throw new InvalidOperationException("Multiple matching top-level windows.");
                found = item;
            }
            if (found == null) throw new InvalidOperationException("Matching top-level window not found.");
            return found;
        }

        public WindowInfo FindUniqueControl(long parentHwnd, int controlId, string className, string label)
        {
            return FindControl(parentHwnd, controlId, className, label, false);
        }

        // PowerShell 5.1 converts $null to String.Empty for string parameters.
        // Explicit no-label entry points preserve the intended C# null contract.
        public WindowInfo FindUniqueControlWithoutLabel(long parentHwnd, int controlId, string className)
        {
            return FindControl(parentHwnd, controlId, className, null, false);
        }

        public WindowInfo FindUniqueControlByClassPrefixWithoutLabel(long parentHwnd, int controlId, string classPrefix)
        {
            if (String.IsNullOrEmpty(classPrefix)) throw new ArgumentException("A class prefix is required.");
            return FindControl(parentHwnd, controlId, classPrefix, null, true);
        }

        public WindowInfo FindUniqueControlByClassPrefix(long parentHwnd, int controlId, string classPrefix, string label)
        {
            if (String.IsNullOrEmpty(classPrefix)) throw new ArgumentException("A class prefix is required.");
            return FindControl(parentHwnd, controlId, classPrefix, label, true);
        }

        private WindowInfo FindControl(long parentHwnd, int controlId, string className, string label, bool prefix)
        {
            WindowInfo found = null;
            foreach (WindowInfo item in EnumChildControls(parentHwnd))
            {
                bool classMatches = className == null || (prefix ? item.Class.StartsWith(className, StringComparison.Ordinal) : item.Class == className);
                if (!item.Visible || !item.Enabled || item.Id != controlId ||
                    !classMatches || (label != null && item.Title != label)) continue;
                if (found != null) throw new InvalidOperationException("Multiple matching controls in the parent window.");
                found = item;
            }
            if (found == null) throw new InvalidOperationException("Matching control not found or not interactive.");
            return found;
        }

        private void EnsureInteractive(IntPtr target, IntPtr top)
        {
            ValidateWindow(target.ToInt64()); ValidateWindow(top.ToInt64());
            if (!IsWindowVisible(target) || !IsWindowEnabled(target) || !IsWindowVisible(top) || !IsWindowEnabled(top))
                throw new InvalidOperationException("Target or parent is hidden or disabled.");
            // A modeless macro editor can have an enabled Macro Manager and main window
            // in its owner chain. These are legitimate ancestors, not competing dialogs.
            HashSet<long> ancestors = new HashSet<long>();
            IntPtr ancestor = top;
            while (ancestor != IntPtr.Zero)
            {
                ValidateWindow(ancestor.ToInt64());
                if (!ancestors.Add(ancestor.ToInt64()) || ancestors.Count > 64)
                    throw new InvalidOperationException("Owner chain is cyclic or exceeds the supported depth.");
                ancestor = GetWindow(ancestor, GW_OWNER);
            }
            foreach (WindowInfo other in EnumTopWindows())
            {
                if (!other.Visible || ancestors.Contains(other.Hwnd)) continue;
                IntPtr window = new IntPtr(other.Hwnd), owner = GetWindow(window, GW_OWNER);
                bool modal = other.Class == "#32770" || (owner != IntPtr.Zero && !IsWindowEnabled(owner));
                // A disabled owner is expected below the currently active modal dialog.
                // CN421 opens its macro import file dialog alongside an enabled
                // macro manager (not in the file dialog's owner chain). Accept
                // only this observed pair; competing dialogs still block edits.
                if (modal && other.Enabled && other.Class == "#32770" && other.Title == "宏指令" &&
                    ClassName(top) == "#32770" && Describe(top).Title == "导入宏")
                {
                    FindUniqueControl(other.Hwnd, 1147, "Button", "导入...");
                    FindUniqueControl(top.ToInt64(), 1, "Button", "打开(&O)");
                    FindUniqueControlWithoutLabel(top.ToInt64(), 1148, "Edit");
                    continue;
                }
                if (modal && other.Enabled) throw new InvalidOperationException("Another modal window blocks this action: " + other.Title);
            }
        }

        // The bound 421 editor uses native MDI documents. Handles are discovered
        // from the exact view's current parent chain, never retained across calls.
        public DocumentActivationInfo ActivateOwnedDocument(long mainHwnd, long viewHwnd, string exactViewTitle)
        {
            if (String.IsNullOrWhiteSpace(exactViewTitle) || exactViewTitle.Length > 2048)
                throw new ArgumentException("Exact bounded document title required.");
            IntPtr main = ValidateWindow(mainHwnd), view = ValidateWindow(viewHwnd);
            if (ClassName(main) != "EasyBuilderPro" || GetAncestor(main, GA_ROOT) != main || !IsChild(main, view))
                throw new InvalidOperationException("Actual own main/document child binding required.");
            EnsureInteractive(view, main);
            foreach (WindowInfo other in EnumTopWindows())
                if (other.Visible && other.Class == "#32770")
                    throw new InvalidOperationException("Close owned dialogs before document activation.");

            WindowInfo target = Describe(view); int matchingViews = 0; WindowInfo uniqueClient = null;
            if (target.Id != 59665 || target.Class != "AfxFrameOrView140u" || target.Title != exactViewTitle)
                throw new InvalidOperationException("Exact native document view ID/class/title required.");
            foreach (WindowInfo item in EnumChildControls(mainHwnd))
            {
                if (item.Id == 59665 && item.Class == "AfxFrameOrView140u" && item.Title == exactViewTitle && item.Visible && item.Enabled)
                    matchingViews++;
                if (item.Class == "MDIClient")
                {
                    if (uniqueClient != null) throw new InvalidOperationException("Native MDI client is ambiguous.");
                    uniqueClient = item;
                }
            }
            if (matchingViews != 1 || uniqueClient == null)
                throw new InvalidOperationException("Unique actual native document/client required.");

            List<WindowInfo> parents = new List<WindowInfo>(); HashSet<long> seen = new HashSet<long>();
            IntPtr current = view, client = IntPtr.Zero, document = IntPtr.Zero;
            for (int depth = 0; depth < 12; depth++)
            {
                WindowInfo item = Describe(current);
                if (!seen.Add(item.Hwnd)) throw new InvalidOperationException("Document parent chain is cyclic.");
                parents.Add(item);
                if (item.Class == "MDIClient")
                {
                    if (client != IntPtr.Zero || parents.Count < 2)
                        throw new InvalidOperationException("Document MDI ancestor is ambiguous.");
                    client = current; document = new IntPtr(parents[parents.Count - 2].Hwnd);
                }
                if (current == main) break;
                current = GetParent(current);
                if (current == IntPtr.Zero) break;
            }
            if (parents[parents.Count - 1].Hwnd != mainHwnd || client == IntPtr.Zero ||
                client.ToInt64() != uniqueClient.Hwnd || document == view || GetParent(document) != client)
                throw new InvalidOperationException("Actual document ancestry must reach the unique own MDI client/main.");
            EnsureInteractive(client, main); EnsureInteractive(document, main);
            for (int index = 0; index + 1 < parents.Count; index++)
                if (GetParent(ValidateWindow(parents[index].Hwnd)).ToInt64() != parents[index + 1].Hwnd)
                    throw new InvalidOperationException("Document parent chain changed before activation.");
            if (Describe(view).Title != exactViewTitle)
                throw new InvalidOperationException("Document title changed before activation.");

            // Microsoft contract: wParam is the MDI child; lParam is unused.
            // WM_MDIACTIVATE returns zero on success, so verify WM_MDIGETACTIVE.
            Send(client, WM_MDIACTIVATE, new UIntPtr(unchecked((ulong)document.ToInt64())), IntPtr.Zero);
            long active = Send(client, WM_MDIGETACTIVE, UIntPtr.Zero, IntPtr.Zero);
            if (active != document.ToInt64())
                throw new InvalidOperationException("WM_MDIGETACTIVE did not return the requested own document.");
            EnsureInteractive(view, main);
            for (int index = 0; index + 1 < parents.Count; index++)
                if (GetParent(ValidateWindow(parents[index].Hwnd)).ToInt64() != parents[index + 1].Hwnd)
                    throw new InvalidOperationException("Document parent chain changed after activation.");
            WindowInfo finalView = Describe(view), finalMain = Describe(main);
            if (finalView.Id != 59665 || finalView.Class != "AfxFrameOrView140u" || finalView.Title != exactViewTitle ||
                !finalMain.Title.Contains(exactViewTitle))
                throw new InvalidOperationException("Activated native document title readback differs.");
            return new DocumentActivationInfo { MainHwnd = mainHwnd, ViewHwnd = viewHwnd,
                MdiClientHwnd = client.ToInt64(), DocumentHwnd = document.ToInt64(), ActiveDocumentHwnd = active,
                ViewTitle = finalView.Title, MainTitle = finalMain.Title, ParentChain = parents.ToArray() };
        }

        private IntPtr ListBox(long hwnd)
        {
            IntPtr control = ValidateWindow(hwnd);
            if (!String.Equals(ClassName(control), "ListBox", StringComparison.OrdinalIgnoreCase))
                throw new InvalidOperationException("List operations require a standard Unicode ListBox.");
            int style = GetWindowStyle(control, -16);
            if (!IsWindowUnicode(control) || ((style & 0x30) != 0 && (style & 0x40) == 0))
                throw new InvalidOperationException("ListBox must be Unicode and store strings, not owner-draw item pointers.");
            return control;
        }

        public string[] GetListBoxItems(long hwnd)
        {
            IntPtr control = ListBox(hwnd);
            long count = Send(control, LB_GETCOUNT, UIntPtr.Zero, IntPtr.Zero);
            if (count < 0 || count > 10000) throw new InvalidOperationException("Invalid or excessive ListBox count.");
            List<string> items = new List<string>();
            for (uint index = 0; index < count; index++)
            {
                long length = Send(control, LB_GETTEXTLEN, new UIntPtr(index), IntPtr.Zero);
                if (length < 0 || length > TextLimit) throw new InvalidOperationException("Invalid or excessive ListBox item length.");
                IntPtr buffer = Marshal.AllocHGlobal(checked((TextLimit + 1) * 2));
                try
                {
                    Marshal.WriteInt16(buffer, 0);
                    long copied = Send(control, LB_GETTEXT, new UIntPtr(index), buffer);
                    if (copied < 0 || copied > TextLimit) throw new InvalidOperationException("ListBox text read failed.");
                    items.Add(Marshal.PtrToStringUni(buffer, (int)copied) ?? "");
                }
                finally { Marshal.FreeHGlobal(buffer); }
            }
            if (Send(control, LB_GETCOUNT, UIntPtr.Zero, IntPtr.Zero) != count)
                throw new InvalidOperationException("ListBox changed during reading; retry after it settles.");
            return items.ToArray();
        }

        public void SelectListItem(long hwnd, int index, string expectedText)
        {
            IntPtr control = ListBox(hwnd); EnsureInteractive(control, GetAncestor(control, GA_ROOT));
            string[] items = GetListBoxItems(hwnd);
            if (index < 0 || index >= items.Length || expectedText == null || items[index] != expectedText)
                throw new InvalidOperationException("List item index and expected text do not match.");
            if (Send(control, LB_SETCURSEL, new UIntPtr((uint)index), IntPtr.Zero) != index ||
                Send(control, LB_GETCURSEL, UIntPtr.Zero, IntPtr.Zero) != index || GetListBoxItems(hwnd)[index] != expectedText)
                throw new InvalidOperationException("ListBox selection did not verify.");
            // LB_SETCURSEL alone does not notify the parent. Post the standard LBN_SELCHANGE
            // for this verified control only; the worker waits for dependent button state.
            IntPtr parent = GetParent(control); ValidateWindow(parent.ToInt64());
            int id = GetDlgCtrlID(control);
            if (id < 0 || id > 65535 || !PostMessageW(parent, WM_COMMAND,
                new UIntPtr((uint)(id | (1 << 16))), control))
                throw new InvalidOperationException("Verified ListBox selection could not notify its parent.");
        }

        public void ClickButton(long parentHwnd, int controlId, string expectedLabel)
        {
            if (String.IsNullOrEmpty(expectedLabel)) throw new ArgumentException("A button label is required.");
            IntPtr parent = ValidateWindow(parentHwnd);
            WindowInfo item = FindUniqueControl(parentHwnd, controlId, "Button", expectedLabel);
            IntPtr target = ValidateWindow(item.Hwnd);
            if (!IsChild(parent, target)) throw new InvalidOperationException("Button no longer belongs to the expected parent.");
            EnsureInteractive(target, GetAncestor(parent, GA_ROOT));
            int kind = GetWindowStyle(target, -16) & 0xF;
            // Check/radio state is consumed immediately by property setters.
            // Complete its native notification before returning to those readers.
            if (kind == 2 || kind == 3 || kind == 4 || kind == 5 || kind == 6 || kind == 9) {
                Send(target, BM_CLICK, UIntPtr.Zero, IntPtr.Zero);
                return;
            }
            // Post instead of synchronously waiting: a modal button can open another dialog.
            if (!PostMessageW(target, BM_CLICK, UIntPtr.Zero, IntPtr.Zero))
                throw new InvalidOperationException("Button click could not be posted (Win32 " + Marshal.GetLastWin32Error() + ").");
        }

        public int GetRadioState(long hwnd)
        {
            IntPtr control = ValidateWindow(hwnd);
            int kind = GetWindowStyle(control, -16) & 0xF;
            if (ClassName(control) != "Button" || (kind != 4 && kind != 9))
                throw new InvalidOperationException("Radio state requires a standard radio button.");
            long state = Send(control, 0x00F0, UIntPtr.Zero, IntPtr.Zero);
            ValidateWindow(hwnd);
            if (state < 0 || state > 1) throw new InvalidOperationException("Invalid radio state.");
            return (int)state;
        }
        public int GetCheckboxState(long hwnd)
        {
            IntPtr control = ValidateWindow(hwnd);
            int kind = GetWindowStyle(control, -16) & 0xF;
            if (ClassName(control) != "Button" || (kind != 2 && kind != 3 && kind != 5 && kind != 6))
                throw new InvalidOperationException("Checkbox state requires a standard checkbox, not a group box or push button.");
            long state = Send(control, 0x00F0, UIntPtr.Zero, IntPtr.Zero);
            if (state < 0 || state > 2) throw new InvalidOperationException("Invalid checkbox state.");
            return (int)state;
        }

        public string InvokeQtElement(long mainHwnd, string bridgePath, string label)
        {
            IntPtr main = ValidateWindow(mainHwnd);
            bool viewerDiagnoser = label == "viewer-diagnoser" && ClassName(main) == "Qt5QWindowOwnDCIcon" && Describe(main).Title == "cMT Viewer ( Simulation )";
            bool legacyWindow = (label == "legacy-window-read" || label.StartsWith("legacy-window-select:", StringComparison.Ordinal)) && GetWindow(main, 4) == IntPtr.Zero;
            if ((ClassName(main) != "EasyBuilderPro" && !viewerDiagnoser && !legacyWindow) || !File.Exists(bridgePath))
                throw new InvalidOperationException("Owned editor and packaged Qt element bridge required.");
            var quoted = new StringBuilder("\""); int slashes = 0;
            foreach (char c in label) {
                if (c == '\\') { slashes++; continue; }
                quoted.Append('\\', c == '"' ? slashes * 2 + 1 : slashes); quoted.Append(c); slashes = 0;
            }
            quoted.Append('\\', slashes * 2).Append('"');
            uint processId; GetWindowThreadProcessId(main, out processId);
            var start = new ProcessStartInfo(bridgePath, processId + " " + mainHwnd + " " + quoted) {
                UseShellExecute = false, CreateNoWindow = true, RedirectStandardOutput = true, RedirectStandardError = true,
                StandardOutputEncoding = Encoding.UTF8, StandardErrorEncoding = Encoding.UTF8
            };
            using (var process = Process.Start(start)) {
                var output = process.StandardOutput.ReadToEndAsync(); var error = process.StandardError.ReadToEndAsync();
                if (!process.WaitForExit(12000)) { process.Kill(); throw new InvalidOperationException("Qt element invocation exceeded 12 seconds; no replay."); }
                if (process.ExitCode != 0) throw new InvalidOperationException("Native Qt element invocation failed: " + output.Result + error.Result);
                return output.Result;
            }
        }

        public void PostMenuCommand(long mainHwnd, uint approvedCommand)
        {
            // Only commands backed by this version's native accelerator resources.
            if (approvedCommand != 0xE100 && approvedCommand != 0xE101 && approvedCommand != 0xE103 &&
                approvedCommand != 0x8161 && approvedCommand != 0x8255)
                throw new InvalidOperationException("Menu command is not on the reviewed EBPro allowlist.");
            IntPtr main = ValidateWindow(mainHwnd);
            if (ClassName(main) != "EasyBuilderPro" || GetAncestor(main, GA_ROOT) != main)
                throw new InvalidOperationException("Menu command requires the bound EasyBuilderPro main window.");
            EnsureInteractive(main, main);
            if (!PostMessageW(main, WM_COMMAND, new UIntPtr(approvedCommand), IntPtr.Zero))
                throw new InvalidOperationException("Menu command could not be posted (Win32 " + Marshal.GetLastWin32Error() + ").");
        }

        public void CloseMainWindow(long mainHwnd)
        {
            IntPtr main = ValidateWindow(mainHwnd);
            if (ClassName(main) != "EasyBuilderPro" || GetAncestor(main, GA_ROOT) != main)
                throw new InvalidOperationException("Close requires the bound EasyBuilderPro main window.");
            EnsureInteractive(main, main);
            if (!PostMessageW(main, 0x0010, UIntPtr.Zero, IntPtr.Zero))
                throw new InvalidOperationException("Normal main-window close could not be posted.");
        }

        public ActivationInfo ActivateOwnedMain(long mainHwnd)
        {
            return ActivateOwnedTopLevel(mainHwnd, "EasyBuilderPro");
        }

        public ActivationInfo ActivateOwnedTopLevel(long hwnd, string exactClass)
        {
            if (exactClass != "EasyBuilderPro" && exactClass != "Qt5QWindowOwnDCIcon" && exactClass != "Qt5QWindowIcon")
                throw new InvalidOperationException("Activation class is not on the owned top-level allowlist.");
            IntPtr main = ValidateWindow(hwnd);
            if (ClassName(main) != exactClass || GetAncestor(main, GA_ROOT) != main)
                throw new InvalidOperationException("Activation requires the bound top-level window of the exact class.");
            if (exactClass == "Qt5QWindowIcon")
            {
                IntPtr owner = GetWindow(main, GW_OWNER);
                if (Describe(main).Title != "Diagnoser" || owner == IntPtr.Zero ||
                    ClassName(ValidateWindow(owner.ToInt64())) != "Qt5QWindowOwnDCIcon" ||
                    Describe(owner).Title != "cMT Viewer ( Simulation )")
                    throw new InvalidOperationException("Activation requires the owned cMT Diagnoser window.");
            }
            EnsureInteractive(main, main);
            string fallbackThreads = "";
            if (GetForegroundWindow() != main)
            {
                if (IsIconic(main)) ShowWindowAsync(main, 9); // SW_RESTORE, owned main only
                SetForegroundWindow(main);
                if (GetForegroundWindow() != main)
                {
                    // AppActivate/SetForegroundWindow may be refused across input
                    // queues even though the owned window is visible. Attach the
                    // calling queue briefly to the current foreground and the
                    // exact owned GUI queue, then request ordinary activation.
                    // No input or window command is sent to the other process.
                    IntPtr prior = GetForegroundWindow();
                    uint ignoredPid, fallbackOwnerPid;
                    uint foregroundThread = prior == IntPtr.Zero ? 0 : GetWindowThreadProcessId(prior, out ignoredPid);
                    uint ownerThread = GetWindowThreadProcessId(main, out fallbackOwnerPid);
                    uint callerThread = GetCurrentThreadId();
                    fallbackThreads = " ownerThread=" + ownerThread + " foregroundThread=" + foregroundThread + " callerThread=" + callerThread;
                    // A desktop can temporarily have no foreground window after
                    // minimizing the editor. Its own GUI queue still identifies
                    // the activation target; attach that queue and verify below.
                    if (fallbackOwnerPid != (uint)pid || ownerThread == 0)
                        throw new InvalidOperationException("foreground_activation_denied: Owned/foreground input thread unavailable." + fallbackThreads);
                    bool attachedForeground = false, attachedOwner = false;
                    try
                    {
                        if (foregroundThread != 0 && callerThread != foregroundThread)
                        {
                            attachedForeground = AttachThreadInput(callerThread, foregroundThread, true);
                            if (!attachedForeground) throw new InvalidOperationException("foreground_activation_denied: Foreground input queues could not attach." + fallbackThreads);
                        }
                        if (callerThread != ownerThread && foregroundThread != ownerThread)
                        {
                            attachedOwner = AttachThreadInput(callerThread, ownerThread, true);
                            if (!attachedOwner) throw new InvalidOperationException("foreground_activation_denied: Owned input queue could not attach." + fallbackThreads);
                        }
                        if (!BringWindowToTop(main))
                            throw new InvalidOperationException("foreground_activation_denied: Owned main could not be raised." + fallbackThreads);
                        SetForegroundWindow(main);
                    }
                    finally
                    {
                        if (attachedOwner) AttachThreadInput(callerThread, ownerThread, false);
                        if (attachedForeground) AttachThreadInput(callerThread, foregroundThread, false);
                    }
                }
            }
            // Cross-input-queue activation can finish after SetForegroundWindow
            // returns. WM_NULL waits for the bound GUI queue before checking it.
            // This does not retry activation or override a foreground refusal.
            Send(main, 0x0000, UIntPtr.Zero, IntPtr.Zero);
            ValidateWindow(hwnd);
            IntPtr foreground = GetForegroundWindow();
            DateTime activationDeadline = DateTime.UtcNow.AddMilliseconds(500);
            while (foreground == IntPtr.Zero && DateTime.UtcNow < activationDeadline)
            {
                System.Threading.Thread.Sleep(25);
                ValidateWindow(hwnd);
                foreground = GetForegroundWindow();
            }
            if (foreground != main)
                throw new InvalidOperationException("foreground_activation_denied: Owned main window is not foreground." + fallbackThreads);
            uint ownerPid; uint thread = GetWindowThreadProcessId(main, out ownerPid);
            GuiThreadInfo state = new GuiThreadInfo(); state.Size = (uint)Marshal.SizeOf(typeof(GuiThreadInfo));
            if (ownerPid != (uint)pid || !GetGUIThreadInfo(thread, ref state))
                throw new InvalidOperationException("Owned GUI thread state could not be read.");
            if (state.Active != main)
                throw new InvalidOperationException("foreground_activation_denied: Owned GUI thread did not activate its main window.");
            return new ActivationInfo { MainHwnd = hwnd, ForegroundHwnd = foreground.ToInt64(),
                ActiveHwnd = state.Active.ToInt64(), FocusHwnd = state.Focus.ToInt64(), ThreadId = thread, Flags = state.Flags };
        }
    }
}
