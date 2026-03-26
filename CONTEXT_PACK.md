# CONTEXT_PACK.md

This document provides a **condensed context snapshot** of the project so AI assistants
(GitHub Copilot, coding agents, LLMs) can quickly understand the system without scanning
the entire documentation.

Full documentation lives in `/docs`. If something here conflicts with `/docs`, the docs
directory is the **source of truth**.

---

# Project Overview

<!-- [PREENCHER] Preencha com nome, propósito e fluxo principal do projeto. -->

Project: [Nome do Projeto]

Purpose:
[Descreva o propósito do sistema em 1-2 frases]

Core user flow:

[Passo 1] → [Passo 2] → [Passo 3] → [Resultado]

---

# Technology Stack

<!-- [PREENCHER] Defina a stack do projeto. Use /setup-project para configurar automaticamente. -->

Backend
- [PREENCHER] Linguagem/runtime (ex.: Node.js, Python, Java, Go, .NET)
- [PREENCHER] Estilo arquitetural (ex.: Clean Architecture, Hexagonal, Modular, MVC)
- [PREENCHER] Tipo de API (ex.: REST, GraphQL, gRPC)

Frontend
- [PREENCHER] Framework (ex.: Next.js, Nuxt.js, SvelteKit, Angular, nenhum)
- [PREENCHER] Estratégia de renderização (ex.: SSR, SSG, SPA, híbrido)

Database
- [PREENCHER] Banco de dados (ex.: PostgreSQL, MySQL, MongoDB, SQLite)

Monitoring
- [PREENCHER] Ferramenta de APM/observabilidade (ex.: Datadog, New Relic, Grafana, CloudWatch)

---

# Architectural Style

<!-- [PREENCHER] Adapte conforme o estilo arquitetural adotado no projeto. -->

Backend follows **[PREENCHER] estilo arquitetural** (ex.: Clean Architecture, Hexagonal, Modular, MVC).

Layers:

[PREENCHER] Liste as camadas conforme o estilo adotado.

Dependency direction:

[PREENCHER] Defina a direção de dependência entre camadas.

Rules:

- Domain/business logic must not depend on frameworks or infrastructure
- Controllers/handlers must not contain business logic
- Database access must happen through abstractions (repositories/adapters)
- Follow the layer boundaries defined in the architectural style

Reference:
docs/architecture.md

---

# Core Domain Model

<!-- [PREENCHER] Liste as entidades principais do projeto e seus relacionamentos. -->

Main entities:

[Entity1]
[Entity2]
[Entity3]

Relationships:

[Entity1] → [relação] → [Entity2]
[Entity2] → [relação] → [Entity3]

Reference:
docs/domain.md

---

# Business Logic

<!-- [PREENCHER] Descreva as regras de negócio mais importantes. -->

> Documente aqui as regras centrais do domínio (ex.: condições de completude,
> unicidade, idempotência, etc.)

Reference:
docs/domain.md

---

# Database Overview

<!-- [PREENCHER] Liste tabelas e constraints principais. -->

Primary tables:

[tabela1]
[tabela2]
[tabela3]

Important constraints:

[tabela_x]:
UNIQUE([campo1], [campo2])

Reference:
docs/database.md

---

# API Overview

Base path:

/api/v1

Authentication:

<!-- [PREENCHER] Defina o método de autenticação (ex.: JWT Bearer Token) -->

Important endpoints:

<!-- [PREENCHER] Liste os endpoints principais -->

Reference:
docs/api-spec.md

---

# Observability

Logging rules:

- Structured logs
- JSON format
- Include requestId in every request

Error responses must include:

requestId

Monitoring:

[PREENCHER] Ferramenta de APM/observabilidade

Reference:
docs/observability.md

---

# Security Rules

Never:

- log passwords
- log password hashes
- log full JWT tokens

Always:

- validate input
- protect user scoped resources
- prevent SQL injection

Reference:
docs/security.md

---

# AI / Agent Rules

AI assistants must:

- Read AGENTS.md
- Read docs before implementing features
- Never invent API endpoints
- Never invent database tables
- Respect architectural boundaries defined in `docs/architecture.md`

Preferred workflow:

1. Check domain rules
2. Check API contract
3. Check database schema
4. Implement backend layers
5. Implement frontend integration
6. Add tests
7. Update docs if necessary

---

# Key ADR Decisions

> **[PREENCHER]** Registre aqui as ADRs do projeto conforme decisões forem tomadas.
> Use `docs/adr/0000-adr-template.md` como base para criar novas ADRs.

---

# AI Agent Squad

This project uses a squad of 11 specialized AI agents.

Agents:

| Agent | Role |
|-------|------|
| product-owner | Converts demands into GitHub Issues |
| architect | Architectural analysis |
| staff | Orchestrator — plans and delegates |
| backend-dev | Backend implementation (sub-agent) |
| frontend-dev | Frontend implementation (sub-agent) |
| test-advisor | Testing strategy |
| qa | Test execution and validation |
| reviewer | PR code review |
| documenter | Post-merge documentation |
| metrifier | Metrics and observability |
| project-setup | Initial stack configuration |

Delegation model:

staff → [backend-dev, frontend-dev, test-advisor, qa, metrifier]

Main flows:

A) New feature: product-owner → architect → staff → [BE, FE] → qa → reviewer → documenter
B) Bug fix: product-owner → staff → [BE/FE] → qa → reviewer → documenter
C) Bootstrap: product-owner → architect → staff → documenter
D) Tech debt: architect → staff → [BE/FE] → reviewer → documenter

Slash commands:

/setup-project, /new-feature, /analyze-issue, /implement-issue, /review-pr, /fix-bug, /document-pr

Reference:
AGENTS.md
docs/agent-task-flow.md
docs/ai/agent-squad-guide.md

---

# Important Documentation

For deeper context:

docs/architecture.md
docs/domain.md
docs/database.md
docs/api-spec.md
docs/security.md
docs/observability.md
docs/project-structure.md
docs/engineer-guidelines.md
docs/engineering-docs-recommendation.md
