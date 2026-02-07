# Interactive 3D Particle Wave

Experiencia web 3D interativa com renderizacao em tempo real, controle por gestos via webcam e fallback por mouse. O projeto foi refatorado para uma arquitetura modular, com foco em performance, manutenibilidade e UX de nivel profissional.

## Visao Geral

O sistema renderiza um campo de particulas dinamico com Three.js e aplica interacoes orientadas por gesto (MediaPipe Hands) para alterar comportamento da simulacao em tempo real.

### Publico-alvo

- Portfolios tecnicos e demonstracoes criativas
- Times de produto que precisam de prototipos visuais interativos
- Estudos de integracao entre visualizacao 3D e visao computacional no browser

## Tecnologias Utilizadas

- HTML5 (sem dependencia de framework)
- CSS3 moderno (layout responsivo, tokens visuais e acessibilidade)
- JavaScript ES Modules
- [Three.js](https://threejs.org/) para pipeline 3D
- [MediaPipe Hands](https://developers.google.com/mediapipe) para hand tracking

## Principais Funcionalidades

- Simulacao 3D com particulas de alta densidade e perfis de onda dinamicos
- Reconhecimento de gestos: `POINTER`, `FIST`, `VICTORY`, `HANG_LOOSE`, `OPEN`
- Controle adaptativo de qualidade (Auto, Alta, Balanceada, Performance)
- Painel de controle em tempo real para sensibilidade, perfil de onda e movimento reduzido
- Telemetria de FPS e quantidade de particulas em HUD
- Fallback por mouse quando a camera nao esta disponivel
- Snapshot do canvas (download PNG)
- Atalhos de teclado para operacao rapida

## Melhorias Tecnicas Aplicadas

- Refactor de arquitetura monolitica para estrutura modular (`src/`)
- Separacao de responsabilidades: render, particulas, gestos, UI e configuracoes
- Buffers tipados reutilizaveis e atributos dinamicos para melhor desempenho
- Sistema de suavizacao de estado (transicoes de modo mais estaveis)
- Gestos com filtro temporal para reduzir jitter
- Tratamento de estados de camera com fallback seguro
- UI responsiva e com feedback continuo de status

## Gestos e Comportamentos

- `POINTER`: controle livre da area de influencia
- `FIST`: modo de impacto com maior energia e dinamica agressiva
- `VICTORY`: modo macro com movimento mais lento e particulas maiores
- `HANG_LOOSE`: congelamento da progressao temporal
- `OPEN`: modo zen com dinamica suave

## Instalacao e Uso

1. Clone o repositorio:

```bash
git clone https://github.com/matheussiqueira-dev/interactive-3d-particle-wave.git
cd interactive-3d-particle-wave
```

2. Rode em servidor estatico local (recomendado para camera):

```bash
# Exemplo com Python
python -m http.server 5500
```

3. Abra no navegador:

```text
http://localhost:5500
```

4. Permita acesso a camera quando solicitado.

## Estrutura do Projeto

```text
interactive-3d-particle-wave/
|- index.html
|- styles/
|  `- main.css
|- src/
|  |- app.js
|  |- config.js
|  `- core/
|     |- gesture-controller.js
|     |- particle-field.js
|     |- performance-monitor.js
|     `- ui-controller.js
|- .github/
|  `- workflows/static.yml
|- LICENSE
`- README.md
```

## Boas Praticas Utilizadas

- Arquitetura modular e codigo orientado a responsabilidade unica
- Parametrizacao centralizada para facilitar evolucao do produto
- Design system leve com variaveis CSS e consistencia visual
- Estados de erro e fallback previstos para resiliencia
- Otimizacoes progressivas baseadas no perfil de hardware
- Controles com foco em usabilidade e acessibilidade

## Fluxo Principal de Uso

1. O app inicializa render e painel de controle
2. A camera e solicitada para ativar rastreamento de mao
3. Gestos atualizam o modo interativo da simulacao
4. Usuario pode ajustar qualidade, perfil de onda e sensibilidade
5. Em caso de falha de camera, o controle por mouse assume automaticamente

## Possiveis Melhorias Futuras

- Pipeline com shaders customizados (GPU) para escalar acima de 100k particulas
- Gravar e exportar sessao em video
- Sistema de presets personalizados por usuario
- Suporte a multilanguage (i18n)
- Modo colaborativo em tempo real (WebSocket)
- Testes automatizados de regressao visual e performance

## Licenca

Este projeto esta sob a licenca MIT. Veja o arquivo `LICENSE` para detalhes.

Autoria: Matheus Siqueira  
Website: https://www.matheussiqueira.dev/
