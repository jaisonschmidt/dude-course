# Triage Criteria Reference

## Priority definitions

| Priority | Meaning | Response time | Examples |
|----------|---------|---------------|---------|
| **P0** | Critical — system down or major feature broken | Immediate | Auth broken, data loss, security vulnerability |
| **P1** | High — significant impact on users | Next sprint | Core feature bug, performance degradation, blocking issue |
| **P2** | Medium — important but not blocking | Planned | New feature, UX improvement, tech debt |
| **P3** | Low — nice to have | Backlog | Minor UI fix, documentation, optimization |

## Completeness checks

An issue is **triage-complete** when all of these are true:

### Product Owner checklist
- [ ] Business objective is clear
- [ ] Target user/persona identified
- [ ] Scope boundaries defined (in scope / out of scope)
- [ ] Acceptance criteria written in Given/When/Then format
- [ ] Priority assigned with justification
- [ ] Dependencies identified
- [ ] Subtask checklist included

### Architect checklist
- [ ] Affected layers identified
- [ ] File/module structure suggested
- [ ] Dependency rules documented
- [ ] Risks and concerns listed
- [ ] ADR decision made (needed or not)

### Staff checklist
- [ ] Implementation plan at code level
- [ ] Files to create/modify listed
- [ ] Implementation order defined
- [ ] Testing strategy consulted

## Demand classification

| Type | Agent flow | Notes |
|------|-----------|-------|
| New feature | PO → Architect → Staff | Full triage |
| Bug fix | PO (clarify) → Staff | Architect only if architectural impact |
| Tech debt | Architect → Staff | PO only if user-facing impact |
| Documentation | Documenter | Direct, no triage needed |
| Security fix | PO → Architect → Staff | Always P0 or P1 |

## Escalation rules

- If PO cannot clarify after 2 rounds of questions → escalate to human
- If Architect identifies ADR-breaking change → require human approval
- If Staff estimates > 5 files changed → suggest splitting into sub-issues
