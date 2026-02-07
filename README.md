# Interactive 3D Particle Wave

Aplicacao frontend interativa focada em visualizacao 3D em tempo real, com controle por gestos via webcam e fallback por mouse. O projeto foi estruturado para manter alta experiencia visual sem comprometer performance, acessibilidade e manutenibilidade.

## 1) Visao Geral do Frontend

### Proposito
Entregar uma experiencia web imersiva, com interacao natural por gestos e painel de controle operacional para ajustes em tempo real.

### Publico-alvo
- Portfolios tecnicos e criativos
- Produtos interativos de demonstracao e marketing
- Estudos e prototipos de UX 3D com visao computacional no navegador

### Fluxos principais
1. Renderizacao da cena 3D e exibicao de status
2. Tentativa de inicializacao da camera com feedback de estado
3. Leitura de gesto ou fallback para mouse
4. Ajustes de qualidade, onda, sensibilidade e movimento reduzido
5. Uso de presets, atalhos e compartilhamento de configuracao

## 2) Stack e Tecnologias

- HTML5 sem framework
- CSS3 com design tokens e layout responsivo
- JavaScript ES Modules
- Three.js para renderizacao 3D
- MediaPipe Hands para hand tracking

## 3) Arquitetura Frontend

A arquitetura foi separada por responsabilidade para facilitar evolucao e manutencao:

- `src/app.js`
  - Orquestracao da aplicacao, loop principal, eventos e estado global
- `src/config.js`
  - Presets de qualidade, modos de gesto e perfis de onda
- `src/core/particle-field.js`
  - Simulacao de particulas, buffers e update por frame
- `src/core/gesture-controller.js`
  - Controle de camera, rastreamento e deteccao de gestos
- `src/core/script-loader.js`
  - Lazy-load de dependencias MediaPipe (carregamento sob demanda)
- `src/core/adaptive-quality.js`
  - Ajuste dinamico de qualidade baseado em FPS
- `src/core/ui-controller.js`
  - Camada de interface e interacoes com os componentes
- `src/core/settings-store.js`
  - Persistencia local das preferencias do usuario
- `src/core/url-state.js`
  - Sincronizacao da configuracao via query params (link compartilhavel)

## 4) Otimizacoes e Refactor Aplicados

### Performance
- Sistema de qualidade adaptativa: `Auto`, `Alta`, `Balanceada`, `Performance`
- Autoajuste por FPS no modo `Auto` para manter fluidez
- Buffers tipados e atributos dinamicos para update eficiente
- Throttle de atualizacao de FPS na UI para reduzir custo de layout
- Lazy-load do MediaPipe para reduzir custo inicial de carregamento

### Estado e escalabilidade
- Estado de configuracao unificado e saneado
- Persistencia em `localStorage`
- Sync de estado via URL para compartilhamento de configuracao
- Presets rapidos (`Calmo`, `Explorar`, `Impacto`) para reduzir friccao de uso

### Manutenibilidade
- Separacao clara entre logica 3D, gestos, UI e configuracao
- Componentizacao funcional via modulos reutilizaveis
- Menor acoplamento entre render e interface

## 5) UI/UX e Design System

### Reestruturacao visual
- Interface refeita com hierarquia clara de informacao
- Painel operacional com feedback imediato de estados criticos
- Tokens visuais centralizados (cores, radius, sombras, contraste)
- Microinteracoes leves e consistentes (toasts, botao ativo, transicoes)

### Usabilidade
- Controle por gestos + fallback por mouse
- Presets para mudanca rapida de contexto
- Atalhos de teclado para operacao continua
- Botao para copiar link com configuracao atual

## 6) Acessibilidade (WCAG) e SEO

### Acessibilidade
- `skip link` para navegacao por teclado
- Estados com `aria-live` e `aria-pressed`
- Indicadores de foco visiveis
- Suporte a `prefers-reduced-motion`
- Texto alternativo semantico e descricao da experiencia

### SEO tecnico
- Meta tags estruturadas (`description`, `robots`, `theme-color`)
- Open Graph e Twitter Cards
- Canonical URL
- JSON-LD (`SoftwareApplication`) para semantica de pagina

## 7) Funcionalidades Principais

- Simulacao 3D de particulas em tempo real
- Gestos detectados: `POINTER`, `FIST`, `VICTORY`, `HANG_LOOSE`, `OPEN`
- Perfis de onda: `Cosmos`, `Ripple`, `Storm`
- Qualidade adaptativa com autoajuste por desempenho
- Presets de experiencia
- Snapshot em PNG
- Compartilhamento de configuracao por URL
- Preview opcional de camera

## 8) Setup, Execucao e Build

### Requisitos
- Navegador moderno com suporte a WebGL e ES Modules
- Permissao de camera (opcional, para controle por gestos)

### Setup
```bash
git clone https://github.com/matheussiqueira-dev/interactive-3d-particle-wave.git
cd interactive-3d-particle-wave
```

### Execucao local
```bash
# Exemplo com Python
python -m http.server 5500
```

Abrir em:
```text
http://localhost:5500
```

### Build
Projeto estatico sem etapa obrigatoria de build.

## 9) Estrutura do Projeto

```text
interactive-3d-particle-wave/
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
|- .github/
|  `- workflows/static.yml
|- LICENSE
`- README.md
```

## 10) Boas Praticas Adotadas

- Single Responsibility por modulo
- Estado previsivel e persistente
- Progressive enhancement com fallback
- Performance orientada a device capability
- Acessibilidade tratada como requisito nativo
- Codigo limpo, sem duplicacoes desnecessarias

## 11) Melhorias Futuras

- Migracao de parte da simulacao para shader/GPU compute
- Painel de telemetria tecnica detalhada (frame time, memory)
- Tema visual configuravel por usuario
- Testes automatizados de regressao visual e performance
- Internacionalizacao (i18n)

Autoria: Matheus Siqueira  
Website: https://www.matheussiqueira.dev/
