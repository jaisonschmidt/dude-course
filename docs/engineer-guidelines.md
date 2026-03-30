# 🧭 Engineering Guidelines

Este documento define padrões e regras de engenharia para o projeto.

Referências:
- Visão geral: `README.md`
- Arquitetura: `docs/architecture.md`
- Domínio: `docs/domain.md`
- Banco: `docs/database.md`
- API: `docs/api-spec.md`

---

## ✅ Objetivos

- Aumentar previsibilidade e qualidade do código.
- Reduzir retrabalho em PRs (padrões claros).
- Facilitar colaboração humano + IA (Copilot/agents).
- Manter o sistema testável e evolutivo.

---

## 🏗️ Arquitetura

As decisões arquiteturais (estilo, camadas e regras de dependência) estão definidas em:

➡ `docs/architecture.md`

**Regra:** todas as contribuições devem respeitar os limites e responsabilidades descritos nesse documento.

---

## 📝 ADRs (Architecture Decision Records)

ADRs registram decisões arquiteturais significativas do projeto. Cada ADR é um documento curto com contexto, decisão, consequências e mitigações.

### Quando criar uma ADR?
- Escolha de estilo arquitetural, banco de dados, framework ou linguagem
- Padrão de autenticação/autorização
- Estratégia de logging/observabilidade
- Qualquer decisão técnica que afete múltiplos componentes ou seja difícil de reverter

### Convenções
- **Diretório:** `docs/adr/`
- **Numeração:** sequencial com 4 dígitos (`0001`, `0002`, ...)
- **Nome do arquivo:** `NNNN-titulo-descritivo.md` em kebab-case
- **Template:** copiar `docs/adr/0000-adr-template.md` como base
- **Ciclo de vida:** `Proposed` → `Accepted` → `Deprecated` → `Superseded by ADR-NNNN`
- **Aprovação:** toda ADR deve ser submetida via PR para revisão do time

### Processo
1. Copie `docs/adr/0000-adr-template.md` como `docs/adr/NNNN-titulo.md`
2. Preencha todas as seções (contexto, alternativas, decisão, consequências)
3. Abra um PR para revisão
4. Após aprovação, mude o status para `Accepted`

> Consulte `docs/adr/0000-adr-template.md` para o template completo com instruções e mini-exemplo.

---

## 🧾 Padrões de Código

### Linguagem e padrão

- Backend: **Node.js 24 + TypeScript** (Fastify)
- Frontend: **Next.js + TypeScript** (App Router, rendering híbrido)
- Banco: **MySQL 8.0** via **Prisma ORM**
- Preferir **código explícito** ao “mágico” (principalmente com IA).

### Nomes
- Pastas: `kebab-case` (ex.: `order-items`)
- Arquivos: `kebab-case` (ex.: `order-service.[ext]`)
- Classes: `PascalCase`
- Funções/variáveis: `camelCase`
- Constantes: `UPPER_SNAKE_CASE`

### DTOs
- Requests/responses HTTP devem usar **DTOs**, não entidades do domínio diretamente.
- DTOs HTTP vivem em `dto/` no pacote backend (com schemas Zod para validação).
- Não “vazar” detalhes de infraestrutura (ex.: campos de banco) para DTOs públicos.

---

## 🧪 Testes

### Pirâmide recomendada
- **Unit tests (principal foco):** domain + application
- **Integration tests:** repositories + API endpoints críticos
- **E2E (mínimo viável):** fluxo feliz principal

### Regras
- Cada Use Case deve ter testes de:
  - fluxo feliz
  - validação de entrada
  - casos de erro esperados (ex.: curso não existe)
- Use Cases devem ser testados com **mocks das ports** (interfaces), não com DB real.

---

## 🔐 Segurança

- JWT obrigatório para rotas protegidas (ver `docs/api-spec.md`).
- Nunca logar:
  - senha
  - token completo
  - dados sensíveis
- Validar input em todos endpoints.
- Proteger contra SQL injection (queries parametrizadas / ORM).
- Rate limit (futuro) para endpoints de auth.

---

## 📦 Persistência

- Migrations gerenciadas pelo **Prisma Migrate** no pacote `database/` (conforme `docs/project-structure.md`).
- Constraints do banco **devem refletir regras do domínio** quando possível.
- Unicidade conforme definido em `docs/database.md`.

---

## 🧰 Observabilidade & Logs

### APM / Monitoramento

- **APM**: New Relic — instrumentar API Fastify e capturar erros não tratados.
- Garantir correlação por `requestId` (ver padrão de erro no `docs/api-spec.md`).

### Logging
Requisitos mínimos para o logger:
- níveis: `debug`, `info`, `warn`, `error`
- logs estruturados (JSON)
- incluir `requestId` sempre que possível
- não incluir dados sensíveis

---

## ⚙️ CI/CD Pipelines

O projeto usa **5 workflows independentes** no GitHub Actions, segmentados por pacote (ADR-0006).

