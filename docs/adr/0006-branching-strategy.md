# ADR-0006: Estratégia de Branching — Hybrid GitFlow

## Status
Accepted

## Contexto

O projeto Dude Course é um **monorepo pnpm workspaces** com 4 pacotes (`backend`, `frontend`, `database`, `integration-tests`) e múltiplos ambientes de execução definidos na ADR-0005: desenvolvimento local, testes (CI), homologação (HML/staging) e produção.

O time é composto por desenvolvedores humanos e agentes de IA (squad de 11 agentes, conforme `AGENTS.md`), trabalhando em paralelo em features distintas. Sem uma estratégia de branching formalizada, surgem riscos de:

- Código não validado promovido diretamente para produção
- Impossibilidade de separar o que está em staging do que está em produção
- Inconsistência nas mensagens de commit, dificultando rastreabilidade e automação de changelog
- Agentes de IA sem regras claras sobre em qual branch trabalhar, causando PRs conflitantes ou commits diretos em `main`
- Ausência de processo de versionamento semântico e releases rastreáveis

O projeto precisa de uma estratégia que equilibre **simplicidade para o MVP** com **suporte nativo a múltiplos ambientes** e **releases semânticas**.

### Alternativas consideradas

#### 1. GitHub Flow

Modelo linear com apenas `main` e branches de feature curtas. Cada merge em `main` dispara deploy.

**Prós:**
- Muito simples — poucos branches, fácil de entender
- Ideal para deploy contínuo com apenas um ambiente de produção

**Contras:**
- Não suporta nativamente staging vs. produção como estágios separados
- Sem conceito de `release/*` — não permite estabilizar uma versão antes de produção
- Inadequado para o contexto do projeto, que tem HML e produção como ambientes distintos (ADR-0005)

#### 2. Trunk-Based Development

Todo o time trabalha em `main` (trunk) com feature branches muito curtas (horas, não dias) e feature flags para controlar exposição.

**Prós:**
- Minimiza conflitos de merge — integração contínua real
- Altamente eficiente quando CI/CD é maduro

**Contras:**
- Exige feature flags para cada feature em andamento — overhead para MVP
- Requer CI extremamente maduro e rápido (< 10 min) para ser viável
- Agentes de IA criam branches de feature baseados em issues — não se encaixam no modelo de commits diretamente no trunk
- Risco elevado de instabilidade em `main` sem a disciplina de flag management

#### 3. Gitflow Clássico

Modelo completo com `main`, `develop`, `feature/*`, `release/*`, `hotfix/*` e `support/*`.

**Prós:**
- Separação muito clara de responsabilidades por branch
- Suporte total a releases paralelas e hotfixes
- Amplamente documentado e suportado por ferramentas

**Contras:**
- Verboso demais para MVP — branches de longa duração acumulam divergências
- `support/*` desnecessário nesta fase
- Merge de `release` de volta para `develop` e `main` é burocrático para time pequeno

#### 4. Hybrid GitFlow ✅ (escolhido)

Adaptação simplificada do Gitflow Clássico: mantém `develop` como branch de integração e staging, e `release/*` para promoção à produção, removendo branches de longa duração desnecessárias (`support/*`) e fixando estratégias de merge por tipo de branch.

**Prós:**
- Separação natural entre staging (`develop`) e produção (`main`) — alinhado à ADR-0005
- `release/*` permite estabilização antes da produção sem congelar `develop`
- Regras simples o suficiente para agentes de IA seguirem sem ambiguidade
- `hotfix/*` garante correções críticas sem passar por `develop`
- SemVer e GitHub Releases se encaixam naturalmente no fluxo de `release/*`

**Contras:**
- Mais branches do que GitHub Flow — mitigado por branch protection e automação
- Requer disciplina de merge-back de `release` para `develop` — mitigado por checklist de DoD

## Decisão

Adotar **Hybrid GitFlow** (GitFlow-lite) como estratégia de branching do projeto Dude Course.

### Modelo de branches

