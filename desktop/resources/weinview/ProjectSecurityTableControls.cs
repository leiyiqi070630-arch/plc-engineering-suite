using System;
using System.Collections.Generic;
using System.Runtime.InteropServices;
using Accessibility;

namespace PLCCode.Weinview {
  // Raw MSAA evidence for the CN421 Enhanced Security table. A Qt table cell's
  // FOCUSED bit is not the value of the check box painted inside that cell.
  public static class ProjectSecurityTableControls {
    [Flags] enum OleaccState { Focused=0x00000004, Checked=0x00000010 }
    const int RoleSystemColumnHeader=25;
    const int RoleSystemCell=29;
    const int RoleSystemCheckButton=44;
    static readonly Guid AccessibleId = new Guid("618736E0-3C3D-11CF-810C-00AA00389B71");
    [DllImport("oleacc.dll")] static extern int AccessibleObjectFromWindow(IntPtr hwnd, uint objectId, ref Guid iid,
      [MarshalAs(UnmanagedType.Interface)] out IAccessible accessible);
    [DllImport("user32.dll")] static extern uint GetWindowThreadProcessId(IntPtr hwnd, out uint pid);

    static IAccessible Table(long hwnd, int expectedPid) {
      uint owner; if(GetWindowThreadProcessId(new IntPtr(hwnd),out owner)==0 || owner!=(uint)expectedPid)
        throw new InvalidOperationException("Owned account table required");
      IAccessible root; Guid iid=AccessibleId;
      int hr=AccessibleObjectFromWindow(new IntPtr(hwnd),0xfffffffc,ref iid,out root);
      if(hr<0) Marshal.ThrowExceptionForHR(hr);
      var table=root.get_accChild(1) as IAccessible;
      if(table==null || table.accChildCount!=204) throw new InvalidOperationException("CN421 account table shape changed");
      return table;
    }

    public static string[] Headers(long hwnd, int expectedPid) {
      var table=Table(hwnd,expectedPid); var result=new string[16];
      for(int col=0;col<16;col++) {
        int index=col+2;
        if(Convert.ToInt32(table.get_accRole(index))!=RoleSystemColumnHeader) throw new InvalidOperationException("Account header role changed");
        result[col]=table.get_accName(index);
      }
      if(result[0]!="启用" || result[1]!="隐藏用户" || result[2]!="用户名称" || result[3]!="密码")
        throw new InvalidOperationException("Account table headers changed");
      for(int col=4;col<16;col++) if(result[col]!="类别 "+(char)('A'+col-4))
        throw new InvalidOperationException("Account class headers changed");
      return result;
    }

    public static Dictionary<string,object> ReadNonPasswordCell(long hwnd, int expectedPid, int row, int col) {
      if(row<0 || row>=11 || col<0 || col>=16 || col==3)
        throw new ArgumentException("Only reviewed non-password account cells may be read");
      var table=Table(hwnd,expectedPid);
      int index=19+row*17+col;
      if(Convert.ToInt32(table.get_accRole(index))!=RoleSystemCell)
        throw new InvalidOperationException("Account cell role changed");
      var result=new Dictionary<string,object>();
      result["row"]=row; result["column"]=col; result["role"]=RoleSystemCell;
      result["name"]=SafeName(table,index); result["value"]=SafeValue(table,index);
      result["state"]=SafeState(table,index);
      result["default_action"]=SafeDefaultAction(table,index);
      // Keep the cell's child evidence separate. Qt may paint a checkbox inside
      // ROLE_SYSTEM_CELL without exporting it as STATE_SYSTEM_CHECKED.
      var cell=table.get_accChild(index) as IAccessible;
      var children=new List<Dictionary<string,object>>();
      var checkValues=new List<bool>();
      if(cell!=null) {
        int count=cell.accChildCount;
        if(count<0 || count>8) throw new InvalidOperationException("Unexpected account cell child count");
        result["cell_role"]=SafeRole(cell,0);
        result["cell_name"]=SafeName(cell,0);
        result["cell_value"]=SafeValue(cell,0);
        result["cell_state"]=SafeState(cell,0);
        result["cell_default_action"]=SafeDefaultAction(cell,0);
        MaybeRecordCheckValue(result["cell_role"],result["cell_state"],checkValues);
        for(int child=1;child<=count;child++) {
          var item=new Dictionary<string,object>();
          item["role"]=SafeRole(cell,child);
          item["name"]=SafeName(cell,child);
          item["value"]=SafeValue(cell,child);
          item["state"]=SafeState(cell,child);
          item["default_action"]=SafeDefaultAction(cell,child);
          MaybeRecordCheckValue(item["role"],item["state"],checkValues);
          children.Add(item);
        }
      }
      result["children"]=children.ToArray();
      result["cell_focused"]=HasState(result["state"],OleaccState.Focused);
      result["checkbox_value_available"]=checkValues.Count==1;
      result["checkbox_value"]=checkValues.Count==1 ? (object)checkValues[0] : null;
      return result;
    }

    static void MaybeRecordCheckValue(object role, object state, List<bool> values) {
      if(role!=null && Convert.ToInt32(role)==RoleSystemCheckButton && state!=null)
        values.Add(HasState(state,OleaccState.Checked));
    }
    static bool HasState(object raw, OleaccState flag) {
      return raw!=null && (Convert.ToInt32(raw) & (int)flag)!=0;
    }

    static object SafeRole(IAccessible accessible, object child) { try {return accessible.get_accRole(child);} catch(COMException) {return null;} }
    static object SafeState(IAccessible accessible, object child) { try {return accessible.get_accState(child);} catch(COMException) {return null;} }
    static string SafeName(IAccessible accessible, object child) { try {return accessible.get_accName(child);} catch(COMException) {return null;} }
    static string SafeValue(IAccessible accessible, object child) { try {return accessible.get_accValue(child);} catch(COMException) {return null;} }
    static string SafeDefaultAction(IAccessible accessible, object child) { try {return accessible.get_accDefaultAction(child);} catch(COMException) {return null;} }
  }
}
