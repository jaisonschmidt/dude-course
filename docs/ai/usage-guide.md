# Guia de Uso da Squad de Agentes

Guia prático de como usar os agentes de IA no dia a dia. Cada cenário mostra **exatamente o que digitar** no Copilot Chat do VS Code e o que esperar de cada passo.

> **Pré-requisito**: VS Code com GitHub Copilot ativo e MCP do GitHub configurado em `.vscode/mcp.json`.

---

## Resumo rápido

| Comando | O que faz | Agente |
|---------|-----------|--------|
| `/setup-project` | Configura stack e atualiza docs do template | Project Setup |
| `/new-feature` | Cria issue a partir de uma demanda | Product Owner |
| `/analyze-issue` | Análise arquitetural de um issue | Architect |
| `/implement-issue` | Planeja e implementa um issue | Staff |
| `/fix-bug` | Investiga e corrige um bug | Staff |
| `/review-pr` | Revisa uma Pull Request | Reviewer |
| `/document-pr` | Atualiza docs após merge | Documenter |

Além dos comandos, você pode invocar agentes diretamente digitando `@nome-do-agente` no chat:
`@product-owner`, `@architect`, `@staff`, `@reviewer`, `@documenter`, `@test-advisor`, `@qa`, `@metrifier`, `@project-setup`

---

## Cenário 1 — Configurar um novo projeto

Use este fluxo quando for configurar o template pela primeira vez.

### Passo 0: Configurar a stack

```
/setup-project
```

O **Project Setup** vai:
- Perguntar sobre linguagem, framework, banco, ferramentas de APM, etc.
- Atualizar automaticamente toda a documentação e configuração
- Sugerir ADRs para as decisões técnicas

### Passo 1: Definir o backlog inicial

```
/new-feature

Preciso criar [descreva o sistema e suas funcionalidades principais].
Crie issues para as funcionalidades principais do MVP.
```

O **Product Owner** vai:
- Fazer perguntas de esclarecimento (se necessário)
- Criar issues no GitHub com critérios de aceite e subtarefas
- Atribuir prioridades (P0–P3)

### Passo 2: Definir a arquitetura

```
/analyze-issue #1

Analise este issue e defina a arquitetura do projeto,
incluindo estilo arquitetural, estrutura de pastas e ADRs iniciais.
```

O **Architect** vai:
- Definir camadas e dependências
- Sugerir estrutura de pastas
- Propor ADRs
- Postar a análise como comentário no issue

### Passo 3: Gerar o scaffold

```
/implement-issue #1

Crie a estrutura inicial do projeto (scaffold) com base
na análise arquitetural.
```

O **Staff** vai:
- Ler a análise do Architect no issue
- Planejar a estrutura de arquivos
- Delegar para `backend-dev` (scaffold backend) e `frontend-dev` (scaffold frontend)
- Criar branch e abrir PR

### Passo 4: Documentar

```
/document-pr #1

Documente a estrutura criada e as decisões tomadas.
```

O **Documenter** vai:
- Analisar o diff da PR
- Criar/atualizar docs relevantes (architecture.md, project-structure.md, ADRs)
- Atualizar CONTEXT_PACK.md

---

## Cenário 2 — Criar e implementar uma feature

Fluxo completo: demanda → issue → análise → código → testes → review → docs.

### Passo 1: Criar o issue

```
/new-feature

[Descreva a funcionalidade que precisa ser implementada,
incluindo regras de negócio e comportamento esperado.]
```

O **Product Owner** cria o issue com:
- Contexto da demanda
- Critérios de aceite (Given/When/Then)
- Prioridade
- Checklist de subtarefas

### Passo 2: Análise arquitetural

```
/analyze-issue #42
```

O **Architect** posta no issue:
- Camadas afetadas (domain, application, infrastructure, interfaces)
- Arquivos a criar/modificar por camada
- Necessidade de ADR (se houver)
- Riscos e pontos de atenção

### Passo 3: Implementar

```
/implement-issue #42
```

O **Staff** orquestra tudo automaticamente:
1. Lê o issue (contexto do PO + análise do Architect)
2. Lê docs obrigatórios (domain, api-spec, database, architecture)
3. Monta plano de implementação e posta no issue
4. Consulta `@test-advisor` para estratégia de testes
5. Delega para `@backend-dev` (use case, repository, controller, testes)
6. Delega para `@frontend-dev` (se tiver componente de UI)
7. Roda testes para validar
8. Consulta `@metrifier` para observabilidade
9. Cria branch e abre PR

> **Dica**: O Staff atualiza o issue com progresso em cada etapa.

