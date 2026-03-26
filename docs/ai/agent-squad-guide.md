# 📚 Guia da Squad de Agentes IA

Este documento descreve a **metodologia de squad de agentes de IA** usada neste repositório, como ela funciona, como criar novos agentes e como customizar para diferentes contextos.

---

## Visão geral

A squad é composta por **11 agentes especializados** que colaboram seguindo um fluxo inspirado em modelos ágeis. Cada agente tem um papel definido, ferramentas restritas e um escopo claro de atuação.

A comunicação entre agentes acontece de duas formas:
1. **Via Issues do GitHub**: Agentes escrevem e leem comentários nas issues (MCP)
2. **Via delegação direta**: O `staff` (orchestrator) invoca sub-agentes automaticamente

---

## Estrutura de arquivos

```
.github/
  agents/                          # Agentes (.agent.md)
    product-owner.agent.md         # Converte demandas em issues
    architect.agent.md             # Análise arquitetural
    staff.agent.md                 # Orquestrador (central)
    backend-dev.agent.md           # Implementação backend (sub-agente)
    frontend-dev.agent.md          # Implementação frontend (sub-agente)
    test-advisor.agent.md          # Estratégia de testes
    qa.agent.md                    # Validação e testes
    reviewer.agent.md              # Code review
    documenter.agent.md            # Documentação pós-merge
    metrifier.agent.md             # Métricas e observabilidade

  prompts/                         # Slash commands (.prompt.md)
    new-feature.prompt.md          # /new-feature
    analyze-issue.prompt.md        # /analyze-issue
    implement-issue.prompt.md      # /implement-issue
    review-pr.prompt.md            # /review-pr
    fix-bug.prompt.md              # /fix-bug
    document-pr.prompt.md          # /document-pr

  instructions/                    # Guidelines contextuais (.instructions.md)
    backend-architecture.instructions.md
    api-controllers.instructions.md
    database-migrations.instructions.md
    frontend-pages.instructions.md
    testing.instructions.md
    security.instructions.md
    issue-tracking.instructions.md

  skills/                          # Workflows complexos
    issue-triage/
      SKILL.md                     # Triagem completa
      references/triage-criteria.md
    full-feature-cycle/
      SKILL.md                     # Ciclo completo de feature
      references/checklist.md

  copilot-instructions.md          # Instruções gerais do repo

AGENTS.md                          # Definição da squad (raiz)
```

---

## Como funciona cada tipo de arquivo

### `.agent.md` — Agentes
Define um papel/persona com ferramentas restritas e instruções de comportamento.

```yaml
---
name: agent-name              # Identificador único
description: "Use when: ..."  # Trigger words para discovery
tools: [read, search]         # Ferramentas permitidas
user-invocable: true          # Aparece no picker do chat?
agents: [sub-agent1]          # Sub-agentes permitidos (opcional)
argument-hint: "..."          # Dica de input (opcional)
---

[Instruções detalhadas do agente]
```

### `.prompt.md` — Slash commands
Template para tarefas específicas, invocado com `/nome` no chat.

```yaml
---
description: "..."
agent: "agent-name"           # Qual agente executa
argument-hint: "..."          # Dica de input
---

[Instruções do prompt]
```

### `.instructions.md` — Guidelines contextuais
Regras que se aplicam automaticamente quando arquivos matching são editados.

```yaml
---
description: "Use when: ..."
applyTo: "backend/src/**/*.ts"  # Glob pattern
---

[Regras e guidelines]
```

### `SKILL.md` — Workflows complexos
Procedimentos multi-step com recursos adicionais (scripts, templates, referências).

```yaml
---
name: skill-name
description: "..."
---

[Procedimento passo a passo]
```

---

## Fluxo de trabalho típico

### Nova feature
```
/new-feature → PO cria issue → /analyze-issue #N → Architect analisa →
/implement-issue #N → Staff planeja e delega → BE/FE implementam →
QA valida → /review-pr #PR → Reviewer revisa → /document-pr #PR → Documenter documenta
```

### Bug fix
```
/fix-bug → Staff investiga e planeja → BE/FE corrigem →
QA valida → /review-pr #PR → Reviewer revisa → /document-pr #PR
```

---

## Como criar um novo agente

1. Crie um arquivo `.github/agents/<nome>.agent.md`
2. Defina o frontmatter YAML com `name`, `description`, `tools`
3. Escreva instruções claras:
   - Papel e escopo (o que FAZ e o que NÃO FAZ)
   - Documentos obrigatórios para ler
   - Workflow de execução (passo a passo)
   - Formato de output
   - Regras não negociáveis
4. Se o agente usa GitHub MCP, adicione a seção de issue tracking protocol
5. Atualize `AGENTS.md` com a nova entrada
6. Se necessário, crie um prompt `.prompt.md` correspondente

### Checklist de validação
- [ ] `description` contém trigger words suficientes
- [ ] `tools` é o mínimo necessário
- [ ] Instruções mencionam docs obrigatórios
- [ ] Formato de output é claro e templatable
- [ ] Regras não negociáveis estão explícitas

---

## Customização para diferentes contextos

### Usando Jira em vez de GitHub Issues
- Substitua `github/*` no tools por um MCP de Jira (quando disponível)
- Adapte referências a "GitHub Issue" nos agentes para "Jira ticket"
- O protocolo de issue tracking permanece o mesmo (formato de comments)

### Usando Confluence em vez de `/docs`
- Adapte referências de `docs/*.md` para links do Confluence
- Considere usar um MCP de Confluence para leitura automatizada
- Mantenha um `CONTEXT_PACK.md` local como cache para os agentes

### Adicionando novos MCPs (Figma, Playwright, etc.)
- Configure o MCP em `.vscode/mcp.json`
- Adicione `<mcp-name>/*` ao campo `tools` dos agentes relevantes
- Documente as capabilities do MCP nas instruções do agente

### Stack diferente (Python, Java, etc.)
- Adapte os instructions files para a nova linguagem/framework
- Atualize `docs/project-structure.md` e `docs/engineer-guidelines.md`
- Os agentes são agnósticos de linguagem — apenas as instructions precisam mudar

---

## Princípios fundamentais

1. **Documentação é fonte de verdade** — Agentes consultam docs antes de agir
2. **Não inventar** — Nunca criar endpoints, tabelas ou entidades não documentadas
3. **Escopo mínimo** — Cada agente faz apenas o que seu papel define
4. **Rastreabilidade** — Toda ação é documentada no issue/PR
5. **Delegação limpa** — Staff orquestra, sub-agentes executam
6. **Qualidade por padrão** — DoD checklist em toda tarefa

---

## Próximos passos

Para exemplos práticos de uso de cada cenário, consulte `docs/ai/usage-guide.md`.
