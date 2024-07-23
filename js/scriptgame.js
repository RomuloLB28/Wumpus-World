const topSection = document.querySelector('.top');
const scoreElement = document.getElementById('score');
const timerElement = document.getElementById('timer');
const playButton = document.getElementById('playButton');
const gameButtons = document.getElementById('gameButtons');
const counters = document.querySelector('.counters');
const zoom = document.getElementById("zoom");

let score = 10000;
let time = 0;
let timerInterval;
let poçosIndices = [];
let wumpusIndex;
let ouroIndex;
let cells = [];
let scale = 1;
let panning = false;
let pointX = 0;
let pointY = 0;
let start = { x: 0, y: 0 };

function setTransform() {
    zoom.style.transform = `translate(${pointX}px, ${pointY}px) scale(${scale})`;
}

zoom.onmousedown = function(e) {
    e.preventDefault();
    start = { x: e.clientX - pointX, y: e.clientY - pointY };
    panning = true;
}

zoom.onmouseup = function(e) {
    panning = false;
}

zoom.onmousemove = function(e) {
    e.preventDefault();
    if (!panning) {
        return;
    }
    pointX = (e.clientX - start.x);
    pointY = (e.clientY - start.y);
    setTransform();
}

zoom.onwheel = function(e) {
    e.preventDefault();
    const xs = (e.clientX - pointX) / scale;
    const ys = (e.clientY - pointY) / scale;
    const delta = (e.wheelDelta ? e.wheelDelta : -e.deltaY);
    (delta > 0) ? (scale *= 1.2) : (scale /= 1.2);
    pointX = e.clientX - xs * scale;
    pointY = e.clientY - ys * scale;
    setTransform();
}

const selectedLevel = parseInt(localStorage.getItem('selectedLevel')) || 1;
const rows = selectedLevel + 3;
const cols = selectedLevel + 3;

function clearLabirinto() {
    topSection.innerHTML = '';
    cells = [];
}

function generateLabirinto() {
    clearLabirinto();
    poçosIndices = [];

    topSection.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    topSection.style.gridTemplateRows = `repeat(${rows}, 1fr)`;

    for (let i = 0; i < rows * cols; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        topSection.appendChild(cell);
        cells.push(cell);
    }

    function getRandomIndex(excludedIndices = []) {
        let index;
        do {
            index = Math.floor(Math.random() * cells.length);
        } while (excludedIndices.includes(index));
        return index;
    }

    const agentStartIndex = 0;
    const usedIndices = [agentStartIndex];

    const agent = document.createElement('img');
    agent.src = '../Images/AgenteAndando.gif';
    cells[agentStartIndex].appendChild(agent);

    wumpusIndex = getRandomIndex(usedIndices);
    usedIndices.push(wumpusIndex);
    const wumpus = document.createElement('img');
    wumpus.src = '../Images/Wumpus.png';
    cells[wumpusIndex].appendChild(wumpus);

    const fedorPositions = [];
    if (wumpusIndex - cols >= 0) fedorPositions.push(wumpusIndex - cols);
    if (wumpusIndex + cols < cells.length) fedorPositions.push(wumpusIndex + cols);
    if (wumpusIndex % cols > 0) fedorPositions.push(wumpusIndex - 1);
    if (wumpusIndex % cols < cols - 1) fedorPositions.push(wumpusIndex + 1);

    fedorPositions.forEach(index => {
        const fedor = document.createElement('img');
        fedor.src = '../Images/Fedor.png';
        cells[index].appendChild(fedor);
    });

    const numPoços = Math.floor(cells.length * 0.2);
    while (poçosIndices.length < numPoços) {
        const poçoIndex = getRandomIndex(usedIndices);
        poçosIndices.push(poçoIndex);
        usedIndices.push(poçoIndex);
    }

    poçosIndices.forEach(poçoIndex => {
        const poço = document.createElement('img');
        poço.src = '../Images/Poço.png';
        cells[poçoIndex].appendChild(poço);

        const brisaPositions = [];
        if (poçoIndex - cols >= 0) brisaPositions.push(poçoIndex - cols);
        if (poçoIndex + cols < cells.length) brisaPositions.push(poçoIndex + cols);
        if (poçoIndex % cols > 0) brisaPositions.push(poçoIndex - 1);
        if (poçoIndex % cols < cols - 1) brisaPositions.push(poçoIndex + 1);

        brisaPositions.forEach(index => {
            const brisa = document.createElement('img');
            brisa.src = '../Images/Brisa.png';
            cells[index].appendChild(brisa);
        });
    });

    ouroIndex = getRandomIndex(usedIndices);
    usedIndices.push(ouroIndex);
    const ouro = document.createElement('img');
    ouro.src = '../Images/Ouro.png';
    cells[ouroIndex].appendChild(ouro);

    const brilho = document.createElement('img');
    brilho.src = '../Images/Brilho.png';
    cells[ouroIndex].appendChild(brilho);
}

