# 🔄 Guia de Replicação

Guia passo a passo para criar um novo projeto a partir deste template.

> **Nota**: Este repositório É o template. Use-o como base para criar novos projetos.

---

## Pré-requisitos

- VS Code com extensão GitHub Copilot (com suporte a agentes)
- Acesso ao MCP do GitHub (já configurado no Copilot)
- Repositório Git inicializado a partir deste template

---

## Passo 1 — Criar repositório a partir do template

Use este repositório como template no GitHub (botão "Use this template") ou copie a estrutura manualmente.

A estrutura que será herdada:

```
.github/
  agents/            # 11 agentes especializados
  prompts/           # 6 slash commands
  instructions/      # 7 instructions contextuais
  skills/            # 2 skills (issue-triage, full-feature-cycle)
  copilot-instructions.md

docs/                # Documentação estruturada com placeholders
AGENTS.md            # Definição da squad
CONTEXT_PACK.md      # Snapshot condensado com placeholders
README.md            # Guia do template
```

---

## Passo 2 — Configurar MCP

### GitHub MCP (obrigatório)
O MCP do GitHub já vem configurado com o Copilot. Verifique `.vscode/mcp.json`:

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

### MCPs adicionais (opcional)
Para adicionar Figma, Playwright ou outros MCPs, adicione entradas ao `mcp.json`:

```json
{
  "servers": {
    "github": {
      "type": "http",
      "url": "https://api.githubcopilot.com/mcp/"
    },
    "playwright": {
      "type": "http",
      "url": "<playwright-mcp-url>"
    }
  }
}
```

---

## Passo 3 — Configurar a stack do projeto (recomendado)

Use o comando `/setup-project` no Copilot Chat. O agente `project-setup` irá perguntar sobre a stack do projeto e atualizar automaticamente toda a documentação.

```
/setup-project
```

Alternativamente, preencha manualmente os placeholders `[PREENCHER]`.

## Passo 4 — Preencher a documentação de domínio

### Documentos com placeholders `[PREENCHER]`
Os seguintes documentos já possuem a estrutura pronta — basta preencher com os dados do seu projeto:

| Documento | Obrigatório? | Propósito |
|-----------|-------------|-----------|
| `docs/domain.md` | ✅ | Entidades e regras de negócio |
| `docs/api-spec.md` | ✅ (se tem API) | Contratos HTTP |
| `docs/database.md` | ✅ (se tem DB) | Schema e constraints |
| `docs/local-setup.md` | ✅ | Setup do ambiente local |
| `CONTEXT_PACK.md` | Recomendado | Snapshot para onboarding rápido |
| `docs/ai/ai-context.md` | Recomendado | Contexto condensado para IA |

### Documentos já preenchidos (revisar e adaptar se necessário)

| Documento | Propósito |
|-----------|-----------|
| `docs/architecture.md` | Estilo arquitetural e camadas |
| `docs/security.md` | Baseline de segurança |
| `docs/engineer-guidelines.md` | Padrões de código e testes |
| `docs/observability.md` | Logging e monitoramento |
| `docs/project-structure.md` | Layout de pastas |

## Passo 5 — Customizar os agentes (se necessário)

### Ajustes mínimos necessários

> **Nota:** Se você usou `/setup-project`, a maioria desses ajustes já foi feita automaticamente.

1. **Product Owner**: Adaptar se usar Jira em vez de GitHub Issues
2. **Architect**: Adaptar referências de ADRs e estilo arquitetural
3. **Backend/Frontend**: Adaptar para stack tecnológica do projeto
4. **Test Advisor**: Adaptar para framework de testes do projeto

### Ajustes nas Instructions

Adaptar os `applyTo` patterns nos `.instructions.md` para a estrutura de pastas do novo projeto.

Revise cada `.instructions.md` e ajuste:
- Patterns de `applyTo` para a estrutura do novo projeto
- Convenções de naming se diferentes
- Regras específicas da stack

---

## Passo 6 — Testar

### Teste rápido de cada agente
1. Abra o VS Code no novo repositório
2. No Copilot Chat, invoque cada agente e verifique se responde conforme o papel
3. Teste cada slash command (`/new-feature`, `/analyze-issue`, etc.)

### Teste de fluxo end-to-end
1. `/new-feature` → PO deve criar uma issue
2. `/analyze-issue #N` → Architect deve postar análise
3. `/implement-issue #N` → Staff deve planejar e delegar
4. `/review-pr #N` → Reviewer deve revisar
5. `/document-pr #N` → Documenter deve atualizar docs

---

## Passo 7 — Documentar

Crie ou atualize o `AGENTS.md` do novo repositório com:
- Lista dos agentes ativos
- Fluxos de trabalho específicos do projeto
- Customizações feitas na replicação

---

## Checklist de replicação

- [ ] Repositório criado a partir do template
- [ ] MCP configurado em `.vscode/mcp.json`
- [ ] `/setup-project` executado (ou placeholders preenchidos manualmente)
- [ ] `docs/domain.md` preenchido com entidades e regras de negócio
- [ ] `docs/database.md` preenchido com schema e constraints
- [ ] `docs/api-spec.md` preenchido com endpoints e contratos
- [ ] `docs/local-setup.md` preenchido com instruções de setup
- [ ] `CONTEXT_PACK.md` preenchido com snapshot do projeto
- [ ] `docs/ai/ai-context.md` atualizado com contexto do sistema
- [ ] ADRs criados para decisões do projeto (`docs/adr/`)
- [ ] Instructions adaptados para estrutura do projeto (se necessário)
- [ ] Teste de cada agente realizado
- [ ] Fluxo end-to-end testado

---

## Dicas

- **Comece com `/setup-project`**: Configuração automatizada economiza tempo e garante consistência
- **Comece simples**: Use apenas PO + Architect + Staff + BE/FE + Reviewer no início
- **Adicione gradualmente**: QA, Documenter e Metrifier podem ser adicionados depois
- **Documente primeiro**: A qualidade dos agentes depende da qualidade da documentação
- **Itere**: Ajuste as instruções dos agentes conforme aprende o que funciona melhor
