# Wumpus-World

![wumpus](https://github.com/user-attachments/assets/b472fd79-6a1b-4ba5-9cdb-4e106bf0a4cf)

O **Mundo de Wumpus** é um clássico problema de **Inteligência Artificial** que demonstra como um agente pode tomar decisões em ambientes parcialmente observáveis.

O agente (jogador) deve explorar uma caverna **desconhecida**, encontrar o ouro escondido e sair vivo — evitando o **Wumpus**, uma criatura mortal, e **poços perigosos** espalhados pelo mapa.

Este projeto implementa uma simulação interativa desse mundo, permitindo estudar raciocínio lógico, planejamento e tomada de decisão sob incerteza.

---

## 🎮 Estrutura do Mundo

A caverna é representada por uma **grade (grid)**, onde cada célula pode conter:

* 🟡 **Ouro:** objetivo principal do agente.
* 👹 **Wumpus:** criatura mortal (mata o agente ao entrar na sala).
* 🕳️ **Poços:** armadilhas mortais.
* ⬜ **Sala vazia:** espaço seguro sem perigos.

![game](https://github.com/user-attachments/assets/f9842c84-ba9b-49ed-ac90-87817fb3bf8e)

---

## 👀 Percepções do Agente

Ao se mover, o agente recebe **pistas limitadas** do ambiente:

* 💨 **Brisa:** há um poço em sala adjacente.
* 👃 **Fedor:** o Wumpus está por perto.
* ✨ **Brilho:** ouro encontrado na sala atual.
* 📢 **Grito:** o Wumpus foi morto (quando o agente acerta a flecha).

---

## 🧠 Decisões e Estratégia

O grande desafio está em **como o agente toma decisões**:

* Ele deve usar **lógica e inferência** para deduzir a posição de poços e do Wumpus.
* Precisa balancear **risco vs. recompensa**.
* Planeja movimentos para **sobreviver, coletar o ouro e sair da caverna**.

Esse cenário é amplamente usado em cursos de IA para ilustrar:

* Planejamento
* Raciocínio lógico
* Tomada de decisão sob incerteza

---

## 🚀 Como executar o projeto

### Clonando o repositório

```bash
git clone https://github.com/RomuloLB28/Wumpus-World.git
cd Wumpus-World
```

### Executando (exemplo com Python, ajuste se necessário)

```bash
python main.py
```

> ⚠️ Dependências ou frameworks usados devem ser listados aqui (ex.: pygame, numpy, etc.).

---

## 📂 Estrutura do Projeto

```
|
├── assets/         ← imagens, sprites e recursos visuais
├── src/            ← código-fonte principal
├── main.py         ← ponto de entrada da aplicação
├── requirements.txt← dependências (se houver)
└── README.md       ← documentação do projeto
```

---

## 🎯 Objetivo Final

O agente deve:

1. Encontrar e pegar o **ouro**.
2. Evitar **Wumpus** e **poços**.
3. Sair da caverna **em segurança**.

---

## 🤝 Contribuições

Sugestões e melhorias são bem-vindas!
Abra uma issue ou envie um PR 🚀

---

## 📜 Licença

Este projeto está sob a licença **MIT** (ou ajuste conforme necessário).

---

👉 Mano, quer que eu já adicione **badges (status do projeto, linguagem, licenças)** nesse README pra deixar ele mais chamativo no GitHub?