scoreElement.textContent = score;
timerElement.textContent = time;

function startGame() {
    playButton.style.display = 'none';
    gameButtons.style.display = 'flex';
    counters.style.display = 'flex';
    generateLabirinto();

    timerInterval = setInterval(() => {
        time++;
        timerElement.textContent = time;
    }, 1000);

    const selectedAgent = localStorage.getItem('selectedAgent');
    if (selectedAgent === "Agente 1") {
        startAgent();
    } else if (selectedAgent === "Agente 2") {
        startSecondAgent();
    } else {
        startThirdAgent();
    }
}

function restartGame() {
    score = 10000;
    time = 0;
    scoreElement.textContent = score;
    timerElement.textContent = time;
    clearInterval(timerInterval);
    startGame();
}
function saveGame() {
    const gameState = {
        score,
        time,
        poçosIndices,
        wumpusIndex,
        ouroIndex,
        cells: cells.map(cell => cell.innerHTML)
    };
    localStorage.setItem('savedGameState', JSON.stringify(gameState));
    alert('Game saved successfully!');

    // Executa o agente 20 vezes após salvar o estado do mundo
    executeAgentMultipleTimes(20);
}

function loadGameState() {
    const savedGameState = JSON.parse(localStorage.getItem('savedGameState'));
    if (savedGameState) {
        score = savedGameState.score;
        time = savedGameState.time;
        poçosIndices = savedGameState.poçosIndices;
        wumpusIndex = savedGameState.wumpusIndex;
        ouroIndex = savedGameState.ouroIndex;

        clearLabirinto();
        cells = savedGameState.cells.map((cellHTML, index) => {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.innerHTML = cellHTML;
            topSection.appendChild(cell);
            return cell;
        });

        scoreElement.textContent = score;
        timerElement.textContent = time;
    } else {
        alert('No saved game state found.');
    }
}

function executeAgentAgain() {
    return new Promise((resolve) => {
        loadGameState(); // Carrega o labirinto salvo antes de cada execução do agente
        const selectedAgent = localStorage.getItem('selectedAgent');

        if (selectedAgent === "Agente 1") {
            startAgent(resolve);
        } else if (selectedAgent === "Agente 2") {
            startSecondAgent(resolve);
        } else {
            startThirdAgent(resolve);
        }
    });
}

async function executeAgentMultipleTimes(times) {
    for (let i = 0; i < times; i++) {
        console.log(`agente número ${i}`);
        await executeAgentAgain();
    }
}

function back() {
    window.location.href = '../TelaMenu.html';
}

playButton.addEventListener('click', startGame);
document.getElementById('replayButton').addEventListener('click', restartGame);
document.getElementById('saveButton').addEventListener('click', saveGame);
document.getElementById('backButton').addEventListener('click', back);

counters.style.display = 'none';
