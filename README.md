# Interactive 3D Particle Wave - Backend

Backend profissional para autenticacao, presets e telemetria operacional da experiencia Interactive 3D Particle Wave.

## Visao Geral do Backend

O backend oferece uma API REST versionada com:

- autenticacao e autorizacao baseada em JWT
- controle de presets publicos/privados com clonagem segura
- ingestao de telemetria para analise de performance
- endpoints de health/readiness para monitoramento
- documentacao OpenAPI com Swagger UI

## Arquitetura Adotada

Monolito modular com separacao clara de camadas e responsabilidades:

- `modules/*`: dominios (`auth`, `presets`, `telemetry`, `system`)
- `common/*`: middlewares, logger, erros e utilitarios
- `storage/*`: persistencia JSON com transacoes serializadas
- `config/*`: validacao de ambiente com Zod
- `docs/*`: contrato OpenAPI

## Tecnologias Utilizadas

- Node.js 20+
- Express 4
- Zod (validacao)
- JWT (`jsonwebtoken`)
- Bcrypt (`bcryptjs`)
- Helmet, CORS, Rate Limit
- Pino + pino-http
- Swagger UI
- Node test runner + Supertest

## API e Contratos

Base URL local:

```text
http://localhost:4000/api/v1
```

Docs interativas:

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
- `POST /presets/:presetId/clone`
- `PATCH /presets/:presetId`
- `DELETE /presets/:presetId`
- `POST /telemetry/events`
- `GET /telemetry/summary` (admin)

## Segurança e Confiabilidade

- senha com politica minima (10+ caracteres, maiuscula, minuscula, numero, simbolo)
- JWT stateless com expiracao configuravel
- RBAC por papel (`admin`, `editor`)
- validacao rigorosa de payloads
- bloqueio de chaves perigosas (`__proto__`, `constructor`, `prototype`)
- CORS allowlist + Helmet
- rate limit global + auth rate limit
- request id por requisicao e logs estruturados
- readiness check com validacao de storage

## Setup e Execucao

### 1) Instalar dependencias

```bash
cd backend
npm install
```

### 2) Configurar ambiente

```bash
cp .env.example .env
```

Defina no minimo:

- `JWT_SECRET` (valor forte)
- `CORS_ORIGIN`

### 3) Rodar em desenvolvimento

```bash
npm run dev
```

### 4) Rodar em producao

```bash
npm start
```

## Estrutura do Projeto

```text
backend/
|- data/
|  `- db.json
|- src/
|  |- app.js
|  |- server.js
|  |- container.js
|  |- config/
|  |  `- env.js
|  |- common/
|  |  |- async-handler.js
|  |  |- logger.js
|  |  |- errors/
|  |  |  `- app-error.js
|  |  `- middleware/
|  |     |- auth.js
|  |     |- error-handler.js
|  |     |- not-found.js
|  |     |- payload-guard.js
|  |     |- request-context.js
|  |     `- validate.js
|  |- modules/
|  |  |- auth/
|  |  |- presets/
|  |  |- telemetry/
|  |  `- system/
|  |- storage/
|  |  `- json-store.js
|  `- docs/
|     `- openapi.json
|- tests/
|  `- api.test.js
|- .env.example
`- package.json
```

## Boas Praticas e Padroes

- SOLID e DRY aplicados nas camadas
- contratos de erro padronizados
- versionamento de API (`/api/v1`)
- readiness para operacao em producao
- testes de integracao cobrindo fluxo critico

## Melhorias Futuras

- migracao para PostgreSQL com migracoes
- refresh token e rotacao
- observabilidade com OpenTelemetry
- cache para queries frequentes
- auditoria de seguranca no CI

Autoria: Matheus Siqueira  
Website: https://www.matheussiqueira.dev/
