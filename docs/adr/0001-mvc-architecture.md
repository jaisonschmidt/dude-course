# ADR-0001: Adoção de Arquitetura MVC

## Status
Accepted

## Context
O projeto Dude Course precisa de um estilo arquitetural para organizar o backend (Fastify + TypeScript). O objetivo é ter uma estrutura clara, fácil de entender e que facilite o desenvolvimento guiado por IA, mantendo separação de responsabilidades e testabilidade.

### Alternativas consideradas

#### 1. Clean Architecture
- Prós: excelente separação de responsabilidades, alta testabilidade, independência de frameworks
- Contras: mais boilerplate inicial (ports, adapters, use cases), curva de aprendizado maior, overhead para MVP

#### 2. Hexagonal Architecture (Ports & Adapters)
- Prós: boa testabilidade, ports & adapters claros
- Contras: similar ao Clean Architecture em complexidade, mais abstrato

#### 3. MVC (Model-View-Controller) adaptado
- Prós: simplicidade, amplamente conhecido, baixo overhead, fácil para IA gerar código, adequado para MVP
- Contras: pode acumular lógica nos controllers se não disciplinado, menos formal na separação

## Decision
Adotar **MVC adaptado** (Models, Services, Controllers, Repositories, Routes, Middlewares) como estilo arquitetural do backend.

A adaptação principal é a camada de **Services** como intermediária entre Controllers e Repositories, garantindo que lógica de negócio fique isolada e testável.

**Camadas:**
- **Models** — entidades puras, tipos, regras invariantes
- **Services** — lógica de negócio, dependem de interfaces de repositories
- **Controllers** — handlers HTTP, delegam para services
- **Repositories** — acesso a dados via Prisma
- **Routes** — definições de rotas Fastify
- **Middlewares** — auth, requestId, error handling
- **DTOs** — schemas Zod para validação

**Direção de dependência:**
```
Routes → Controllers → Services → Repositories → Models
```

## Consequences

### Positive
- Simplicidade e velocidade de desenvolvimento no MVP
- Curva de aprendizado baixa para contribuidores e IA
- Separação clara: business logic em Services, HTTP em Controllers
- Testabilidade via mocking de repository interfaces
- Padrão amplamente conhecido e documentado

### Negative
- Menos formal que Clean/Hexagonal — requer disciplina para não "poluir" controllers
- Evolução futura para arquitetura mais complexa requer refactor

### Mitigations
- Regras de dependência documentadas em `docs/architecture.md`
- Instruction files (`.github/instructions/`) reforçam limites
- Code review (agente `reviewer`) valida aderência
- Services sempre dependem de abstrações (interfaces de repositories)

## Notes
- Impacta: `docs/architecture.md`, `docs/project-structure.md`, `.github/instructions/backend-architecture.instructions.md`
- Se no futuro a complexidade crescer, considerar migração gradual para Clean Architecture
