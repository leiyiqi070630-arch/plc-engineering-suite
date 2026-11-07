---
name: windows-computer-use
description: "Use when PLCCode needs to inspect or operate Windows desktop engineering applications. Read screenshots and UI Automation elements, target a specific app window, invoke controls, enter values, and read compilation/simulation results when existing PLC integrations do not cover the task."
---

# Windows Computer Use

Use this skill when the task requires a Windows graphical user interface and a structured integration, CLI command, file inspection, or browser-specific tool is not enough.

Prefer a structured app plugin or API when one exists. Use Windows Computer Use for scoped visual workflows, native desktop apps, settings dialogs, installers, legacy apps, and bugs that only reproduce in the GUI.

## Workflow

1. Start with `windows_computer_use_health` if this is the first desktop action in the thread.
2. Observe before acting:
   - Use `windows_computer_use_snapshot` when visual layout matters.
   - Use `windows_computer_use_accessibility_tree` when names, roles, values, and element ids matter.
   - Use `windows_computer_use_find` to narrow large trees.
3. Start with the default tree options: `viewMode="control"`, `includeOffscreen=false`, and `detailLevel="compact"`. Use `content` for reading visible content. Use `raw` and `includeOffscreen=true` only when a control is missing or the app has a custom/sparse provider.
4. When focus may move or multiple windows are open, call `windows_computer_use_list_windows` and pass `nativeWindowHandle`, `processId`, or `windowTitle` to subsequent tools. Use `activate=true` when the target window must be foregrounded.
5. Prefer element actions over raw coordinates:
   - Use `windows_computer_use_invoke` for buttons, menu items, checkboxes, radio buttons, list items, and expanders.
   - Use `windows_computer_use_set_value` for editable controls.
   - Use `windows_computer_use_focus` before keyboard-only flows.
6. Choose the reliable input method for the observed interface: element actions, screenshot-based coordinates, dragging, or keyboard shortcuts. Use visual coordinates for canvases, custom controls, sparse accessibility trees, or when they are the simpler route. Derive coordinates from the current screenshot; do not hard-code desktop positions or reuse stale observations.
7. Re-observe after each click, invocation, typing action, drag, navigation, dialog open, or state-changing keypress.

## Safety

Keep the task narrow and stay inside the user-approved app or window. Ask before account, security, privacy, payment, credential, destructive, irreversible, or cross-account actions. Stop if the active window is not the intended target.

Do not automate Codex itself, terminal approval prompts, system security prompts, administrator authentication, or any action that would bypass Codex approvals.

## Tool Notes

Element ids look like `uia:active.0.2` or `uia:root.4.1`. They are path ids from the latest accessibility snapshot. If an element id becomes stale, take a new tree and select the new id. When working across windows, use nativeWindowHandle, processId, or windowTitle to keep the intended target explicit. Prefer nativeWindowHandle for repeatable targeting.

Element ids are relative to the tree view that produced them. If you observed with `viewMode="raw"` or `includeOffscreen=true`, pass the same values when resolving that id in `element_info`, `move`, `click`, `focus`, `invoke`, or `set_value`.

When a target window is supplied, `uia:active` resolves against that target for the current call. Prefer `nativeWindowHandle` from `windows_computer_use_list_windows` for repeatable app testing.

Positive `deltaY` in `windows_computer_use_scroll` scrolls down. Text input uses native Unicode keyboard input and leaves the clipboard unchanged. `keypress` accepts one key or one chord (including Win), not a sequence of characters; use `type_text` for text. When targeting a window for keyboard input, use `activate=true` if it is not already foreground.

Verify each result with the next screenshot or `element_info`/tree value. These tools read ValuePattern, TextPattern and standard Win32 Edit text. Do not use another process's GetWindowText to verify Edit text; Windows does not support that. A successful input call alone is not proof that the intended text was entered.

For top-level app discovery use `list_windows`. Search inside the selected HWND with `find`; a desktop-wide find may return `truncated=true` at its traversal budget. That means incomplete search, not proof the control is absent. Start/Search popups may appear in a snapshot even when list_windows omits them. Launch test apps in a way that keeps their process alive after the launching shell exits, and close only the test-owned process.

Use `windows_computer_use_list_windows` when the wrong app is active or when you need to understand which top-level windows are visible.

## Useful References

Use the `windows-computer-use://wiki/mcp-tools` and `windows-computer-use://wiki/app-technology-matrix` MCP resources for detailed reference. PLCCode displays a blue/violet screen border during Computer Use; it is an activity indicator, not part of the target application. Prefer an existing native PLCCode tool when it already completes the task. Do not start a new project, change communication parameters, connect real hardware, or download to a PLC/HMI unless the user's task calls for it.
