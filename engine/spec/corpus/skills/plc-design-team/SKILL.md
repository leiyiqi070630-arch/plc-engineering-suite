---
name: plc-design-team
description: Obtain focused engineering perspectives for a PLC design when the task needs them.
---

Start from the user's actual design task and project inputs. Use independent subagents only where they can resolve distinct design questions faster. Do not impose a fixed panel size, three rounds, named persona profiles, or mandatory StructuredOutput. A small request may need no delegation.

Use `subagent` with a complete scoped task, or `subagent_fork` to share completed conversation context. Give each child the relevant specification, concrete deliverable and known limitations. Children inherit the parent model, tools and permission ceiling. Use `send_message` for corrections or continuation of the same child and `interrupt_agent` to stop unnecessary work. Results arrive automatically.

Integrate disagreements against actual requirements and evidence. A review is not a native compiler or simulation result. Preserve any uncertainty and run only the verification needed for the requested deliverable. Do not broaden the task into unrelated research or require the user to choose between completing already-authorized next steps.
