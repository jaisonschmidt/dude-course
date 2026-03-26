# 🏗️ Architecture

Este documento descreve as **decisões arquiteturais** do projeto.

Para visão geral consulte: `README.md`

Para regras do domínio consulte: `docs/domain.md`

---

## 🧭 Architectural Style

<!-- [PREENCHER] Defina o estilo arquitetural do projeto e registre a decisão em uma ADR (docs/adr/). -->
<!-- Exemplos de estilos: Clean Architecture, Hexagonal, Modular, MVC, CQRS. -->
<!-- Adapte as seções abaixo conforme o estilo adotado. -->

> **[PREENCHER]** Descreva aqui o estilo arquitetural adotado pelo projeto e a justificativa.
>
> Registre a decisão formalmente em uma ADR: `docs/adr/NNNN-estilo-arquitetural.md`

### Camadas (defina conforme o estilo adotado)

<!-- Exemplo para uma arquitetura em camadas (adapte ao estilo do projeto): -->

> **[PREENCHER]** Liste as camadas do projeto e suas responsabilidades.
>
> Exemplo (Clean Architecture):
> - **Domain**: entidades e regras de negócio puras (sem framework)
> - **Application**: casos de uso (use cases) e portas (interfaces)
> - **Interfaces**: adaptadores de entrada (HTTP controllers, DTOs, middlewares)
> - **Infrastructure**: adaptadores de saída (DB/repositories, providers externos, logger)
> - **Main**: composição/bootstrapping (DI, rotas, wiring)
>
> Exemplo (MVC):
> - **Models**: entidades e regras de negócio
> - **Controllers**: lógica de coordenação e HTTP
> - **Views/Routes**: apresentação e rotas

### Regras de dependência

<!-- Defina a direção de dependência entre camadas. -->

> **[PREENCHER]** Defina as regras de dependência entre camadas.
>
> Exemplo para arquitetura em camadas com dependência para dentro:
> ```
> interfaces      ─┐
> infrastructure  ─┼──> application ───> domain
> main            ─┘
> ```

**Princípios gerais (adapte ao estilo adotado):**

- Camadas internas **não devem** importar camadas externas
- Controllers/handlers **não devem** conter regra de negócio
- Acesso a banco **deve** ser feito através de abstrações (repositories/adapters)
- A camada de composição (main/bootstrap) é a única que pode referenciar todas as outras

---

## 🧩 Responsabilidades por camada

<!-- [PREENCHER] Detalhe as responsabilidades de cada camada do projeto. -->
<!-- Os exemplos abaixo são baseados em arquitetura em camadas — adapte ao estilo adotado. -->

### Camada de Domínio / Modelos
- Entidades de negócio
- Regras invariantes do domínio
- Value Objects (se aplicável)

**Não deve conter:** SQL, HTTP, DTOs de API, dependências de framework

### Camada de Aplicação / Serviços
- Casos de uso / lógica de orquestração
- Portas/interfaces para dependências externas
- Modelos de entrada/saída internos (não HTTP)

> **[PREENCHER]** Liste os use cases do projeto. Exemplos:
> - `RegisterUser`
> - `Create[Entity]`
> - `List[Entities]`

### Camada de Interfaces / Controllers
- Rotas e controllers HTTP
- DTOs de request/response (alinhados com `docs/api-spec.md`)
- Middlewares (auth, requestId, error mapping)

**Regra**: transformar entrada HTTP → input do caso de uso e output → resposta HTTP (sem negócio).

### Camada de Infraestrutura / Adapters
- Implementações concretas de abstrações/ports
- Conexão com DB e migrations
- Integrações externas
- Logger e instrumentação de APM

### Camada de Composição / Bootstrap
- Criação de instâncias concretas
- Wiring de dependências (DI)
- Definição de rotas e inicialização do server

---

## 📦 Estrutura recomendada do repositório

### Backend

<!-- [PREENCHER] Adapte a estrutura de pastas conforme o estilo arquitetural e a linguagem do projeto. -->
<!-- O exemplo abaixo é baseado em arquitetura em camadas — adapte ao estilo adotado. -->

```
backend/
  src/
    [PREENCHER] Organize conforme o estilo arquitetural adotado.

    # Exemplo para arquitetura em camadas:
    domain/               # entidades e regras de negócio
      entities/
      errors/

    application/          # casos de uso e abstrações
      use-cases/
      ports/

    interfaces/           # adaptadores de entrada (HTTP)
      http/
        controllers/
        routes/
        middlewares/
        dto/
      mappers/

    infrastructure/       # adaptadores de saída (DB, serviços)
      db/
        connection/
        migrations/
      repositories/
      logging/
      providers/

    main/                 # composição e bootstrap
      server/
      container/
```

### Frontend

<!-- [PREENCHER] Adapte conforme o framework frontend do projeto. -->

```
frontend/
  [PREENCHER] Estrutura do framework frontend
  components/
  services/              # client da API
  hooks/
  styles/
```

---

## 🔐 Autenticação

- Autenticação baseada em **JWT** (Bearer).
- Rotas protegidas devem validar token via middleware.
- Contratos e exemplos: `docs/api-spec.md`.

---

## 📈 Observability

<!-- [PREENCHER] Defina a ferramenta de APM do projeto (ex.: Datadog, New Relic, Grafana). -->

- Instrumentar backend com ferramenta de APM (APM + erros).
- Padronizar `requestId` para correlação em logs e erros.
- Erros devem ser mapeados para o padrão especificado em `docs/api-spec.md`.

---

## 🔒 Segurança

Obrigatório:
- validação de input em endpoints
- queries parametrizadas / ORM para evitar SQL injection
- não logar tokens/senhas/dados sensíveis
- controles de acesso para rotas autenticadas

---

## 📈 Evolução Arquitetural

Possíveis melhorias futuras (quando necessidade aparecer):
- cache (Redis) para leituras intensas
- processamento assíncrono (filas) para operações pesadas
- containerização e escalabilidade horizontal