| Workflow | Arquivo | Paths que acionam | Responsabilidade |
|---|---|---|---|
| CI Backend | `ci-backend.yml` | `backend/**`, `database/**`, `integration-tests/**` | MySQL efêmero, migrate deploy, unit tests, build, integration tests, lint |
| CI Frontend | `ci-frontend.yml` | `frontend/**` | Testes Vitest + lint TypeScript |
| Deploy Database | `deploy-database.yml` | `database/prisma/migrations/**`, `database/prisma/schema.prisma` | `prisma migrate deploy` → HML → prod |
| Deploy Backend | `deploy-backend.yml` | `backend/**`, `database/**` | `db:generate` + deploy da API → HML → prod |
| Deploy Frontend | `deploy-frontend.yml` | `frontend/**` | Build e deploy do Next.js → HML → prod |

**Fallback (aciona todos os workflows):** alterações em `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, `docker-compose.yml` ou `.github/workflows/**` acionam todos os jobs.

**Regra importante:** `prisma migrate deploy` no deploy roda **apenas** via `deploy-database.yml`, acionado exclusivamente por mudanças em `database/prisma/migrations/**` ou `database/prisma/schema.prisma` (ou fallback raiz).

**Sequência de deploy:** dentro de cada workflow, a sequência é `hml → prod` garantida via `needs`. Os 3 workflows de deploy são independentes entre si (executam em paralelo quando acionados).

> ⚠️ **Risco de paralelismo aceito**: um commit que modifique `database/prisma/migrations/**` ou `database/prisma/schema.prisma` aciona simultaneamente `deploy-database.yml` e `deploy-backend.yml`. Os dois rodam em paralelo — não há garantia de que as migrations serão aplicadas antes do backend subir. Ver ADR-0006.

---

## 🔁 Git Workflow

- Branches:
  - `main`: estável
  - `feat/<tema>`: features
  - `fix/<tema>`: correções
  - `chore/<tema>`: manutenção
- PR obrigatório para merge em `main`.
- PR deve incluir:
  - descrição do que mudou
  - checklist de testes
  - link de issue (se houver)

---

## 🪝 Git Hooks (Husky + lint-staged)

O projeto usa **Husky** + **lint-staged** para barrar erros localmente antes do push, reduzindo quebras na pipeline de CI.

Os hooks são instalados automaticamente após `pnpm install` via o script `prepare` no `package.json` raiz.

### Hook `pre-commit`

Executa `lint-staged` apenas nos arquivos staged:

| Glob | Comando | O que valida |
|------|---------|--------------|
| `backend/src/**/*.ts` | `tsc --noEmit -p backend/tsconfig.json` | Type-check TypeScript do backend (valida o projeto inteiro) |
| `frontend/src/**/*.{ts,tsx}` | `eslint --max-warnings=0` | Lint Next.js/React/TypeScript no frontend |

> **Nota**: O `tsc --noEmit` sempre analisa o projeto TypeScript inteiro, independentemente de quais arquivos estão staged. Erros em arquivos fora do staged também serão reportados — isso é intencional para garantir type-safety.

### Hook `pre-push`

Executa a validação completa que espelha o que a CI fará:

```sh
pnpm validate
```

O comando `validate` executa em sequência:
1. `pnpm lint` — type-check de **todos** os pacotes (backend, frontend, integration-tests, database)
2. `pnpm --filter backend test` — testes unitários do backend

Essa abordagem garante que erros de compilação em qualquer pacote (incluindo `integration-tests/`) sejam capturados **antes do push**, evitando falhas na pipeline de CI.

> **Nota**: Os testes de integração (`integration-tests/`) requerem backend + MySQL rodando e continuam sendo executados apenas na CI ou sob demanda local com `RUN_INTEGRATION_TESTS=true`.

### Contornar hooks (uso restrito)

Em casos emergenciais (ex.: hotfix crítico), é possível ignorar os hooks com:

```sh
git commit --no-verify
git push --no-verify
```

> ⚠️ Usar somente em situações excepcionais. O bypass deve ser comunicado ao time e o código revisado com atenção redobrada na CI.

---

## ✅ Definition of Done (DoD)

Uma tarefa só é “done” quando:
- [ ] código implementado respeitando `docs/architecture.md`
- [ ] testes (unit/integration) adicionados quando aplicável
- [ ] lint/format passando
- [ ] endpoints aderentes a `docs/api-spec.md`
- [ ] migrations incluídas quando houver alteração de schema
- [ ] logs e tratamento de erro adequados
- [ ] documentação atualizada (se necessário)

---

## 🤖 Regras para IA (Copilot / Agents)

- Sempre ler antes de codar:
  - `README.md`
  - `docs/architecture.md`
  - `docs/domain.md`
  - `docs/database.md`
  - `docs/api-spec.md`
  - este documento `docs/engineer-guidelines.md`
- Não inventar endpoints nem tabelas fora da documentação.
- Em caso de dúvida: propor alteração na documentação **antes** de gerar código.
- Evitar “embelezamento” de código (emojis, comentários redundantes, etc.).
- Preferir pequenas mudanças com commits/PRs menores e revisáveis.
