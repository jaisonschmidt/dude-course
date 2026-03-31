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

## ✨ Features

- 📚 **Catálogo de cursos** — navegação pública com paginação
- ▶️ **Player de aulas** — YouTube embed integrado com marcação de progresso
- 📊 **Dashboard do aluno** — progresso por curso e porcentagem de conclusão
- 🎓 **Certificados** — geração automática ao completar 100% das aulas
- 🔐 **Autenticação** — registro, login (JWT), proteção de rotas por role
- 🛠️ **Painel admin** — CRUD de cursos e aulas, drag-and-drop para reordenar, publicar/despublicar
- 📖 **Swagger UI** — documentação interativa da API em `/documentation` (dev/staging)

## 📖 Documentação

### Documentos do Projeto

| Documento | O que preencher |
|-----------|----------------|
| [docs/product](docs/product) | Detalhes do produto como visão, requisitos funcionais, entre outros |
| [docs/domain.md](docs/domain.md) | Entidades, regras de negócio, relacionamentos, fluxo principal |
| [docs/database.md](docs/database.md) | Tabelas, campos, constraints, indexes, schema SQL |
| [docs/api-spec.md](docs/api-spec.md) | Endpoints, request/response, autenticação, formato de erro |
| [docs/local-setup.md](docs/local-setup.md) | Banco de dados, variáveis de ambiente, passos de setup |
| [CONTEXT_PACK.md](CONTEXT_PACK.md) | Snapshot condensado do projeto para onboarding rápido de IA |

### Documentação de engenharia

| Documento | Conteúdo |
|-----------|----------|
| [docs/architecture.md](docs/architecture.md) | Estilo arquitetural e regras de dependência |
| [docs/security.md](docs/security.md) | Baseline de segurança (auth, validação, OWASP) |
| [docs/observability.md](docs/observability.md) | Logging, requestId, métricas, alertas |
| [docs/engineer-guidelines.md](docs/engineer-guidelines.md) | Naming, testes, git workflow, DoD |
| [docs/project-structure.md](docs/project-structure.md) | Estrutura recomendada de pastas |

### Configurar MCP

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

### Criar ADRs do projeto

O template inclui:
- `docs/adr/0000-adr-template.md` — Template padrão com instruções e mini-exemplo (copie para criar novas ADRs)

Crie ADRs para decisões do projeto (estilo arquitetural, linguagem, banco, framework, auth, hosting, etc.).

Consulte `docs/engineer-guidelines.md` (seção ADRs) para o processo completo.

### Instruções para uso de IA

| Arquivo | Propósito |
|---------|----------|
| `.github/copilot-instructions.md` | Instruções gerais para Copilot |
| `.github/instructions/backend-architecture.instructions.md` | Limites de camada e naming |
| `.github/instructions/database-migrations.instructions.md` | Padrões de migration |
| `.github/instructions/testing.instructions.md` | Pirâmide de testes e mocking |
| `.github/instructions/api-controllers.instructions.md` | Formato de response e validação |
| `.github/instructions/security.instructions.md` | Auth, JWT, validação |
| `.github/instructions/frontend-pages.instructions.md` | Patterns do framework frontend |

## 🚀 Como Rodar

### Pré-requisitos

- **Node.js ≥ 24**
- **pnpm ≥ 10**
- **Docker + Docker Compose**

### Quick Start

1. Clone o repositório:
   ```bash
   git clone <repo-url>
   cd dude-course
   ```

2. Instale as dependências do monorepo:
   ```bash
   pnpm install
   ```

3. Suba o MySQL via Docker:
   ```bash
   pnpm dev:db
   ```

4. Copie os arquivos de variáveis de ambiente:
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env.local
   cp database/.env.example database/.env
   cp integration-tests/.env.example integration-tests/.env
   ```

5. Execute as migrations e o seed:
   ```bash
   pnpm --filter database db:migrate:dev
   pnpm --filter database db:seed
   ```

6. Suba o backend e o frontend em paralelo:
   ```bash
   pnpm dev
   ```

### 🔑 Credenciais do Seed

Após rodar o seed, os seguintes usuários estão disponíveis para login:

| Email | Senha | Role | Descrição |
|-------|-------|------|----------|
| `admin@dudecourse.local` | `Admin@123456` | `admin` | Acesso ao painel admin |
| `learner@dudecourse.local` | `Learner@123456` | `learner` | Aluno com matrícula e progresso |

> O seed também cria: 1 curso publicado ("Introdução ao TypeScript" com 3 aulas), 1 curso draft, 1 matrícula do learner e 1 aula concluída.

### 📖 Swagger UI

Com o backend rodando em modo `development`, acesse a documentação interativa da API:

- **Swagger UI**: http://localhost:3001/documentation
- **OpenAPI JSON**: http://localhost:3001/documentation/json

Para testar endpoints protegidos: faça login via `POST /api/v1/auth/login`, copie o token e clique em **Authorize** → `Bearer <token>`.

### ✅ Validação pré-push

```bash
pnpm validate
```

Executa lint (type-check) + testes unitários do backend. Roda automaticamente no hook `pre-push`.

> Para detalhes completos sobre validação e testes de integração, consulte [`docs/local-setup.md`](docs/local-setup.md).

### Mapa de Portas

| Serviço | Porta |
|---------|-------|
| Frontend | `:3000` |
| Backend API | `:3001` |
| MySQL | `:3306` |

### Scripts disponíveis (raiz)

| Script | Descrição |
|--------|----------|
| `pnpm dev` | Sobe backend e frontend em paralelo |
| `pnpm dev:backend` | Sobe apenas o backend |
| `pnpm dev:frontend` | Sobe apenas o frontend |
| `pnpm dev:db` | Sobe o MySQL via Docker (Docker Compose) |
| `pnpm test` | Roda todos os testes do monorepo |
| `pnpm build` | Builda todos os pacotes |

> Para setup detalhado (env vars, banco de testes, etc.), consulte [`docs/local-setup.md`](docs/local-setup.md).

### READMEs por pacote

- [backend/README.md](backend/README.md) — API Fastify + MVC
- [frontend/README.md](frontend/README.md) — Next.js 15 App Router
- [database/README.md](database/README.md) — Prisma ORM, migrations, seed
- [integration-tests/README.md](integration-tests/README.md) — Testes de integração

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
|---------|--------|----------|
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
