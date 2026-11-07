# DeepSeek Harness subagent adaptation

Source: https://github.com/deepseek-ai/deepseek-harness
Pinned revision: 687f282e8625c6b8d11ff58211a90524be2e4317
License: MIT (included in LICENSE). Copyright (c) 2026 DeepSeek.

The Rust manager in rust/crates/tools/src/agent_tools/dsh.rs adapts the manager, activation pool, continuable-child lifecycle, adjacent-agent message delivery and completed-turn fork contracts from packages/subagent/subagent, subagent-spawn-in-process, subagent-fork-in-process, tool-subagent and tool-subagent-control. Tool descriptions and child return guidance are derived from those sources. PLCCode-specific task scope and integration guidance accompany the upstream semantics in dsh/*.txt. The provider and native PLC tool adapters remain PLCCode's own Rust implementations. This is a port, not a bundled Node/Cordis runtime. Existing Agent*/Workflow dispatch is retained for old transcripts and saved integrations but excluded from new model-facing catalogs and ToolSearch. Model delegation and /parallel use the DSH manager.
