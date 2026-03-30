# database

Pacote responsável pelo schema do banco de dados, migrations e seed do **Dude Course**, usando **Prisma ORM** com **MySQL 8.0**.

Faz parte do monorepo `dude-course`. Consulte o [README raiz](../README.md) para o setup completo do projeto.

---

## ⚙️ Variáveis de Ambiente

Copie o arquivo de exemplo antes de rodar:

```bash
cp .env.example .env
```

| Variável | Descrição | Exemplo |
|----------|-----------|--------|
| `DATABASE_URL` | URL de conexão MySQL | `mysql://root:root@localhost:3306/dude_course` |

---

## 📜 Scripts (em ordem de uso)

| Script | Comando | Descrição |
|--------|---------|----------|
| `db:generate` | `prisma generate` | Gera o Prisma Client a partir do schema |
| `db:migrate:dev` | `prisma migrate dev` | Cria e aplica migrations (ambiente de desenvolvimento) |
| `db:seed` | `tsx src/seed.ts` | Popula o banco com dados iniciais |
| `db:migrate:deploy` | `prisma migrate deploy` | Aplica migrations sem criar novas (produção) |
| `db:push` | `prisma db push` | Sincroniza schema sem migration (prototipagem) |

> ⚠️ **Produção**: use sempre `db:migrate:deploy`. Nunca rode `db:migrate:dev` em ambientes produtivos.

---

## 🚀 Como Rodar Isolado

```bash
# 1. Gerar Prisma Client
pnpm --filter database db:generate

# 2. Aplicar migrations (dev)
pnpm --filter database db:migrate:dev

# 3. Popular o banco com dados iniciais
pnpm --filter database db:seed
```
