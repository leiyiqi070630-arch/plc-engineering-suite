# 09 · TIA Portal Software Operation (Engineering Workflow)

What an engineer clicks inside TIA Portal. Sources: **STEP 7 Basic Getting Started** (`GS_STEP7Bas105enUS.pdf`, A5E02651459-01), **S7-1200 Easy Book** (A5E02486774-AG), **docs.tia.siemens.cloud V20/V21**. The workflow is stable across V15→V21; the exact UI wording may vary slightly between versions.

## Two Views

- **Portal view** (task-oriented, with the Start / Devices & Networks / PLC programming / Online & Diagnostics portals) and **Project view** (object-oriented). The link in the bottom-left corner switches between them at any time, and TIA also switches automatically per task.
- Project view layout: menu bar, toolbar, **project tree** (left), work area, **Task cards** (right), Details view, **Inspector window** (bottom), and the Portal view link. `Ctrl+1`–`5` toggle the individual windows.

## Project Tree — PLC Node

`Device configuration`, `Online & diagnostics`, `Program blocks` (including the auto-generated `Main [OB1]`), `Technology objects`, `PLC tags`, `PLC data types`, and `Watch and force tables`; the project root also has `Online access`.

## Create Project + Add Device

- Create/open a project from the Start portal in Portal view; a save always saves the entire project.
- Add a CPU: Portal view → `Devices & Networks` portal → `Add new device` → (click `SIMATIC PLC`) → select the CPU by **article number** plus firmware version → check `Open device view` → `Add` (opens Device configuration in Project view).
- Alternatively, double-click `Add new device` in the Project view project tree.
- Devices & Networks editor: switch between the `Device view` / `Network view` tabs; drag hardware from the `Hardware catalog` task card on the right into the graphic area.

## Write Program Blocks

- Expand `Program blocks` and double-click a block (e.g. `Main [OB1]`) to open it in the program editor; the editor has a toolbar, the block interface (local variable declarations), Favorites, the instruction window (networks), and the `Instructions`/`Testing` task cards.
- Programs are organized into **networks**, up to **999 networks** per block; `Main [OB1]` is created with one network.
- Each PLC has an auto-generated **PLC tag table**; the Tags tab columns are Name / Data type / Address / Retentivity / **Monitor value** (shown only online and when Monitoring is selected) / Comment. All editors share it.

## Compile

Blocks are **compiled during download**. Compile scope (V20 official page, 6 items):
- `Hardware and software (only changes)`
- `Hardware (only changes)` / `Hardware (rebuild completely)`
- `Software (only changes)` / **`Software (rebuild all)`** / `Software (reset memory reserve)`

> ⚠️ A full software compile is **`Software (rebuild all)`**, **not "Software (rebuild all blocks)"** (the latter is legacy/community wording).
> **Hardware compile** covers device configuration/network connections; **software compile** covers program blocks (and HMI screens).

Compile errors appear in the Inspector window under `Info > Compile`.

## Download

Three entry points: right-click the project tree → `Download` (more precisely `Download to device > Software`), the `Online` menu → `Download to device`, and the toolbar `Download to device` icon.
- The `Show all accessible devices` checkbox lists `Accessible devices in target subnet` for selecting the target CPU.
- Download sequence: if the PLC is in RUN, prompt to set `STOP` → `Download preview`/`Load preview` dialog (check to accept differences) → click `Load` (keep `Continue` checked) → `Download results` dialog → start modules → activate the online connection.

## Online + Monitor + Debug

- **Go online**: select the CPU and click the toolbar `Go online` (on the first time, choose the PG/PC interface); once online the work area **title turns orange**, the project tree shows the offline/online comparison, and a **green circle = synchronized**.
- **Monitor**: toolbar `Monitor all` or the editor's `Monitoring on/off`; in LAD/FBD an energized rung shows green; up to 50 tags can be monitored. The right-click `Modify value`, `Modify to 1`, and `Modify to 0` commands are available.
- **Watch table**: monitor/modify I, Q, I:P, M, DB; create one with `Add new watch table`; modify options are `Modify now` (one scan cycle), `Modify with trigger`, and `Enable peripheral outputs` (turns on peripheral outputs in STOP, used to test wiring).
- **Force table**: can only force **peripheral** I/O; addresses automatically get `:P` appended; enter a `Force value` and check the `Force` column → `Start or replace forcing` / `Stop forcing`; **the force values live in the CPU (not in the table) and persist after STEP 7 is closed, until explicitly cleared**.
- **Online & diagnostics / Online tools**: the operator panel shows/changes the CPU mode (STOP/RUN) plus the `MRES` reset; the RUN/STOP indicator is **yellow = STOP, green = RUN**; toolbar `Start CPU`/`Stop CPU` (**the S7-1200 has no physical mode switch**).
- **Settings**: `Options` menu → `Settings` (interface/language/save directory).

## New in V21 STEP 7 (does not affect the core workflow)

SD export extended to FBD/SCL/mixed languages (version control), the "Keep actual values" DB download option on S7-1500 FW V4.1, Named Value data type enhancements, and improved code/interface search filtering. (Official V21 What's New page)

## Sources

- Getting Started: `cache.industry.siemens.com/dl/files/542/40263542/att_829827/v1/GS_STEP7Bas105enUS.pdf`
- Easy Book: `cache.industry.siemens.com/dl/files/145/39710145/att_5787/v1/s71200_easy_book_en-US_en-US.pdf`
- V20 compile-scope page: `docs.tia.siemens.cloud/r/en-us/v20/editing-project-data/compiling-and-loading-project-data/...`
- V21 What's New: `docs.tia.siemens.cloud/r/en-us/v21/what-s-new-in-tia-portal/what-s-new-in-v21/simatic-step-7`
