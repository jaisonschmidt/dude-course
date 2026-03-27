# 🗄️ Database

<!-- TEMPLATE: Preencha este documento com o schema do banco de dados do seu projeto. -->
<!-- Consulte docs/engineering-docs-recommendation.md para orientações detalhadas. -->

Este documento descreve o **modelo físico de dados** do projeto.

Para o modelo de domínio e regras de negócio consulte: `docs/domain.md`

Para decisões de arquitetura consulte: `docs/architecture.md`

---

## ✅ Princípios

- **MySQL 8.0** como banco de dados relacional.
- **Prisma ORM** para acesso a dados, migrations e schema management.
- **FKs e constraints** habilitadas para integridade referencial.
- **Chaves primárias**: `INT AUTO_INCREMENT` para entidades principais.
- **Auditoria mínima** com `created_at` (`DEFAULT CURRENT_TIMESTAMP`) e `updated_at` (`ON UPDATE CURRENT_TIMESTAMP`).
- **Unicidade** garantida por índices únicos conforme domínio.
- **Integridade referencial** com FKs e regras de `ON DELETE`/`ON UPDATE`.
- **Charset**: `utf8mb4` com collation `utf8mb4_unicode_ci` (suporte completo a Unicode).
- **Engine**: InnoDB (padrão MySQL 8.0, suporta transações e FKs).
- Decisão registrada em: `docs/adr/0002-database-mysql.md`.

> **Nota charset (Docker):** Para garantir `utf8mb4` no ambiente local via Docker, o `docker-compose.yml` inicia o MySQL com `--character-set-server=utf8mb4 --collation-server=utf8mb4_unicode_ci`. Sem essa configuração explícita, o servidor pode subir com `latin1` dependendo da imagem, corrompendo dados Unicode silenciosamente.

---

## 🧱 Tabelas

<!-- Repita esta seção para cada tabela do sistema. -->

### users

**Descrição:** armazena contas de usuários da plataforma, incluindo learners e administradores.

#### Campos

- `id`: identificador interno
- `name`: nome do usuário
- `email`: email único para autenticação
- `password_hash`: hash seguro da senha
- `role`: papel do usuário (`learner` ou `admin`)
- `created_at`, `updated_at`

#### Regras/Constraints

- `email` **único**
- `role` restrito aos valores aceitos pela aplicação

### courses

**Descrição:** armazena os cursos estruturados da plataforma.

#### Campos

- `id`: identificador interno
- `title`: título do curso
- `description`: descrição do curso
- `thumbnail_url`: imagem de capa
- `status`: estado de publicação (`draft`, `published`, `unpublished`)
- `created_at`, `updated_at`

#### Regras/Constraints

- índice por `status` para listagens públicas
- publicação depende de regras validadas na camada de serviço

### lessons

**Descrição:** armazena as aulas pertencentes a um curso.

#### Campos

- `id`: identificador interno
- `course_id`: FK para `courses`
- `title`: título da aula
- `description`: descrição da aula
- `youtube_url`: URL do vídeo no YouTube
- `position`: ordem da aula no curso
- `created_at`, `updated_at`

#### Regras/Constraints

- FK para `courses(id)`
- unicidade composta em `course_id + position`
- índice por `course_id`

### enrollments

**Descrição:** registra a participação de um usuário em um curso.

#### Campos

- `id`: identificador interno
- `user_id`: FK para `users`
- `course_id`: FK para `courses`
- `started_at`: início do curso
- `completed_at`: data de conclusão do curso
- `created_at`, `updated_at`

#### Regras/Constraints

- FK para `users(id)`
- FK para `courses(id)`
- unicidade composta em `user_id + course_id`

### lesson_progress

**Descrição:** registra conclusão de aulas por usuário.

#### Campos

- `id`: identificador interno
- `user_id`: FK para `users`
- `course_id`: FK para `courses`
- `lesson_id`: FK para `lessons`
- `completed_at`: data da conclusão
- `created_at`, `updated_at`

#### Regras/Constraints

- FK para `users(id)`
- FK para `courses(id)`
- FK para `lessons(id)`
- unicidade composta em `user_id + lesson_id`

### certificates

**Descrição:** registra certificados emitidos para cursos concluídos.

#### Campos

- `id`: identificador interno
- `user_id`: FK para `users`
- `course_id`: FK para `courses`
- `certificate_code`: código único de referência do certificado
- `issued_at`: data de emissão
- `created_at`, `updated_at`

#### Regras/Constraints

- FK para `users(id)`
- FK para `courses(id)`
- `certificate_code` **único**
- unicidade composta em `user_id + course_id`

---

## 🧠 Observações importantes (Domínio ↔ Banco)

<!-- Descreva cálculos, derivações ou regras que conectam domínio e banco. -->

- completude do curso é derivada da relação entre lessons obrigatórias do curso e registros em `lesson_progress`
- publicação de curso depende de validações da camada de serviço; o banco garante estrutura e unicidade, mas não substitui todas as regras de publicação
- emissão de certificado depende de conclusão de curso e deve respeitar unicidade por `user_id + course_id`
- registros históricos de progresso e certificado não devem ser invalidados por exclusões destrutivas de cursos sem política explícita

---

## 🧾 Schema SQL

<!-- Cole o DDL de referência para migrations. -->

