# Wumpus-World

O "Mundo de Wumpus" é um clássico problema de inteligência artificial que ilustra como um agente pode tomar decisões baseadas em percepções parciais do ambiente. Trata-se de um ambiente em que um agente, geralmente representado como um jogador, deve explorar uma caverna quadrada e desconhecida, composta por salas interconectadas. O objetivo é encontrar o ouro escondido e sair da caverna sem ser atacado pelo Wumpus, uma criatura mortal, ou cair em poços perigosos.

### Estrutura do Mundo
A caverna é representada por uma grade, onde cada célula pode conter:
- **Ouro:** O objetivo do agente é localizar e pegar o ouro.
- **Wumpus:** Uma criatura mortal que, se o agente entrar em sua sala, o mata.
- **Poços:** Se o agente cair em um poço, ele também morre.
- **Sala Vazia:** Uma sala que não contém perigos nem recompensas.

### Percepções do Agente
O agente, ao se mover pela caverna, tem percepções limitadas:
- **Fedor:** Indica que o Wumpus está em uma sala adjacente.
- **Brisa:** Indica que há um poço em uma sala adjacente.
- **Brilho:** Indica que o ouro está na sala em que o agente se encontra.
- **Grito:** Indica que o Wumpus foi morto. O agente pode matá-lo disparando uma flecha em direção a uma sala onde suspeita que o Wumpus esteja.

### Decisões e Estratégia
O desafio do Mundo de Wumpus está em como o agente decide quais movimentos fazer com base em percepções limitadas e parciais. O agente deve usar lógica e inferência para determinar com segurança onde o Wumpus e os poços estão, evitando-os enquanto busca o ouro.

### Objetivo Final
O objetivo do agente é, portanto, encontrar e pegar o ouro, e depois sair da caverna com segurança, minimizando riscos. Essa tarefa é usada em estudos de IA para demonstrar conceitos como planejamento, raciocínio lógico, e tomada de decisão sob incerteza.

