# 📋 Documentação de Engenharia — Recomendações

Guia de documentos de engenharia recomendados para qualquer projeto de software. Organizado por nível de prioridade, com objetivo, quando criar e template mínimo para cada documento.

---

## Documentos Fundamentais (obrigatórios)

Documentos que todo projeto deveria ter desde o início.

### README.md
- **Objetivo**: Visão geral do projeto, como rodar, stack tecnológica
- **Quando criar**: No primeiro commit
- **Template mínimo**:
  - O que é o projeto (1-2 parágrafos)
  - Stack tecnológica
  - Como rodar localmente
  - Como rodar testes
- **Exemplo neste repo**: `README.md`

### architecture.md
- **Objetivo**: Estilo arquitetural, camadas, regras de dependência
- **Quando criar**: Antes de escrever código
- **Template mínimo**:
  - Estilo arquitetural (Clean Arch, Hexagonal, MVC, etc.)
  - Diagrama de camadas
  - Regras de dependência entre camadas
  - O que cada camada faz e o que é proibido
- **Exemplo neste repo**: `docs/architecture.md`

### domain.md
- **Objetivo**: Entidades de domínio, regras de negócio, glossário
- **Quando criar**: Na modelagem do domínio
- **Template mínimo**:
  - Lista de entidades com atributos
  - Regras de negócio por entidade
  - Glossário de termos do domínio
  - Fluxo principal do sistema
- **Exemplo neste repo**: `docs/domain.md`

### database.md
- **Objetivo**: Schema do banco, constraints, indexes, migrations
- **Quando criar**: Quando o banco de dados for definido
- **Template mínimo**:
  - Diagrama de tabelas (ou descrição)
  - Campos, tipos e constraints por tabela
  - Foreign keys e regras de cascade
  - Indexes relevantes
  - Regras de unicidade
- **Exemplo neste repo**: `docs/database.md`

### api-spec.md
- **Objetivo**: Contratos HTTP, autenticação, formatos de erro
- **Quando criar**: Antes de implementar endpoints
- **Template mínimo**:
  - Base path e versionamento
  - Esquema de autenticação
  - Lista de endpoints (método, path, request, response)
  - Formato padrão de erro
  - Códigos de erro
- **Exemplo neste repo**: `docs/api-spec.md`

### security.md
- **Objetivo**: Baseline de segurança, autenticação, validação
- **Quando criar**: Antes do primeiro endpoint
- **Template mínimo**:
  - Método de autenticação
  - Regras de validação de input
  - Dados sensíveis (o que nunca logar)
  - Prevenção de injection
  - Controle de acesso
- **Exemplo neste repo**: `docs/security.md`

### engineer-guidelines.md
- **Objetivo**: Padrões de código, naming, testes, Definition of Done
- **Quando criar**: Antes da primeira PR
- **Template mínimo**:
  - Convenções de naming (arquivos, classes, funções)
  - Pirâmide de testes (unit > integration > e2e)
  - Regras de commit/branch
  - Definition of Done (checklist)
- **Exemplo neste repo**: `docs/engineer-guidelines.md`

---

## Documentos de Suporte (recomendados)

Documentos que aumentam a qualidade e produtividade da equipe.

### observability.md
- **Objetivo**: Logging, métricas, tracing, alertas
- **Quando criar**: Quando configurar logging/APM
- **Template mínimo**:
  - Padrão de log estruturado (campos obrigatórios)
  - Correlação de requests (requestId)
  - Ferramenta de APM
  - Health endpoints
- **Exemplo neste repo**: `docs/observability.md`

### project-structure.md
- **Objetivo**: Organização de pastas e convenções de layout
- **Quando criar**: Quando a estrutura de pastas for definida
- **Template mínimo**:
  - Árvore de diretórios com explicação
  - Onde vive cada tipo de artefato
  - Exemplos de como adicionar novos artefatos
- **Exemplo neste repo**: `docs/project-structure.md`

### local-setup.md
- **Objetivo**: Como rodar o projeto localmente
- **Quando criar**: Quando o setup tiver mais de 3 passos
- **Template mínimo**:
  - Pré-requisitos (versões, ferramentas)
  - Passos de instalação
  - Variáveis de ambiente
  - Como rodar testes
  - Troubleshooting comum
