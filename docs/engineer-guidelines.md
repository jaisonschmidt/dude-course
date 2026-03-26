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

<!-- [PREENCHER] Defina a stack do projeto. Use /setup-project para configurar. -->

- Backend: [PREENCHER] (ex.: Node.js + TypeScript, Python, Java, Go)
- Frontend: [PREENCHER] (ex.: Next.js, Nuxt.js, SvelteKit, Angular)
- Preferir **código explícito** ao “mágico” (principalmente com IA).

### Nomes
- Pastas: `kebab-case` (ex.: `order-items`)
- Arquivos: `kebab-case` (ex.: `order-service.[ext]`)
- Classes: `PascalCase`
- Funções/variáveis: `camelCase`
- Constantes: `UPPER_SNAKE_CASE`

### DTOs
- Requests/responses HTTP devem usar **DTOs**, não entidades do domínio diretamente.
- DTOs HTTP vivem em `interfaces/http/dto`.
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

- Migrations versionadas no diretório de migrations do projeto (conforme `docs/project-structure.md`).
- Constraints do banco **devem refletir regras do domínio** quando possível.
- Unicidade conforme definido em `docs/database.md`.

---

## 🧰 Observabilidade & Logs

### APM / Monitoramento

<!-- [PREENCHER] Defina a ferramenta de APM (ex.: Datadog, New Relic, Grafana, CloudWatch). -->

- Instrumentar API e capturar erros não tratados.
- Garantir correlação por `requestId` (ver padrão de erro no `docs/api-spec.md`).

### Logging
Requisitos mínimos para o logger:
- níveis: `debug`, `info`, `warn`, `error`
- logs estruturados (JSON)
- incluir `requestId` sempre que possível
- não incluir dados sensíveis

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
