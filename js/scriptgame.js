// Função para gerar dinamicamente as células do labirinto
const topSection = document.querySelector('.top');
const rows = 4;
const cols = 4;
const cells = [];

// Cria as células do labirinto
for (let i = 0; i < rows * cols; i++) {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    topSection.appendChild(cell);
    cells.push(cell);
}

// Função para obter um índice aleatório não usado
function getRandomIndex(excludedIndices = []) {
    let index;
    do {
        index = Math.floor(Math.random() * cells.length);
    } while (excludedIndices.includes(index));
    return index;
}

// Posiciona o Agente, Wumpus, poços e seus sinais
const agentStartIndex = 0;
const agent = document.createElement('img');
agent.src = '/../Images/AgenteAndando.gif';
cells[agentStartIndex].appendChild(agent);

const wumpusIndex = getRandomIndex([agentStartIndex]);
const wumpus = document.createElement('img');
wumpus.src = '/../Images/Wumpus.png';
cells[wumpusIndex].appendChild(wumpus);

const fedorPositions = [];
if (wumpusIndex - cols >= 0) fedorPositions.push(wumpusIndex - cols); // acima
if (wumpusIndex + cols < cells.length) fedorPositions.push(wumpusIndex + cols); // abaixo
if (wumpusIndex % cols > 0) fedorPositions.push(wumpusIndex - 1); // esquerda
if (wumpusIndex % cols < cols - 1) fedorPositions.push(wumpusIndex + 1); // direita

fedorPositions.forEach(index => {
    const fedor = document.createElement('img');
    fedor.src = '/../Images/Fedor.png';
    cells[index].appendChild(fedor);
});

const poçosIndices = [];
const numPoços = Math.floor(cells.length * 0.2);
while (poçosIndices.length < numPoços) {
    const poçoIndex = getRandomIndex([agentStartIndex, wumpusIndex, ...poçosIndices]);
    poçosIndices.push(poçoIndex);
}

poçosIndices.forEach(poçoIndex => {
    const poço = document.createElement('img');
    poço.src = '/../Images/Poço.png';
    cells[poçoIndex].appendChild(poço);

    const brisaPositions = [];
    if (poçoIndex - cols >= 0) brisaPositions.push(poçoIndex - cols); // acima
    if (poçoIndex + cols < cells.length) brisaPositions.push(poçoIndex + cols); // abaixo
    if (poçoIndex % cols > 0) brisaPositions.push(poçoIndex - 1); // esquerda
    if (poçoIndex % cols < cols - 1) brisaPositions.push(poçoIndex + 1); // direita

    brisaPositions.forEach(index => {
        if (!cells[index].querySelector('img[src="Images/Fedor.png"]')) {
            const brisa = document.createElement('img');
            brisa.src = '/../Images/Brisa.png';
            cells[index].appendChild(brisa);
        }
    });
});

// Variáveis para contadores
let score = 10000;
let time = 0;
let timerInterval;

// Seleciona os elementos
const scoreElement = document.getElementById('score');
const timerElement = document.getElementById('timer');
const playButton = document.getElementById('playButton');
const gameButtons = document.getElementById('gameButtons');
const counters = document.querySelector('.counters');

// Atualiza os elementos de pontuação e tempo
scoreElement.textContent = score;
timerElement.textContent = time;

// Função para iniciar o jogo
function startGame() {
    playButton.style.display = 'none';
    gameButtons.style.display = 'flex';
    counters.style.display = 'flex';

    // Inicia o timer
    timerInterval = setInterval(() => {
        time++;
        timerElement.textContent = time;
    }, 1000);
}

// Função para reiniciar o jogo
function restartGame() {
    score = 10000;
    time = 0;
    scoreElement.textContent = score;
    timerElement.textContent = time;
    clearInterval(timerInterval);
    startGame();
}

// Função para voltar para a tela TelaMenu.html
function back() {
    window.location.href = '../TelaMenu.html';
}

// Adiciona eventos aos botões
playButton.addEventListener('click', startGame);
replayButton.addEventListener('click', restartGame);
backButton.addEventListener('click', back);

// Esconde os contadores inicialmente
counters.style.display = 'none';
