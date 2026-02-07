# UX/UI Decisions - Interactive 3D Particle Wave

## 1. Contexto do Produto

### Objetivo do produto
Oferecer uma experiencia imersiva de visualizacao 3D controlada por gestos, com fallback por mouse e alta confiabilidade operacional.

### Publico-alvo
- Pessoas usuarias explorando uma demo interativa
- Recrutadores e stakeholders avaliando qualidade de produto
- Times tecnicos que precisam de uma base escalavel para evolucao de UX

### Valor de negocio
- Aumenta tempo de engajamento via interacao em tempo real
- Demonstra maturidade tecnica e visual do produto
- Permite experimentacao com configuracoes compartilhaveis

## 2. Diagnostico de UX (antes do refactor)

### Principais friccoes observadas
- Densidade informacional elevada no painel lateral, sem progressao guiada
- Pouca orientacao de "proximo passo" para usuario iniciante
- Sinais operacionais dispersos, dificultando leitura rapida de estado
- Jornada de ativacao (camera -> gesto -> ajuste) nao explicita

### Riscos de abandono
- Bloqueio inicial por permissao de camera sem contexto pedagogico
- Falta de previsibilidade para quem nao domina atalhos/gestos

## 3. Direcao de UX aplicada

### Estrategia
- Transformar a interface em um "command deck" com estados orientados por tarefa
- Tornar onboarding progressivo e autoexplicativo
- Centralizar sinais de contexto onde a atencao do usuario ja esta (palco)

### Mudancas de fluxo
1. Header com valor da experiencia + CTA principal (ativar sensor)
2. Palco com cards de sinal operacional (input, perfil, sensibilidade, recomendacao)
3. Jornada guiada em 3 passos com feedback visual de conclusao
4. Painel lateral segmentado por intencao: calibragem, interacao, preset, acoes

### Microinteracoes
- Toast de confirmacao para acoes criticas
- Indicador de passo concluido na jornada
- Estado ativo para presets
- Alteracao contextual de recomendacao em tempo real

## 4. Direcao de UI aplicada

### Linguagem visual
- Tema "tech-organic" com verdes e tons naturais para diferenciar de dashboards comuns
- Forte contraste entre fundo e superficies para foco no palco
- Tipografia: `Outfit` (interface) + `JetBrains Mono` (dados operacionais)

### Hierarquia visual
- Nivel 1: palco 3D e sinais contextuais
- Nivel 2: controles essenciais (qualidade, onda, sensibilidade)
- Nivel 3: atalhos e informacoes auxiliares

### Consistencia
- Cards com raio e borda padronizados
- Estados de botoes uniformes (default/hover/active/focus)
- Escalas de espacamento consistentes no painel

## 5. Design System (tokens e componentes)

### Tokens principais
- Cor base: `--bg-void`, `--bg-forest`, `--bg-olive`
- Superficie: `--surface-soft`, `--surface-strong`, `--surface-elevated`
- Texto: `--text-primary`, `--text-secondary`, `--text-muted`
- Acentos: `--accent-lime`, `--accent-mint`, `--accent-amber`, `--accent-danger`
- Forma: `--radius-lg`, `--radius-md`, `--radius-sm`

### Componentes reutilizaveis
- `pill` (status e metricas)
- `signal-card` (contexto rapido no palco)
- `control-card` (blocos funcionais do painel)
- `legend-chip` (tags de ajuda)
- `journey-list` com estado `is-done`

### Estados considerados
- Hover, active e focus visivel para controles interativos
- Estados semanticos de tracking: `active`, `warning`, `error`
- Estados de progresso de jornada por classe utilitaria

## 6. Acessibilidade (WCAG)

### Melhorias aplicadas
- `skip-link` para navegacao por teclado
- `aria-live` para mensagens de status
- `aria-pressed` em controles de toggle
- Contraste reforcado entre texto e fundo
- Focus ring consistente em todos os controles-chave
- Suporte a `prefers-reduced-motion`

### Pontos para evolucao
- Incluir auditoria automatica com axe/lighthouse no CI
- Expandir semantica para rotulos dinâmicos narráveis por leitores de tela

## 7. Responsividade e adaptacao

### Breakpoints
- `1270px`: painel lateral vira bloco abaixo do palco
- `1060px`: compactacao de metricas e sinais em 2 colunas
- `760px`: layout mobile de coluna unica

### Comportamento mobile
- Sinais do palco empilhados
- Presets e acoes em 1 coluna
- Footer adaptado para leitura vertical

## 8. Hand-off para Engenharia

### Arquivos impactados
- `index.html`
- `styles/main.css`
- `src/app.js`
- `src/core/ui-controller.js`

### Contratos de UI adicionados
- Novos IDs: `heroCameraBtn`, `heroPresetBtn`, `signalSourceLabel`, `signalWaveLabel`, `signalSensitivityLabel`, `recommendationLabel`, `journeyStepCamera`, `journeyStepGesture`, `journeyStepTune`
- Novos métodos de UI: `setRecommendation`, `setJourneyState`, `setSignalWave`, `setSignalSensitivity`

### Decisao tecnica importante
A UX agora e atualizada por estado de operacao (camera, gesto, tuning), nao apenas por evento isolado. Isso reduz ambiguidade e melhora previsibilidade da experiencia.
