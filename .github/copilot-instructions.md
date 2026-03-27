# GitHub Copilot Instructions (Repository)

This file guides GitHub Copilot to use this repository’s documentation and follow project rules.

> **Source of truth**: The documentation under `/docs` is authoritative.  
> If something is missing or inconsistent, propose a doc update before generating code.

---

## 1) Mandatory context to read first

Before creating or changing code, always consult:

1. `README.md`
2. `docs/ai/ai-context.md`
3. `docs/architecture.md`
4. `docs/domain.md`
5. `docs/database.md`
6. `docs/api-spec.md`
7. `docs/engineer-guidelines.md`
8. `docs/project-structure.md`
9. `docs/security.md`
10. `docs/observability.md`
11. `docs/agent-task-flow.md`
12. `docs/adr/*` (relevant decisions)

---

## 2) Non-negotiable rules

### Git workflow (branching)
Follow the **Hybrid GitFlow** strategy defined in `docs/engineer-guidelines.md` → section **Git Workflow** and `docs/adr/0006-branching-strategy.md`.

**Rules for agents:**
- Always create branches from `develop` — **never from `main`**
- Never commit directly to `main` or `develop`
- Branch naming: `feature/<issue-number>-<slug>`, `fix/<issue-number>-<slug>`, `chore/<slug>`
- Commit messages must follow **Conventional Commits** with monorepo scopes:
  `feat(backend): ...`, `fix(database): ...`, `test(integration-tests): ...`
- Always add `Refs #<issue-number>` at the end of commit messages
- Migrations must be committed in the same branch/PR as the backend code that requires them

### Do NOT invent
- Do not invent endpoints not described in `docs/api-spec.md`
- Do not invent tables/columns not described in `docs/database.md`
- Do not invent domain entities not described in `docs/domain.md`
- Do not bypass constraints/uniqueness rules described in DB docs

If a feature requires a new endpoint/table/entity:
1) propose a documentation change,  
2) only then generate code.

### Architecture boundaries (backend)
Backend must follow the architectural style and layer rules defined in `docs/architecture.md`.

General rules (adapt to the project's architectural style):

- Business/domain layer has **no framework/DB dependencies**
- Application/service layer contains **use cases + abstractions (ports)**
- Interface/controller layer contains **HTTP handlers/routes/DTOs**
- Infrastructure layer contains **DB repositories/providers/logging/observability**
- Composition root is for **wiring only**

**Forbidden**
- business logic in controllers
- direct DB access outside repositories/adapters
- inner layers importing outer layers
- application layer importing infrastructure (depend on abstractions only)

### Security and privacy
Follow `docs/security.md`:
- never log passwords, password hashes, or full JWT tokens
- validate input on all endpoints
- use parameterized queries / ORM protections
- protect user-scoped resources (avoid IDOR)

### Observability
Follow `docs/observability.md`:
- always propagate and include `requestId`
- error responses must include `requestId` and follow `docs/api-spec.md` error format
- log in structured JSON (or through the central logger) with `requestId`

---

## 3) How to implement a feature (preferred workflow)

When implementing a feature, follow this order:

1. Check domain rules in `docs/domain.md`
2. Check API contract in `docs/api-spec.md`
3. Check DB schema/constraints in `docs/database.md`
4. Implement backend in layers:
   - `application` use case (command/query) + ports
   - `infrastructure` adapters (repositories/providers)
   - `interfaces` controller + DTOs + routes
   - `main` wiring only
5. Add tests:
   - unit tests for use cases (mock ports)
   - integration tests for repositories and critical endpoints
6. Ensure logs/errors follow `docs/observability.md`
7. Update docs if any contract changed (API/DB/domain)

Keep changes small and incremental.

---

## 4) Code generation guidelines

### Backend
- Follow the language and conventions defined in `CONTEXT_PACK.md` and `docs/engineer-guidelines.md`.
- Implement idempotency where required by the domain.
- Respect DB uniqueness constraints as defined in `docs/database.md`.
- Keep DTOs separate from domain entities.

### Frontend
- Follow the framework and patterns defined in `CONTEXT_PACK.md` and `docs/project-structure.md`.
- Match API usage to `docs/api-spec.md`
- Keep UI resilient (loading states, error states, token expired handling)
- Do not duplicate business rules; backend is source of truth.

---

## 5) Output expectations

When generating code changes, include:
- file list of what you changed/added
- brief explanation of why each file exists
- tests added/updated
- any documentation updates required

---

## 6) Quick pointers (most common tasks)

- Auth flows and response shapes: `docs/api-spec.md`
- DB constraints and indexes: `docs/database.md`
- Domain-specific business rules: `docs/domain.md` + relevant ADRs
- Logging/request correlation: `docs/observability.md`
- Architectural boundaries: `docs/architecture.md` + relevant ADRs
- Engineering best practices: `docs/engineer-guidelines.md`

---

## 7) Agent squad

This repository uses a squad of 11 specialized AI agents defined in `.github/agents/`. See `AGENTS.md` for full details.

### Available agents

| Agent | When to invoke |
|-------|---------------|
| `product-owner` | New demands, issue creation, acceptance criteria, backlog refinement |
| `architect` | Architectural analysis of issues, layer impact, ADR evaluation |
| `staff` | Implementation planning, delegation, PR creation (orchestrator) |
| `backend-dev` | Backend code implementation (sub-agent of staff) |
| `frontend-dev` | Frontend code implementation (sub-agent of staff) |
| `test-advisor` | Testing strategy proposals (what to test, how to structure) |
| `qa` | Test execution, acceptance criteria validation |
| `reviewer` | Pull Request code review |
| `documenter` | Post-merge documentation updates, ADR creation |
| `metrifier` | Metrics and observability recommendations |
| `project-setup` | Initial stack configuration, tooling setup, MCP servers, readiness validation |

### Slash commands (prompts)

| Command | Purpose |
|---------|---------|
| `/setup-project` | Detect environment, configure stack, set up tooling, validate readiness |
| `/new-feature` | Start new feature (PO flow) |
| `/analyze-issue` | Architectural analysis |
| `/implement-issue` | Plan and implement issue |
| `/review-pr` | Code review a PR |
| `/fix-bug` | Bug fix flow |
| `/document-pr` | Document a merged PR |

### Skills (multi-step workflows)

| Skill | Purpose |
|-------|---------|
| `issue-triage` | Full triage: PO → Architect → Staff planning |
| `full-feature-cycle` | End-to-end: demand → merged, documented PR |

### Issue tracking rule

All agents with GitHub access must keep issue cards updated with progress, subtask checklists, and status updates. See `.github/instructions/issue-tracking.instructions.md`.