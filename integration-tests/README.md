# integration-tests

Pacote de testes de integração do **Dude Course**, executando contra um banco de dados separado (`dude_course_test`) e a API real do backend em execução.

Faz parte do monorepo `dude-course`. Consulte o [README raiz](../README.md) para o setup completo do projeto.

---

## ⚠️ Pré-requisitos

Antes de rodar os testes de integração, certifique-se de que:

1. O banco `dude_course_test` existe e está acessível.
2. As migrations foram aplicadas no banco de teste.
3. O backend está rodando em `http://localhost:3001` (ou conforme `BACKEND_URL`).
4. A variável `RUN_INTEGRATION_TESTS=true` está definida no ambiente.

> **Os testes são pulados silenciosamente se `RUN_INTEGRATION_TESTS` não estiver setada como `true`.**

> ⚠️ **IMPORTANTE — Alinhamento de banco**: O backend **deve** estar conectado ao **mesmo banco** que os testes usam para seed (`dude_course_test`). Os testes inserem dados diretamente no DB via Prisma e a API lê desse mesmo DB. Se o backend estiver conectado a `dude_course` e os seeds inserirem em `dude_course_test`, os dados serão invisíveis para a API.

---

## ⚙️ Variáveis de Ambiente

Copie o arquivo de exemplo antes de rodar:

```bash
cp .env.example .env
```

| Variável | Descrição | Obrigatória |
|----------|-----------|-------------|
| `DATABASE_URL` | URL de conexão com o banco de testes | ✅ |
| `DATABASE_URL_TEST` | Alias para `DATABASE_URL` (banco de testes) | ✅ |
| `BACKEND_URL` | URL base do backend em execução | ✅ |
| `RUN_INTEGRATION_TESTS` | **Deve ser `true`** para os testes não serem pulados | ✅ |

---

## 📜 Scripts

| Script | Comando | Descrição |
|--------|---------|----------|
| `test` | `vitest run` | Roda todos os testes de integração |
| `test:watch` | `vitest` | Roda em modo watch |

---

## 🚀 Como Rodar Localmente

```bash
# 1. Subir MySQL (se não estiver rodando)
pnpm dev:db

# 2. Criar banco de testes (apenas na primeira vez)
docker exec dude-course-mysql mysql -uroot -proot \
  -e "CREATE DATABASE IF NOT EXISTS dude_course_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 3. Aplicar migrations no banco de testes
DATABASE_URL="mysql://root:root@localhost:3306/dude_course_test" \
  pnpm --filter database exec prisma migrate deploy

# 4. Iniciar backend conectado ao banco de TESTE
DATABASE_URL="mysql://root:root@localhost:3306/dude_course_test" \
  JWT_SECRET="test-secret-key-minimum-32-characters-long" \
  pnpm dev:backend

# 5. Em outro terminal — rodar os testes
RUN_INTEGRATION_TESTS=true \
  DATABASE_URL_TEST="mysql://root:root@localhost:3306/dude_course_test" \
  BACKEND_URL="http://localhost:3001" \
  pnpm --filter integration-tests test
```

> Após os testes, reinicie o backend com `DATABASE_URL` apontando para `dude_course` para retomar o desenvolvimento.

---

## 🧪 Guidelines para Seed Functions

Ao escrever funções de seed em testes de integração, siga estas regras:

### Prisma Raw SQL

| Operação | Método correto | ❌ Não usar |
|----------|---------------|-------------|
| INSERT / UPDATE / DELETE | `$executeRaw` | `$queryRaw` (silently fails) |
| SELECT | `$queryRaw` | `$executeRaw` |

```typescript
// ✅ Correto — INSERT com $executeRaw
await prisma.$executeRaw`
  INSERT INTO courses (title, description, status, created_at, updated_at)
  VALUES (${title}, ${description}, ${status}, NOW(), NOW())
`

// ✅ Correto — SELECT com $queryRaw
const rows = await prisma.$queryRaw`SELECT LAST_INSERT_ID() as id` as Array<{ id: bigint }>
return Number(rows[0]!.id)

// ❌ ERRADO — INSERT com $queryRaw (pode falhar silenciosamente)
await prisma.$queryRaw`INSERT INTO ...`
```

### Tipos MySQL

- `LAST_INSERT_ID()` retorna `bigint` no MySQL — sempre converta com `Number()`
- Campos `TIMESTAMP` podem precisar de `NOW()` explícito no raw SQL

### Padrão recomendado para seed

```typescript
async function seedEntity(overrides = {}): Promise<number> {
  const prisma = getTestPrisma()
  // ... merge defaults com overrides
  await prisma.$executeRaw`INSERT INTO table_name (...) VALUES (...)`
  const rows = await prisma.$queryRaw`SELECT LAST_INSERT_ID() as id` as Array<{ id: bigint }>
  return Number(rows[0]!.id)
}
```
