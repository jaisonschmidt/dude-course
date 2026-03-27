# ADR-0006: Segmentação de Pipelines de CI/CD por Pacote no Monorepo

## Status
Accepted

## Contexto

O workflow de deploy anterior (`deploy.yml`) disparava para **qualquer push na `main`**, independentemente de qual pacote havia sido alterado. Em um monorepo com pacotes independentes (`backend/`, `frontend/`, `database/`, `integration-tests/`), essa abordagem monolítica causava:

- **Deploys desnecessários**: um fix de CSS em `frontend/` acionava `prisma migrate deploy` em produção.
- **Tempo de CI desperdiçado**: pacotes sem alteração eram instalados, buildados e testados.
- **Risco operacional aumentado**: cada execução desnecessária de `migrate deploy` é uma oportunidade de erro em produção.

O projeto precisava segmentar os workflows de CI e deploy utilizando filtros de path do GitHub Actions, de forma que cada job só rode quando arquivos do seu pacote forem alterados.

### Alternativas consideradas

#### 1. Workflows separados por responsabilidade (Opção A — escolhida)

Cada responsabilidade tem seu próprio arquivo de workflow com `on: paths:` nativo do GitHub Actions. Nenhuma action externa é introduzida.

- Prós: nativo, sem dependência externa, arquivo por responsabilidade, fácil de ler/debugar/evoluir
- Contras: duplicação de steps de setup em cada arquivo

#### 2. Action de detecção de paths (ex.: `dorny/paths-filter`)

Um único workflow com um job de detecção que determina quais jobs subsequentes devem rodar.

- Prós: menos duplicação de setup, lógica centralizada
- Contras: dependência externa, complexidade adicional, possível ponto único de falha

## Decisão

Adotar a **Opção A**: 5 arquivos de workflow separados, cada um com `on: paths:` nativo do GitHub Actions.

### Estrutura de arquivos

| Arquivo | Substitui | Responsabilidade |
|---|---|---|
| `.github/workflows/ci-backend.yml` | `ci.yml` (parcial) | CI do backend: MySQL efêmero, migrate deploy, unit tests, build, integration tests, lint |
| `.github/workflows/ci-frontend.yml` | `ci.yml` (parcial) | CI do frontend: testes Vitest + lint TypeScript |
| `.github/workflows/deploy-database.yml` | `deploy.yml` (parcial) | Deploy de migrations: `prisma migrate deploy` → HML → prod |
| `.github/workflows/deploy-backend.yml` | `deploy.yml` (parcial) | Deploy da API: `db:generate` + deploy → HML → prod |
| `.github/workflows/deploy-frontend.yml` | `deploy.yml` (parcial) | Deploy Next.js: build + deploy → HML → prod |

### Triggers por workflow

| Arquivo | Paths específicos | Fallback (aciona sempre) |
|---|---|---|
| `ci-backend.yml` | `backend/**`, `database/**`, `integration-tests/**` | `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, `docker-compose.yml`, `.github/workflows/**` |
| `ci-frontend.yml` | `frontend/**` | idem |
| `deploy-database.yml` | `database/prisma/migrations/**`, `database/prisma/schema.prisma` | idem |
| `deploy-backend.yml` | `backend/**`, `database/**` | idem |
| `deploy-frontend.yml` | `frontend/**` | idem |

### Sequência intra-workflow (garantida)

Dentro de cada workflow de deploy, a sequência HML → prod é garantida via `needs`:

```
deploy-database.yml:   [hml] ──needs──▶ [prod]      ┐
deploy-backend.yml:    [hml] ──needs──▶ [prod]      ├─ paralelos entre si
deploy-frontend.yml:   [hml] ──needs──▶ [prod]      ┘
```

### Paralelismo inter-workflow (aceito)

Os 5 workflows são totalmente independentes entre si. Quando um push aciona múltiplos workflows (ex.: migration + backend), eles disparam em paralelo sem coordenação cross-workflow.

## Consequências

### Positivas

- Deploys seletivos: uma mudança exclusiva no `frontend/` não aciona `prisma migrate deploy`.
- CI mais rápido: apenas os pacotes alterados são testados.
- Menor risco operacional: execuções desnecessárias de migrate eliminadas.
- Cada arquivo de workflow tem responsabilidade única e pode ser lido, modificado e testado de forma isolada.
- Alterações em arquivos raiz (`package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, `docker-compose.yml`) e em `.github/workflows/**` acionam todos os workflows via fallback.

### Negativas

- Duplicação de steps de setup (checkout, pnpm, node, install) em cada arquivo.
- **Risco de race condition aceito**: um commit que toque simultaneamente `database/prisma/migrations/**` e `backend/**` aciona `deploy-database.yml` e `deploy-backend.yml` em paralelo. Não há garantia formal de que as migrations serão aplicadas antes do backend subir. Na prática, `deploy-database` é mais rápido (só roda migrate), mas a ordenação não é garantida.

### Mitigações

- A duplicação de setup é aceitável dado o ganho de simplicidade e independência.
- O risco de race condition foi analisado e aceito como trade-off em favor da simplicidade operacional. Equipes que precisem de garantia formal de ordenação podem adicionar `needs` cross-workflow futuramente.
- A convenção de criar migrations antes de alterar o código do backend (prática já documentada na ADR-0005) mitiga o risco na maioria dos casos práticos.

## Notes

- Substitui o comportamento de `ci.yml` e `deploy.yml` (ambos removidos).
- Relacionado: ADR-0005 (`docs/adr/0005-database-environments.md`) — estratégia de migrations e ambientes.
- Impacta: `docs/engineer-guidelines.md`, `docs/project-structure.md`, `CONTEXT_PACK.md`.
