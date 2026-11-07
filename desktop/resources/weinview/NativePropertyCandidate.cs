using System;
using System.Diagnostics;
using System.IO;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading;
using System.Collections.Generic;
using Accessibility;

namespace PLC Engineering Suite.Weinview.Research
{
    public sealed class TextFocusEvidence
    {
        public string action,exe_path,dialog_title,parent_title,text_before,text_after,observed_utc;
        public int process_pid,edit_id,blur_button_id,parent_pid,thread_id;
        public long creation_utc_ticks,dialog_hwnd,edit_hwnd,blur_button_hwnd,parent_hwnd,target_hwnd,
            focus_before_hwnd,focus_after_hwnd,active_hwnd,foreground_hwnd,observed_utc_ticks;
        public uint message,event_mask_before,event_mask_after;
        public long wparam,lparam;
        public bool focus_editor,message_posted,focus_verified,notification_synthesized,event_mask_changed,
            text_set_performed,confirmation_performed;
    }
    // Candidate only: standard HWND controls. No launch, UIA or Qt fallback.
    public sealed class NativePropertyCandidate
    {
        private readonly int pid; private readonly long ticks; private readonly string exe;
        [DllImport("kernel32.dll")] static extern IntPtr OpenProcess(uint access, bool inherit, int pid);
        [DllImport("kernel32.dll")] static extern bool CloseHandle(IntPtr handle);
        [DllImport("kernel32.dll")] static extern bool GetProcessTimes(IntPtr handle, out long creation, out long exit, out long kernel, out long user);
        [DllImport("kernel32.dll", CharSet=CharSet.Unicode)] static extern bool QueryFullProcessImageNameW(IntPtr handle, uint flags, StringBuilder path, ref uint size);
        [DllImport("kernel32.dll")] static extern uint WaitForSingleObject(IntPtr handle, uint ms);
        [DllImport("user32.dll")] static extern bool IsWindow(IntPtr hwnd);
        [DllImport("user32.dll")] static extern bool IsWindowVisible(IntPtr hwnd);
        [DllImport("user32.dll")] static extern bool IsWindowEnabled(IntPtr hwnd);
        [DllImport("user32.dll")] static extern bool IsWindowUnicode(IntPtr hwnd);
        [DllImport("user32.dll")] static extern uint GetWindowThreadProcessId(IntPtr hwnd, out uint pid);
        [DllImport("user32.dll", CharSet=CharSet.Unicode)] static extern int GetClassNameW(IntPtr hwnd, StringBuilder text, int count);
        [DllImport("user32.dll")] static extern IntPtr GetParent(IntPtr hwnd);
        [DllImport("user32.dll")] static extern int GetDlgCtrlID(IntPtr hwnd);
        [DllImport("user32.dll", EntryPoint="GetWindowLongW")] static extern int GetWindowLongW(IntPtr hwnd, int index);
        [DllImport("user32.dll", SetLastError=true)] static extern IntPtr SendMessageTimeoutW(IntPtr hwnd, uint msg, UIntPtr wp, IntPtr lp, uint flags, uint timeout, out UIntPtr result);
        [DllImport("user32.dll", SetLastError=true)] static extern bool PostMessageW(IntPtr hwnd, uint msg, UIntPtr wp, IntPtr lp);
        [DllImport("user32.dll")] static extern IntPtr GetForegroundWindow();
        [DllImport("user32.dll",SetLastError=true)] static extern bool GetGUIThreadInfo(uint threadId,ref TextGuiThreadInfo info);
        [StructLayout(LayoutKind.Sequential)] struct TextRect {public int left,top,right,bottom;}
        [StructLayout(LayoutKind.Sequential)] struct TextGuiThreadInfo {public uint size,flags;public IntPtr active,focus,capture,menuOwner,moveSize,caret;public TextRect caretRect;}
        [DllImport("oleacc.dll")] static extern int AccessibleObjectFromWindow(IntPtr hwnd, uint objectId, ref Guid iid, [MarshalAs(UnmanagedType.Interface)] out IAccessible accessible);
        public NativePropertyCandidate(int processId, long creationUtcTicks, string executablePath)
        { if(processId<=0 || creationUtcTicks<=0) throw new ArgumentException("Bound identity required"); pid=processId; ticks=creationUtcTicks; exe=Path.GetFullPath(executablePath); ValidateProcess(); }
        private void ValidateProcess()
        {
            IntPtr h=OpenProcess(0x101000,false,pid); if(h==IntPtr.Zero) throw new InvalidOperationException("Cannot open owned process");
            try {long c,e,k,u; uint size=32768; var path=new StringBuilder((int)size);
                if(WaitForSingleObject(h,0)!=258 || !GetProcessTimes(h,out c,out e,out k,out u) || c+504911232000000000L!=ticks || !QueryFullProcessImageNameW(h,0,path,ref size) || !String.Equals(Path.GetFullPath(path.ToString()),exe,StringComparison.OrdinalIgnoreCase)) throw new InvalidOperationException("Owned process identity changed");
            } finally {CloseHandle(h);}
        }
        private IntPtr Window(long hwnd, string expectedClass)
        {
            ValidateProcess(); var h=new IntPtr(hwnd); uint owner; var cls=new StringBuilder(128);
            GetClassNameW(h,cls,cls.Capacity);
            if(!IsWindow(h) || GetWindowThreadProcessId(h,out owner)==0 || owner!=pid || !IsWindowVisible(h) || !IsWindowEnabled(h) || (expectedClass!=null && cls.ToString()!=expectedClass)) throw new InvalidOperationException("Owned standard interactive control required");
            if(expectedClass=="ComboBox" && (!IsWindowUnicode(h) || ((GetWindowLongW(h,-16)&0x30)!=0 && (GetWindowLongW(h,-16)&0x200)==0))) throw new InvalidOperationException("Unicode string ComboBox required; ownerdraw data-only unsupported");
            return h;
        }
        private long Send(IntPtr h, uint msg, ulong wp, IntPtr lp, uint timeout=800)
        {
            Window(h.ToInt64(),null); UIntPtr result;
            if(SendMessageTimeoutW(h,msg,new UIntPtr(wp),lp,34,timeout,out result)==IntPtr.Zero) throw new InvalidOperationException("Bound control timeout/failure");
            return IntPtr.Size==8 ? unchecked((long)result.ToUInt64()) : unchecked((int)result.ToUInt32());
        }
        private string ComboText(IntPtr h, int index)
        {
            long length=Send(h,0x149,(ulong)index,IntPtr.Zero); if(length<0 || length>4096) throw new InvalidOperationException("Combo text bound/error");
            // Fixed capacity avoids allocating only the previously observed text length.
            const int capacity=4097; IntPtr buffer=Marshal.AllocHGlobal(capacity*2);
            try {
                for(int offset=0;offset<capacity;offset++)Marshal.WriteInt16(buffer,offset*2,0);
                long actual=Send(h,0x148,(ulong)index,buffer);
                if(actual<0 || actual>=capacity)throw new InvalidOperationException("Combo returned text length out of bound");
                if(Marshal.ReadInt16(buffer,(int)actual*2)!=0)throw new InvalidOperationException("Combo text terminator absent");
                string value=Marshal.PtrToStringUni(buffer,(int)actual);
                return GetDlgCtrlID(h)==1547 ? FontName(value) : value;
            } finally {Marshal.FreeHGlobal(buffer);}
        }
        public string[] ComboItems(long hwnd)
        {
            var h=Window(hwnd,"ComboBox");long count=Send(h,0x146,0,IntPtr.Zero);if(count<0 || count>2048) throw new InvalidOperationException("Combo count bound/error");
            var items=new string[(int)count];for(int i=0;i<items.Length;i++)items[i]=ComboText(h,i);return items;
        }
        public string ComboSelected(long hwnd)
        {var h=Window(hwnd,"ComboBox");long index=Send(h,0x147,0,IntPtr.Zero);if(index<0) return null;return ComboText(h,(int)index);}
        public int ComboSelectedIndex(long hwnd)
        {var h=Window(hwnd,"ComboBox");long index=Send(h,0x147,0,IntPtr.Zero);if(index<0 || index>=ComboItems(hwnd).Length)throw new InvalidOperationException("Combo selected index unavailable");return (int)index;}
        public int[] UpDownRange(long spinHwnd)
        {
            var spin=Window(spinHwnd,"msctls_updown32");
            // UDM_GETRANGE (WM_USER+102) returns LOWORD=max, HIWORD=min.
            // Both parameters are zero; no cross-process pointer marshalling.
            // https://learn.microsoft.com/en-us/windows/win32/controls/udm-getrange
            uint packed=unchecked((uint)Send(spin,0x466,0,IntPtr.Zero));
            int lower=unchecked((short)(packed>>16)),upper=unchecked((short)(packed&0xffff));
            return new int[]{Math.Min(lower,upper),Math.Max(lower,upper)};
        }
        public void SetNumericDigits(long editHwnd,long spinHwnd,long value)
        {
            if(value<0)throw new ArgumentOutOfRangeException("value","Numeric display digits must be nonnegative.");
            var edit=Window(editHwnd,"Edit");var spin=Window(spinHwnd,"msctls_updown32");
            int editId=GetDlgCtrlID(edit),spinId=GetDlgCtrlID(spin);
            if(!((editId==1196 && spinId==1201)||(editId==1197 && spinId==1202)) ||
                GetParent(edit)!=GetParent(spin) || Send(spin,0x46a,0,IntPtr.Zero)!=edit.ToInt64())
                throw new InvalidOperationException("Actual Numeric format digit Edit/Spin buddy pair required.");
            int[] range=UpDownRange(spinHwnd);
            if(value<range[0] || value>range[1])
                throw new ArgumentOutOfRangeException("value","Numeric display digits outside the current native Spin range ["+range[0]+","+range[1]+"].");
            string text=value.ToString(System.Globalization.CultureInfo.InvariantCulture);
            IntPtr input=Marshal.StringToHGlobalUni(text);
            try {if(Send(edit,0xc,0,input)==0)throw new InvalidOperationException("Numeric digit Edit refused text.");}
            finally {Marshal.FreeHGlobal(input);}
            IntPtr output=Marshal.AllocHGlobal(32*2);
            try {
                for(int i=0;i<32;i++)Marshal.WriteInt16(output,i*2,0);
                long length=Send(edit,0xd,32,output);
                if(length<0 || length>=32 || Marshal.ReadInt16(output,(int)length*2)!=0 || Marshal.PtrToStringUni(output,(int)length)!=text)
                    throw new InvalidOperationException("Numeric digit Edit did not retain the exact requested value.");
            } finally {Marshal.FreeHGlobal(output);}
        }
        public string RichText(long hwnd)
        {
            var h=Window(hwnd,"RichEdit20W");if(!IsWindowUnicode(h))throw new InvalidOperationException("Unicode RichEdit20W required");
            long length=Send(h,0xe,0,IntPtr.Zero);if(length<0 || length>4096)throw new InvalidOperationException("RichEdit text bound exceeded");
            IntPtr buffer=Marshal.AllocHGlobal(4097*2);
            try {
                for(int i=0;i<4097;i++)Marshal.WriteInt16(buffer,i*2,0);
                long actual=Send(h,0xd,4097,buffer);
                if(actual<0 || actual>4096 || Marshal.ReadInt16(buffer,(int)actual*2)!=0)throw new InvalidOperationException("RichEdit text response invalid");
                return Marshal.PtrToStringUni(buffer,(int)actual);
            } finally {Marshal.FreeHGlobal(buffer);}
        }
        public void SetRichTextExact(long hwnd,string text)
        {
            if(text==null || text.Length>4096 || text.IndexOf('\0')>=0)throw new ArgumentException("Bound NUL-free RichEdit text required");
            var h=Window(hwnd,"RichEdit20W");if(!IsWindowUnicode(h))throw new InvalidOperationException("Unicode RichEdit20W required");
            var parent=Window(GetParent(h).ToInt64(),null);
            // RichEdit WM_SETTEXT does not emit EN_CHANGE. Replace the selection through
            // the editor's normal mutation path; do not synthesize a duplicate notification.
            Send(h,0xb1,0,new IntPtr(-1)); // EM_SETSEL all.
            IntPtr value=Marshal.StringToHGlobalUni(text);
            try {Send(h,0xc2,0,value);} finally {Marshal.FreeHGlobal(value);} // EM_REPLACESEL.
            Window(parent.ToInt64(),null);
            if(RichText(hwnd)!=text)throw new InvalidOperationException("RichEdit exact readback failed");
        }
        // cMT displays two platform fallbacks after the Windows font name.
        // They are original menu metadata, not part of the selected font name.
        public static string FontName(string nativeLabel)
        {
            if(nativeLabel==null)return null;
            var match=System.Text.RegularExpressions.Regex.Match(nativeLabel,@"^([^\[\]\r\n]+?) \[[^\[\]\r\n]+\] \[[^\[\]\r\n]+\]$");
            return match.Success ? match.Groups[1].Value : nativeLabel;
        }
        private TextGuiThreadInfo TextThreadState(IntPtr dialog)
        {
            uint owner;uint thread=GetWindowThreadProcessId(dialog,out owner);
            var state=new TextGuiThreadInfo();state.size=(uint)Marshal.SizeOf(typeof(TextGuiThreadInfo));
            if(owner!=(uint)pid || thread==0 || !GetGUIThreadInfo(thread,ref state))throw new InvalidOperationException("Actual owned Text GUI thread required");
            // Ownership and the exact modal/control identities are checked separately.
            // An inactive application still processes WM_NEXTDLGCTL on this GUI thread.
            return state;
        }
        private IntPtr AssertTextFocusTarget(PLC Engineering Suite.Weinview.NativeControls native,long dialogHwnd,long editHwnd,long blurButtonHwnd,string exactTitle)
        {
            if(exactTitle!="新增 文字/批注" && exactTitle!="文字/批注的属性")throw new ArgumentException("Exact observed Text dialog title required");
            var dialog=Window(dialogHwnd,"#32770");
            var modals=new List<PLC Engineering Suite.Weinview.WindowInfo>();
            foreach(var w in native.EnumTopWindows())if(w.Visible && w.Class=="#32770")modals.Add(w);
            if(modals.Count!=1 || modals[0].Hwnd!=dialogHwnd || !modals[0].Enabled || modals[0].Title!=exactTitle)throw new InvalidOperationException("Unique exact owned Text modal required");
            int edits=0,buttons=0;
            foreach(var w in native.EnumChildControls(dialogHwnd)) {
                if(w.Visible && w.Enabled && w.Class=="RichEdit20W" && w.Id==1283){edits++;if(w.Hwnd!=editHwnd)throw new InvalidOperationException("Actual Text RichEdit identity changed");}
                if(w.Visible && w.Enabled && w.Class=="Button" && w.Id==1780){buttons++;if(w.Hwnd!=blurButtonHwnd || w.Title!="斜体")throw new InvalidOperationException("Actual Text non-confirming focus button changed");}
            }
            if(edits!=1 || buttons!=1)throw new InvalidOperationException("Unique actual RichEdit1283 and Button1780 required");
            var edit=Window(editHwnd,"RichEdit20W");var button=Window(blurButtonHwnd,"Button");
            if(!IsWindowUnicode(edit) || GetDlgCtrlID(edit)!=1283 || GetDlgCtrlID(button)!=1780)throw new InvalidOperationException("Actual Unicode Text controls required");
            var parent=Window(GetParent(edit).ToInt64(),"#32770");
            if(GetParent(button)!=parent || GetParent(parent)!=dialog || native.GetControlText(parent.ToInt64(),64)!="文字标签")throw new InvalidOperationException("Actual shared Text-label direct parent and property ancestor required");
            uint owner,dialogOwner;uint thread=GetWindowThreadProcessId(dialog,out dialogOwner);
            if(GetWindowThreadProcessId(edit,out owner)!=thread || owner!=(uint)pid || GetWindowThreadProcessId(button,out owner)!=thread || owner!=(uint)pid)throw new InvalidOperationException("Same owned Text GUI thread required");
            TextThreadState(dialog);return parent;
        }
        // One semantic focus transition only. Caller owns text mutation, blur, confirmation and readback.
        public TextFocusEvidence FocusTextEditor(long dialogHwnd,long editHwnd,long blurButtonHwnd,string exactTitle,bool focusEditor)
        {
            var native=new PLC Engineering Suite.Weinview.NativeControls(pid,ticks,exe,800);
            var parent=AssertTextFocusTarget(native,dialogHwnd,editHwnd,blurButtonHwnd,exactTitle);
            var dialog=new IntPtr(dialogHwnd);var before=TextThreadState(dialog);var target=new IntPtr(focusEditor?editHwnd:blurButtonHwnd);
            string text=RichText(editHwnd);uint mask=unchecked((uint)Send(new IntPtr(editHwnd),0x043B,0,IntPtr.Zero));
            parent=AssertTextFocusTarget(native,dialogHwnd,editHwnd,blurButtonHwnd,exactTitle);
            if(!PostMessageW(parent,0x28,new UIntPtr(unchecked((ulong)target.ToInt64())),new IntPtr(1)))throw new InvalidOperationException("Owned Text WM_NEXTDLGCTL post failed; no replay");
            var clock=Stopwatch.StartNew();TextGuiThreadInfo after;
            do {
                AssertTextFocusTarget(native,dialogHwnd,editHwnd,blurButtonHwnd,exactTitle);after=TextThreadState(dialog);
                if(after.focus==target)break;
                if(clock.ElapsedMilliseconds>=1000)throw new InvalidOperationException("Actual Text focus transition not observed; no replay");
                Thread.Sleep(20);
            }while(true);
            string current=RichText(editHwnd);uint afterMask=unchecked((uint)Send(new IntPtr(editHwnd),0x043B,0,IntPtr.Zero));
            if(current!=text || afterMask!=mask)throw new InvalidOperationException("Text focus transition changed native text/event mask");
            AssertTextFocusTarget(native,dialogHwnd,editHwnd,blurButtonHwnd,exactTitle);after=TextThreadState(dialog);
            if(after.focus!=target)throw new InvalidOperationException("Actual Text target focus changed before evidence");
            uint owner;uint thread=GetWindowThreadProcessId(dialog,out owner);var now=DateTime.UtcNow;
            return new TextFocusEvidence {action=focusEditor?"focus_text_rich_edit":"blur_text_to_nonconfirming_control",exe_path=exe,
                process_pid=pid,creation_utc_ticks=ticks,dialog_hwnd=dialogHwnd,dialog_title=exactTitle,edit_hwnd=editHwnd,edit_id=1283,
                blur_button_hwnd=blurButtonHwnd,blur_button_id=1780,parent_hwnd=parent.ToInt64(),parent_title="文字标签",parent_pid=pid,
                target_hwnd=target.ToInt64(),focus_before_hwnd=before.focus.ToInt64(),focus_after_hwnd=after.focus.ToInt64(),
                active_hwnd=after.active.ToInt64(),foreground_hwnd=GetForegroundWindow().ToInt64(),thread_id=(int)thread,
                message=0x28,wparam=target.ToInt64(),lparam=1,focus_editor=focusEditor,message_posted=true,focus_verified=true,
                text_before=text,text_after=current,event_mask_before=mask,event_mask_after=afterMask,notification_synthesized=false,
                event_mask_changed=false,text_set_performed=false,confirmation_performed=false,observed_utc=now.ToString("o"),observed_utc_ticks=now.Ticks};
        }
        private sealed class QtComboEvidence
        {public int Nodes;public readonly List<string> Values=new List<string>();public readonly HashSet<string> Items=new HashSet<string>();public readonly HashSet<long> Visited=new HashSet<long>();}
        private void ReadQtNode(IAccessible acc,int child,int depth,bool withinCombo,QtComboEvidence evidence)
        {
            if(depth>4 || ++evidence.Nodes>48)throw new InvalidOperationException("Qt Combo bounded subtree exceeded");
            if(child==0){IntPtr unknown=Marshal.GetIUnknownForObject(acc);try{if(!evidence.Visited.Add(unknown.ToInt64()))return;}finally{Marshal.Release(unknown);}}
            int role=Convert.ToInt32(acc.get_accRole(child));
            if(role==46){if(depth>2)throw new InvalidOperationException("Qt Combo outside verified shallow contract");evidence.Values.Add(acc.get_accValue(child));withinCombo=true;}
            if(withinCombo && role==34)evidence.Items.Add(acc.get_accName(child));
            if(child!=0)return; // Simple MSAA child has no independently traversable interface.
            int count=acc.accChildCount;if(count<0 || count>32)throw new InvalidOperationException("Qt child count outside bound");
            for(int i=1;i<=count;i++){
                object value=acc.get_accChild(i);IAccessible nested=value as IAccessible;
                if(nested!=null){try{ReadQtNode(nested,0,depth+1,withinCombo,evidence);}finally{if(Marshal.IsComObject(nested))Marshal.ReleaseComObject(nested);}}
                else ReadQtNode(acc,i,depth+1,withinCombo,evidence);
            }
        }
        [DllImport("user32.dll")] static extern bool IsChild(IntPtr parent,IntPtr child);
        [DllImport("user32.dll",CharSet=CharSet.Unicode)] static extern int GetWindowTextW(IntPtr hwnd,StringBuilder text,int count);
        public void SelectWindowNavigationRadio(long dialog,long hwnd)
        {
            var parent=Window(dialog,"#32770");var h=Window(hwnd,"Button");var text=new StringBuilder(128);GetWindowTextW(h,text,128);
            if(!IsChild(parent,h)||GetDlgCtrlID(h)!=1185||text.Length!=0||(GetWindowLongW(h,-16)&15)!=9)throw new InvalidOperationException("Exact anonymous navigation autoradio required");
            if(!PostMessageW(h,0xf5,UIntPtr.Zero,IntPtr.Zero))throw new InvalidOperationException("Owned navigation mode post failed; no retry");
        }
        public int GetRadioState(long hwnd)
        {
            var h=Window(hwnd,"Button");int style=GetWindowLongW(h,-16)&15;
            if(style!=4 && style!=9)throw new InvalidOperationException("Standard radio Button required");
            long state=Send(h,0xf0,0,IntPtr.Zero);Window(hwnd,"Button");
            if(state!=0 && state!=1)throw new InvalidOperationException("Radio state must be unchecked or checked");
            return (int)state;
        }
        public string ComboQtValue(long hwnd)
        {
            var h=Window(hwnd,"Qt5QWindowIcon");Guid iid=new Guid("618736E0-3C3D-11CF-810C-00AA00389B71");IAccessible acc;
            int hr=AccessibleObjectFromWindow(h,0xfffffffc,ref iid,out acc);if(hr<0)Marshal.ThrowExceptionForHR(hr);if(acc==null)throw new InvalidOperationException("Qt MSAA interface absent");
            var evidence=new QtComboEvidence();
            try{ReadQtNode(acc,0,0,false,evidence);}finally{if(Marshal.IsComObject(acc))Marshal.ReleaseComObject(acc);}
            Window(hwnd,"Qt5QWindowIcon");
            if(evidence.Values.Count!=1 || String.IsNullOrEmpty(evidence.Values[0]) || !evidence.Items.Contains("LW") || !evidence.Items.Contains("RW"))throw new InvalidOperationException("Unique Qt address-type Combo plus LW/RW items required");
            return evidence.Values[0];
        }
        public void SelectComboExact(long hwnd, string expectedText)
        {
            var h=Window(hwnd,"ComboBox");int found=FindComboExact(h,expectedText,false);
            // cMT fonts append platform fallback names. Let the native combo
            // search its strings instead of reading every installed font over IPC.
            if(found<0 && GetDlgCtrlID(h)==1547)found=FindComboExact(h,expectedText,true);
            if(found<0)throw new InvalidOperationException("Combo label absent");var parent=Window(GetParent(h).ToInt64(),null);
            if(Send(h,0x14e,(ulong)found,IntPtr.Zero)!=found)throw new InvalidOperationException("Combo selection refused");
            int id=GetDlgCtrlID(h);if(id<0 || id>65535)throw new InvalidOperationException("Combo control id invalid");
            // Complete the bound parent's selection handler before callers edit dependent fields.
            // Modal/hung handlers fail through the existing 800ms timeout, without retry.
            Send(parent,0x111,(uint)(id | (1<<16)),h);
            if(ComboSelected(hwnd)!=expectedText)throw new InvalidOperationException("Combo selected-text readback failed");
            // Parent-dependent fields/dialog state must additionally be read back by caller.
        }
        private int FindComboExact(IntPtr h,string expected,bool fontPrefix)
        {
            if(String.IsNullOrEmpty(expected)||expected.Length>4096)throw new ArgumentException("Exact Combo label required");
            IntPtr text=Marshal.StringToHGlobalUni(fontPrefix?expected+" [":expected);
            try {
                var visited=new HashSet<int>();int found=-1;ulong previous=UInt32.MaxValue;
                for(;;){
                    int index=(int)Send(h,fontPrefix?0x14cu:0x158u,previous,text);
                    if(index<0 || !visited.Add(index))break;
                    if(visited.Count>2048)throw new InvalidOperationException("Combo search count bound exceeded");
                    if(ComboText(h,index)==expected){if(found>=0)throw new InvalidOperationException("Duplicate Combo label");found=index;}
                    previous=(uint)index;
                }
                return found;
            }finally{Marshal.FreeHGlobal(text);}
        }
        public void SelectComboIndexExact(long hwnd, int index, string expectedText)
        {
            var items=ComboItems(hwnd);
            if(index<0 || index>=items.Length || String.IsNullOrEmpty(expectedText) || items[index]!=expectedText)
                throw new InvalidOperationException("Combo index/text pair differs from native items");
            var h=Window(hwnd,"ComboBox");var parent=Window(GetParent(h).ToInt64(),null);
            if(Send(h,0x14e,(ulong)index,IntPtr.Zero)!=index)throw new InvalidOperationException("Combo indexed selection refused");
            int id=GetDlgCtrlID(h);if(id<0 || id>65535)throw new InvalidOperationException("Combo control id invalid");
            Send(parent,0x111,(uint)(id | (1<<16)),h);
            if(Send(h,0x147,0,IntPtr.Zero)!=index || ComboSelected(hwnd)!=expectedText || ComboItems(hwnd)[index]!=expectedText)
                throw new InvalidOperationException("Combo indexed selection readback failed");
        }
        public string[] TabNames(long hwnd)
        {
            var deadline=DateTime.UtcNow.AddSeconds(3);
            for(;;){try{return ReadTabNames(hwnd);}catch(ArgumentException){
                // The original MSAA provider can briefly publish the native
                // item count before its child roles during dialog creation.
                if(DateTime.UtcNow>=deadline)throw;
                Window(hwnd,"SysTabControl32");System.Threading.Thread.Sleep(50);
            }catch(InvalidOperationException error){
                // Native item count and the original MSAA child collection can
                // become ready on different ticks. Retry only this observation;
                // persistent mismatch, roles, labels and bounds still fail.
                if(error.Message!="MSAA tab index/count contract mismatch"||DateTime.UtcNow>=deadline)throw;
                Window(hwnd,"SysTabControl32");System.Threading.Thread.Sleep(50);
            }}
        }
        private string[] ReadTabNames(long hwnd)
        {
            var h=Window(hwnd,"SysTabControl32");int count=(int)Send(h,0x1304,0,IntPtr.Zero);if(count<1 || count>32)throw new InvalidOperationException("Tab count bound");
            Guid iid=new Guid("618736E0-3C3D-11CF-810C-00AA00389B71");IAccessible acc;
            int hr=AccessibleObjectFromWindow(h,0xfffffffc,ref iid,out acc);if(hr<0)Marshal.ThrowExceptionForHR(hr);if(acc==null)throw new InvalidOperationException("Tab accessible interface absent");
            try {if(acc.accChildCount!=count)throw new InvalidOperationException("MSAA tab index/count contract mismatch");var names=new string[count];
                for(int i=0;i<count;i++){if(Convert.ToInt32(acc.get_accRole(i+1))!=37)throw new InvalidOperationException("Non-PageTab child in index contract");names[i]=acc.get_accName(i+1);if(String.IsNullOrWhiteSpace(names[i]))throw new InvalidOperationException("Unnamed tab");}return names;
            }finally {if(acc!=null && Marshal.IsComObject(acc))Marshal.ReleaseComObject(acc);}
        }
        public void SelectTabExact(long hwnd,string expectedName)
        {
            var names=TabNames(hwnd);int index=-1;for(int i=0;i<names.Length;i++)if(names[i]==expectedName){if(index>=0)throw new InvalidOperationException("Duplicate tab label");index=i;}
            if(index<0)throw new InvalidOperationException("Tab label absent");var h=Window(hwnd,"SysTabControl32");
            if((GetWindowLongW(h,-16)&0x100)!=0)throw new InvalidOperationException("TCS_BUTTONS unsupported");
            if(Send(h,0x130b,0,IntPtr.Zero)==index)return;
            Send(h,0x1330,(ulong)index,IntPtr.Zero,3000); // TCM_SETCURFOCUS: one bounded send allows synchronous page loading.
            var deadline=DateTime.UtcNow.AddSeconds(2);do{if(Send(h,0x130b,0,IntPtr.Zero)==index)return;Thread.Sleep(40);}while(DateTime.UtcNow<deadline);
            throw new InvalidOperationException("Tab selection readback failed; no retry/reset");
        }
    }
}
