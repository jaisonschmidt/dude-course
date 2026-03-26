# ADR-[NÚMERO]: [Título da Decisão]

<!--
## O que é uma ADR?

ADR (Architecture Decision Record) é um documento curto que registra uma decisão arquitetural
significativa tomada no projeto, junto com o contexto e as consequências dessa decisão.

### Quando criar uma ADR?
- Escolha de estilo arquitetural (ex.: Hexagonal, Modular, MVC, Clean Architecture)
- Escolha de banco de dados, framework, linguagem
- Padrão de autenticação/autorização
- Estratégia de logging/observabilidade
- Qualquer decisão técnica que afete múltiplos componentes ou seja difícil de reverter

### Como usar este template?
1. Copie este arquivo como `docs/adr/NNNN-titulo-descritivo.md` (ex.: `0001-estilo-arquitetural.md`)
2. Substitua os placeholders `[...]` com as informações do projeto
3. Preencha todas as seções
4. Faça PR com a ADR para revisão do time

### Convenções
- Numeração sequencial com 4 dígitos: `0001`, `0002`, etc.
- Nome do arquivo: `NNNN-titulo-descritivo.md` em kebab-case
- Diretório: `docs/adr/`
- Ciclo de vida: Proposed → Accepted → Deprecated → Superseded by ADR-NNNN

### Mini-exemplo preenchido (delete ao criar sua ADR)

# ADR-0001: Escolha do Estilo Arquitetural

## Status
Accepted

## Context
O projeto precisa de uma arquitetura que mantenha separação de responsabilidades,
facilite testabilidade e reduza acoplamento a frameworks.

### Alternativas consideradas
#### 1. Hexagonal Architecture
- Prós: ports & adapters claros, boa testabilidade
- Contras: mais boilerplate inicial

#### 2. MVC tradicional
- Prós: simplicidade, amplamente conhecido
- Contras: tende a acumular lógica nos controllers

## Decision
Adotar [estilo escolhido] com [justificativa principal].

## Consequences
### Positive
- Alta testabilidade
- Baixo acoplamento a frameworks

### Negative
- Custo inicial de setup maior

### Mitigations
- Documentar regras em docs/architecture.md
- Reforçar limites via code review

## Notes
- Impacta: docs/architecture.md, docs/project-structure.md
-->


## Status
[Proposed | Accepted | Deprecated | Superseded by ADR-NNNN]

## Context
[Descreva o contexto e o problema que motivou esta decisão.
Que forças estão em jogo? Que restrições existem?
Quais alternativas foram consideradas?]

### Alternativas consideradas

#### 1. [Alternativa A]
- [Prós]
- [Contras]

#### 2. [Alternativa B]
- [Prós]
- [Contras]

## Decision
[Descreva a decisão tomada e a justificativa.
Seja claro e objetivo.]

## Consequences

### Positive
- [Benefício 1]
- [Benefício 2]

### Negative
- [Trade-off 1]
- [Trade-off 2]

### Mitigations
- [Como mitigar os pontos negativos]

## Notes
- [Informações adicionais, links, referências]
- [Documentos impactados por esta decisão]
