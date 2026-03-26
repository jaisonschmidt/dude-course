# 🛠️ Local Setup

<!-- TEMPLATE: Preencha este documento com as instruções de setup do seu projeto. -->

Este documento descreve como preparar e executar o projeto localmente (backend + frontend).

Referências:
- Visão geral: `README.md`
- Estrutura do repositório: `docs/project-structure.md`
- API: `docs/api-spec.md`
- Banco: `docs/database.md`

---

## ✅ Pré-requisitos

### Ferramentas

<!-- [PREENCHER] Defina os pré-requisitos do projeto. Use /setup-project para configurar. -->

- **[PREENCHER]** Runtime/linguagem (ex.: Node.js LTS, Python 3.x, Java 21, Go 1.22)
- **[PREENCHER]** Gerenciador de pacotes (ex.: npm, pnpm, pip, maven, go modules)
- **[PREENCHER]** Banco de dados (ex.: PostgreSQL, MySQL, MongoDB, SQLite)
- Git

### Opcional (recomendado)
- Docker / Docker Compose (para subir dependências e facilitar setup)

---

## 📦 Clonar o repositório

```bash
git clone <repo-url>
cd <repo-folder>
```

---

## 🗄️ Banco de dados

> **[PREENCHER]** Instruções para configurar o banco de dados do projeto.

### Opção A) Banco local instalado

1. Inicie o banco de dados
2. Crie o banco:

```sql
CREATE DATABASE [nome_do_banco];
```

### Opção B) Docker (recomendado)

> **[PREENCHER]** Adicione ou referencie o `docker-compose.yml` do projeto.

```bash
docker compose up -d
```

---

## ⚙️ Variáveis de ambiente

### Backend

Crie o arquivo de variáveis de ambiente do backend baseado em `.env.example`:

> **[PREENCHER]** Liste as variáveis de ambiente necessárias.

```env
# Server
PORT=[PREENCHER]
ENV=development

# Database
DB_HOST=localhost
DB_PORT=[PREENCHER]
DB_NAME=[nome_do_banco]
DB_USER=[PREENCHER]
DB_PASSWORD=[PREENCHER]

# Auth
# [PREENCHER] Variáveis de autenticação (ex.: JWT_SECRET, API_KEY, etc.)

# Observability
# [PREENCHER] Variáveis de observabilidade (ex.: APM_ENABLED, APM_LICENSE_KEY, etc.)
```

### Frontend

Crie o arquivo de variáveis de ambiente do frontend:

```env
# [PREENCHER] Variáveis do frontend
API_BASE_URL=http://localhost:[PREENCHER]/api/v1
```

---

## 🔧 Backend

```bash
cd [diretório-do-backend]
# [PREENCHER] Comando para instalar dependências (ex.: npm install, pip install -r requirements.txt)
```

### Rodar migrations

> A ferramenta de migration será definida na implementação.
> O schema de referência está em `docs/database.md`.

```bash
# [PREENCHER] Comando de migration (ex.: npm run migrate, alembic upgrade head, flyway migrate)
```

### Rodar seeds (opcional)

> **[PREENCHER]** Adicione instruções de seed quando disponíveis.

```bash
# [PREENCHER] Comando de seed
```

### Iniciar

```bash
# [PREENCHER] Comando para iniciar o backend (ex.: npm run dev, python manage.py runserver)
```

Backend disponível em `http://localhost:[PREENCHER]`.

---

## 🌐 Frontend

```bash
cd [diretório-do-frontend]
# [PREENCHER] Comando para instalar dependências
# [PREENCHER] Comando para iniciar o frontend
```

Frontend disponível em `http://localhost:[PREENCHER]`.

---

## ✅ Verificar

- Backend: `http://localhost:[PREENCHER]/health`
- Frontend: `http://localhost:[PREENCHER]`

---

## 🐛 Troubleshooting

| Problema | Solução |
|----------|---------|
| Erro de conexão com banco | Verificar se o banco está rodando e as credenciais em `.env` |
| Porta em uso | Alterar `PORT` no `.env` |
| Migrations falham | Verificar se o banco foi criado e credenciais estão corretas |

## 🧯 Troubleshooting

### Porta em uso
- Backend: ajuste `PORT` no arquivo de variáveis de ambiente
- Frontend: ajuste a porta conforme o framework

### Erro de conexão com DB
Verifique:
- Banco de dados rodando
- Credenciais no arquivo de variáveis de ambiente
- Porta do banco liberada

### JWT inválido
Verifique:
- Secret de autenticação configurado no backend
- token no header `Authorization`

---

## 📌 Onde salvar

Recomendado:
- `docs/local-setup.md`
