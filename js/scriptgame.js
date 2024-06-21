const topSection = document.querySelector('.top');
const scoreElement = document.getElementById('score');
const timerElement = document.getElementById('timer');
const playButton = document.getElementById('playButton');
const gameButtons = document.getElementById('gameButtons');
const counters = document.querySelector('.counters');
let score = 10000;
let time = 0;
let timerInterval;

// Recupera as configurações salvas
const selectedLevel = parseInt(localStorage.getItem('selectedLevel')) || 1;

const rows = selectedLevel + 3;
const cols = selectedLevel + 3;
let cells = [];

// Função para limpar o labirinto
function clearLabirinto() {
    topSection.innerHTML = '';
    cells = [];
}

// Função para gerar dinamicamente as células do labirinto
function generateLabirinto() {
    clearLabirinto();

    topSection.style.gridTemplateColumns = `repeat(${cols}, 100px)`;
    topSection.style.gridTemplateRows = `repeat(${rows}, 100px)`;

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

    // Posiciona o Agente, Wumpus, poços, ouro e seus sinais
    const agentStartIndex = 0;
    const usedIndices = [agentStartIndex];

    const agent = document.createElement('img');
    agent.src = '../Images/AgenteAndando.gif';
    cells[agentStartIndex].appendChild(agent);

    const wumpusIndex = getRandomIndex(usedIndices);
    usedIndices.push(wumpusIndex);
    const wumpus = document.createElement('img');
    wumpus.src = '../Images/Wumpus.png';
    cells[wumpusIndex].appendChild(wumpus);

    const fedorPositions = [];
    if (wumpusIndex - cols >= 0) fedorPositions.push(wumpusIndex - cols); // acima
    if (wumpusIndex + cols < cells.length) fedorPositions.push(wumpusIndex + cols); // abaixo
    if (wumpusIndex % cols > 0) fedorPositions.push(wumpusIndex - 1); // esquerda
    if (wumpusIndex % cols < cols - 1) fedorPositions.push(wumpusIndex + 1); // direita

    fedorPositions.forEach(index => {
        const fedor = document.createElement('img');
        fedor.src = '../Images/Fedor.png';
        cells[index].appendChild(fedor);
    });

    const poçosIndices = [];
    const numPoços = Math.floor(cells.length * 0.2);
    while (poçosIndices.length < numPoços){
        const poçoIndex = getRandomIndex(usedIndices);
        poçosIndices.push(poçoIndex);
        usedIndices.push(poçoIndex);
    }

    poçosIndices.forEach(poçoIndex => {
        const poço = document.createElement('img');
        poço.src = '../Images/Poço.png';
        cells[poçoIndex].appendChild(poço);

        const brisaPositions = [];
        if (poçoIndex - cols >= 0) brisaPositions.push(poçoIndex - cols); // acima
        if (poçoIndex + cols < cells.length) brisaPositions.push(poçoIndex + cols); // abaixo
        if (poçoIndex % cols > 0) brisaPositions.push(poçoIndex - 1); // esquerda
        if (poçoIndex % cols < cols - 1) brisaPositions.push(poçoIndex + 1); // direita

        brisaPositions.forEach(index => {
            const brisa = document.createElement('img');
            brisa.src = '../Images/Brisa.png';
            cells[index].appendChild(brisa);
        });
    });

    const ouroIndex = getRandomIndex(usedIndices);
    usedIndices.push(ouroIndex);
    const ouro = document.createElement('img');
    ouro.src = '../Images/Ouro.png';
    cells[ouroIndex].appendChild(ouro);

    const brilho = document.createElement('img');
    brilho.src = '../Images/Brilho.png';
    cells[ouroIndex].appendChild(brilho);
}

// Atualiza os elementos de pontuação e tempo
scoreElement.textContent = score;
timerElement.textContent = time;

// Função para iniciar o jogo
function startGame() {
    playButton.style.display = 'none';
    gameButtons.style.display = 'flex';
    counters.style.display = 'flex';
    generateLabirinto();

    // Inicia o timer
    timerInterval = setInterval(() => {
        time++;
        timerElement.textContent = time;
    }, 1000);

    const selectedAgent = localStorage.getItem('selectedAgent');

    if (selectedAgent === 'Agente 1') {
        startAgent(); // Inicia o agente 1
    } else if (selectedAgent === 'Agente 2') {
        startSecondAgent(); // Inicia o agente 2
    }
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
document.getElementById('replayButton').addEventListener('click', restartGame);
document.getElementById('backButton').addEventListener('click', back);

// Esconde os contadores inicialmente
counters.style.display = 'none';

