# Windows Computer Use in PLCCode

Source: https://github.com/cgissing/windows-computer-use

Pinned revision: `cd2681fa0446655215a907fe7cc41dc027e09df7` (v0.1.2).

The MCP server, Windows UI Automation backend and wiki are derived from that
revision, under the included MIT license. No npm packages or Python runtime are
required. PLCCode launches the bundled Electron runtime in Node mode, on demand.

PLCCode exposes the upstream element, screenshot, coordinate, keyboard and drag
tools together, so the agent can select the appropriate method for each UI.
The desktop app owns the blue/violet screen indicator and its lifecycle.
Screenshots are encoded in memory rather than accumulating temporary PNG files.
