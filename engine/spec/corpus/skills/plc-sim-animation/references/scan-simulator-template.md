# 扫描模拟器 HTML 骨架

单文件 HTML:三区模型 + plcScan() 逐网络执行 + 物理模型 + 渲染。核心结构如下,按项目填充。

## 三区模型

```js
/* 输入:按钮/传感器/开关(物理模型每帧更新传感器) */
const I = {
  Hall_Up: new Array(7).fill(false),      // 厅外上行按钮(真实信号名)
  Sens_Floor: new Array(7).fill(false),   // 平层传感器
  Door_Open_Sensor:false, Door_Closed_Sensor:false,
  EStop:true,          // 常闭:true=正常, false=急停按下 ← 注意极性
  Fault_Reset:false,   // 脉冲
};

/* 内部变量:状态位/标志/计时(名称用代码里的 St_*/标志名) */
const V = {
  St_Idle:false, St_Open_Door:false, St_Door_Dwell:false, St_Close_Door:false,
  St_Moving_Up:false, St_Moving_Down:false, St_Fault:false,
  /* ...其他标志,物理辅助(非 PLC 变量)单独注释 */
  pos:0, doorPos:0, tDwell:0,
};

/* 共享锁存(全局 DB,如 DB_Elevator_Link) */
const DB = { HallUp_L:[], HallDown_L:[], CarCall_L:[] };
```

## 扫描周期(一个扫描 = 按真实网络顺序执行全部逻辑)

```js
const SCAN_DT = 0.05;                    // 一个扫描的模拟时间(s)
let scanCount = 0;
function plcScan(){
  scanCount++;
  /* FC N1-N16: 呼叫锁存(按钮沿 → 置位) */
  if(I.Hall_Up[f] && !DB.HallUp_L[f]){ DB.HallUp_L[f]=true; ev(`FC N${f}: 锁存${f}楼上行召唤`,'ev'); }

  /* FB N3-N8: 楼层计数(平层传感器 → MOV CurrentFloor) */
  for(let f=1;f<=6;f++) if(I.Sens_Floor[f]) V.CurrentFloor = f;

  /* FB N9-N24: 中间标志(CallAt / AboveFlag / BelowFlag)——照抄布尔方程 */

  /* FB N66-69: 发车 —— S/R 语义,条件严格来自网络 */
  if(V.St_Idle && I.Door_Closed_Sensor && V.Any_Above && I.EStop && !V.Overload && !V.St_Fault && !V.OpenHere){
    V.St_Moving_Up = true; V.St_Idle = false;     // SCoil + RCoil
    ev('FB N66/67: 发车上行','ev');
  }

  /* TON 模拟:如 停留 5s / 关门超时 8s */
  if(V.St_Door_Dwell){ V.tDwell += SCAN_DT; V.DwellElapsed = V.tDwell >= 5; }
  else { V.tDwell = 0; V.DwellElapsed = false; }

  /* 输出方程:如 电机上行 = 状态 & 门关 & 无故障 & 互锁 */
  V.Motor_Up = V.St_Moving_Up && I.Door_Closed_Sensor && I.EStop && !V.St_Fault && !V.Overload && !V.St_Moving_Down;
}
```

要点:
- **S/R 语义**:`St_* = true/false` 只发生在置位/复位网络里;普通条件成立 ≠ 状态保持。每周期重算的标志(如 CallAt)用赋值,状态位用置位/复位,两者别混。
- **顺序敏感**:先写的网络先执行,同扫描内后写的可以覆盖先写的。照抄网络顺序,注释标 `/* FB N43-47 */`。
- **TON 用 SCAN_DT 累加**,时间常数用代码原值(T#5s→5)。

## 物理模型(唯一建模处)

```js
const PHYS = { moveTime:1.0, openTime:0.8, levelBand:0.06, doorOpenAt:0.95, doorCloseAt:0.05 }; // 建模值

function physics(dt){
  /* 电机输出 → 位置; 门命令 → 门开度 */
  if(V.Motor_Up)   V.pos += dt/PHYS.moveTime;
  if(V.Motor_Down) V.pos -= dt/PHYS.moveTime;
  if(V.Door_Open_Cmd)  V.doorPos = Math.min(1, V.doorPos + dt/PHYS.openTime);
  if(V.Door_Close_Cmd) V.doorPos = Math.max(0, V.doorPos - dt/PHYS.closeTime);
  /* 传感器 ← 物理量阈值 */
  for(let f=1;f<=6;f++) I.Sens_Floor[f] = Math.abs(V.pos-(f-1)) < PHYS.levelBand;
  I.Door_Open_Sensor  = V.doorPos >= PHYS.doorOpenAt;
  I.Door_Closed_Sensor= V.doorPos <= PHYS.doorCloseAt;
}
```

主循环:速度倍率只缩放物理推进,扫描次数按模拟时间折算,保证 TON 与物理同步:

```js
function loop(now){
  const speed = +slider.value;                       // 速度倍率
  const simDt = dtReal * speed;                      // 模拟世界时间
  const scans = Math.max(1, Math.round(simDt/SCAN_DT));
  for(let i=0;i<scans;i++){ physics(SCAN_DT); plcScan(); }
  render();
  requestAnimationFrame(loop);
}
```

## 渲染(简约,信息真实)

- 工艺图(井道/管道/机构)+ 当前状态常驻显示(状态机名用代码 St_* 名)+ 关键数值(楼层/位置/门开度)。
- 指示灯/呼叫按钮状态直接读 DB 锁存。
- 日志:变化瞬间记录,消息带真实网络编号,同消息 8 扫描内去重:

```js
let lastEvMsg='', lastEvScan=-1;
function evOnce(msg, cls){
  if(lastEvMsg===msg && scanCount-lastEvScan<8) return;
  lastEvMsg=msg; lastEvScan=scanCount; addLog(msg, cls);
}
```

- 输入按钮标注真实信号名(如"⛔ 急停 EStop");"场景模拟"按钮(断电重启/超载/门阻)只在程序确有对应逻辑时提供。

## 交互与输入极性

- 常闭输入(EStop)按真实极性:UI 按下急停 = 信号变 0。
- 脉冲按钮(呼叫、复位)在 UI 点击时置 1,几帧后清 0,模拟按钮沿。
- 保持型输入(超载、门受阻)用开关,UI 可切换。
