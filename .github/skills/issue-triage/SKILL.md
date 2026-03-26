---
name: issue-triage
description: "Complete issue triage workflow: from raw demand to implementation-ready issue. Orchestrates Product Owner → Architect → Staff planning. Use when a new demand arrives and needs full triage through the agent pipeline."
argument-hint: "Describe the demand or provide the issue number"
---

# Issue Triage Skill

End-to-end workflow for triaging a new demand through the agent pipeline until it is ready for implementation.

## When to Use

- A new business demand or feature request arrives
- An existing issue needs full triage (PO refinement + architectural analysis + implementation planning)
- You want to run the complete pipeline: PO → Architect → Staff planning

## Procedure

### Phase 1 — Product Owner Refinement

1. Invoke the `product-owner` agent with the demand
2. The PO will:
   - Clarify ambiguities (may ask questions)
   - Search for existing issues
   - Create/update a GitHub Issue with acceptance criteria, priority, and subtask checklist
3. Wait for the issue to be created/updated
4. Note the issue number for the next phase

### Phase 2 — Architectural Analysis

1. Invoke the `architect` agent with the issue number from Phase 1
2. The Architect will:
   - Fetch the issue via MCP
   - Read all mandatory documentation
   - Analyze affected layers and file structure
   - Check if an ADR is needed
   - Post the architectural plan as a comment on the issue
3. Wait for the analysis to be posted

### Phase 3 — Implementation Planning

1. Invoke the `staff` agent with the issue number
2. The Staff will:
   - Read the PO's task and Architect's analysis
   - Plan implementation at code level
   - Document the plan on the issue
   - Consult test-advisor for testing strategy
3. The issue is now **implementation-ready**

## Triage Criteria

Refer to [triage criteria](./references/triage-criteria.md) for priority definitions and completeness checks.

## Completion Checklist

- [ ] Issue exists with clear title and description
- [ ] Acceptance criteria defined (Given/When/Then)
- [ ] Priority assigned (P0–P3)
- [ ] Architectural analysis posted as comment
- [ ] ADR drafted if needed
- [ ] Implementation plan documented
- [ ] Testing strategy outlined
- [ ] Subtask checklist in issue body
