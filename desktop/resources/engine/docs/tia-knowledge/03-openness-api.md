# 03 · TIA Openness .NET API

Openness is the **.NET API** on top of TIA Portal (core assembly `Siemens.Engineering.dll`) that lets external programs automate TIA: open/create projects, read/write devices and blocks, import/export, compile and download. The primary sources are the Siemens **TIA Portal Openness system manual** (Entry-ID 109773802 = V16, 109826886 = V19, etc.) and the **V21 Openness Readme** (`docs.tia.siemens.cloud/r/en-us/v21/readme-tia-portal-openness/...`).

## Security gates (must be satisfied before use)

- **Windows user group `Siemens TIA Openness`**: created automatically during TIA installation; the process **must be a member of this group** to attach to TIA Portal.
- **Per-application firewall whitelist**: the first connection prompts "Allow once / Do not allow / Always allow". The whitelist keys on the **SHA-256 hash of the application executable** (stored Base64 in the registry). Changing the executable's hash or LastModified triggers the prompt again. The manual's sample code pins the hash algorithm with `SHA256.Create()`.

## Assembly resolution (how the .exe finds the DLL)

DLL location: `C:\Program Files\Siemens\Automation\Portal Vxx\PublicAPI\Vxx\Siemens.Engineering.dll`.
**From V21 on**, this path gains a `net48` subdirectory: `...\Portal V21\PublicAPI\V21\net48\`.

Three resolution methods (per the manual):
1. **app.config** (`<codeBase>` element; recommended for most scenarios) — only this method performs strong-name validation.
2. **`AssemblyResolve` handler** (recommended for copy-deploy scenarios) — no strong-name validation.
3. Copy `Siemens.Engineering.dll` directly into the application directory.

**Strong-name element**: `PublicKeyToken`.
- **V16–V20**: `d29ec89bac048f84` (Openness).
- **V21 changed it**: the new token is **`29bfe5fdf4ba5d3b`** (unified for Openness and Add-Ins); the old Add-Ins token was `65b871d8372d6a8f`. **An old app.config referencing the old token will fail to bind to V21 assemblies.**

## Object model

Connect/start → project → device → software → block:

```
TiaPortal (attach to a running instance or start a new one)
  └─ Project
       └─ Device
            └─ DeviceItem
                 └─ SoftwareContainer  →  PlcSoftware
                                              └─ BlockGroup
                                                   └─ PlcBlock (OB/FB/FC/DB)
```

(The object-model path follows common community/manual convention; core nodes appear in the manual's examples. A few intermediate container names differ slightly by version, so consult the target version's API reference when coding.)

## Per version: `Siemens.Engineering.dll` and .NET target

| TIA version | .NET target | Notes |
|---|---|---|
| V16 | .NET Framework **4.6.x** | Manual build requirement cites SDK 4.6.2; migration notes also mention 4.6.1 |
| **V21** | **.NET Framework 4.8** | V21 Readme: "only supports Microsoft .NET Framework 4.8" |

> Before compiling against a specific TIA version, check that version's own Requirements page for its exact .NET target.

When a per-version 4-part `AssemblyVersion` (e.g. `16.0.0.0`) is needed, read it from the actual assembly rather than hardcoding one.

## V21 major structural changes (hard incompatibility)

The V21 Readme documents three changes:
1. **Monolithic DLL split**: the single large class library used through V20 is split into **multiple modular domain assemblies**.
2. **Path migration**: from `...\Portal V20\PublicAPI\V20\` to `...\Portal V21\PublicAPI\V21\net48\`.
3. **Hard incompatibility (must recompile)**: applications/Add-Ins targeting V21 **must be rebuilt for V21**, otherwise they will not run from V21 on; conversely, an application built for V21+ will not run against any earlier version.

> Meaning for PLC Engineering Suite: to support V21, the bridge cannot reuse V20's assembly references and app.config — the token, the path, and the assembly split all change. When building the V21 bridge, identify the specific domain assembly that provides block import/export.

## Sources

- V16 Openness manual (109773802): `cache.industry.siemens.com/dl/files/802/109773802/att_1007204/v1/TIAPortalOpenness_en-US.pdf`
- V19 Openness manual (109826886): `cache.industry.siemens.com/dl/files/886/109826886/att_1163875/v1/TIAPortalOpenness_enUS_en-US.pdf`
- V21 Openness Readme: `docs.tia.siemens.cloud/r/en-us/v21/readme-tia-portal-openness/major-changes-for-long-term-stability-in-tia-portal-openness-v21`

## HMI Openness

The HMI-author Openness object model (WinCC Unified's `HmiSoftware.*.Create(name)`, per-version assembly resolution, alarm/data-logging property names, Classic being XML-only) is covered separately → see [16. HMI Openness](16-hmi-openness.md). Key point: Unified types live in the main assembly for V16–V19 and in `Siemens.Engineering.WinCCUnified.dll` for V21, **not** in `Siemens.Engineering.Hmi` (that is Classic).
