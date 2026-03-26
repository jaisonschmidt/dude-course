---
description: "Trigger the Documenter agent to update project documentation based on a merged or approved Pull Request."
agent: "documenter"
argument-hint: "PR number (e.g., #15)"
---

Document the changes from the specified Pull Request:

1. Fetch the PR and linked issue via MCP
2. Analyze the diff to identify what changed (endpoints, tables, entities, patterns)
3. Update affected documentation files:
   - `docs/api-spec.md` for new/modified endpoints
   - `docs/database.md` for schema changes
   - `docs/domain.md` for new entities/rules
   - `docs/architecture.md` for structural changes
   - `docs/observability.md` for new logging/metrics
   - `docs/security.md` for security pattern changes
4. Create a new ADR if an architectural decision was made
5. Update `CONTEXT_PACK.md` if changes are significant
6. Post documentation update summary on the issue via MCP

Maintain consistency with existing documentation style and formatting.
