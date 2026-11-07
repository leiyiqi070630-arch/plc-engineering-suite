using System;
using System.Collections.Generic;
using System.Runtime.InteropServices;
using System.Threading;

namespace PLC Engineering Suite.Weinview {
 public sealed class NativeModelEntry {
  public int Index; public string Name,Path; public int Role,State;
 }
 public sealed class NativeModelChoice {
  public string Name,Detail,Template,Orientation; public int SelectedState;
 }
 // The signed CN421 New Project dialog is the vendor's model serializer.
 // No EMTP/CMTP binary patching, desktop coordinates, or PLC-dialog allowlist reuse.
 public sealed class ModelCreationControls {
  readonly NativeControls native; readonly long main,modal,root; readonly int pid;
  const string Page="client/index:0/index:0/index:0/index:0/index:0/index:0";
  const string Tree=Page+"/index:11", Meta=Page+"/index:16";
  public ModelCreationControls(NativeControls n,long mainHwnd,long dialogHwnd,long qtHwnd,int ownerPid) {
   native=n;main=mainHwnd;modal=dialogHwnd;root=qtHwnd;pid=ownerPid;Guard();
  }
  void Guard() {
   var top=native.EnumTopWindows();int dialogs=0;bool foundMain=false,foundModal=false;
   foreach(var w in top){if(!w.Visible)continue;if(w.Class=="#32770"){dialogs++;if(w.Hwnd==modal&&w.Title==""&&w.Enabled&&w.Pid==pid)foundModal=true;}if(w.Hwnd==main&&w.Class=="EasyBuilderPro"&&!w.Enabled&&w.Pid==pid)foundMain=true;}
   if(dialogs!=1||!foundModal||!foundMain)throw new InvalidOperationException("Unique original New Project dialog and disabled owned main required.");
   int qt=0;foreach(var w in native.EnumChildControls(modal))if(w.Class=="Qt5QWindowIcon"&&w.Visible&&w.Enabled){qt++;if(w.Hwnd!=root||w.Pid!=pid)throw new InvalidOperationException("Model picker root changed.");}
   if(qt!=1)throw new InvalidOperationException("Unique native model picker root required.");
  }
  OwnedMsaaAction.Target Node(string path){return OwnedMsaaAction.Resolve(root,pid,path);}
  string Text(string path,int role){var t=Node(path);if(Convert.ToInt32(t.acc.get_accRole(t.child))!=role)throw new InvalidOperationException("Native model metadata role changed.");return t.acc.get_accName(t.child);}
  int State(string path){var t=Node(path);return Convert.ToInt32(t.acc.get_accState(t.child));}
  public NativeModelEntry[] Directory() {
   Guard();var t=Node(Tree);if(t.child!=0||Convert.ToInt32(t.acc.get_accRole(0))!=35)throw new InvalidOperationException("Native model tree required.");
   int count=t.acc.accChildCount;if(count<10||count>120)throw new InvalidOperationException("Model directory outside known native bounds.");
   var entries=new List<NativeModelEntry>();
   for(int i=0;i<count;i++){string path=Tree+"/index:"+i;var row=Node(path);int role=Convert.ToInt32(row.acc.get_accRole(row.child));if(role==36)entries.Add(new NativeModelEntry{Index=i,Name=row.acc.get_accName(row.child),Path=path,Role=role,State=Convert.ToInt32(row.acc.get_accState(row.child))});}
   return entries.ToArray();
  }
  NativeModelEntry Unique(NativeModelEntry[] rows,string name){NativeModelEntry found=null;foreach(var row in rows)if(row.Name==name){if(found!=null)throw new InvalidOperationException("Duplicate native model.");found=row;}return found;}
  void Selected(NativeModelEntry expected){var until=DateTime.UtcNow.AddSeconds(3);do{var t=Node(expected.Path);if(t.acc.get_accName(t.child)!=expected.Name||Convert.ToInt32(t.acc.get_accRole(t.child))!=36)throw new InvalidOperationException("Native model directory changed.");if((Convert.ToInt32(t.acc.get_accState(t.child))&2)!=0)return;Thread.Sleep(40);}while(DateTime.UtcNow<until);throw new InvalidOperationException("Original model selection readback failed: "+expected.Name);}
  public NativeModelChoice Select(string exactName,string groupName,string bridgePath){
   Guard();native.InvokeQtElement(main,bridgePath,"model-select:"+exactName+"|"+groupName);
   var rows=Directory();var target=Unique(rows,exactName)??Unique(rows,groupName);
   if(target==null)throw new InvalidOperationException("Requested original model is absent after native selection.");
   return Read(target);
  }
  public NativeModelChoice Read(NativeModelEntry expected) {
   Guard();Selected(expected);string name=Text(Meta+"/index:1",41);if(name!=expected.Name)throw new InvalidOperationException("Selected model did not update original model metadata.");
   string template=Text(Page+"/index:8",44);if(!template.StartsWith("使用范本 (")||!template.EndsWith(")")||(State(Page+"/index:8")&16)==0)throw new InvalidOperationException("Checked original template required.");
   string orientation=(State(Meta+"/index:3")&16)!=0?"horizontal":(State(Meta+"/index:4")&16)!=0?"vertical":"none";
   return new NativeModelChoice{Name=name,Detail=Text(Meta+"/index:7",41),Template=template.Substring(6,template.Length-7),Orientation=orientation,SelectedState=State(expected.Path)};
  }
  public void Orientation(string value){Guard();if(value!="horizontal"&&value!="vertical")throw new ArgumentException("Horizontal or vertical orientation required.");string path=Meta+(value=="horizontal"?"/index:3":"/index:4");var t=Node(path);string name=t.acc.get_accName(t.child);if(t.child!=0||Convert.ToInt32(t.acc.get_accRole(0))!=45||name!=(value=="horizontal"?"水平":"垂直")||(Convert.ToInt32(t.acc.get_accState(0))&0x18001)!=0)throw new InvalidOperationException("Visible enabled original orientation required.");if((Convert.ToInt32(t.acc.get_accState(0))&16)==0)t.acc.accDoDefaultAction(0);var until=DateTime.UtcNow.AddSeconds(3);while((State(path)&16)==0){if(DateTime.UtcNow>=until)throw new InvalidOperationException("Native orientation readback failed.");Thread.Sleep(40);}}
  public void Confirm(string exactName){var rows=Directory();NativeModelEntry target=null;foreach(var row in rows)if(row.Name==exactName)target=row;if(target==null)throw new InvalidOperationException("Model absent.");Read(target);Guard();OwnedMsaaAction.Execute(root,pid,"client/index:0/index:0/index:0/index:4","确定 Enter",43,"Invoke");}
  public void Cancel(){Guard();OwnedMsaaAction.Execute(root,pid,"client/index:0/index:0/index:0/index:5","取消",43,"Invoke");}
 }
}
