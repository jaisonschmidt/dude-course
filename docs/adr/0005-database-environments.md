# ADR-0005: Estratégia de Migrations e Ambientes de Banco de Dados

## Status
Accepted

## Contexto

O projeto Dude Course utiliza Prisma ORM com MySQL 8.0 como banco de dados relacional. À medida que o schema evolui, as migrations precisam ser aplicadas com segurança em múltiplos ambientes: desenvolvimento local, testes (local e CI), homologação (HML) e produção.

Sem uma estratégia clara, surgem riscos de:
- Schema divergente entre ambientes
- Perda acidental de dados em staging/prod (ex.: `migrate dev` com reset)
- Inconsistência no histórico de migrations
- CI não detectar divergências entre schema e migrations

O projeto precisa formalizar **como migrations são criadas, versionadas e aplicadas** em cada contexto de execução.

## Decisão

### 1. Migrations são criadas exclusivamente em desenvolvimento local

O único ambiente onde `prisma migrate dev` é executado é a máquina do desenvolvedor. Nunca em CI, HML ou produção.

```
DEV LOCAL  →  prisma migrate dev  →  gera arquivo SQL versionado no Git
```

### 2. Todos os outros ambientes apenas aplicam migrations existentes

CI, HML e produção utilizam exclusivamente `prisma migrate deploy`, que:
- Aplica somente migrations pendentes já versionadas no Git
- É determinístico: sem prompts, sem reset, sem geração de novas migrations
- Falha imediatamente se detectar drift (schema divergente do histórico)

### 3. O diretório `migrations/` é artefato versionado no Git

`database/prisma/migrations/` deve ser commitado e nunca gerado em runtime. É a fonte de verdade para todos os ambientes.

### 4. Convenção de nomes de banco por ambiente

| Ambiente | Nome do banco | Comando Prisma | Origem da `DATABASE_URL` |
|---|---|---|---|
| Dev local | `dude_course` | `migrate dev` | `database/.env` (gitignored) |
| Testes (local e CI) | `dude_course_test` | `migrate deploy` | `integration-tests/.env` / CI secret |
| HML | `dude_course_staging` | `migrate deploy` | GitHub Environment secret `hml` |
| Produção | `dude_course_prod` | `migrate deploy` | GitHub Environment secret `prod` |

### 5. CI/CD é responsável por aplicar, nunca por criar migrations

O workflow de CI executa `prisma migrate deploy` contra um banco efêmero de teste. O workflow de deploy executa `prisma migrate deploy` contra HML e produção usando os GitHub Environment secrets correspondentes.

## Alternativas Consideradas

### `prisma db push` em todos os ambientes
- Rejeitado: não versionável, não rastreável, pode truncar dados sem aviso em produção

### `prisma migrate dev` em CI
- Rejeitado: pode resetar o banco de teste se houver drift; não é determinístico

### Rodar migrate deploy manualmente antes de cada deploy
- Rejeitado: propenso a esquecimento; CI/CD automatiza e garante consistência

## Consequências

### Positivas
- Pipeline determinística: mesmas migrations aplicadas em todos os ambientes não-locais
- Rastreabilidade total via histórico do Git
- CI detecta imediatamente se `migrations/` estiver desatualizado (Prisma detecta drift)
- Rollback controlado: cada migration tem seu SQL versionado e auditável

### Negativas
- Dev precisa ter MySQL local rodando para criar migrations
- Fluxo quebra se desenvolvedor esquecer de versionar o diretório `migrations/` no commit

### Mitigações
- `docker-compose.yml` na raiz facilita subir MySQL local com um comando (`pnpm dev:db`)
- CI falha imediatamente se `migrations/` estiver desatualizado — o Prisma detecta drift automaticamente
- `database/.env.example` e `docs/local-setup.md` documentam o setup inicial para novos desenvolvedores
