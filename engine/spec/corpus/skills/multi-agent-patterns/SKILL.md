---
name: multi-agent-patterns
description: Delegate focused independent work to continuable subagents.
---

Use `subagent` for self-contained tasks; its prompt must include the needed inputs and scope. Use `subagent_fork` when completed conversation context is needed. It excludes the current in-flight turn, so state new facts explicitly. Both return immediately with `subagentId`.

Children inherit the parent's current model, available tools and permission ceiling. No role selection or output schema is required. Give each worker a bounded deliverable and avoid conflicting edits. Continue useful work while children run; do not invent additional reviews or research tasks to fill lanes.

Use `send_message(agent_id, message)` to guide a working child at its next step or continue the same idle child's conversation. The return is delivery confirmation, not its answer. Children may message their parent. Use `interrupt_agent(agent_id)` to request a stop without waiting; its conversation remains resumable. Descendant agents continue independently.

Results and settlement messages arrive automatically. Read and integrate their actual contents; do not repeatedly query status or read output files merely to fetch a normal final answer. `list_agents` is for a concrete status question, not a polling loop. Idle/finished means the turn ended; it does not verify the deliverable. Report failed, interrupted, partial or unverified work accurately.
