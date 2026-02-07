# Interactive 3D Particle Wave - Backend and API Platform

Backend profissional para a aplicacao Interactive 3D Particle Wave, com foco em arquitetura modular, seguranca, observabilidade e escalabilidade operacional.

## Visao Geral do Backend

Este backend entrega uma API REST versionada para:

- autenticacao e autorizacao baseada em JWT
- gerenciamento de presets de simulacao (privados/publicos)
- ingestao e analise de telemetria de performance
- endpoints operacionais de health/readiness
- documentacao OpenAPI com Swagger UI

O dominio principal atende a experiencia 3D da aplicacao frontend, permitindo persistencia de configuracoes, controle de acesso e monitoramento de uso em tempo real.

## Arquitetura Adotada

Arquitetura modular por contexto de dominio, com separacao de responsabilidades por camada:

- `modules/*`: dominio e casos de uso (`auth`, `presets`, `telemetry`, `system`)
- `common/*`: middlewares, tratamento de erro, logger e utilitarios compartilhados
- `storage/*`: persistencia em JSON com transacao serializada
- `config/*`: validacao e normalizacao de variaveis de ambiente
- `docs/*`: contrato OpenAPI

Pontos de desenho arquitetural:

- estilo de monolito modular (simples para evolucao incremental)
- contratos claros entre controller -> service -> repository
- baixo acoplamento com DI manual via `container.js`
- tratamento centralizado de erros e validacao de entrada com Zod

## Stack Tecnologica

- Node.js 20+
- Express 4
- Zod (validacao de schema)
- JWT (`jsonwebtoken`) para auth stateless
- Bcrypt (`bcryptjs`) para hash de senha
- Helmet, CORS e rate limit para hardening
- Pino + pino-http para logging estruturado
- Swagger UI para documentacao de API
- Node test runner + Supertest para testes de integracao

## Estrutura do Projeto

```text
.
|- backend/
|  |- data/
|  |  `- db.json
|  |- src/
|  |  |- app.js
|  |  |- server.js
|  |  |- container.js
|  |  |- config/
|  |  |  `- env.js
|  |  |- common/
|  |  |  |- async-handler.js
|  |  |  |- logger.js
|  |  |  |- errors/
|  |  |  |  `- app-error.js
|  |  |  `- middleware/
|  |  |     |- auth.js
|  |  |     |- error-handler.js
|  |  |     |- not-found.js
|  |  |     |- payload-guard.js
|  |  |     |- request-context.js
|  |  |     `- validate.js
|  |  |- modules/
|  |  |  |- auth/
|  |  |  |- presets/
|  |  |  |- telemetry/
|  |  |  `- system/
|  |  |- storage/
|  |  |  `- json-store.js
|  |  `- docs/
|  |     `- openapi.json
|  |- tests/
|  |  `- api.test.js
|  |- .env.example
|  `- package.json
|- index.html
|- src/
|- styles/
`- README.md
```

## API e Contratos

Base URL local:

```text
http://localhost:4000/api/v1
```

Documentacao interativa:

```text
http://localhost:4000/docs
```

Endpoints principais:

- `GET /system/health`
- `GET /system/ready`
- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`
- `GET /presets`
- `GET /presets/:presetId`
- `POST /presets`
- `PATCH /presets/:presetId`
- `DELETE /presets/:presetId`
- `POST /telemetry/events`
- `GET /telemetry/summary` (admin)

## Seguranca e Confiabilidade

Medidas implementadas:

- autenticao JWT stateless
- autorizacao por papel (`admin`, `editor`)
- hash de senha com bcrypt
- validacao estrita de payload com Zod
- bloqueio de chaves perigosas (`__proto__`, `constructor`, `prototype`)
- Helmet para headers de seguranca
- CORS com allowlist
- rate limit global + rate limit reforcado em auth
- tratamento centralizado de excecoes com codigos de erro padronizados
- request id por requisicao para correlacao de logs

## Setup e Execucao

### 1. Instalar dependencias

```bash
cd backend
npm install
```

### 2. Configurar ambiente

```bash
cp .env.example .env
```

Defina no minimo:

- `JWT_SECRET` (valor forte)
- `CORS_ORIGIN`

### 3. Rodar em desenvolvimento

```bash
npm run dev
```

### 4. Rodar em producao

```bash
npm start
```

## Testes

Executar testes de integracao:

```bash
cd backend
npm test
```

A suite cobre fluxo critico:

- health check
- registro e login
- criacao e leitura de preset autenticado
- ingestao de telemetria
- autorizacao no endpoint administrativo

## Boas Praticas e Padroes

- SOLID aplicado nas camadas de service/repository
- DRY em middlewares e validacoes
- clean boundaries por modulo
- contratos de erro consistentes
- versionamento de API em `/api/v1`
- design orientado a evolucao incremental para banco relacional futuro

## Melhorias Futuras

- migrar persistencia JSON para PostgreSQL (com migracoes)
- refresh token com revogacao e rotacao
- auditoria de seguranca automatizada no CI
- cache para queries mais acessadas (Redis)
- tracing distribuido com OpenTelemetry
- testes de carga e SLOs por endpoint
- RBAC mais granular por escopo

Autoria: Matheus Siqueira  
Website: https://www.matheussiqueira.dev/