```
main  ←── release/v1.2.0  ←── develop  ←── feature/42-enrollment
 ↑                                    ←── fix/55-login-crash
 └──── hotfix/99-payment-null               chore/ci-add-lint
```

| Branch | Propósito | Criado a partir de | Merge destino | Estratégia de merge |
|---|---|---|---|---|
| `main` | Código em produção. Sempre estável e tagueado | — | — | merge commit |
| `develop` | Integração contínua. Deploy automático para HML | `main` (criado 1x) | via `release/*` | — |
| `feature/<N>-<slug>` | Novas funcionalidades | `develop` | `develop` | squash merge |
| `fix/<N>-<slug>` | Correções não-críticas | `develop` | `develop` | squash merge |
| `chore/<slug>` | Infra, docs, manutenção | `develop` | `develop` | squash merge |
| `release/vX.Y.Z` | Release candidate | `develop` | `main` + `develop` | merge commit (ambos) |
| `hotfix/<N>-<slug>` | Correção crítica em produção | `main` | `main` + `develop` | merge commit (ambos) |

### Conventional Commits (monorepo-aware)

Adotar a especificação [Conventional Commits](https://www.conventionalcommits.org/) com escopos específicos ao monorepo:

```
<type>(<scope>): <descrição curta>

[body opcional]

Refs #<issue-number>
```

**Tipos válidos:** `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `perf`, `ci`, `build`

**Escopos do monorepo:** `backend`, `frontend`, `database`, `integration-tests`, `ci`, `docs`

### Versionamento SemVer

| Incremento | Quando usar |
|---|---|
| `MAJOR` | Breaking change de API, migration destrutiva incompatível, mudança estrutural |
| `MINOR` | Nova feature backward-compatible |
| `PATCH` | Bugfix, hotfix, ajuste sem quebra de contrato |

Tags no formato `vMAJOR.MINOR.PATCH` (ex.: `v1.2.3`) criadas no `main`.

### GitHub Releases como changelog oficial

GitHub Releases é adotado como fonte de verdade para o changelog do projeto. Cada tag `vX.Y.Z` deve ser acompanhada de uma Release publicada com:
- Lista de features, fixes e breaking changes (referenciando issues/PRs)
- Link para o Milestone fechado

### Uso de Milestones

Cada versão planejada (`v0.1.0`, `v1.0.0`, etc.) deve ter um Milestone no GitHub. Issues são atribuídas ao Milestone correspondente. O Milestone é fechado quando a `release/vX.Y.Z` é mergeada em `main`.

## Consequências

### Positivas
- Separação explícita entre staging (`develop`) e produção (`main`) — alinha-se ao ADR-0005
- Agentes de IA têm regra não-ambígua: sempre partir de `develop`, nunca de `main`
- Rastreabilidade completa: cada commit referencia issue via `Refs #N`
- `release/*` permite bugfixes pré-release sem bloquear novas features em `develop`
- SemVer + GitHub Releases criam histórico auditável de versões
- Hotfixes têm caminho seguro sem passar por todo o ciclo de release

### Negativas
- Requer disciplina de merge-back (`release` e `hotfix` → `develop`) — risco de regressão se esquecido
- Mais branches simultâneos do que GitHub Flow — pode ser confuso sem branch protection configurada

### Mitigações
- Branch protection em `main` e `develop` impede commits diretos e força PRs com CI verde
- DoD (`docs/engineer-guidelines.md`) inclui checklist de merge-back obrigatório
- Regras documentadas em `docs/engineer-guidelines.md` e `.github/copilot-instructions.md` orientam agentes

## Notas

- Relacionado a: ADR-0005 (`docs/adr/0005-database-environments.md`) — ambientes e migrations
- Impacta: `docs/engineer-guidelines.md`, `.github/copilot-instructions.md`
- Referências:
  - [Gitflow Workflow – Atlassian](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow)
  - [Conventional Commits](https://www.conventionalcommits.org/)
  - [Semantic Versioning](https://semver.org/)
  - [GitHub Releases](https://docs.github.com/en/repositories/releasing-projects-on-github/about-releases)
