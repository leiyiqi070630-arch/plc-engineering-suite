# 15 · PID Control, Motion Control, High-Speed I/O (Technology Objects, TO)

All of these rely on **technology objects (TO)** configured in the project tree, plus instance/technology DBs. Sources: official PID function manual **108210036**, S7-1200 motion control function manual **109973965**, docs.tia.siemens.cloud, Siemens official GitHub. Code examples are **reconstructed** (parameter names taken from the manuals).

## PID

**PID_Compact** (standard general-purpose PIDT1 controller). (Manual 108210036, V2 parameter table p.254-255)
- Inputs: `Setpoint` (Real), `Input` (Real, scaled process value) **or** `Input_PER`, `ManualEnable` (Bool), `ManualValue` (Real, manual output), `ErrorAck` (Bool, rising edge clears error), `Reset` (Bool, restarts the controller), `ModeActivate` (Bool, rising edge switches to Mode), `Mode` (Int)
- Outputs: `ScaledInput` (Real), `Output` (Real), `Output_PER`, `Output_PWM` (Bool), `SetpointLimit_H/L`, `InputWarning_H/L`, `State` (Int), `Error` (Bool), `ErrorBits` (DWord)
- > ⚠️ **Correction**: `Input_PER`/`Output_PER` in **PID_Compact V2 (current V14+/V19-V21) are `INT`**; **`WORD` was only the older V1**. The generator, targeting current TIA, must emit INT.
- **`State` values**: 0 Inactive, 1 Pretuning, 2 Fine tuning, 3 Automatic, 4 Manual, 5 Substitute output value with error monitoring.
- > ⚠️ **PID_Compact must be called in a cyclic interrupt OB** (constant sampling period; sampling period = interrupt interval), e.g. OB30.
- Tuning: pretuning → fine tuning (self-tuning).

**Siblings**: `PID_3Step` (three-step / motorized valve), `PID_Temp` (temperature; supports heating-only or heating/cooling, with `Output_Heat`/`Output_Cool`). Legacy: `CONT_C`/`TCONT_C` (S7-300/400).

```scl
// Must be in a cyclic interrupt OB (e.g. OB30):
"PID_Compact_DB"(Setpoint := sp, Input := pv,        // or Input_PER := rawAnalogInt
                 ManualEnable := FALSE, ManualValue := 0.0, Reset := FALSE,
                 ModeActivate := modeTrig, Mode := 3,   // 3 = automatic
                 Output => y, State => pidState, Error => pidErr, ErrorBits => pidErrBits);
```

## Motion Control (axis TO + PLCopen MC blocks)

**Axis technology object types**: `TO_PositioningAxis`, `TO_SpeedAxis` (also `TO_CommandTable`, `TO_External_Encoder`; S7-1500 adds `TO_SynchronousAxis`). (Official GitHub uses `"TO_SpeedAxis"`/`"TO_PositioningAxis"` + Version(6,0))

> ⚠️ **Correction**: the **`Axis` input type of the MC instructions in the current manual is `TO_Axis` (generic)**, **not the old names `TO_Axis_1` / `TO_Axis_PTO`** (those were interface names in older TIA; zero hits in the current manual).

Each MC block needs its own instance DB and shares `Axis` (TO reference), `Execute` (or `Enable`), `Done`/`Busy`/`CommandAborted`/`Error`/`ErrorID` (Word)/`ErrorInfo` (Word). (Manual 109973965)

| Block | Key parameters |
|---|---|
| **MC_Power** | `Enable`, `StartMode` (Int: 0 non-position-controlled / 1 position-controlled), `StopMode`, `Status`; Enable=FALSE aborts all tasks on the axis |
| **MC_Home** | `Position`, `Mode` (**0 direct absolute / 1 direct relative / 2 passive / 3 active**); `Done` |
| **MC_MoveAbsolute** | `Position` (Real, -1e12..1e12), `Velocity`, `Done` (in position) |
| **MC_MoveRelative** | `Distance`, `Velocity`, `Done` |
| **MC_MoveVelocity** | `Velocity` (Real, default 10.0, 0.0 allowed), `Direction` (Int), `Current`, `InVelocity` |
| **MC_MoveJog** | `JogForward`/`JogBackward` (Bool, moves while held), `Velocity` (sign ignored), `InVelocity` |
| **MC_Halt** | `Execute`, `Done` (stopped to standstill) |
| **MC_Reset** | Acknowledge/clear axis TO errors to allow re-enable |
| **MC_ChangeDynamic** | Change accel/decel / emergency-stop ramp / jerk |

S7-1200 axes drive PTO; S7-1500 requires MC-Servo/MC-PreServo OB.

