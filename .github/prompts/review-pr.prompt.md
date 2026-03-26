---
description: "Trigger the Reviewer agent to perform a structured code review on a Pull Request."
agent: "reviewer"
argument-hint: "PR number (e.g., #15)"
---

Perform a comprehensive code review for the specified Pull Request:

1. Fetch the PR and its linked issue via MCP
2. Read all mandatory documentation (architecture, API spec, security, observability, guidelines)
3. Review against the full checklist: architectural compliance (per `docs/architecture.md`), API contracts, security, observability, tests, code quality
4. Post structured review with inline comments on the PR via MCP
5. Update the linked issue with review status

Follow the reviewer agent's checklist and output format.
