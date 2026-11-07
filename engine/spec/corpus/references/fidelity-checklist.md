` — 忠实性核对清单与典型场景测试表。
- `examples/elevator-scan-simulator.html` — 完整参考实现(六层电梯:FB 124 网络 + FC 32 网络,含急停/复位/超时重开/找平)。
skills/plc-sim-animation/examples/elevator-scan-simulator.html<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<title>六层电梯 · 真实逻辑扫描模拟器 (PLC_Code_Project_50)</title>
<style>
  :root{
    --bg:#0f1720; --panel:#182430; --panel2:#1f2f3d; --line:#2c3e4e;
    --txt:#d7e3ec; --dim:#7f96a8; --accent:#35b6ff; --green:#34d399;
    --red:#f87171; --amber:#fbbf24;
  }
  *{box-sizing:border-box; margin:0; padding:0;}
  body{background:var(--bg); color:var(--txt); font-family:"Microsoft YaHei","PingFang SC",sans-serif;
       display:flex; flex-direction:column; height:100vh; user-select:none;}
  header{display:flex; align-items:center; gap:18px; padding:10px 20px; background:var(--panel);
         border-bottom:1px solid var(--line); flex-wrap:wrap;}
  header h1{font-size:17px; font-weight:600;}
  header .sub{color:var(--dim); font-size:12px;}
  .hud{display:flex; gap:20px; margin-left:auto; align-items:center;}
  .hud .cell{text-align:center;}
  .hud .cell .v{font-size:26px; font-weight:700; line-height:1.1;}
  .hud .cell .l{font-size:11px; color:var(--dim);}
  #floorNow{color:var(--accent);}
  #dirNow{color:var(--green);}
  #stateNow{font-size:14px; padding:4px 10px; border-radius:14px; background:var(--panel2); border:1px solid var(--line);}
  #stateNow.fault{background:#3a1d22; border-color:var(--red); color:var(--red);}
  main{flex:1; display:flex; min-height:0;}
  /* ---- 井道 ---- */
  .shaftWrap{flex:1; min-width:0; display:flex; justify-content:center; padding:10px 6px 10px 18px;}
  .shaft{position:relative; width:340px; height:100%;}
  .floorLine{position:absolute; left:0; right:0; height:2px; background:var(--line);}
  .floorLine::after{content:attr(data-fl); position:absolute; right:-34px; top:-11px; width:28px;
         font-size:13px; color:var(--dim); text-align:right;}
  .guide{position:absolute; top:0; bottom:0; width:4px; background:#3a4a58; border-radius:2px;}
  #guideL{left:34px;} #guideR{right:34px;}
  #car{position:absolute; left:44px; right:44px; height:calc(100%/6 - 4px); transition:top .12s linear;
       background:linear-gradient(180deg,#2c4052,#243545); border:2px solid #4a627a; border-radius:6px; overflow:hidden;}
  #car .roof{position:absolute; top:-4px; left:10%; right:10%; height:6px; background:#4a627a; border-radius:3px;}
  #car .door{position:absolute; top:0; bottom:0; width:50%; background:linear-gradient(180deg,#5d7a94,#4b647c);
             transition:left .08s linear, right .08s linear; border-top:2px solid #7d9bb5;}
  #doorL{left:0; border-right:1px solid #2c3e4e;}
  #doorR{right:0; border-left:1px solid #2c3e4e;}
  #car .door.openL{left:-46%;} #car .door.openR{right:-46%;}
  #car .cabLabel{position:absolute; top:6px; left:0; right:0; text-align:center; font-size:12px; color:#bcd3e4;}
  .shaftLamp{position:absolute; left:6px; width:12px; height:12px; border-radius:50%;
             background:#27384a; border:1px solid #3a4a58; transition:background .2s, box-shadow .2s;}
  .shaftLamp.on{background:var(--green); box-shadow:0 0 8px var(--green);}
  /* ---- 面板 ---- */
  aside{width:330px; background:var(--panel); border-left:1px solid var(--line); padding:14px; overflow-y:auto; display:flex; flex-direction:column; gap:12px;}
  .box{background:var(--panel2); border:1px solid var(--line); border-radius:10px; padding:12px;}
  .box h3{font-size:13px; color:var(--dim); margin-bottom:10px; letter-spacing:1px;}
  .hallBtns{display:grid; grid-template-columns:1fr 1fr; gap:8px 12px;}
  .hb{display:flex; align-items:center; gap:6px;}
  .hb button{flex:1; padding:5px 0; border:1px solid #3a4a58; background:#22303e; color:var(--txt);
             border-radius:6px; font-size:13px; cursor:pointer; transition:all .15s;}
  .hb button:hover{border-color:var(--accent);}
  .lamp{width:12px; height:12px; border-radius:50%; background:#27384a; border:1px solid #3a4a58; flex:none;}
  .lamp.on{background:var(--amber); box-shadow:0 0 8px var(--amber);}
  .carBtns{display:grid; grid-template-columns:repeat(3,1fr); gap:8px;}
  .carBtns button{padding:9px 0; font-size:16px; font-weight:700; border-radius:50%;
                  border:1px solid #3a4a58; background:#22303e; color:var(--txt); cursor:pointer; transition:all .15s;}
  .carBtns button:hover{border-color:var(--accent);}
  .carBtns button.on{background:var(--amber); color:#1a1a1a; border-color:var(--amber);}
  .swRow{display:grid; grid-template-columns:1fr 1fr; gap:8px;}
  .swRow button{padding:7px 0; border-radius:6px; border:1px solid #3a4a58; background:#22303e;
                color:var(--txt); cursor:pointer; font-size:13px;}
  .swRow button:hover{border-color:var(--accent);}
  .swRow button.on{background:#3a3220; border-color:var(--amber); color:var(--amber);}
  #btnEstop{background:#3a1d22; border-color:#7a3540; color:var(--red); font-weight:700;}
  #btnEstop.estop{background:#7a2a35; border-color:var(--red); box-shadow:0 0 10px #7a2a35;}
  .speedRow{display:flex; align-items:center; gap:10px; font-size:13px; color:var(--dim); margin-top:10px;}
  .speedRow input{flex:1; accent-color:var(--accent);}
  #logBox{flex:1; min-height:110px; background:#101a24; border:1px solid var(--line); border-radius:8px;
          padding:8px; font-family:Consolas,monospace; font-size:12px; overflow-y:auto; color:#9fb6c8; line-height:1.7;}
  #logBox .ev{color:var(--green);} #logBox .warn{color:var(--amber);} #logBox .err{color:var(--red);}
  #logBox .dim{color:#5d7487;}
  footer{padding:6px 18px; font-size:11px; color:#5d7487; background:var(--panel); border-top:1px solid var(--line);}
</style>
</head>
<body>
<header>
  <h1>六层电梯 · 真实逻辑扫描模拟器</h1>
  <span class="sub">逐网络执行 FB_Elevator_Core(124) + FC_Elevator_Calls(32)</span>
  <div class="hud">
    <div class="cell"><div class="v" id="floorNow">1</div><div class="l">CurrentFloor</div></div>
    <div class="cell"><div class="v" id="dirNow">—</div><div class="l">运行方向</div></div>
    <div class="cell"><div class="v" id="stateNow">St_Idle</div><div class="l">状态机</div></div>
  </div>
</header>
<main>
  <div class="shaftWrap"><div class="shaft" id="shaft"></div></div>
  <aside>
    <div class="box"><h3>厅外召唤 (FC N1-N10 锁存)</h3><div class="hallBtns" id="hallBtns"></div></div>
    <div class="box"><h3>轿厢指令 (FC N11-N16)</h3><div class="carBtns" id="carBtns"></div></div>
    <div class="box">
      <h3>现场输入信号</h3>
      <div class="swRow">
        <button id="btnObst">门受阻 Door_Obstruction</button>
        <button id="btnOverload">超载 Overload</button>
        <button id="btnDoorOpenBtn">开门按钮</button>
        <button id="btnDoorCloseBtn">关门按钮</button>
      </div>
      <div class="swRow" style="margin-top:8px;">
        <button id="btnPause">⏸ 暂停</button>
        <button id="btnBlackout">⚡ 断电重启(模拟层间找平)</button>
      </div>
      <div class="swRow" style="margin-top:8px;">
        <button id="btnEstop">⛔ 急停 EStop</button>
        <button id="btnResetF">🔄 故障复位 Fault_Reset</button>
      </div>
      <div class="speedRow"><span>速度</span><input type="range" id="speed" min="1" max="10" value="3"><span id="speedVal">3×</span></div>
    </div>
    <div class="box"><h3>运行日志(对应真实网络)</h3><div id="logBox"></div></div>
  </aside>
</main>
<footer>扫描模拟器严格对应 FB_Elevator_Core N1-N124 / FC_Elevator_Calls N1-N32 · 信号名与项目一致 · 速度倍率只加速物理过程,逻辑周期不变</footer>

<script>
"use strict";
/* =====================================================================
 * 六层电梯 PLC 逻辑扫描模拟器
 * 严格复刻 FB_Elevator_Core(124 网络) + FC_Elevator_Calls(32 网络)
 * 物理模型: 轿厢位置 pos(0..5 连续) + 门位置 doorPos(0..1)
 * 传感器:   Sens_Floor_x = 平层区域内; Door_Open/Closed_Sensor = 门到位
 * ===================================================================== */
const FLOORS = 6;
const S = { IDLE:'St_Idle', OPEN:'St_Open_Door', DWELL:'St_Door_Dwell',
            CLOSE:'St_Close_Door', UP:'St_Moving_Up', DOWN:'St_Moving_Down', FAULT:'St_Fault' };

/* ---- 物理参数 ---- */
const PHYS = {
  moveTime: 1.0,      // 一层移动时间(s)
  openTime: 0.8,      // 开门时间
  closeTime: 0.8,     // 关门时间
  levelBand: 0.06,    // 平层检测带(层)
  doorOpenAt: 0.95,   // Door_Open_Sensor 动作点
  doorCloseAt: 0.05,  // Door_Closed_Sensor 动作点
};

/* ---- 输入(真实符号) ---- */
const I = {
  Hall_Up:   new Array(FLOORS+1).fill(false),   // FC 输入: 厅外上行按钮
  Hall_Down: new Array(FLOORS+1).fill(false),   // 厅外下行按钮
  Car_Call:  new Array(FLOORS+1).fill(false),   // 轿厢按钮
  Sens_Floor:new Array(FLOORS+1).fill(false),   // 平层传感器(物理)
  Door_Open_Sensor:false,  Door_Closed_Sensor:false,
  Door_Open_Button:false,  Door_Close_Button:false,
  Door_Obstruction:false,  Overload:false,
  EStop:true,              // 常闭: true=正常, false=急停按下
  Fault_Reset:false,       // 脉冲
};

/* ---- FB 内部变量(真实 Static) ---- */
const V = {
  InitDone:false,
  St_Idle:false, St_Open_Door:false, St_Door_Dwell:false, St_Close_Door:false,
  St_Moving_Up:false, St_Moving_Down:false, St_Fault:false,
  CurrentFloor:1,
  CallAt:new Array(FLOORS+1).fill(false),
  AboveFlag:new Array(FLOORS+1).fill(false), BelowFlag:new Array(FLOORS+1).fill(false),
  Any_Above:false, Any_Below:false, AtFloorAny:false,
  ServeUp:new Array(FLOORS+1).fill(false), ServeDown:new Array(FLOORS+1).fill(false),
  ServeUpStop:false, ServeDownStop:false, OpenHere:false,
  ArriveUp:false, ArriveDown:false,
  ReverseToDown:false, ReverseToUp:false,
  OpenManual:false, EndDwell:false, CloseComplete:false, Reopen:false,
  DwellElapsed:false, CloseTimeout:false, ResetOK:false,
  BetweenFloors:false, LastDirection_Up:true,
  Motor_Up:false, Motor_Down:false, Door_Open_Cmd:false, Door_Close_Cmd:false,
  Alarm_Horn:false,
  /* 物理辅助(非 PLC 变量) */
  pos:0, doorPos:0, tDwell:0, tClose:0, tMove:0, running:false,
};

/* ---- DB_Elevator_Link(真实 17 个锁存) ---- */
const DB = {
  HallUp_L:  new Array(FLOORS+1).fill(false),  // 1..5
  HallDown_L:new Array(FLOORS+1).fill(false),  // 2..6
  CarCall_L: new Array(FLOORS+1).fill(false),  // 1..6
};

/* ================= PLC 扫描(一个扫描周期 = 顺序执行全部网络) ================= */
let scanCount = 0;
function plcScan(){
  scanCount++;
  /* ---------- FC_Elevator_Calls N1-N16: 呼叫锁存(按钮沿→SCoil) ---------- */
  for(let f=1;f<=5;f++) if(I.Hall_Up[f]   && !DB.HallUp_L[f]){ DB.HallUp_L[f]=true; ev(`FC N${f}: 锁存${f}楼上行召唤 → HallUp_L${f}`,'ev'); }
  for(let f=2;f<=6;f++) if(I.Hall_Down[f] && !DB.HallDown_L[f]){ DB.HallDown_L[f]=true; ev(`FC N${f+4}: 锁存${f}楼下行召唤 → HallDown_L${f}`,'ev'); }
  for(let f=1;f<=6;f++) if(I.Car_Call[f]  && !DB.CarCall_L[f]){ DB.CarCall_L[f]=true; ev(`FC N${f+10}: 锁存轿厢${f}楼指令 → CarCall_L${f}`,'ev'); }
  // FC N17-N32: 召唤灯 = 锁存位(渲染时直接读 DB)

  /* ---------- FB N1-N2: 初始化 ---------- */
  if(!V.InitDone){ V.St_Idle=true; V.InitDone=true; ev('FB N1/N2: 上电置空闲态+完成标志'); }

  /* ---------- FB N3-N8: 楼层计数(平层传感器→MOV CurrentFloor) ---------- */
  for(let f=1;f<=FLOORS;f++){ if(I.Sens_Floor[f]) V.CurrentFloor = f; }

  /* ---------- FB N9-N14: 各层有呼叫 ---------- */
  for(let f=1;f<=FLOORS;f++){
    V.CallAt[f] = DB.CarCall_L[f] || DB.HallUp_L[f] || DB.HallDown_L[f];
  }
  /* ---------- FB N15-N24: 上方/下方有呼叫标志 ---------- */
  for(let f=1;f<=5;f++){ V.AboveFlag[f]=false; for(let g=f+1;g<=6;g++) if(V.CallAt[g]){V.AboveFlag[f]=true;break;} }
  for(let f=2;f<=6;f++){ V.BelowFlag[f]=false; for(let g=1;g<f;g++)  if(V.CallAt[g]){V.BelowFlag[f]=true;break;} }
  /* ---------- FB N25-N27: 当前层上方/下方有呼叫; 轿厢在楼层 ---------- */
  V.Any_Above=false; V.Any_Below=false; V.AtFloorAny=false;
  for(let f=1;f<=FLOORS;f++){
    if(I.Sens_Floor[f]){
      V.AtFloorAny = true;
      if(V.AboveFlag[f]) V.Any_Above = true;
      if(V.BelowFlag[f]) V.Any_Below = true;
    }
  }
  /* ---------- FB N28-N39: 上行/下行应答(运行中+平层+该层呼叫) ---------- */
  for(let f=1;f<=FLOORS;f++){ V.ServeUp[f]=false; V.ServeDown[f]=false; }
  for(let f=1;f<=5;f++) V.ServeUp[f]   = (DB.CarCall_L[f]||DB.HallUp_L[f])   && V.St_Moving_Up   && I.Sens_Floor[f];
  V.ServeUp[6]   = DB.CarCall_L[6]                                          && V.St_Moving_Up   && I.Sens_Floor[6];
  V.ServeDown[1] = DB.CarCall_L[1]                                          && V.St_Moving_Down && I.Sens_Floor[1];
  for(let f=2;f<=6;f++) V.ServeDown[f] = (DB.CarCall_L[f]||DB.HallDown_L[f]) && V.St_Moving_Down && I.Sens_Floor[f];
  /* ---------- FB N40-N41: 方向停靠目标 ---------- */
  V.ServeUpStop=false; V.ServeDownStop=false;
  for(let f=1;f<=6;f++){ if(V.ServeUp[f])V.ServeUpStop=true; if(V.ServeDown[f])V.ServeDownStop=true; }
  /* ---------- FB N42: 空闲本层呼叫(实际代码无状态限制) ---------- */
  V.OpenHere=false;
  for(let f=1;f<=FLOORS;f++){ if(I.Sens_Floor[f] && V.CallAt[f]) V.OpenHere=true; }

  /* ---------- FB N43-N47: 到达目标 → 停 + 请求开门 ---------- */
  if(V.ServeUpStop){ V.St_Moving_Up=false; V.St_Open_Door=true; evOnce('FB N43/44: 到达目标 → 停上行+请求开门'); }
  if(V.ServeDownStop){ V.St_Moving_Down=false; V.St_Open_Door=true; evOnce('FB N45/46: 到达目标 → 停下行+请求开门'); }
  const openHereRise = V.OpenHere && !V.prevOpenHere;
  V.prevOpenHere = V.OpenHere;
  if(V.OpenHere){ V.St_Open_Door=true; if(openHereRise) evOnce('FB N42/47: 本层有呼叫 → 请求开门'); }

  /* ---------- FB N48-N49: 本次停靠属性 ---------- */
  if(V.ServeUpStop || V.OpenHere){ V.ArriveUp=true; }
  if(V.ServeDownStop || V.OpenHere){ V.ArriveDown=true; }

  /* ---------- FB N50-N65: 服务完毕清锁存 ---------- */
  for(let f=1;f<=6;f++){
    if((V.ArriveUp||V.ArriveDown) && I.Sens_Floor[f] && DB.CarCall_L[f]){ DB.CarCall_L[f]=false; ev(`FB N${49+f}: 清${f}楼轿厢指令`,'dim'); }
  }
  for(let f=1;f<=5;f++){
    if(I.Sens_Floor[f] && V.ArriveUp   && DB.HallUp_L[f]){ DB.HallUp_L[f]=false; ev(`FB N${55+f}: 清${f}楼上行召唤`,'dim'); }
  }
  for(let f=2;f<=6;f++){
    if(I.Sens_Floor[f] && V.ArriveDown && DB.HallDown_L[f]){ DB.HallDown_L[f]=false; ev(`FB N${59+f}: 清${f}楼下行召唤`,'dim'); }
  }

  /* ---------- FB N66-N69: 发车(空闲+门关+方向目标+无故障+本层无呼叫) ---------- */
  const departCond = V.St_Idle && I.Door_Closed_Sensor && I.EStop && !V.Overload && !V.St_Fault && !V.OpenHere;
  if(departCond && V.Any_Above){
    V.St_Moving_Up=true; V.St_Idle=false;
    ev('FB N66/67: 发车上行 (Any_Above & 门关 & 无故障)','ev');
  } else if(departCond && V.Any_Below && !V.Any_Above){
    V.St_Moving_Down=true; V.St_Idle=false;
    ev('FB N68/69: 发车下行 (Any_Below & !Any_Above 上行优先)','ev');
  }

  /* ---------- FB N70-N75: 反向换向 ---------- */
  V.ReverseToDown = V.St_Moving_Up   && V.AtFloorAny && I.EStop && !V.ServeUpStop   && !V.Any_Above && V.Any_Below;
  V.ReverseToUp   = V.St_Moving_Down && V.AtFloorAny && I.EStop && !V.ServeDownStop && !V.Any_Below && V.Any_Above;
  if(V.ReverseToDown){ V.St_Moving_Up=false; V.St_Moving_Down=true; ev('FB N70-72: 上行无目标 → 反向转下行','warn'); }
  if(V.ReverseToUp){ V.St_Moving_Down=false; V.St_Moving_Up=true; ev('FB N73-75: 下行无目标 → 反向转上行','warn'); }

  /* ---------- FB N76-N79: 无任何目标 → 就近停靠回空闲 ---------- */
  const idleCond = V.AtFloorAny && !V.ServeUpStop && !V.ServeDownStop && !V.Any_Above && !V.Any_Below;
  if(V.St_Moving_Up && idleCond){ V.St_Moving_Up=false; V.St_Idle=true; ev('FB N76/77: 上行无任何目标 → 就近停靠','dim'); }
  if(V.St_Moving_Down && idleCond){ V.St_Moving_Down=false; V.St_Idle=true; ev('FB N78/79: 下行无任何目标 → 就近停靠','dim'); }

  /* ---------- FB N80-N81: 门命令输出 ---------- */
  V.Door_Open_Cmd  = V.St_Open_Door && I.EStop;
  V.Door_Close_Cmd = V.St_Close_Door && I.EStop && !I.Door_Obstruction && !I.Overload;

  /* ---------- FB N82-N83: 手动开门(空闲+平层+无故障) ---------- */
  V.OpenManual = I.Door_Open_Button && V.St_Idle && V.AtFloorAny && I.EStop && !V.St_Fault;
  if(V.OpenManual){ V.St_Open_Door=true; evOnce('FB N82/83: 手动开门请求'); }

  /* ---------- FB N84-N85: 门开到位 → 进入停留 ---------- */
  if(V.St_Open_Door && I.Door_Open_Sensor){ V.St_Door_Dwell=true; V.St_Open_Door=false; evOnce('FB N84/85: 门开到位 → 进入停留'); }

  /* ---------- FB N86: 开门停留 5 秒(TON) ---------- */
  if(V.St_Door_Dwell){ V.tDwell += SCAN_DT; V.DwellElapsed = V.tDwell >= 5; }
  else { V.tDwell = 0; V.DwellElapsed = false; }

  /* ---------- FB N87-N89: 停留结束(延时到/按关门) → 开始关门 ---------- */
  V.EndDwell = (V.DwellElapsed || I.Door_Close_Button) && V.St_Door_Dwell && I.EStop &&
               !V.Overload && !I.Door_Obstruction && !I.Door_Open_Button;
  if(V.EndDwell){ V.St_Door_Dwell=false; V.St_Close_Door=true; evOnce('FB N87-89: 停留结束 → 开始关门'); }

  /* ---------- FB N90-N93: 门关到位 → 回空闲 + 清停靠属性 ---------- */
  if(V.St_Close_Door && I.Door_Closed_Sensor){
    V.St_Idle=true; V.ArriveUp=false; V.ArriveDown=false; V.St_Close_Door=false;
    evOnce('FB N90-93: 门关到位 → 回空闲态');
  }

  /* ---------- FB N94-N96: 关门受阻/开门按钮/超载/急停 → 重新开门 ---------- */
  /* 真实: (Obstruction || Open_Button || Overload || !EStop) && St_Close_Door */
  V.Reopen = (I.Door_Obstruction || I.Door_Open_Button || V.Overload || !I.EStop) && V.St_Close_Door;
  if(V.Reopen){ V.St_Close_Door=false; V.St_Open_Door=true; ev('FB N94-96: 关门受阻/开门按钮/超载 → 重新开门','warn'); }

  /* ---------- FB N97-N99: 关门超时 8 秒 → 重新开门 ---------- */
  if(V.St_Close_Door){ V.tClose += SCAN_DT; V.CloseTimeout = V.tClose >= 8; }
  else { V.tClose = 0; V.CloseTimeout = false; }
  if(V.St_Close_Door && V.CloseTimeout){
    V.St_Open_Door=true; V.St_Close_Door=false;
    ev('FB N97-99: 关门超时 8s → 重新开门','warn');
  }

  /* ---------- FB N100-N101: 电机输出(门闭+无故障+互锁) ---------- */
  V.Motor_Up   = V.St_Moving_Up   && I.Door_Closed_Sensor && I.EStop && !V.St_Fault && !V.Overload && !V.St_Moving_Down;
  V.Motor_Down = V.St_Moving_Down && I.Door_Closed_Sensor && I.EStop && !V.St_Fault && !V.Overload && !V.St_Moving_Up;

  /* ---------- FB N102-N106: 急停 → 停+故障态+报警 ---------- */
  if(!I.EStop){
    if(V.St_Moving_Up){ V.St_Moving_Up=false; ev('FB N102: 急停: 停上行','err'); }
    if(V.St_Moving_Down){ V.St_Moving_Down=false; ev('FB N103: 急停: 停下行','err'); }
    if(V.St_Close_Door){ V.St_Close_Door=false; ev('FB N104: 急停: 停止关门','err'); }
    if(!V.St_Fault){ V.St_Fault=true; ev('FB N105: 急停: 置故障态','err'); }
  }
  V.Alarm_Horn = V.St_Fault;

  /* ---------- FB N107-N109: 复位(急停已复位+按复位) ---------- */
  V.ResetOK = I.Fault_Reset && I.EStop;
  if(V.ResetOK){
    if(V.St_Fault){ V.St_Fault=false; ev('FB N108: 故障复位','ev'); }
    if(!V.St_Idle){ V.St_Idle=true; ev('FB N109: 复位后回空闲态','ev'); }
  }

  /* ---------- FB N110-N114: 层间找平恢复(按记忆方向) ---------- */
  V.BetweenFloors = V.St_Idle && I.Door_Closed_Sensor && I.EStop && !V.AtFloorAny && !V.St_Fault && !V.Overload;
  if(V.BetweenFloors && V.LastDirection_Up){ V.St_Idle=false; V.St_Moving_Up=true; ev('FB N111/112: 层间找平 → 原方向上行','warn'); }
  if(V.BetweenFloors && !V.LastDirection_Up){ V.St_Idle=false; V.St_Moving_Down=true; ev('FB N113/114: 层间找平 → 原方向下行','warn'); }

  /* ---------- FB N115-N116: 记忆方向 ---------- */
  if(V.St_Moving_Up)   V.LastDirection_Up = true;
  if(V.St_Moving_Down) V.LastDirection_Up = false;

  /* ---------- FB N117-N124: 楼层指示/方向指示(渲染读) ---------- */
}

/* 事件去重:同一消息在 8 个扫描内只记一次(对应真实网络的转移瞬间) */
let lastEvMsg='', lastEvScan=-1;
function evOnce(msg, cls){
  if(lastEvMsg===msg && scanCount-lastEvScan<8) return;
  lastEvMsg=msg; lastEvScan=scanCount;
  addLog(msg, cls);
}
function ev(msg, cls){ addLog(msg, cls); }

/* ================= 物理模型(在每次扫描间推进) ================= */
function physics(dt){
  // 平层传感器(先清)
  for(let f=1;f<=FLOORS;f++) I.Sens_Floor[f] = Math.abs(V.pos-(f-1)) < PHYS.levelBand;
  // 移动
  if(V.Motor_Up){ V.pos += dt/PHYS.moveTime; V.running=true; }
  else if(V.Motor_Down){ V.pos -= dt/PHYS.moveTime; V.running=true; }
  // 门
  if(V.Door_Open_Cmd && V.doorPos<1){ V.doorPos = Math.min(1, V.doorPos + dt/PHYS.openTime); }
  else if(V.Door_Close_Cmd && V.doorPos>0){ V.doorPos = Math.max(0, V.doorPos - dt/PHYS.closeTime); }
  I.Door_Open_Sensor  = V.doorPos >= PHYS.doorOpenAt;
  I.Door_Closed_Sensor= V.doorPos <= PHYS.doorCloseAt;
}

/* ================= 输入交互 ================= */
function pressHall(f, up){
  if(!I.EStop) return;
  if(up){ I.Hall_Up[f]=true; setTimeout(()=>I.Hall_Up[f]=false, 120); }
  else  { I.Hall_Down[f]=true; setTimeout(()=>I.Hall_Down[f]=false, 120); }
}
function pressCar(f){
  if(!I.EStop) return;
  I.Car_Call[f]=true; setTimeout(()=>I.Car_Call[f]=false, 120);
}
function toggleBtn(id, obj, key){
  const b=document.getElementById(id);
  b.classList.toggle('on');
  obj[key]=b.classList.contains('on');
}
function estop(){
  const b=document.getElementById('btnEstop');
  b.classList.toggle('estop');
  I.EStop = !b.classList.contains('estop');
  if(!I.EStop) ev('⛔ 急停按下 (EStop=0)','err');
  else ev('急停释放 (EStop=1)','ev');
}
function faultReset(){
  if(I.EStop){ I.Fault_Reset=true; setTimeout(()=>I.Fault_Reset=false, 150); ev('故障复位按钮 (Fault_Reset)','ev'); }
  else ev('急停未释放: 复位无效 (需 EStop=1)','warn');
}
function blackout(){
  // 模拟断电重启: 轿厢停在层间, 全部状态复位, 保留记忆方向
  const dir = V.pos >= 2.5 ? -1 : 1;
  V.pos = Math.min(4.7, Math.max(0.3, V.pos + dir*0.45)); // 停在非平层
  V.St_Idle=true; V.St_Open_Door=V.St_Door_Dwell=V.St_Close_Door=false;
  V.St_Moving_Up=V.St_Moving_Down=V.St_Fault=false; V.running=false;
  V.doorPos=0; V.Door_Open_Cmd=V.Door_Close_Cmd=false;
  for(let f=1;f<=6;f++){ DB.CarCall_L[f]=false; }
  ev('⚡ 断电重启: 轿厢停在层间, 等待找平恢复','warn');
  render();
}

/* ================= 渲染 ================= */
function render(){
  const frac = 1 - V.pos/(FLOORS-1);
  const car = document.getElementById('car');
  car.style.top = `calc(${frac*100}% - ${car.offsetHeight||80}px)`;
  document.getElementById('doorL').style.left = `${-45*V.doorPos}%`;
  document.getElementById('doorR').style.right = `${-45*V.doorPos}%`;
  const st = V.St_Moving_Up?S.UP:V.St_Moving_Down?S.DOWN:V.St_Open_Door?S.OPEN:
             V.St_Door_Dwell?S.DWELL:V.St_Close_Door?S.CLOSE:V.St_Fault?S.FAULT:S.IDLE;
  document.getElementById('floorNow').textContent = V.CurrentFloor;
  document.getElementById('dirNow').textContent = V.Motor_Up?'▲ 上行':V.Motor_Down?'▼ 下行':'—';
  const se = document.getElementById('stateNow');
  se.textContent = st; se.classList.toggle('fault', V.St_Fault);
  document.querySelectorAll('.shaftLamp').forEach(el=>{
    el.classList.toggle('on', Math.abs(V.pos-(+el.dataset.f-1))<PHYS.levelBand && !V.St_Fault);
  });
  document.querySelectorAll('.hb').forEach(el=>{
    const f=+el.dataset.f, up=el.dataset.up==='1';
    el.querySelector('.lamp').classList.toggle('on', up?DB.HallUp_L[f]:DB.HallDown_L[f]);
  });
  document.querySelectorAll('#carBtns button').forEach(b=>{
    b.classList.toggle('on', DB.CarCall_L[+b.dataset.f]);
  });
  document.getElementById('btnPause').textContent = paused?'▶ 继续':'⏸ 暂停';
}

/* ================= 日志 ================= */
function addLog(msg, cls=''){
  const box=document.getElementById('logBox');
  const d=document.createElement('div');
  d.innerHTML=`<span class="dim">[${scanCount}]</span> <span class="${cls}">${msg}</span>`;
  box.appendChild(d);
  while(box.children.length>150) box.removeChild(box.firstChild);
  box.scrollTop=box.scrollHeight;
}

/* ================= 主循环 ================= */
let paused=false, lastT=performance.now();
const SCAN_DT = 0.05;
function loop(now){
  const speed = +document.getElementById('speed').value;
  const dtReal = Math.min(0.1,(now-lastT)/1000); lastT=now;
  if(!paused){
    const simDt = dtReal * speed;                       // 模拟世界时间(速度倍率)
    const scans = Math.max(1, Math.round(simDt/SCAN_DT)); // 对应扫描次数(TON 用 SCAN_DT 累加,时间一致)
    for(let i=0;i<scans;i++){
      physics(SCAN_DT);       // 物理推进(传感器更新)
      plcScan();              // 一个扫描周期 = 全部真实网络
    }
  }
  render();
  requestAnimationFrame(loop);
}

/* ================= UI 构建 ================= */
function build(){
  const shaft=document.getElementById('shaft');
  for(let f=FLOORS;f>=1;f--){
    const line=document.createElement('div'); line.className='floorLine'; line.dataset.fl=`${f}F`;
    line.style.top=`calc(${(FLOORS-f)/(FLOORS-1)*100}% - 1px)`;
    shaft.appendChild(line);
    const lamp=document.createElement('div'); lamp.className='shaftLamp'; lamp.dataset.f=f;
    lamp.style.top=`calc(${(FLOORS-f)/(FLOORS-1)*100}% - 6px)`;
    shaft.appendChild(lamp);
  }
  const car=document.createElement('div'); car.id='car';
  car.innerHTML=`<div class="roof"></div><div class="door" id="doorL"></div><div class="door" id="doorR"></div><div class="cabLabel">轿厢</div>`;
  shaft.appendChild(car);
  const gL=document.createElement('div'); gL.id='guideL'; gL.className='guide'; shaft.appendChild(gL);
  const gR=document.createElement('div'); gR.id='guideR'; gR.className='guide'; shaft.appendChild(gR);

  const hb=document.getElementById('hallBtns');
  for(let f=FLOORS;f>=1;f--){
    if(f<FLOORS){
      const row=document.createElement('div'); row.className='hb'; row.dataset.f=f; row.dataset.up='1';
      row.innerHTML=`<button>▲ ${f}F</button><div class="lamp"></div>`;
      row.querySelector('button').onclick=()=>pressHall(f,true);
      hb.appendChild(row);
    }
    if(f>1){
      const row=document.createElement('div'); row.className='hb'; row.dataset.f=f; row.dataset.up='0';
      row.innerHTML=`<button>▼ ${f}F</button><div class="lamp"></div>`;
      row.querySelector('button').onclick=()=>pressHall(f,false);
      hb.appendChild(row);
    }
  }
  const cb=document.getElementById('carBtns');
  for(let f=1;f<=FLOORS;f++){
    const b=document.createElement('button'); b.textContent=f; b.dataset.f=f;
    b.onclick=()=>pressCar(f); cb.appendChild(b);
  }
  document.getElementById('btnObst').onclick=()=>toggleBtn('btnObst', I, 'Door_Obstruction');
  document.getElementById('btnOverload').onclick=()=>toggleBtn('btnOverload', V, 'Overload');
  document.getElementById('btnDoorOpenBtn').onclick=()=>{ if(!I.EStop)return; I.Door_Open_Button=true; setTimeout(()=>I.Door_Open_Button=false,200); };
  document.getElementById('btnDoorCloseBtn').onclick=()=>{ if(!I.EStop)return; I.Door_Close_Button=true; setTimeout(()=>I.Door_Close_Button=false,200); };
  document.getElementById('btnPause').onclick=()=>{ paused=!paused; render(); };
  document.getElementById('btnBlackout').onclick=blackout;
  document.getElementById('btnEstop').onclick=estop;
  document.getElementById('btnResetF').onclick=faultReset;
  const sp=document.getElementById('speed');
  sp.oninput=()=>document.getElementById('speedVal').textContent=sp.value+'×';
}
build();
addLog('上电: InitDone 初始化完成, 轿厢在 1 楼 St_Idle','dim');
setTimeout(()=>{ ev('演示: 按 3楼上行召唤 + 5楼下行召唤 + 轿厢4楼指令','dim');
  I.Hall_Up[3]=true; setTimeout(()=>I.Hall_Up[3]=false,120);
  I.Hall_Down[5]=true; setTimeout(()=>I.Hall_Down[5]=false,120);
  I.Car_Call[4]=true; setTimeout(()=>I.Car_Call[4]=false,120);
}, 500);
requestAnimationFrame(loop);
</script>
</body>
</html>
