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

## 🔁 Git Workflow

A estratégia de branching adotada é o **Hybrid GitFlow** (GitFlow-lite para monorepo).
Decisão registrada em: `docs/adr/0006-branching-strategy.md`

### Modelo de branches

```
main  ←── release/v1.2.0  ←── develop  ←── feature/42-enrollment
 ↑                                    ←── fix/55-login-crash
 └──── hotfix/99-payment-null               chore/ci-add-lint
```

| Branch | Propósito | Criado a partir de | Merge destino | Estratégia |
|---|---|---|---|---|
| `main` | Produção. Sempre estável e tagueado | — | — | merge commit |
| `develop` | Integração. Deploy automático para HML | `main` (1x) | via `release/*` | — |
| `feature/<N>-<slug>` | Novas funcionalidades | `develop` | `develop` | squash merge |
| `fix/<N>-<slug>` | Correções não-críticas | `develop` | `develop` | squash merge |
| `chore/<slug>` | Infra, docs, manutenção | `develop` | `develop` | squash merge |
| `release/vX.Y.Z` | Release candidate | `develop` | `main` + `develop` | merge commit |
| `hotfix/<N>-<slug>` | Correção crítica em produção | `main` | `main` + `develop` | merge commit |

### Nomenclatura obrigatória

Formato: `<tipo>/<número-da-issue>-<slug-descritivo>`

```
feature/42-course-enrollment
fix/55-login-crash
chore/ci-add-lint
hotfix/99-payment-null-pointer
release/v1.2.0
```

- O número da issue é obrigatório em `feature/*`, `fix/*` e `hotfix/*`
- O slug deve ser em `kebab-case`, descritivo e curto (máx. ~5 palavras)

### Fluxo: Feature → Staging → Produção

```
1. Cria feature/<N>-<slug> a partir de develop
2. Implementa (qualquer pacote do monorepo: backend/, frontend/, database/, integration-tests/)
   └── Migrations SEMPRE commitadas junto com o código que as exige (ADR-0005)
3. Abre PR para develop
   └── CI: build + unit tests + integration tests + prisma migrate deploy (HML efêmero)
4. ≥1 aprovação → squash merge para develop
5. develop em HML → validação pela equipe (critérios de aceitação da issue)
6. Quando develop estável para release:
   a. Cria release/vX.Y.Z a partir de develop
   b. Apenas bugfixes são permitidos na release branch
   c. Atualiza CHANGELOG.md / GitHub Release draft
   d. Fecha Milestone vX.Y.Z
7. PR: release/vX.Y.Z → main (merge commit)
8. Tag vX.Y.Z criada em main → GitHub Release publicada
9. CI: prisma migrate deploy em produção → deploy de produção
10. OBRIGATÓRIO: release/vX.Y.Z mergeado de volta para develop
```

### Fluxo de Hotfix (bug crítico em produção)

```
1. Cria hotfix/<N>-<slug> a partir de main
2. Corrige o bug (inclui teste regressivo)
3. PR: hotfix → main (merge commit) → incrementa PATCH → tag vX.Y.(Z+1)
4. GitHub Release publicada para o patch
5. OBRIGATÓRIO: PR hotfix → develop (sincronização imediata)
```

**Quando usar hotfix?** Apenas quando um bug em produção causa impacto crítico e não pode aguardar o próximo ciclo de release.

### Conventional Commits

Adotar a especificação [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <descrição curta>

[body opcional — contexto adicional]

Refs #<issue-number>
```

**Tipos válidos:**

| Tipo | Quando usar |
|---|---|
| `feat` | Nova funcionalidade |
| `fix` | Correção de bug |
| `chore` | Manutenção, infra, tooling |
| `docs` | Apenas documentação |
| `refactor` | Refatoração sem mudança de comportamento |
| `test` | Adição ou correção de testes |
| `perf` | Melhoria de performance |
| `ci` | Mudanças em CI/CD |
| `build` | Sistema de build, dependências |

**Escopos do monorepo** (obrigatório quando aplicável):

`backend` · `frontend` · `database` · `integration-tests` · `ci` · `docs`

**Exemplos:**

```
feat(backend): add course enrollment endpoint Refs #23
fix(database): fix migration for lesson_progress Refs #31
chore(ci): add prisma migrate deploy step for HML Refs #14
docs(engineer-guidelines): update git workflow section Refs #14
test(integration-tests): add enrollment e2e test Refs #23
```

**Breaking changes:** adicionar `!` após o tipo e incluir `BREAKING CHANGE:` no footer:

```
feat(backend)!: change enrollment API response shape Refs #45

BREAKING CHANGE: field `courseId` renamed to `course_id` in enrollment response.
```

### Versionamento Semântico (SemVer)

Formato: `vMAJOR.MINOR.PATCH` (ex.: `v1.2.3`)

| Incremento | Quando usar | Exemplo |
|---|---|---|
| `MAJOR` | Breaking change de API, migration destrutiva, mudança estrutural | `v1.0.0 → v2.0.0` |
| `MINOR` | Nova feature backward-compatible | `v1.0.0 → v1.1.0` |
| `PATCH` | Bugfix, hotfix, ajuste sem quebra | `v1.0.0 → v1.0.1` |

Milestones iniciais planejados: `v0.1.0` (MVP backend), `v0.2.0` (MVP frontend), `v1.0.0` (produção).

### Tags e GitHub Releases

1. Tags são criadas **exclusivamente em `main`** via PR de `release/vX.Y.Z`
2. Formato da tag: `vMAJOR.MINOR.PATCH`
3. Cada tag deve ter uma **GitHub Release publicada** com:
   - Resumo das mudanças (features, fixes, breaking changes)
   - Links para issues/PRs incluídos
   - Link para o Milestone fechado
4. **GitHub Releases é o changelog oficial** — ver `CHANGELOG.md` na raiz
5. Milestones do GitHub agrupam issues por versão planejada e são fechados no momento da release

### Branch Protection Rules (recomendado)

**`main`:**
- Require pull request with ≥1 approval before merging
- Require status checks to pass: `ci/build`, `ci/unit-tests`, `ci/integration-tests`
- Require branches to be up to date before merging
- No force pushes, no direct commits, no deletions

**`develop`:**
- Require pull request with ≥1 approval before merging
- Require status checks to pass: `ci/build`, `ci/unit-tests`
- No force pushes

### Considerações específicas para monorepo

- **Um PR pode e deve tocar múltiplos pacotes** — ex.: `database/` + `backend/` + `integration-tests/` em um único PR de feature
- **Migrations** devem ser versionadas **no mesmo commit** que o código de backend que as requer (ADR-0005)
- **Tags são no nível raiz** — o monorepo é versionado como uma unidade, não por pacote
- **CI detecta pacotes alterados** para otimizar jobs, mas migrations e integration-tests sempre rodam

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
