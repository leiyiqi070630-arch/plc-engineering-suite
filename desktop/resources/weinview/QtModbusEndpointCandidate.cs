using System;using System.Collections.Generic;using System.Runtime.InteropServices;using Accessibility;
namespace PLCCode.Weinview {
 public sealed class ModbusEndpoint {public string Ip{get;set;}public int Port{get;set;}}
 // Exact actual 421 Qt device-settings subtree only. COM calls require an external watchdog.
 public sealed class QtModbusEndpointCandidate {
  readonly NativeControls native;
  [DllImport("user32.dll",SetLastError=true)]static extern IntPtr SendMessageTimeoutW(IntPtr h,uint m,UIntPtr w,IntPtr l,uint flags,uint ms,out UIntPtr result);
  [DllImport("user32.dll")]static extern uint MapVirtualKeyW(uint code,uint type);
  public List<string> StageTrace = new List<string>();
  void Trace(IAccessible[] fields,int index,string stage){var values=new string[5];for(int i=0;i<5;i++)values[i]=fields[i].get_accValue(0)??"<null>";StageTrace.Add(stage+" index="+index+" focused="+((Convert.ToInt32(fields[index].get_accState(0))&4)!=0)+" values="+String.Join("|",values));}
  static void Focus(IAccessible field){if((Convert.ToInt32(field.get_accState(0))&4)==0)throw new InvalidOperationException("Endpoint focus moved before next key; no retry.");}
  void Message(long dialog,long q,uint message,uint key,long keyData){long current=Guard(dialog);if(current!=q)throw new InvalidOperationException("Endpoint Qt HWND changed.");UIntPtr r;if(SendMessageTimeoutW(new IntPtr(q),message,new UIntPtr(key),new IntPtr(keyData),34,1000,out r)==IntPtr.Zero)throw new InvalidOperationException("Endpoint key message failed/timed out.");}
  void Key(long d,long q,uint key){uint scan=MapVirtualKeyW(key,0);if(scan==0)throw new InvalidOperationException("Endpoint key scan code unavailable.");uint down=1u|(scan<<16);if(key==0x23)down|=0x01000000;Message(d,q,0x100,key,down);Message(d,q,0x101,key,unchecked((int)(down|0xC0000000u)));}
  // Window-local Qt messages target the guarded editor HWND, not the desktop
  // foreground. The exact field focus and every changed value are checked below.
  // Caller must first verify device-name + driver on native parent properties.
  public ModbusEndpoint SetExactByBoundMessages(long dialog,string expectedIp,int expectedPort,string ip,int port){
   StageTrace.Clear(); ModbusEndpoint before=Read(dialog);if(before.Ip!=expectedIp||before.Port!=expectedPort)throw new InvalidOperationException("Endpoint before-write context differs.");
   string[] parts=(ip??"").Split('.');if(parts.Length!=4||port<1||port>65535)throw new ArgumentException("IPv4/port invalid.");
   int[] numbers=new int[4];for(int i=0;i<4;i++)if(!Int32.TryParse(parts[i],out numbers[i])||numbers[i]<0||numbers[i]>255||parts[i]!=numbers[i].ToString())throw new ArgumentException("Canonical IPv4 required.");
   var fields=Fields(dialog);long q=Guard(dialog);
   for(int i=0;i<5;i++){
    string old=fields[i].get_accValue(0);if(old==null||old.Length<1||old.Length>5)throw new InvalidOperationException("Endpoint pre-edit value invalid.");
    string action=fields[i].get_accDefaultAction(0);if(action!="SetFocus")throw new InvalidOperationException("Endpoint field action differs from SetFocus.");
    fields[i].accDoDefaultAction(0);int state=Convert.ToInt32(fields[i].get_accState(0));
    if((state&4)==0||(state&(1|64|32768|65536))!=0)throw new InvalidOperationException("Endpoint field focus was not verified.");
    Trace(fields,i,"focused");
    string[] others=new string[5];for(int j=0;j<5;j++)others[j]=fields[j].get_accValue(0)??"";
    // End navigates the composite IPv4 control: never use it as a caret move.
    for(int direction=0;direction<2;direction++){
     string remaining=fields[i].get_accValue(0)??"";if(remaining.Length==0)break;
     fields[i].accDoDefaultAction(0);Focus(fields[i]);
     for(int k=0;k<old.Length;k++){
      string previous=fields[i].get_accValue(0)??"";if(previous.Length==0)break;
      Focus(fields[i]);Key(dialog,q,direction==0?8u:0x2Eu);Trace(fields,i,(direction==0?"backspace":"delete")+k);
      for(int j=0;j<5;j++)if(j!=i&&(fields[j].get_accValue(0)??"")!=others[j])throw new InvalidOperationException("Endpoint clear changed another field.");
      string next=fields[i].get_accValue(0)??"";
      if(next.Length==0)break;
      if(next==previous){break;} // Stop this direction; refocus before the next direction.
      if(next.Length>=previous.Length)throw new InvalidOperationException("Endpoint clear did not shorten the value.");
      Focus(fields[i]);
     }
    }
    if(!String.IsNullOrEmpty(fields[i].get_accValue(0)))throw new InvalidOperationException("Endpoint bounded clear incomplete; no retry.");
    fields[i].accDoDefaultAction(0);Focus(fields[i]);Trace(fields,i,"cleared-refocused");
    string value=(i<4?numbers[i]:port).ToString();
    string expectedPrefix="";foreach(char c in value){
     Focus(fields[i]);Key(dialog,q,(uint)c);Trace(fields,i,"digit"+c);
     for(int j=0;j<5;j++)if(j!=i&&(fields[j].get_accValue(0)??"")!=others[j])throw new InvalidOperationException("Endpoint digit changed another field.");
     expectedPrefix+=c;string typed=fields[i].get_accValue(0)??"";
     int typedNumber, prefixNumber; if(typed.Length<1||typed.Length>5||!System.Text.RegularExpressions.Regex.IsMatch(typed,"^[0-9]+$")||!Int32.TryParse(typed,out typedNumber)||!Int32.TryParse(expectedPrefix,out prefixNumber)||typedNumber!=prefixNumber)throw new InvalidOperationException("Endpoint typed numeric prefix differs.");
     // Auto-advance after a complete octet is allowed only when its target is exact.
     if((Convert.ToInt32(fields[i].get_accState(0))&4)==0&&typedNumber!=(i<4?numbers[i]:port))throw new InvalidOperationException("Endpoint auto-advanced before target complete.");
    }    if(Number(fields[i],i<4?255:65535)!=(i<4?numbers[i]:port))throw new InvalidOperationException("Endpoint bound-message readback differs; no retry.");
   }
   ModbusEndpoint result=Read(dialog);if(result.Ip!=ip||result.Port!=port)throw new InvalidOperationException("Endpoint final readback differs.");return result;
  }
  [DllImport("oleacc.dll")]static extern int AccessibleObjectFromWindow(IntPtr h,uint id,ref Guid iid,[MarshalAs(UnmanagedType.Interface)]out IAccessible a);
  [DllImport("oleacc.dll")]static extern int AccessibleChildren(IAccessible a,int start,int count,[Out,MarshalAs(UnmanagedType.LPArray,SizeParamIndex=2)]object[] c,out int got);
  public QtModbusEndpointCandidate(NativeControls n){if(n==null)throw new ArgumentNullException("n");native=n;}
  long Guard(long dialog){WindowInfo d=null;foreach(var w in native.EnumTopWindows())if(w.Hwnd==dialog)d=w;if(d==null||d.Class!="#32770"||d.Title!="设备设置"||!d.Visible||!d.Enabled)throw new InvalidOperationException("Exact owned enabled device-settings dialog required.");long q=0;foreach(var w in native.EnumChildControls(dialog))if(w.Visible&&w.Class=="Qt5QWindowIcon"){if(q!=0)throw new InvalidOperationException("Qt root not unique.");q=w.Hwnd;}if(q==0)throw new InvalidOperationException("Qt root absent.");return q;}
  static IAccessible Child(IAccessible a,int index){if(index<0||index>=a.accChildCount)throw new InvalidOperationException("Endpoint path child absent.");var b=new object[1];int got;int h=AccessibleChildren(a,index,1,b,out got);if(h<0)Marshal.ThrowExceptionForHR(h);if(got!=1||!(b[0] is IAccessible))throw new InvalidOperationException("Endpoint child is not an interface.");return (IAccessible)b[0];}
  static void Role(IAccessible a,int r){if(Convert.ToInt32(a.get_accRole(0))!=r)throw new InvalidOperationException("Endpoint semantic role changed.");}
  static void Name(IAccessible a,string n){if(a.get_accName(0)!=n)throw new InvalidOperationException("Endpoint semantic label changed.");}
  IAccessible[] Fields(long d){long q=Guard(d);IAccessible a;Guid g=new Guid("618736E0-3C3D-11CF-810C-00AA00389B71");int h=AccessibleObjectFromWindow(new IntPtr(q),0xFFFFFFFC,ref g,out a);if(h!=0||a==null)throw new InvalidOperationException("Endpoint root HRESULT "+h);int[] roles={10,10,10,10,20,10,10};for(int i=0;i<roles.Length;i++){Role(a,roles[i]);if(i==4||i==5)Name(a,"IP 地址设置");if(i<roles.Length-1)a=Child(a,0);}if(a.accChildCount!=4&&a.accChildCount!=5)throw new InvalidOperationException("Endpoint group shape changed.");int portIndex=a.accChildCount==4?2:4;var ipLabel=Child(a,0);Role(ipLabel,41);Name(ipLabel,"IP 地址 :");var portLabel=Child(a,3);Role(portLabel,41);Name(portLabel,"端口号 :");var ip=Child(a,1);Role(ip,19);if(ip.accChildCount!=7)throw new InvalidOperationException("IPv4 field group changed.");var fields=new IAccessible[5];for(int i=0;i<7;i++){var c=Child(ip,i);if(i%2==0){Role(c,42);fields[i/2]=c;}else{Role(c,41);Name(c,".");}}fields[4]=Child(a,portIndex);Role(fields[4],42);Guard(d);return fields;}
  static int Number(IAccessible a,int max){string value=a.get_accValue(0);int n;if(value==null||value.Length>5||!Int32.TryParse(value,out n)||n<0||n>max)throw new InvalidOperationException("Endpoint numeric value invalid.");return n;}
  public ModbusEndpoint Read(long dialog){var f=Fields(dialog);var oct=new string[4];for(int i=0;i<4;i++)oct[i]=Number(f[i],255).ToString();int port=Number(f[4],65535);if(port==0)throw new InvalidOperationException("Endpoint port zero.");Guard(dialog);return new ModbusEndpoint{Ip=String.Join(".",oct),Port=port};}
  public ModbusEndpoint SetExact(long dialog,string ip,int port){string[] parts=(ip??"").Split('.');if(parts.Length!=4||port<1||port>65535)throw new ArgumentException("IPv4 and port1..65535 required.");int[] numbers=new int[4];for(int i=0;i<4;i++)if(!Int32.TryParse(parts[i],out numbers[i])||numbers[i]<0||numbers[i]>255||parts[i]!=numbers[i].ToString())throw new ArgumentException("Canonical decimal IPv4 required.");var f=Fields(dialog);for(int i=0;i<5;i++){Guard(dialog);int state=Convert.ToInt32(f[i].get_accState(0));if((state&(1|64|32768|65536))!=0)throw new InvalidOperationException("Endpoint field unavailable/read-only/invisible/offscreen.");f[i].set_accValue(0,(i<4?numbers[i]:port).ToString());if(Number(f[i],i<4?255:65535)!=(i<4?numbers[i]:port))throw new InvalidOperationException("Endpoint put_accValue readback differs.");}var result=Read(dialog);if(result.Ip!=ip||result.Port!=port)throw new InvalidOperationException("Endpoint aggregate readback differs.");return result;}
 }
}
