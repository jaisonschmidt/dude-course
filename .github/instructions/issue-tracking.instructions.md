---
description: "Use when working with GitHub Issues, updating task status, managing subtasks, tracking progress, creating sub-issues, or maintaining issue cards. Applies to all agents that interact with GitHub Issues via MCP."
---

# Issue Tracking Protocol

This instruction defines the standard for how agents must keep GitHub Issue cards updated during execution.

## Core principle

Every agent that interacts with GitHub Issues via MCP must keep the card updated with relevant progress, ensuring full visibility of what has been done and what remains.

---

## Obligations

### 1. On start
Post a comment indicating the agent is acting and what it will do.

### 2. Incremental progress
Update the issue with what has been done and what remains.

### 3. Subtask checklists
Create or update a checklist of subtasks using GitHub markdown task lists (`- [ ]`), marking each item as it is completed.

### 4. Sub-issues
When a task is too large for a single issue:
- Create sub-issues for major components
- Link to parent using "Part of #N" in the sub-issue body
- Reference all sub-issues in the parent issue body

### 5. On completion
Post a final comment with:
- Summary of what was done
- Links to PRs/commits
- Status of all subtasks

---

## Standard status update format

```markdown
## 🤖 [Agent Name] — Status Update

**Status**: 🟡 In progress / ✅ Completed / 🔴 Blocked

### Subtasks
- [x] Completed task
- [ ] Pending task
- [ ] Pending task

### Notes
[Relevant decisions, open questions, blockers, links to PRs]
```

---

## Status icons

| Icon | Meaning |
|------|---------|
| 🟡 | In progress — agent is actively working |
| ✅ | Completed — all subtasks done |
| 🔴 | Blocked — waiting for input or dependency |
| ➖ | Not applicable |

---

## Agent-specific expectations

| Agent | Creates issues? | Updates issues? | Creates sub-issues? |
|-------|----------------|-----------------|---------------------|
| product-owner | ✅ Yes | ✅ Yes | ✅ When task is large |
| architect | ❌ No | ✅ Comments only | ❌ No |
| staff | ❌ No | ✅ Yes (plan + progress) | ✅ When delegating work |
| qa | ❌ No | ✅ Test results | ❌ No |
| reviewer | ❌ No | ✅ Review results | ❌ No |
| documenter | ❌ No | ✅ Doc update summary | ❌ No |

---

## Subtask checklist template (for Product Owner)

When creating an issue, include a standard subtask checklist:

```markdown
## Subtasks
- [ ] 🏗️ Architectural analysis (@architect)
- [ ] 🛠️ Implementation plan (@staff)
- [ ] 💻 Backend implementation (@backend-dev)
- [ ] 🎨 Frontend implementation (@frontend-dev)
- [ ] 🧪 Testing strategy (@test-advisor)
- [ ] ✅ QA validation (@qa)
- [ ] 📊 Metrics recommendation (@metrifier)
- [ ] 🔍 Code review (@reviewer)
- [ ] 📝 Documentation update (@documenter)
```

Not all subtasks apply to every issue. The Product Owner should include only relevant ones.
