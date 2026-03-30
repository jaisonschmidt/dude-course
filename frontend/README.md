# frontend

Interface web do Dude Course, construída com **Next.js 15** (App Router) + **TypeScript** + **Tailwind CSS**.

Faz parte do monorepo `dude-course`. Consulte o [README raiz](../README.md) para o setup completo do projeto.

---

## ⚙️ Variáveis de Ambiente

Copie o arquivo de exemplo antes de rodar:

```bash
cp .env.example .env.local
```

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `NEXT_PUBLIC_API_URL` | URL base da API backend | `http://localhost:3001/api/v1` |

---

## 📜 Scripts

| Script | Comando | Descrição |
|--------|---------|----------|
| `dev` | `next dev` | Inicia em modo desenvolvimento com hot-reload |
| `build` | `next build` | Gera o build de produção |
| `start` | `next start` | Serve o build de produção |
| `test` | `vitest run` | Roda os testes unitários |
| `test:watch` | `vitest` | Roda os testes em modo watch |
| `test:coverage` | `vitest run --coverage` | Roda os testes com cobertura |
| `lint` | `tsc --noEmit` | Verifica erros de tipagem TypeScript |

---

## 🚀 Como Rodar Isolado

```bash
pnpm --filter frontend dev
```

> O frontend espera o backend rodando em `http://localhost:3001`. Configure `NEXT_PUBLIC_API_URL` em `frontend/.env.local` se a URL for diferente.