- **Exemplo neste repo**: `docs/local-setup.md`

### ADRs (Architectural Decision Records)
- **Objetivo**: Registrar decisões arquiteturais com contexto e consequências
- **Quando criar**: A cada decisão arquitetural significativa
- **Template mínimo**:
  - Status (Proposed, Accepted, Deprecated, Superseded)
  - Contexto (por que a decisão foi necessária)
  - Decisão (o que foi decidido)
  - Consequências (positivas e negativas)
- **Exemplo neste repo**: `docs/adr/0000-adr-template.md` (template com instruções e mini-exemplo)
- **Convenção**: Numeração sequencial `NNNN-slug.md` em `docs/adr/`
- **Processo completo**: ver seção ADRs em `docs/engineer-guidelines.md`

---

## Documentos de IA e Automação

Para projetos que usam agentes de IA como auxiliares de desenvolvimento.

### ai-context.md
- **Objetivo**: Contexto condensado para assistentes de IA
- **Quando criar**: Quando adotar agentes de IA
- **Template mínimo**:
  - Docs obrigatórios para ler
  - Visão geral do sistema
  - Stack tecnológica
  - Anti-patterns para IA evitar
- **Exemplo neste repo**: `docs/ai/ai-context.md`

### agent-task-flow.md
- **Objetivo**: Fluxo de trabalho entre agentes
- **Quando criar**: Quando configurar a squad de agentes
- **Template mínimo**:
  - Lista de agentes com responsabilidades
  - Diagrama de delegação
  - Fluxos principais (feature, bug, bootstrap)
  - Regras de ouro
- **Exemplo neste repo**: `docs/agent-task-flow.md`

### agent-squad-guide.md
- **Objetivo**: Metodologia completa da squad de agentes
- **Quando criar**: Quando a squad estiver operacional
- **Conteúdo**: Estrutura de arquivos, tipos de customização, como criar agentes, como replicar
- **Exemplo neste repo**: `docs/ai/agent-squad-guide.md`

### AGENTS.md (raiz)
- **Objetivo**: Definição de papéis e responsabilidades dos agentes
- **Quando criar**: Junto com os agentes
- **Conteúdo**: Tabela de agentes, modelo de delegação, fluxos de execução
- **Exemplo neste repo**: `AGENTS.md`

### CONTEXT_PACK.md (raiz)
- **Objetivo**: Snapshot condensado para onboarding rápido de IA
- **Quando criar**: Quando a documentação crescer além de 5 arquivos
- **Conteúdo**: Resumo de domínio, stack, arquitetura, regras principais
- **Exemplo neste repo**: `CONTEXT_PACK.md`

---

## Documentos Opcionais (conforme maturidade)

Para projetos mais maduros ou com necessidades específicas.

| Documento | Objetivo | Quando criar |
|-----------|----------|-------------|
| `runbook.md` | Procedimentos operacionais e troubleshooting | Quando houver produção |
| `contributing.md` | Guia para contribuidores externos | Projetos open-source ou equipes grandes |
| `changelog.md` | Histórico de mudanças por versão | Quando houver releases |
| `testing-strategy.md` | Estratégia detalhada de testes | Quando a pirâmide for complexa |
| `deployment.md` | Pipeline, ambientes, rollback | Quando houver CI/CD |
| `performance.md` | Benchmarks, SLAs, otimizações | Quando performance for crítica |
| `data-dictionary.md` | Dicionário de dados completo | Projetos data-intensive |
| `integration-guide.md` | Como integrar com o sistema | Quando houver consumers externos |

---

## Dicas gerais

1. **Comece com o mínimo** — README + architecture + domain são suficientes para iniciar
2. **Escreva antes de codificar** — Documentar a decisão antes de implementar economiza retrabalho
3. **Mantenha vivo** — Docs desatualizados são piores que nenhum doc
4. **Automatize a verificação** — Agentes de IA podem validar se a implementação segue os docs
5. **Um doc por concern** — Separar em arquivos específicos facilita manutenção e referência
6. **Use o Documenter** — O agente `documenter` atualiza os docs automaticamente após cada PR
