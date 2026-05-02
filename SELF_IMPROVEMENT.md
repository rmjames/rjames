# Agent Self-Improvement Loop

To ensure continuous improvement and avoid repeating mistakes, all agents must follow this self-improvement loop when working on tasks.

## 1. Planning and Task Breakdown (`scratchpad.md`)
When given a new task, break it down before taking action.
- Use a `scratchpad.md` file in the project root to plan your work. If it does not exist, create it.
- **Clear or overwrite** previous contents of `scratchpad.md` at the start of a new task so you have a clean workspace.
- Create a clear to-do list of the steps required to complete the task.
- Use this scratchpad as your active workspace to track progress, note intermediate thoughts, and adjust your plan as needed.

## 2. Referencing Past Knowledge (`knowledge.md`)
Before starting execution on a prompt:
- Always read `knowledge.md` in the project root. If it does not exist, create it.
- Apply any relevant past learnings, rules, or insights to the current task to ensure previous mistakes are not repeated.

## 3. Transferring Knowledge (`knowledge.md`)
Once a task is completed and verified to work correctly, you must transfer any new, generalized, or project-specific working knowledge into `knowledge.md` in the project root.

- **Append** your new learnings to the bottom of the file (do not overwrite the entire file).
- **Check for redundancy**: Before adding a new entry, quickly scan `knowledge.md` to ensure a similar learning doesn't already exist. Only add genuinely new insights.

Use the following strict format for all entries in `knowledge.md`:

```markdown
## [YYYY-MM-DD] - [Task Title]
- **Context**: Brief context of the task and what was being attempted.
- **Learning**: What worked, what failed, or specific knowledge gained about the codebase, environment, or tools.
- **Action**: How to apply this specifically to future tasks.
```

By following this loop, you ensure that the system's collective intelligence grows with every completed task.
