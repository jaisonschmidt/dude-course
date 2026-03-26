---
description: "Trigger the Staff orchestrator to plan and execute the implementation of a GitHub Issue, delegating to backend/frontend sub-agents."
agent: "staff"
argument-hint: "Issue number (e.g., #42 or 42)"
---

Plan and execute the implementation for the specified GitHub Issue:

1. Fetch the issue and read all context (PO task, Architect analysis)
2. Read all mandatory project documentation
3. Plan implementation at code level (files to create/modify, order)
4. Document the plan on the issue as a comment via MCP
5. Consult test-advisor for testing strategy
6. Delegate to backend-dev and/or frontend-dev sub-agents
7. Validate results and run tests
8. Consult metrifier for observability recommendations
9. Create a feature branch and open a PR via MCP
10. Post final status update on the issue

Follow the staff agent workflow strictly.
