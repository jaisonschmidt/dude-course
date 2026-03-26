---
description: "Configure the project stack, tooling integrations, and update all template placeholders interactively."
mode: agent
agent: project-setup
---

# Setup Project

Configure este projeto definindo a stack de tecnologias, ferramentas e convenções.

O agente `project-setup` irá:

1. **Detectar o ambiente** automaticamente: verificar MCP servers, arquivos de projeto existentes e placeholders já preenchidos (Phase 0).
2. **Coletar informações** sobre o projeto: linguagem, framework, banco de dados, ferramentas de observabilidade, issue tracker, MCP servers, etc.
3. **Confirmar as escolhas** antes de aplicar mudanças.
4. **Atualizar automaticamente** toda a documentação e configuração do template (README.md, CONTEXT_PACK.md, docs/, .github/instructions/, .vscode/mcp.json, etc.).
5. **Sugerir ADRs** para registrar as decisões técnicas tomadas.
6. **Validar** que todos os placeholders de stack foram preenchidos.
7. **Gerar checklist de Copilot Productivity Readiness** — mostrando o que está pronto e o que precisa de ação.

> **Dica:** Este é o primeiro passo recomendado após clonar o template.
> Se já rodou antes, o agente detecta o que já foi configurado e oferece atualização seletiva.
