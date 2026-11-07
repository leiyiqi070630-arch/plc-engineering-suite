using System;
using System.IO;
using System.Runtime.InteropServices;
using System.Threading;
namespace PLCCode.Weinview {
 public static class ModelSaveControls {
  [DllImport("user32.dll")] static extern IntPtr GetParent(IntPtr h);
  [DllImport("user32.dll")] static extern IntPtr GetForegroundWindow();
  [DllImport("user32.dll",SetLastError=true)] static extern IntPtr SendMessageTimeoutW(IntPtr h,uint m,UIntPtr w,IntPtr l,uint flags,uint ms,out UIntPtr result);
  static void Send(long h,uint m,UIntPtr w,IntPtr l){UIntPtr result;if(SendMessageTimeoutW(new IntPtr(h),m,w,l,2,1500,out result)==IntPtr.Zero)throw new InvalidOperationException("Original filename edit message timed out.");}
  public static object SetFilename(NativeControls n,long dialog,long main,string path,string expectedPreset) {
   if(String.IsNullOrEmpty(expectedPreset)||!System.Text.RegularExpressions.Regex.IsMatch(expectedPreset,"^EBProject[0-9]+$")||String.IsNullOrEmpty(path)||path.Length>4096||!Path.IsPathRooted(path)||File.Exists(path)||!Directory.Exists(Path.GetDirectoryName(path)))throw new InvalidOperationException("Fresh private model output and original initialized preset required.");
   var top=n.EnumTopWindows();int dialogs=0;bool save=false,ownedMain=false;
   foreach(var w in top)if(w.Visible){if(w.Class=="#32770"){dialogs++;if(w.Hwnd==dialog&&w.Title=="另存为"&&w.Enabled)save=true;}if(w.Hwnd==main&&w.Class=="EasyBuilderPro"&&!w.Enabled)ownedMain=true;}
   if(dialogs!=1||!save||!ownedMain)throw new InvalidOperationException("Unique original model Save As dialog required.");
   var edit=n.FindUniqueControlWithoutLabel(dialog,1001,"Edit");long parent=GetParent(new IntPtr(edit.Hwnd)).ToInt64();bool combo=false;
   foreach(var w in n.EnumChildControls(dialog))if(w.Hwnd==parent&&w.Class=="ComboBox"&&w.Visible&&w.Enabled)combo=true;
   if(!combo||n.GetControlText(edit.Hwnd,4096)!=expectedPreset||n.GetControlText(parent,4096)!=expectedPreset)throw new InvalidOperationException("Initialized original filename edit/combo agreement required.");
   long foregroundBefore=GetForegroundWindow().ToInt64();
   // Clear the initialized edit first: shell autocomplete can change its selection
   // between EM_SETSEL and EM_REPLACESEL, leaving part of the preset behind.
   // EM_REPLACESEL still supplies the edit-change notification for the shell binding.
   var buffer=Marshal.StringToHGlobalUni(path);int attempts=0;bool verified=false;
   string editText=null,comboText=null;
   try{
    for(attempts=1;attempts<=2;attempts++){
     n.EnumTopWindows();
     Send(edit.Hwnd,0x000C,UIntPtr.Zero,IntPtr.Zero);
     Send(edit.Hwnd,0x00B1,UIntPtr.Zero,new IntPtr(-1));
     Send(edit.Hwnd,0x00C2,UIntPtr.Zero,buffer);
     int stable=0;
     for(int sample=0;sample<12;sample++){
      Thread.Sleep(50);
      editText=n.GetControlText(edit.Hwnd,4096);comboText=n.GetControlText(parent,4096);
      stable=editText==path&&comboText==path?stable+1:0;
      if(stable==3){verified=true;break;}
     }
     if(verified)break;
    }
   }finally{Marshal.FreeHGlobal(buffer);}
   if(!verified)throw new InvalidOperationException("Original filename edit/combo readback differs. Edit="+editText+"; Combo="+comboText);
   return new {dialog_hwnd=dialog,filename_edit_hwnd=edit.Hwnd,filename_combo_hwnd=parent,preset=expectedPreset,filename=path,write_attempts=attempts,messages=new uint[]{0x000C,0x00B1,0x00C2},global_input=false,foreground_activation_requested=false,foreground_before=foregroundBefore,foreground_after=GetForegroundWindow().ToInt64()};
  }
 }
}