```scl
"MC_Power_DB"(Axis := "AxisName", Enable := TRUE, StartMode := 1, StopMode := 0,
              Status => statusBit, Busy => busyBit, Error => errBit, ErrorID => errId);
"MC_Home_DB"(Axis := "AxisName", Execute := homeReq, Position := 0.0, Mode := 3,   // 3 = active homing
             Done => homed);
"MC_MoveAbsolute_DB"(Axis := "AxisName", Execute := go, Position := 250.0, Velocity := 100.0,
                     Done => atTarget);
```

**Creating an axis TO via Openness** (verified 2026-07-14 on real V20: reflected the real dll + end-to-end creation of TO_SpeedAxis; bridge commands `create-technology-object`/`list-technology-object-types`, reflection script `tools/tia-verify/reflect_technology_object_types.ps1`):
```csharp
// Real signature (confirmed by reflecting Siemens.Engineering.dll V20):
//   TechnologicalInstanceDBComposition.Create(string name, string ofSystemLibElement, System.Version ofSystemLibVersion) -> TechnologicalInstanceDB
//   also CreateFrom(MasterCopy[,MasterCopyMode]) and Import(FileInfo, ImportOptions)
var to = plcSoftware.TechnologicalObjectGroup.TechnologicalObjects
            .Create("Axis1", "TO_SpeedAxis", new Version(9, 0));   // or "TO_PositioningAxis" / "PID_Compact"
to.Parameters.Find("PositionLimits_HW.Active").Value = true;      // TechnologicalParameter.Value: object [rw]
```
> ⚠️ **The version number (new Version) varies with TIA version and with each TO type; read it at runtime, do not copy constants blindly**: the old GitHub `Version(6,0)` is wrong on **V20**. On real V20: all motion types are **9.0** (TO_SpeedAxis/PositioningAxis/SynchronousAxis/Cam/Kinematics…), `PID_Compact` **3.0**, `PID_3Step` **2.3**, `PID_Temp` **1.1**. Use `list-technology-object-types` to read an existing TO's `OfSystemLibVersion` (no enumeration API). `TechnologicalInstanceDB.OfSystemLibVersion` is writable but `OfSystemLibElement` is read-only.
> ⚠️ **PID_Compact is a TO** (not an ordinary instruction) and goes through the same Create; **self-tuning is online-only** (offline you only create it and set parameters). When a newly created axis TO has no drive telegram (drive telegram address) connected, compilation reports "input/output address not set" — that is hardware-connection/parameter work (phase 2), not an error in creating the TO.
The SimaticML export of an axis TO has `AdditionalData` (namespace `.../SW/Motion/Axis/v1`); `<Connection Interface="...">` enumerates `Actor`/`Sensor`/`Sensor[1..4]`/`Torque`/`OutputCam`/`MeasuringInput`. (Local XSD)

## High-Speed I/O (HSC / PWM; no MC blocks needed, but the pulse generator/counter must be enabled in the device configuration)

- **CTRL_HSC**: `HSC` (HW_HSC id), `DIR`/`CV`/`RV`/`PERIOD` (Bool, enable "apply new value"), `NEW_DIR`/`NEW_CV`/`NEW_RV`/`NEW_PERIOD`, `BUSY`, `STATUS`; **the current count value is not in the block parameters — read it from the PII address assigned in the device configuration**. Newer variant `CTRL_HSC_EXT`.
- **CTRL_PWM**: `PWM` (HW_PWM id), `ENABLE` (Bool), `BUSY`, `STATUS`; PWM has fixed frequency and variable duty cycle, the pulse width is written to the configured Q-word address; motion control uses **PTO, not PWM**.

```scl
"CTRL_PWM_DB"(PWM := "Local~Pulse_1", ENABLE := TRUE, BUSY => , STATUS => );
"CTRL_HSC_DB"(HSC := "Local~HSC_1", DIR := FALSE, CV := TRUE, NEW_CV := 0, BUSY => , STATUS => );
myCount := "Tag_HSC1_Count";   // current count read from PII
```

## Sources

- PID function manual 108210036: `support.industry.siemens.com/cs/attachments/108210036/s71500_pid_control_function_manual_en-US_en-US.pdf`
- S7-1200 motion control function manual 109973965 (A5E03790551-AH, 2024-08)
- Official GitHub: `source-cache/siemens_tia-portal-openness-code-snippets/.../TechnologyObjectSnippets.cs`
- Local XSD: `source-cache/Parozzz_TiaUtilities/.../SW.TechnologicalObjects_AdditionalDataAxis_v1.xsd`
