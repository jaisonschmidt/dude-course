# 📚 Domain Model

<!-- TEMPLATE: Preencha este documento com o modelo de domínio do seu projeto. -->
<!-- Consulte docs/engineering-docs-recommendation.md para orientações detalhadas. -->

Este documento descreve o **modelo de domínio** do projeto.

Ele define:

- entidades do sistema
- relacionamentos
- regras de negócio
- estados do domínio

Para detalhes de arquitetura consulte: `docs/architecture.md`

Para visão geral do projeto consulte: `README.md`

---

## 🧩 Entidades do Domínio

As entidades centrais do domínio do Dude Course para o MVP são:

- `User`
- `Course`
- `Lesson`
- `Enrollment`
- `LessonProgress`
- `Certificate`

Observação:
O papel de administrador é tratado inicialmente como uma capacidade do usuário autenticado e privilegiado. O detalhamento fino de RBAC pode evoluir depois, sem bloquear o bootstrap do projeto.

---

## Entidade: User

### Descrição

Representa a conta do usuário da plataforma. Pode atuar como learner e, quando aplicável, possuir privilégios administrativos para gestão de conteúdo.

### Atributos

```
id
name
email
passwordHash
role
createdAt
updatedAt
```

### Regras

- `email` deve ser único por conta.
- `passwordHash` deve armazenar apenas hash seguro da senha.
- `role` suporta ao menos `learner` e `admin` para o MVP.

---

## Entidade: Course

### Descrição

Representa um curso estruturado, composto por aulas ordenadas e metadados necessários para exibição e publicação.

### Atributos

```
id
title
description
thumbnailUrl
status
createdAt
updatedAt
```

### Regras

- curso só pode ser exibido a learners quando estiver `published`.
- curso deve possuir metadados mínimos antes da publicação.
- curso deve possuir ao menos uma lesson válida antes da publicação.

---

## Entidade: Lesson

### Descrição

Representa uma aula pertencente a um curso, com referência a vídeo do YouTube e ordem explícita dentro do fluxo de aprendizagem.

### Atributos

```
id
courseId
title
description
youtubeUrl
position
createdAt
updatedAt
```

### Regras

- lesson pertence a exatamente um curso.
- `position` define a ordem da aula no curso.
- `youtubeUrl` deve apontar para um vídeo válido e embeddable do YouTube.

---

## Entidade: Enrollment

### Descrição

Representa o vínculo de participação de um usuário em um curso publicado.

### Atributos

```
id
userId
courseId
startedAt
completedAt
createdAt
updatedAt
```

### Regras

- um usuário pode iniciar múltiplos cursos.
- deve existir no máximo um enrollment por par `userId` + `courseId`.
- `completedAt` só pode ser preenchido quando o curso estiver concluído.

---

## Entidade: LessonProgress

### Descrição

Representa a conclusão de uma lesson por um learner específico.

### Atributos

```
id
userId
courseId
lessonId
completedAt
createdAt
updatedAt
```

### Regras

- progresso é individual por learner.
- uma lesson não pode ser contada múltiplas vezes para inflar progresso.
- deve existir no máximo um registro de conclusão por par `userId` + `lessonId`.

---

## Entidade: Certificate

### Descrição

Representa o certificado emitido para um learner após a conclusão de um curso.

### Atributos

```
id
userId
courseId
issuedAt
certificateCode
createdAt
updatedAt
```

### Regras

- certificado só pode ser emitido após conclusão do curso.
- certificado pertence ao learner que concluiu o curso.
- deve existir no máximo um certificado ativo por par `userId` + `courseId` no MVP.

---

## 🔗 Relacionamentos

<!-- Descreva os relacionamentos entre entidades. Pode usar diagrama ASCII ou texto. -->

```
User 1 ─── * Enrollment * ─── 1 Course
Course 1 ─── * Lesson
User 1 ─── * LessonProgress * ─── 1 Lesson
User 1 ─── * Certificate * ─── 1 Course
```

Resumo:

- um `Course` possui muitas `Lesson`
- um `User` participa de muitos `Course` via `Enrollment`
- um `User` acumula progresso por `Lesson` via `LessonProgress`
- um `Certificate` referencia exatamente um `User` e um `Course`

---

## 📊 Regras de Negócio

<!-- Liste as regras de negócio globais do sistema, agrupadas por contexto. -->

### Acesso e autenticação

- usuário autenticado é obrigatório para progresso, dashboard e certificado.
- áreas públicas podem expor homepage, catálogo e detalhe de curso publicado.
- funcionalidades administrativas exigem usuário com privilégio de admin.

### Publicação de cursos

- apenas cursos publicados são visíveis para learners.
- curso precisa de título, descrição e ao menos uma lesson válida antes de ser publicado.

### Progresso

- progresso é registrado por lesson e por usuário.
- conclusão duplicada de uma lesson não pode inflar o progresso.
- progresso do curso é calculado a partir das lessons obrigatórias concluídas.

### Conclusão e certificado

- curso é concluído quando todas as lessons obrigatórias forem marcadas como concluídas.
- certificado só pode ser emitido após conclusão do curso.
- certificado deve conter ao menos nome do learner, nome do curso e data de conclusão/emissão.

---

## 🔄 Fluxo Principal

<!-- Descreva o fluxo principal do sistema (happy path). -->

```
Registro/Login → Catálogo de cursos → Detalhe do curso → Consumo das lessons → Marcação de lessons concluídas → Atualização do progresso → Conclusão do curso → Emissão de certificado
```

Observação:
Este documento cobre o nível mínimo necessário para bootstrap e alinhamento técnico inicial. Regras mais detalhadas continuam sendo complementadas pelos documentos de produto em `docs/product/v1/`.
