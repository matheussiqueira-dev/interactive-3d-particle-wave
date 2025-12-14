# Partículas de Onda 3D Interativas

Um experimento de visualização de partículas 3D interativo que responde a gestos manuais em tempo real. Construído com **Three.js** e **MediaPipe Hand Tracking**.

## Visão Geral

Este projeto renderiza um campo dinâmico de 28.000 partículas que se movem em um padrão de onda. Usando a webcam do seu computador, você pode controlar a visualização através de gestos manuais. O sistema detecta a posição da sua mão e gestos específicos para alterar a velocidade, cor e comportamento da simulação.

## Funcionalidades

- **Renderização 3D em Tempo Real**: Sistema de partículas de alta performance usando Three.js.
- **Controle por Gestos Manuais**: Alimentado pelo MediaPipe.
- **Modos Interativos**:
  - **Pointer**: Mova sua mão para rotacionar a galáxia e perturbar as partículas.
  - **Punho Fechado**: "Modo Fúria" - Aumenta a velocidade, torna-se vermelho e causa explosões de partículas.
  - **Vitória (V)**: "Macro Zoom" - Aproxima as partículas e desacelera o tempo.
  - **Hang Loose**: "Congelar Tempo" - Pausa a animação da onda.
  - **Mão Aberta**: "Modo Zen" - Cores azuis calmantes e movimento lento e suave.

## Tecnologias Utilizadas

- **HTML5/CSS3**
- **JavaScript (Módulos ES6)**
- **Three.js** (Motor de Renderização 3D)
- **MediaPipe Hands** (Visão Computacional)

## Como Executar

1. Clone este repositório:
   ```bash
   git clone https://github.com/matheussiqueirahub/interactive-3d-particle-wave.git
   ```
2. Abra a pasta do projeto.
3. Abra o arquivo `index.html` no seu navegador.
   - *Nota*: Para o acesso à webcam funcionar corretamente, pode ser necessário servir o arquivo via servidor local (como o VS Code Live Server) ou garantir que seu navegador permite acesso à câmera para arquivos locais.

## Autor

Desenvolvido por **Matheus Siqueira**.

## Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.