```sql
CREATE TABLE users (
	id INT AUTO_INCREMENT PRIMARY KEY,
	name VARCHAR(120) NOT NULL,
	email VARCHAR(255) NOT NULL UNIQUE,
	password_hash VARCHAR(255) NOT NULL,
	role VARCHAR(20) NOT NULL DEFAULT 'learner',
	created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE courses (
	id INT AUTO_INCREMENT PRIMARY KEY,
	title VARCHAR(180) NOT NULL,
	description TEXT NOT NULL,
	thumbnail_url VARCHAR(512) NULL,
	status VARCHAR(20) NOT NULL DEFAULT 'draft',
	created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	INDEX idx_courses_status (status)
);

CREATE TABLE lessons (
	id INT AUTO_INCREMENT PRIMARY KEY,
	course_id INT NOT NULL,
	title VARCHAR(180) NOT NULL,
	description TEXT NULL,
	youtube_url VARCHAR(512) NOT NULL,
	position INT NOT NULL,
	created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT fk_lessons_course FOREIGN KEY (course_id) REFERENCES courses(id),
	CONSTRAINT uq_lessons_course_position UNIQUE (course_id, position)
);

CREATE TABLE enrollments (
	id INT AUTO_INCREMENT PRIMARY KEY,
	user_id INT NOT NULL,
	course_id INT NOT NULL,
	started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	completed_at TIMESTAMP NULL,
	created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT fk_enrollments_user FOREIGN KEY (user_id) REFERENCES users(id),
	CONSTRAINT fk_enrollments_course FOREIGN KEY (course_id) REFERENCES courses(id),
	CONSTRAINT uq_enrollments_user_course UNIQUE (user_id, course_id)
);

CREATE TABLE lesson_progress (
	id INT AUTO_INCREMENT PRIMARY KEY,
	user_id INT NOT NULL,
	course_id INT NOT NULL,
	lesson_id INT NOT NULL,
	completed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT fk_progress_user FOREIGN KEY (user_id) REFERENCES users(id),
	CONSTRAINT fk_progress_course FOREIGN KEY (course_id) REFERENCES courses(id),
	CONSTRAINT fk_progress_lesson FOREIGN KEY (lesson_id) REFERENCES lessons(id),
	CONSTRAINT uq_progress_user_lesson UNIQUE (user_id, lesson_id)
);

CREATE TABLE certificates (
	id INT AUTO_INCREMENT PRIMARY KEY,
	user_id INT NOT NULL,
	course_id INT NOT NULL,
	certificate_code VARCHAR(64) NOT NULL UNIQUE,
	issued_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT fk_certificates_user FOREIGN KEY (user_id) REFERENCES users(id),
	CONSTRAINT fk_certificates_course FOREIGN KEY (course_id) REFERENCES courses(id),
	CONSTRAINT uq_certificates_user_course UNIQUE (user_id, course_id)
);
```

Observação:
Este DDL é uma referência inicial para alinhar bootstrap e modelagem. A implementação efetiva no pacote `database/` deve usar Prisma como fonte de verdade e pode evoluir detalhes de tipos/constraints desde que permaneça compatível com estas regras documentadas.

---

## 🔄 Ciclo de vida de migrations

**Regra central:** migrations são **criadas** pelo desenvolvedor em desenvolvimento local e **versionadas no Git**. Todos os outros ambientes (CI, HML, produção) apenas as aplicam — nunca as criam.

### Comandos Prisma

| Comando | Quando usar | O que faz |
|---|---|---|
| `prisma migrate dev` | **Somente desenvolvimento local** | Detecta divergências, cria novo arquivo de migration, pode resetar o banco |
| `prisma migrate deploy` | CI, HML e Produção | Aplica apenas migrations pendentes já existentes; determinístico, sem prompts, sem reset |

> ⚠️ **Nunca executar `migrate dev` em staging ou produção** — pode resetar dados irreversivelmente.

### Versioning

O diretório `database/prisma/migrations/` é **artefato versionado no Git** — não deve ser ignorado nem gerado em runtime. É a fonte de verdade para todos os ambientes.

Se o CI detectar drift entre o schema e as migrations, o pipeline falha imediatamente — isso é intencional e garante consistência.

### Fluxo completo

```
Dev revisa schema.prisma vs docs/database.md
        │
        ▼
Dev cria migration (prisma migrate dev)
        │
        ▼
  git push → PR aberto
        │
        ▼
  CI: prisma migrate deploy (banco efêmero) + testes
        │
        ▼
  Merge na main
        │
        ▼
  Deploy HML: prisma migrate deploy → banco hml atualizado → app sobe
        │
        ▼
  Aprovação manual (protection rule de prod)
        │
        ▼
  Deploy PROD: prisma migrate deploy → banco prod atualizado → app sobe
```

---

## 🌍 Ambientes e nomes de banco

| Ambiente | Nome do banco | Comando Prisma | Origem da `DATABASE_URL` |
|---|---|---|---|
| Dev local | `dude_course` | `migrate dev` | `database/.env` (gitignored) |
| Testes (local e CI) | `dude_course_test` | `migrate deploy` | `integration-tests/.env` / CI secret |
| HML | `dude_course_staging` | `migrate deploy` | GitHub Environment secret `hml` |
| Produção | `dude_course_prod` | `migrate deploy` | GitHub Environment secret `prod` |

**Notas importantes:**
- O banco de testes é sempre **isolado por nome** — nunca compartilha instância com dev
- Nos ambientes remotos (HML e prod) não existe arquivo `.env`; as variáveis são injetadas pela plataforma via GitHub Environments
- A estratégia completa está documentada na ADR: `docs/adr/0005-database-environments.md`
