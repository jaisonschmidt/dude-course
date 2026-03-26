# 🤖 AI Context

Este documento fornece **contexto estruturado para assistentes de IA** (GitHub Copilot, agentes de código, LLMs) que trabalham neste repositório.

O objetivo é reduzir alucinações, melhorar a geração de código e garantir que mudanças respeitem a arquitetura e o domínio definidos.

---

# 🎯 Objetivo

Garantir que qualquer IA que gere código neste projeto:

- entenda o **propósito do sistema**
- respeite **arquitetura e domínio**
- utilize **APIs e banco corretos**
- evite inventar entidades, endpoints ou regras

---

# 📚 Documentos obrigatórios de contexto

Antes de gerar código, a IA deve ler:

1. `README.md`
2. `docs/architecture.md`
3. `docs/domain.md`
4. `docs/database.md`
5. `docs/api-spec.md`
6. `docs/engineer-guidelines.md`

Esses documentos são a **fonte oficial de verdade do projeto**.

Se alguma informação estiver ausente, a IA deve **sugerir alteração na documentação antes de gerar código**.

---

# 🧭 Sobre o sistema

<!-- [PREENCHER] Descreva o sistema em termos de alto nível. -->

> Atualize esta seção com o propósito e fluxo principal do projeto.
> Consulte `docs/domain.md` para o modelo de domínio e `CONTEXT_PACK.md` para o snapshot condensado.

---

# 🧱 Arquitetura

<!-- O estilo arquitetural é definido em docs/architecture.md. Adapte conforme o projeto. -->

O estilo arquitetural adotado está documentado em:

➡ `docs/architecture.md`

IA **deve respeitar o estilo e as regras de dependência definidos** nesse documento.

---

# 📊 Entidades do sistema

<!-- [PREENCHER] Liste as entidades do domínio do projeto. -->

> Atualize com as entidades definidas em `docs/domain.md`.

IA **não deve criar novas entidades sem atualizar o domínio**.

---

# 🗄 Banco de dados

<!-- [PREENCHER] Informe o banco utilizado e as tabelas principais. -->

> Atualize com as informações de `docs/database.md`.

IA não deve:

- inventar colunas
- alterar schema sem migration
- ignorar constraints

---

# 🌐 API

A API segue padrão REST.

Base path:

/api/v1

<!-- [PREENCHER] Liste os principais recursos da API. -->

> Atualize com os recursos definidos em `docs/api-spec.md`.

IA deve gerar controllers e rotas **conformes ao API_SPEC**.

---

# 🧪 Testes

Estratégia recomendada:

- unit tests → domínio e use cases
- integration tests → repositories e API
- e2e → fluxo principal

Use cases devem ser testados com **mocks de ports**, não com banco real.

---

# ⚠️ Regras importantes para IA

A IA **NÃO deve**:

- criar endpoints não documentados
- criar tabelas não definidas
- colocar regra de negócio em controllers
- acessar banco diretamente em controllers
- misturar camadas da arquitetura

A IA **DEVE**:

- seguir a arquitetura definida em `docs/architecture.md`
- gerar código pequeno e incremental
- sugerir mudanças na documentação quando necessário

---

# 🧠 Estratégia de geração de código

Ao implementar uma feature, a IA deve seguir a ordem:

1️⃣ Verificar se o domínio suporta a feature  
2️⃣ Verificar se a API já define o endpoint  
3️⃣ Criar/ajustar Use Case na camada Application  
4️⃣ Implementar adapter (repository/service) na Infrastructure  
5️⃣ Criar controller na camada Interfaces  
6️⃣ Adicionar testes  

---

# 📌 Convenções

<!-- [PREENCHER] Defina a stack do projeto. Use /setup-project para configurar. -->

- linguagem backend: [PREENCHER] (ex.: Node.js, Python, Java, Go)
- frontend: [PREENCHER] (ex.: Next.js, Nuxt.js, SvelteKit, Angular)
- banco: [PREENCHER] (ex.: PostgreSQL, MySQL, MongoDB)

Preferir:

- código explícito
- funções pequenas
- responsabilidade única

---

# 🚫 Anti‑patterns que a IA deve evitar

- controllers com lógica de negócio
- queries SQL espalhadas
- dependências circulares
- violação dos limites arquiteturais definidos em `docs/architecture.md`
- geração de código não utilizado

---

# 🧩 Evolução

Se a IA identificar:

- inconsistência de arquitetura
- necessidade de nova entidade
- alteração no domínio
- novo endpoint

Ela deve:

1. Propor alteração em documentação
2. Somente depois gerar código

---

# 🤖 Squad de Agentes

Este repositório utiliza **11 agentes de IA especializados** que colaboram em fluxos ágeis.

Agentes principais:
- `product-owner` — demandas → issues
- `architect` — análise arquitetural
- `staff` — orquestrador central
- `backend-dev` / `frontend-dev` — implementação (sub-agentes do Staff)
- `test-advisor` — estratégia de testes
- `qa` — validação e execução de testes
- `reviewer` — code review de PRs
- `documenter` — documentação pós-merge
- `metrifier` — métricas e observabilidade
- `project-setup` — configuração inicial da stack do projeto
- `documenter` — documentação pós-merge
- `metrifier` — métricas e observabilidade

Slash commands disponíveis:
- `/new-feature` — nova feature (PO)
- `/analyze-issue` — análise arquitetural (Architect)
- `/implement-issue` — planejar e implementar (Staff)
- `/review-pr` — code review (Reviewer)
- `/fix-bug` — correção de bug (Staff)
- `/document-pr` — documentar pós-merge (Documenter)

Referência completa:
- `AGENTS.md`
- `docs/agent-task-flow.md`
- `docs/ai/agent-squad-guide.md`
- `docs/ai/usage-guide.md` — guia prático com exemplos de uso