### Passo 4: Review

```
/review-pr #15
```

O **Reviewer** verifica:
- Estilo arquitetural (sem violação de camadas, conforme `docs/architecture.md`)
- Aderência a `api-spec.md` e `database.md`
- Segurança (validação, dados sensíveis)
- Observabilidade (requestId, logs)
- Existência de testes

### Passo 5: Documentar

```
/document-pr #15
```

O **Documenter** atualiza docs caso a feature tenha introduzido:
- Novo endpoint → atualiza `api-spec.md`
- Nova tabela/coluna → atualiza `database.md`
- Nova entidade → atualiza `domain.md`
- Decisão arquitetural → cria ADR

### Atalho: Ciclo completo em um comando

Se preferir rodar o ciclo inteiro de uma vez, use a skill `full-feature-cycle`:

```
[Descreva a feature que precisa ser implementada com detalhes de negócio.]
```

Ao detectar que se trata de uma feature completa, o Copilot pode acionar a skill que executa PO → Architect → Staff → QA → Reviewer → Documenter sequencialmente.

---

## Cenário 3 — Corrigir um bug

### Opção A: Bug já tem issue

```
/fix-bug #55

[Descreva o bug: o que acontece, o que deveria acontecer.]
```

### Opção B: Bug ainda não tem issue

```
/fix-bug

[Descreva o bug com detalhes do comportamento incorreto
e o comportamento esperado.]
```

Em ambos os casos, o **Staff**:
1. Se não houver issue, cria um com o contexto do bug
2. Investiga a root cause (lê código, testa hipóteses)
3. Planeja o fix mínimo necessário
4. Delega para `@backend-dev` ou `@frontend-dev`
5. Garante que um teste de regressão é adicionado
6. Abre PR com a correção

Depois, siga o mesmo fluxo de review e documentação:

```
/review-pr #16
/document-pr #16
```

---

## Cenário 4 — Refatoração e tech debt

Para mudanças técnicas que não vêm de demanda de negócio.

### Passo 1: Avaliar impacto arquitetural

```
@architect

[Descreva a refatoração necessária e peça análise de impacto.]
```

O **Architect** avalia:
- Quais camadas e arquivos são afetados
- Se a mudança respeita as fronteiras arquiteturais definidas em `docs/architecture.md`
- Se é necessário ADR

### Passo 2: Implementar

```
@staff

Implemente a refatoração sugerida pelo Architect.
```

### Passo 3: Review e docs

```
/review-pr #17
/document-pr #17
```

---

## Cenário 5 — Consultar estratégia de testes

Quando você quer saber **que testes escrever** antes de implementar.

```
@test-advisor

Vou implementar [descreva o endpoint ou funcionalidade].
Quais testes devo escrever? Considere unit, integration e edge cases.
```

O **Test Advisor** retorna:
- Testes unitários (use case com mocks de ports)
- Testes de integração (repository + banco, endpoint HTTP)
- Edge cases (dados inválidos, recurso inexistente, usuário sem permissão)
- Estratégia de mocking
- Fixtures necessárias

> **Nota**: O Test Advisor **propõe** testes mas não escreve código. Quem implementa é o `backend-dev` ou `frontend-dev`.

---

## Cenário 6 — Solicitar métricas e observabilidade

```
@metrifier

Vamos lançar [descreva o módulo/feature]. Quais métricas e
instrumentações devemos adicionar?
```

O **Metrifier** sugere:
- Métricas de negócio (operações por dia, taxas de conversão)
- Métricas técnicas (latência, taxa de erros)
- Métricas operacionais (uso de recursos)
- Alertas recomendados
- Estrutura de dashboard

---

## Cenário 7 — Validar uma implementação (QA)

Depois que o código foi implementado mas antes do merge:

```
@qa #42

Valide se a implementação atende aos critérios de aceite do issue #42.
```

O **QA**:
1. Lê os critérios de aceite do issue
2. Executa os testes automatizados
3. Testa edge cases e cenários de segurança
4. Posta relatório estruturado no issue

---

## Dicas gerais

- **Documente antes de codificar**: Os agentes funcionam melhor quando `domain.md`, `api-spec.md` e `database.md` estão preenchidos
- **Use slash commands para fluxos formais**: `/new-feature`, `/implement-issue`, etc.
- **Use `@agente` para consultas rápidas**: `@test-advisor`, `@metrifier`, `@architect`
- **Confie no Staff para orquestrar**: O `@staff` sabe delegar para os sub-agentes corretos
- **Atualize a documentação**: Use `/document-pr` após cada merge significativo
