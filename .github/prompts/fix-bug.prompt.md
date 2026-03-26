---
description: "Start the bug fix flow: the Staff orchestrator investigates, plans the fix, delegates implementation, and opens a PR."
agent: "staff"
argument-hint: "Issue number of the bug (e.g., #42 or 42)"
---

Fix the bug described in the specified GitHub Issue:

1. Fetch the issue and understand the bug report (steps to reproduce, expected vs actual)
2. Read relevant documentation and existing code
3. Investigate root cause — use logs, tests, and code analysis
4. Plan the minimal fix (smallest change possible)
5. Consult test-advisor for regression test strategy
6. Delegate fix implementation to backend-dev and/or frontend-dev
7. Ensure a regression test is added
8. Validate the fix and run full test suite
9. Open a PR via MCP referencing the bug issue
10. Post status update on the issue

Follow the bug fix flow from `docs/agent-task-flow.md`:
- Minimize change scope
- Add regression test
- Verify no architectural violations
