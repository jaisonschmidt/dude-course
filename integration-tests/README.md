# integration-tests

Pacote de testes de integração do **Dude Course**, executando contra um banco de dados separado (`dude_course_test`) e a API real do backend em execução.

Faz parte do monorepo `dude-course`. Consulte o [README raiz](../README.md) para o setup completo do projeto.

---

## ⚠️ Pré-requisitos

Antes de rodar os testes de integração, certifique-se de que:

1. O banco `dude_course_test` existe e está acessível.
2. O backend está rodando em `http://localhost:3001` (ou conforme `BACKEND_URL`).
3. A variável `RUN_INTEGRATION_TESTS=true` está definida no ambiente.

> **Os testes são pulados silenciosamente se `RUN_INTEGRATION_TESTS` não estiver setada como `true`.**

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

## 🚀 Como Rodar Isolado

```bash
RUN_INTEGRATION_TESTS=true pnpm --filter integration-tests test
```

> Garanta que o banco `dude_course_test` existe e que as migrations foram aplicadas antes de executar os testes.
