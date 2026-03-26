# Dude Course

Plataforma educacional que transforma conteúdo gratuito do YouTube em cursos estruturados, com progresso rastreável e emissão de certificados.

Desenvolvido com **squad de 11 agentes de IA** especializados, usando GitHub Copilot.

## Stack do Projeto

- **Backend:** Node.js 24 + TypeScript (Fastify, MVC)
- **Frontend:** Next.js + TypeScript (App Router, rendering híbrido)
- **Banco:** MySQL 8.0 (Prisma ORM)
- **Observabilidade:** New Relic (APM) + Pino (logging)
- **Testes:** Vitest
- **Monorepo:** pnpm workspaces (backend, frontend, database, integration-tests)
- **Containerização:** Docker + Docker Compose
- **Auth:** JWT Bearer Token (bcrypt)

### 3. Documentos do Projeto

| Documento | O que preencher |
|-----------|----------------|
| [docs/product](docs/product) | Detalhes do produto como visão, requisitos funcionais, entre outros |
| [docs/domain.md](docs/domain.md) | Entidades, regras de negócio, relacionamentos, fluxo principal |
| [docs/database.md](docs/database.md) | Tabelas, campos, constraints, indexes, schema SQL |
| [docs/api-spec.md](docs/api-spec.md) | Endpoints, request/response, autenticação, formato de erro |
| [docs/local-setup.md](docs/local-setup.md) | Banco de dados, variáveis de ambiente, passos de setup |
| [CONTEXT_PACK.md](CONTEXT_PACK.md) | Snapshot condensado do projeto para onboarding rápido de IA |

### 3. Documentação de engenharia

| Documento | Conteúdo |
|-----------|----------|
| [docs/architecture.md](docs/architecture.md) | Estilo arquitetural e regras de dependência |
| [docs/security.md](docs/security.md) | Baseline de segurança (auth, validação, OWASP) |
| [docs/observability.md](docs/observability.md) | Logging, requestId, métricas, alertas |
| [docs/engineer-guidelines.md](docs/engineer-guidelines.md) | Naming, testes, git workflow, DoD |
| [docs/project-structure.md](docs/project-structure.md) | Estrutura recomendada de pastas |

### 4. Configurar MCP

Crie `.vscode/mcp.json` com o GitHub MCP (obrigatório para os agentes interagirem com issues e PRs):

```json
{
  "servers": {
    "github": {
      "type": "http",
      "url": "https://api.githubcopilot.com/mcp/"
    }
  }
}
```

MCPs opcionais: Playwright (testes e2e), DB, Figma, etc.

### 5. Criar ADRs do projeto

O template inclui:
- `docs/adr/0000-adr-template.md` — Template padrão com instruções e mini-exemplo (copie para criar novas ADRs)

Crie ADRs para decisões do projeto (estilo arquitetural, linguagem, banco, framework, auth, hosting, etc.).

Consulte `docs/engineer-guidelines.md` (seção ADRs) para o processo completo.

### 6. Instruções para uso de IA

| Arquivo | Propósito |
|---------|-----------|
| `.github/copilot-instructions.md` | Instruções gerais para Copilot |
| `.github/instructions/backend-architecture.instructions.md` | Limites de camada e naming |
| `.github/instructions/database-migrations.instructions.md` | Padrões de migration |
| `.github/instructions/testing.instructions.md` | Pirâmide de testes e mocking |
| `.github/instructions/api-controllers.instructions.md` | Formato de response e validação |
| `.github/instructions/security.instructions.md` | Auth, JWT, validação |
| `.github/instructions/frontend-pages.instructions.md` | Patterns do framework frontend |

## Agentes

11 agentes especializados com papéis definidos:

| Agente | Papel |
|--------|-------|
| **Product Owner** | Demandas → issues com critérios de aceite |
| **Architect** | Análise arquitetural de issues |
| **Staff** | Orquestrador: planeja, delega, abre PR |
| **Backend Dev** | Implementação backend (sub-agente) |
| **Frontend Dev** | Implementação frontend (sub-agente) |
| **Test Advisor** | Propõe estratégia de testes |
| **QA** | Executa testes e valida critérios |
| **Reviewer** | Code review contra guidelines |
| **Documenter** | Atualiza docs pós-merge |
| **Metrifier** | Recomenda métricas e observabilidade |
| **Project Setup** | Configura stack e atualiza docs do template |

Detalhes completos: [AGENTS.md](AGENTS.md)

## Slash Commands

| Comando | Agente | O que faz |
|---------|--------|-----------|
| `/setup-project` | Project Setup | Configura stack e atualiza docs |
| `/new-feature` | Product Owner | Cria issue a partir de demanda |
| `/analyze-issue` | Architect | Análise arquitetural |
| `/implement-issue` | Staff | Planeja e implementa |
| `/fix-bug` | Staff | Investiga e corrige bug |
| `/review-pr` | Reviewer | Revisa PR |
| `/document-pr` | Documenter | Atualiza docs |

## Referências

- Guia de uso dos agentes: [docs/ai/usage-guide.md](docs/ai/usage-guide.md)
- Guia da squad: [docs/ai/agent-squad-guide.md](docs/ai/agent-squad-guide.md)
- Fluxo de agentes: [docs/agent-task-flow.md](docs/agent-task-flow.md)
- Contexto para IA: [docs/ai/ai-context.md](docs/ai/ai-context.md)
- Recomendações de docs: [docs/engineering-docs-recommendation.md](docs/engineering-docs-recommendation.md)

## Licença

A definir.
