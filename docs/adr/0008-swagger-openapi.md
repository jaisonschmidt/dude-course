# ADR-0008: Swagger UI (OpenAPI) — Documentação Interativa da API

## Status

**Accepted** — 2026-03-31

## Context

O backend do Dude Course possui todos os contratos de API documentados estaticamente em `docs/api-spec.md`. Porém, essa abordagem apresenta limitações:

- Desenvolvedores precisam configurar Postman/curl para testar endpoints manualmente
- Novos contribuidores têm dificuldade para explorar a API rapidamente
- Validação de contratos durante desenvolvimento e homologação é trabalhosa
- Não há forma visual de experimentar a API com autenticação integrada

O projeto usa **Fastify 5** com schemas **Zod v4** para validação de input. Zod v4 possui `z.toJSONSchema()` nativo, eliminando a necessidade de bibliotecas externas de conversão.

### Alternativas consideradas

#### 1. Postman Collection exportada
- Prós: ferramenta familiar, permite salvar exemplos
- Contras: coleção fica desatualizada facilmente, requer ferramenta externa, não é "code-driven"

#### 2. Redoc (documentação estática OpenAPI)
- Prós: UI bonita, read-only
- Contras: não permite testar endpoints diretamente, requer spec separada

#### 3. @fastify/swagger + @fastify/swagger-ui (escolhida)
- Prós: geração automática da spec a partir dos schemas das rotas, UI interativa com "Try it out", integrado ao Fastify, zero manutenção manual da spec
- Contras: +2 dependências de runtime (leves), schemas obrigatórios em todas as rotas

## Decision

Adotar **`@fastify/swagger` + `@fastify/swagger-ui`** com as seguintes regras:

1. **Plugin condicional**: registrado em `backend/src/plugins/swagger.ts` como Fastify plugin
2. **Guard por ambiente**: `if (env.NODE_ENV === 'production') return` — o plugin faz early-return em produção, sem registrar nenhuma rota
3. **Disponível em**: `development`, `staging`, `test`
4. **Não disponível em**: `production` (rota `/documentation` simplesmente não existe)
5. **Schemas derivados de Zod**: usa `zodToJsonSchema()` wrapper que chama `z.toJSONSchema()` e remove o `$schema` draft-2020-12 (incompatível com Ajv do Fastify)
6. **Single source of truth**: mesmos schemas Zod que validam o input também geram a documentação OpenAPI
7. **`staging` adicionado ao enum `NODE_ENV`**: em `backend/src/config/env.ts`

### Acessos

| URL | Descrição |
|-----|-----------|
| `/documentation` | Swagger UI (interface interativa) |
| `/documentation/json` | OpenAPI 3.x spec em JSON |

## Consequences

### Positive
- Documentação interativa da API disponível sem ferramentas externas
- Schemas de rota obrigatórios melhoram a tipagem e validação do Fastify
- Single source of truth: mesmos Zod schemas para validação runtime + documentação OpenAPI
- Zero impacto em produção (plugin não é registrado)
- Facilita onboarding de novos desenvolvedores

### Negative
- +2 dependências de runtime: `@fastify/swagger` e `@fastify/swagger-ui`
- Schemas devem ser adicionados em todas as rotas (esforço inicial)
- Response schemas são JSON Schema literal (não derivados de Zod) — requer manutenção manual se os DTOs de response mudarem

### Mitigations
- Dependências são oficiais do ecossistema Fastify e amplamente mantidas
- Helper `zodToJsonSchema()` centraliza a conversão e trata incompatibilidade de draft
- Testes unitários verificam que o Swagger UI está acessível e que a spec contém metadata esperada
- Future: converter response DTOs para Zod schemas para fechar o loop de single source of truth
