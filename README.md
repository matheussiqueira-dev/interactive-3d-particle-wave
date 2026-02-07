# Interactive 3D Particle Wave

Aplicacao frontend interativa de visualizacao 3D em tempo real, com controle por gestos via webcam, fallback por mouse e painel operacional orientado a UX.

## Visao Geral do Frontend

O produto foi projetado para transformar uma demo visual em uma experiencia de uso profissional, com foco em:

- imersao visual em tempo real
- controle natural por gestos
- configuracao rapida de performance e comportamento
- clareza operacional para usuarios iniciantes e avancados

### Publico-alvo
- portfolios tecnicos e criativos
- demonstracoes de produto e tecnologia
- times de UX/Frontend que precisam de base escalavel para experiencias interativas

## Stack e Tecnologias Utilizadas

### Frontend
- HTML5 sem framework
- CSS3 com Design Tokens
- JavaScript ES Modules
- Three.js (renderizacao 3D)
- MediaPipe Hands (rastreamento de gestos)

### Backend (suporte opcional no mesmo repositório)
- Node.js + Express
- JWT, Zod, Helmet, CORS, Rate Limit
- API modular para autenticacao, presets e telemetria

## Arquitetura Frontend

Arquitetura modular com separacao clara de responsabilidades:

- `src/app.js`: orquestracao de estado, fluxo, atalhos e runtime
- `src/config.js`: presets, modos, perfis de onda e defaults
- `src/core/particle-field.js`: motor de particulas e update por frame
- `src/core/gesture-controller.js`: ciclo de camera e leitura de gestos
- `src/core/ui-controller.js`: camada de interface desacoplada
- `src/core/adaptive-quality.js`: ajuste adaptativo por FPS
- `src/core/settings-store.js`: persistencia local de preferencias
- `src/core/url-state.js`: compartilhamento de estado via URL

## UX/UI Rework (Nivel Senior)

Principais entregas aplicadas:

- fluxo guiado em jornada (camera -> gesto -> ajuste)
- painel de controle reorganizado por intencao
- cards de contexto em tempo real no palco principal
- recomendacao dinamica de proximo passo
- modo foco para reduzir distracoes em sessoes imersivas
- modo de alto contraste para acessibilidade avancada
- design system com tokens consistentes de cor, espaco e estados

Documentacao de design:

- `docs/UX-UI-DECISIONS.md`

## Funcionalidades Principais

- simulacao 3D com alta densidade de particulas
- gestos suportados: `POINTER`, `FIST`, `VICTORY`, `HANG_LOOSE`, `OPEN`
- perfis visuais: `Cosmos`, `Ripple`, `Storm`
- presets de experiencia: `Calmo`, `Explorar`, `Impacto`
- qualidade adaptativa por desempenho (modo Auto)
- snapshot PNG
- link compartilhavel com estado de configuracao
- fallback por mouse quando camera indisponivel
- atalhos de teclado para operacao rapida

## Otimizacoes de Performance

- particulas com buffers tipados reutilizaveis
- throttling de atualizacao de indicadores visuais
- lazy load de dependencias de visao computacional
- update de cor de particulas em densidade alta com estrategia de frame slicing
- persistencia de configuracoes com debounce para reduzir churn de IO

## Acessibilidade e Responsividade

### Acessibilidade
- `skip-link` para navegacao por teclado
- `aria-live`, `aria-pressed` e `aria-busy` em estados dinamicos
- foco visivel padronizado em componentes interativos
- `prefers-reduced-motion` respeitado
- modo de alto contraste dedicado

### Responsividade
- layouts adaptativos para desktop, tablet e mobile
- reorganizacao de painéis e cards de estado por breakpoint
- manutenção de usabilidade em viewport reduzida

## Estrutura do Projeto

```text
.
|- index.html
|- styles/
|  `- main.css
|- src/
|  |- app.js
|  |- config.js
|  `- core/
|     |- adaptive-quality.js
|     |- gesture-controller.js
|     |- particle-field.js
|     |- performance-monitor.js
|     |- script-loader.js
|     |- settings-store.js
|     |- ui-controller.js
|     `- url-state.js
|- docs/
|  `- UX-UI-DECISIONS.md
|- backend/
|  `- (API opcional para auth/presets/telemetry)
`- README.md
```

## Setup e Execucao

### Frontend (local)
```bash
# na raiz do projeto
python -m http.server 5500
```

Acesse:
```text
http://localhost:5500
```

### Backend (opcional)
```bash
cd backend
npm install
npm run dev
```

## Build

Projeto frontend estatico, sem etapa obrigatoria de build.

## Boas Praticas Adotadas

- arquitetura modular e desacoplada
- estado previsivel e persistente
- UX orientada a fluxo e clareza operacional
- design system com tokens reutilizaveis
- acessibilidade tratada como requisito de produto
- desempenho adaptativo para diferentes capacidades de hardware

## Melhorias Futuras

- shader pipeline customizado para escalabilidade acima de 100k particulas
- painel de analytics UX (tempo de sessao, funil de ativacao)
- biblioteca de presets sincronizada com backend autenticado
- testes automatizados de regressao visual e acessibilidade
- internacionalizacao (i18n)

Autoria: Matheus Siqueira  
Website: https://www.matheussiqueira.dev/
