# 10 · Hardware configuration and commissioning

## Device view and hardware configuration

- The device configuration editor has `Device view` / `Network view` (/`Topology view`). Add a CPU by order number via `Add new device`, then drag modules from the hardware catalog onto the rack slots. (Basic flow, consistent with the device/network editor in [09](09-tia-software-operation.md).)
- **Module I/Q start address**: set under `Start address` in the module's `Properties > General > I/O addresses`. The `Start address` field name is documented in the TIA Openness manual.

## CPU IP / network

- Select the CPU's **PROFINET port** (or the `PROFINET interface` in the CPU's `General` properties) → in the Inspector choose **`Ethernet addresses`** → the `IP protocol` section displays/sets the default IP.
- `Add new subnet` and `Set IP address in the project` are both available here.

## Online IP / device-name assignment (commissioning)

- Use the **`Accessible devices`** dialog, selecting the IO device by MAC:
  - Click **`Assign Name`** to download the configured device name to the IO device.
  - Online IP assignment is also done from the `Accessible devices` dialog.
- Online IP/name assignment can also be reached by right-clicking the IO device → `Online & diagnostics` → `Functions` → `Assign IP address` / `Assign name`.

## Diagnostics and operating modes

- **Diagnostics buffer**: every CPU has one, read via online diagnostics. Menu path: `Online & diagnostics > Diagnostics > Diagnostics buffer`.
- **Operating modes**: the operator panel in the `Online tools` task card displays/changes RUN/STOP plus `MRES`; yellow = STOP, green = RUN. The S7-1200 has no physical switch (see [09](09-tia-software-operation.md)).

## Forcing peripheral I/O

- The force table can only force peripheral (physical) I/O; addresses show `:P` (e.g. `On:P`).
- Button **`Show/hide force columns`** (note: the label is `Show/hide force columns`, not `Show/hide all force columns`); commands `Force to 1`, `Start or replace forcing`, `Stop forcing`.
- Forced values are stored in the CPU and persist until explicitly cleared (see the force table in [09](09-tia-software-operation.md)).

## PLCSIM (simulation)

PLCSIM can simulate one CPU (download and debug without real hardware).

### Simulable CPU families and firmware (official)

Which CPUs S7-PLCSIM can simulate is decided by the STEP 7 license. Quoted from the
S7-PLCSIM online help, `2.5 Supported hardware > 2.5.1 Hardware and firmware support`:

> With a STEP 7 Basic license, you can simulate the following CPU families in S7-PLCSIM:
> • S7-1200 with firmware version 4.0 through version 4.5
> • S7-1200F with firmware version 4.1 through version 4.5
> If your project contains CPUs with older firmware versions, the "Start simulation"
> button in the TIA Portal is not selectable and you cannot start a simulation.

With a STEP 7 Professional license the same S7-1200 range applies, plus S7-1500 /
S7-1500F / ET 200SP / ET 200SPF up to firmware 2.9, S7-1504D TF / S7-1507D TF 2.9,
and S7-1500R/H 2.9 (RUN Solo). The help also states: "S7-PLCSIM cannot simulate CPUs
with a newer firmware version than the highest supported version at the time of the
S7-PLCSIM release."

- Sources: *S7-PLCSIM V17 online help*, A5E46238743-AB, 05/2021, p. 11; *S7-PLCSIM V17
  Readme*, A5E46238799-AA, p. 2; *S7-PLCSIM V16 online help*, A5E46238743-AA, p. 11
  (same V4.0 floor, upper bound 4.4).
- **The V4.0 floor for S7-1200 is constant across releases; only the upper bound moves.**
  The V19/V20 readmes no longer print the table, so treat the upper bound as unknown for
  V18 and later rather than assuming 4.5.
- **S7-PLCSIM Advanced is a different product** and does not simulate traditional S7-1200
  at all (S7-1500 family, ET 200SP CPU, S7-1500 software controller, and S7-1200 G2).

### S7-1200 firmware is bound to the article generation

An S7-1200 article number carries exactly one firmware generation, so a pre-V4 CPU
cannot be raised to V4 in the device properties — it needs "Change device":

| Article pattern | Firmware |
|---|---|
| `6ES721x-1xx30-0XB0` | V2.2 and earlier |
| `6ES721x-1xx31-0XB0` | V3.0 |
| `6ES721x-1xx40-0XB0` | V4.0 and later |

- Source: Siemens FAQ **92047260**, *SIMATIC S7-1200 CPU firmware overview*, V1.1, 04/2015
  (section titles "CPU firmware V2.2 and earlier features matrix (6ES721x-1xx30-0XB0)",
  "CPU firmware V3.0 features matrix (6ES721x-1xx31-0XB0)",
  "CPU firmware >V4.0 features matrix (6ES721x-1xx40-0XB0)").
- Confirmed against the real TIA V18 hardware catalog (2026-07-29): "CPU 1212C AC/DC/Rly"
  appears as three articles — `6ES7 212-1BD30-0XB0` (V2.0-V2.2),
  `6ES7 212-1BE31-0XB0` (**V3.0 only**), `6ES7 212-1BE40-0XB0` (V4.0-V4.6).

Real-machine consequence, evidence, and the exact product wording live in
`docs/tia-v18-standard-plcsim-e2e.md` and `docs/plc-rules/s7-plcsim-family-routing.md`.

## Sources

- S7-PLCSIM V17 online help A5E46238743-AB / V17 Readme A5E46238799-AA / V16 online help
  A5E46238743-AA (simulable CPU families and firmware ranges)
- S7-1200 CPU firmware overview FAQ 92047260 (article generation ↔ firmware major)
- S7-1200 Getting Started A5E02486791-01 (primary source for Ethernet/IP/force pages)
- I-Device configuration example 109478798: `cache.industry.siemens.com/dl/files/798/109478798/att_992843/v1/109478798_config_idevice_standard_DOCU_V20_en.pdf` (primary source for `Accessible devices` / `Assign Name`)
- Diagnostics overview 109752283 (diagnostics buffer concept)
- Easy Book A5E02486774-AG (operating modes / force, see ch. 09)

## Config-author-chain verification bench

`tools/tia-verify/zutai_smoke.py` (+ `zutai_chains.json`) is the real-Portal verification bench for the hardware/HMI author chains. Confirm the hardware-config author-method shapes (`Devices.CreateWithItem` / `CanPlugNew`/`PlugNew` / `Subnets.Create` / `CreateIoSystem` / `Address.StartAddress` write) with a clean `zutai_smoke --tia` compile. GSD/GSDML has no Openness programmatic install API (confirmed missing on V18 and the in-repo V21 split); distributed / third-party devices must have their GSD installed manually in TIA first (`Options > Manage general station description files (GSD)`) before they appear in the catalog.
