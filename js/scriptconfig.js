document.addEventListener('DOMContentLoaded', () => {
    // Agente Selector
    const agents = ['Agente 1', 'Agente 2', 'Agente 3'];
    let currentAgentIndex = 0;

    let agentOneWin = 0;
    let agentOneDefeat = 0;
    let agentTwoWin = 0;
    let agentTwoDefeat = 0;
    let totalAgentOne = 0;
    let totalAgentTwo = 0;

    const agentNameElement = document.getElementById('agent-name');
    const leftArrowAgent = document.getElementById('left-arrow-agent');
    const rightArrowAgent = document.getElementById('right-arrow-agent');

    function closeChartsModal() {
        const chartsModal = document.getElementById('charts-modal');
        chartsModal.classList.add('hidden');
        chartsModal.style.display = 'none';
    }

    function updateAgentName() {
        agentNameElement.textContent = agents[currentAgentIndex];
    }

    leftArrowAgent.addEventListener('click', () => {
        currentAgentIndex = (currentAgentIndex > 0) ? currentAgentIndex - 1 : agents.length - 1;
        updateAgentName();
    });

    rightArrowAgent.addEventListener('click', () => {
        currentAgentIndex = (currentAgentIndex < agents.length - 1) ? currentAgentIndex + 1 : 0;
        updateAgentName();
    });

    updateAgentName();

    // Level Selector
    let currentLevel = 1;

    const levelBarsElement = document.getElementById('level-bars');
    const leftArrowLevel = document.getElementById('left-arrow-level');
    const rightArrowLevel = document.getElementById('right-arrow-level');

    function updateLevelBars() {
        levelBarsElement.innerHTML = '';
        for (let i = 1; i <= 17; i++) { // Allow selection up to 17
            const bar = document.createElement('div');
            bar.className = 'bar';
            if (i <= currentLevel) {
                bar.classList.add('active');
            }
            const barNumber = document.createElement('span');
            barNumber.className = 'bar-number';
            barNumber.textContent = i + 3; // Adjust the number to represent the grid size
            bar.appendChild(barNumber);
            levelBarsElement.appendChild(bar);
        }
    }

    leftArrowLevel.addEventListener('click', () => {
        currentLevel = (currentLevel > 1) ? currentLevel - 1 : 17;
        updateLevelBars();
    });

    rightArrowLevel.addEventListener('click', () => {
        currentLevel = (currentLevel < 17) ? currentLevel + 1 : 1;
        updateLevelBars();
    });

    updateLevelBars();

    // Save Configuration
    const saveConfigButton = document.getElementById('save-config');
    saveConfigButton.addEventListener('click', () => {
        localStorage.setItem('selectedAgent', agents[currentAgentIndex]);
        localStorage.setItem('selectedLevel', currentLevel);
    });

    // Modal
    const modal = document.getElementById('config-modal');
    const openModalButton = document.getElementById('open-modal');
    const closeModalButton = document.getElementsByClassName('close-button')[0];
    const closeModalButton2 = document.getElementsByClassName('close-button2')[0];
    const modalContent = document.querySelector(".modal-content");
    let pointX = 0, pointY = 0, scale = 1, panning = false, start = { x: 0, y: 0 };

    function setTransform() {
        modalContent.style.transform = `translate(${pointX}px, ${pointY}px) scale(${scale})`;
    }

    openModalButton.addEventListener('click', () => {
        modal.style.display = 'block';
        startGame();
        saveGame();
    });

    closeModalButton.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    });

    modalContent.onmousedown = function (e) {
        e.preventDefault();
        start = { x: e.clientX - pointX, y: e.clientY - pointY };
        panning = true;
    };

    modalContent.onmouseup = function () {
        panning = false;
    };

    modalContent.onmousemove = function (e) {
        e.preventDefault();
        if (!panning) return;
        pointX = e.clientX - start.x;
        pointY = e.clientY - start.y;
        setTransform();
    };

    modalContent.onwheel = function (e) {
        e.preventDefault();
        const xs = (e.clientX - pointX) / scale;
        const ys = (e.clientY - pointY) / scale;
        const delta = (e.wheelDelta ? e.wheelDelta : -e.deltaY);
        scale *= (delta > 0) ? 1.2 : 0.8;
        pointX = e.clientX - xs * scale;
        pointY = e.clientY - ys * scale;
        setTransform();
    };
    //teste
    function gerarOrientacaoAleatoria() {
        var orientacoes = ['N', 'S', 'E', 'W'];
        var indiceAleatorio = Math.floor(Math.random() * orientacoes.length);
        return orientacoes[indiceAleatorio];
    }

    class FirstAgent {
        constructor(cells, rows, cols) {
            this.cells = cells;
            this.rows = rows;
            this.cols = cols;
            this.position = { x: 0, y: 0 }; // Posição inicial na caverna
            this.orientation = gerarOrientacaoAleatoria();
            this.hasGold = false;
            this.alive = true;
            this.wumpusAlive = true;
            this.shotArrows = new Set(); // Para evitar atirar na mesma posição repetidamente
        }

        turnLeft() {
            const directions = ['N', 'W', 'S', 'E'];
            this.orientation = directions[(directions.indexOf(this.orientation) + 1) % 4];
        }

        turnRight() {
            const directions = ['N', 'E', 'S', 'W'];
            this.orientation = directions[(directions.indexOf(this.orientation) + 1) % 4];
        }

        turnUp() {
            const directions = ['W', 'S', 'E', 'N'];
            this.orientation = directions[(directions.indexOf(this.orientation) + 1) % 4];
        }

        turnDown() {
            const directions = ['E', 'S', 'W', 'N'];
            this.orientation = directions[(directions.indexOf(this.orientation) + 1) % 4];
        }

        moveForward() {
            switch (this.orientation) {
                case 'N':
                    if (this.position.y > 0) this.position.y--;
                    break;
                case 'S':
                    if (this.position.y < this.rows - 1) this.position.y++;
                    break;
                case 'E':
                    if (this.position.x < this.cols - 1) this.position.x++;
                    break;
                case 'W':
                    if (this.position.x > 0) this.position.x--;
                    break;
            }
        }

        grabGold() {
            this.hasGold = true;
            const index = this.position.y * this.cols + this.position.x;
            const gold = this.cells[index].querySelector("img[src*='Ouro.png']");
            const glitter = this.cells[index].querySelector("img[src*='Brilho.png']");
            if (gold) gold.remove();
            if (glitter) glitter.remove();
        }

        isGoldHere() {
            const index = this.position.y * this.cols + this.position.x;
            return this.cells[index].querySelector("img[src*='Ouro.png']") !== null;
        }

        isWumpusHere() {
            const index = this.position.y * this.cols + this.position.x;
            return this.cells[index].querySelector("img[src*='Wumpus.png']") !== null;
        }

        isPitHere() {
            const index = this.position.y * this.cols + this.position.x;
            return this.cells[index].querySelector("img[src*='Poço.png']") !== null;
        }

        isBreezeHere() {
            const index = this.position.y * this.cols + this.position.x;
            return this.cells[index].querySelector("img[src*='Brisa.png']") !== null;
        }

        isStenchHere() {
            const index = this.position.y * this.cols + this.position.x;
            return this.cells[index].querySelector("img[src*='Fedor.png']") !== null;
        }

        move() {
            if (this.isWumpusHere() || this.isPitHere()) {
                if (!this.wumpusAlive) {
                    this.explore();
                }
                this.alive = false;
                this.resetToInitialPosition();
                return;
            }

            if (this.isGoldHere()) {
                this.grabGold();
            }

            if (this.isStenchHere()) {
                this.shootArrow();
            } else {
                this.explore();
            }
        }

        shootArrow() {
            const currentPosKey = `${this.position.x},${this.position.y}`;

            if (this.shotArrows.has(currentPosKey)) {
                this.explore();
                return;
            }

            this.shotArrows.add(currentPosKey);
            this.changeAgentImage("AgenteAtirando.png");

            setTimeout(() => {
                const nextPosition = this.getNextPosition();
                if (this.isStenchHere() && this.wumpusAlive && this.isWumpusAdjacent(nextPosition)) {
                    this.killWumpus(nextPosition);
                }
                this.changeAgentImage("AgenteAndando.gif");
            }, 1000);

            setTimeout(() => {
                this.removeAgentImage();
                this.explore();
            }, 1500);
        }

        isWumpusAdjacent(position) {
            const adjacentPositions = [
                { x: position.x, y: position.y - 1 },
                { x: position.x, y: position.y + 1 },
                { x: position.x - 1, y: position.y },
                { x: position.x + 1, y: position.y }
            ];

            return adjacentPositions.some(pos => {
                const index = pos.y * this.cols + pos.x;
                return this.cells[index] && this.cells[index].querySelector("img[src*='Wumpus.png']") !== null;
            });
        }

        killWumpus(position) {
            this.wumpusAlive = false;
            const adjacentPositions = [
                { x: position.x, y: position.y - 1 },
                { x: position.x, y: position.y + 1 },
                { x: position.x - 1, y: position.y },
                { x: position.x + 1, y: position.y }
            ];

            adjacentPositions.forEach(pos => {
                const index = pos.y * this.cols + pos.x;
                if (this.cells[index]) {
                    const wumpus = this.cells[index].querySelector("img[src*='Wumpus.png']");
                    const stench = this.cells[index].querySelector("img[src*='Fedor.png']");
                    if (wumpus) wumpus.remove();
                    if (stench) stench.remove();
                }
            });
        }

        explore() {
            // Lista de direções disponíveis
            const availableDirections = ['left', 'right', 'up', 'down'];
            const currentDirection = this.orientation;

            // Verifica e move em todas as direções possíveis
            while (availableDirections.length > 0) {
                const randomIndex = Math.floor(Math.random() * availableDirections.length);
                const randomDirection = availableDirections.splice(randomIndex, 1)[0];

                switch (randomDirection) {
                    case 'left':
                        this.turnLeft();
                        break;
                    case 'up':
                        this.turnUp();
                        break;
                    case 'down':
                        this.turnDown();
                        break;
                    case 'right':
                        this.turnRight();
                        break;
                }
                if (this.isWumpusHere() || this.isPitHere()) {
                    this.alive = false;
                    this.resetToInitialPosition();
                    return;
                }

                const newPosition = this.getNextPosition();

                // Se a nova posição é válida, move o agente
                if (newPosition.x >= 0 && newPosition.x < this.cols && newPosition.y >= 0 && newPosition.y < this.rows) {
                    this.moveForward();
                    return;
                }
                // Reseta a orientação para a original se a direção não foi válida
                this.orientation = currentDirection;
            }

            // Se todas as direções foram verificadas, move para frente
            this.moveForward();
        }

        getNextPosition() {
            const nextPosition = { ...this.position };
            switch (this.orientation) {
                case 'N':
                    if (this.position.y > 0) nextPosition.y--;
                    break;
                case 'S':
                    if (this.position.y < this.rows - 1) nextPosition.y++;
                    break;
                case 'E':
                    if (this.position.x < this.cols - 1) nextPosition.x++;
                    break;
                case 'W':
                    if (this.position.x > 0) nextPosition.x--;
                    break;
            }
            return nextPosition;
        }

        resetToInitialPosition() {
            this.position = { x: 0, y: 0 };
            this.orientation = gerarOrientacaoAleatoria();
            this.shotArrows.clear(); // Reset the shot arrows to allow new shots
        }

        updatePosition() {
            const index = this.position.y * this.cols + this.position.x;
            let agent = document.querySelector("img[src*='AgenteAndando.gif'], img[src*='AgenteAtirando.gif']");
            if (agent) agent.remove();
            agent = document.createElement('img');
            agent.src = '../Images/AgenteAndando.gif';
            this.cells[index].appendChild(agent);
        }

        changeAgentImage(imageSrc) {
            const index = this.position.y * this.cols + this.position.x;
            let agent = document.querySelector("img[src*='AgenteAndando.gif'], img[src*='AgenteAtirando.gif']");
            if (agent) agent.src = `../Images/${imageSrc}`;
        }

        removeAgentImage() {
            const agentImages = document.querySelectorAll("img[src*='AgenteAtirando.png']");
            agentImages.forEach(img => img.remove());
        }
    }
    // Função para iniciar os movimentos automáticos do agente
    function startAgent(callback) {
        const topSection = document.querySelector('.top');
        const cells = topSection.querySelectorAll('.cell');
        const rows = selectedLevel + 3;
        const cols = selectedLevel + 3;
        const agent = new FirstAgent(cells, rows, cols);

        const agentInterval = setInterval(() => {
            if (agent.alive && !agent.hasGold) {
                agent.move();
                agent.updatePosition();
            } else if (agent.alive && agent.hasGold && (agent.position.x !== 0 || agent.position.y !== 0)) {
                agent.explore(); // Agente se movimenta aleatoriamente ao invés de rastrear o caminho de volta
                agent.updatePosition();
            } else if (agent.alive && agent.hasGold && agent.position.x === 0 && agent.position.y === 0) {
                clearInterval(agentInterval);
                agentOneWin++;
                totalAgentOne++;
                console.log(`win ${agentOneWin}`);
                if (callback) callback(); // Chama o callback se o agente vencer
            } else if (!agent.alive) {
                clearInterval(agentInterval);
                if (callback) callback(); // Chama o callback se o agente morrer
                agentOneDefeat++;
                totalAgentOne++;
            }
        }, 1000); // Move o agente a cada segundo
    }

    //new parte
    let poçosIndices = [];
    let wumpusIndex;
    let ouroIndex;
    let cells = [];
    const topSection = document.querySelector('.top');
    function clearLabirinto() {
        topSection.innerHTML = '';
        cells = [];
    }
    const selectedLevel = parseInt(localStorage.getItem('selectedLevel')) || 1;
    const rows = selectedLevel + 3;
    const cols = selectedLevel + 3;

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

    function startGame() {
        generateLabirinto();
        const selectedAgent = localStorage.getItem('selectedAgent');
        if (selectedAgent === "Agente 1") {
            startAgent();
        } else if (selectedAgent === "Agente 2") {
            startSecondAgent();
        } else {
            startThirdAgent();
        }
    }
    //segundo agente
    class SecondAgent {
        constructor(cells, rows, cols) {
            this.cells = cells;
            this.rows = rows;
            this.cols = cols;
            this.position = { x: 0, y: 0 }; // Posição inicial na caverna
            this.orientation = gerarOrientacaoAleatoria();
            this.hasGold = false;
            this.alive = true;
            this.wumpusAlive = true;
            this.path = [];
            this.visited = new Set();
            this.shotArrows = new Set(); // Para evitar atirar na mesma posição repetidamente
            this.lastSafePosition = null; // Adicionado para armazenar a última posição segura
            this.returning = false;
        }

        turnLeft() {
            const directions = ['N', 'W', 'S', 'E'];
            this.orientation = directions[(directions.indexOf(this.orientation) + 1) % 4];
        }

        turnRight() {
            const directions = ['N', 'E', 'S', 'W'];
            this.orientation = directions[(directions.indexOf(this.orientation) + 1) % 4];
        }

        turnUp() {
            const directions = ['W', 'S', 'E', 'N'];
            this.orientation = directions[(directions.indexOf(this.orientation) + 1) % 4];
        }

        turnDown() {
            const directions = ['E', 'S', 'W', 'N'];
            this.orientation = directions[(directions.indexOf(this.orientation) + 1) % 4];
        }

        moveForward() {
            this.path.push({ ...this.position });
            switch (this.orientation) {
                case 'N':
                    if (this.position.y > 0) this.position.y--;
                    break;
                case 'S':
                    if (this.position.y < this.rows - 1) this.position.y++;
                    break;
                case 'E':
                    if (this.position.x < this.cols - 1) this.position.x++;
                    break;
                case 'W':
                    if (this.position.x > 0) this.position.x--;
                    break;
            }
        }

        grabGold() {
            this.hasGold = true;
            const index = this.position.y * this.cols + this.position.x;
            const gold = this.cells[index].querySelector("img[src*='Ouro.png']");
            const glitter = this.cells[index].querySelector("img[src*='Brilho.png']");
            if (gold) gold.remove();
            if (glitter) glitter.remove();
            this.returning = true; // Inicia o retorno após pegar o ouro
        }

        isGoldHere() {
            const index = this.position.y * this.cols + this.position.x;
            return this.cells[index].querySelector("img[src*='Ouro.png']") !== null;
        }

        isWumpusHere() {
            const index = this.position.y * this.cols + this.position.x;
            return this.cells[index].querySelector("img[src*='Wumpus.png']") !== null;
        }

        isPitHere() {
            const index = this.position.y * this.cols + this.position.x;
            return this.cells[index].querySelector("img[src*='Poço.png']") !== null;
        }

        isBreezeHere() {
            const index = this.position.y * this.cols + this.position.x;
            return this.cells[index].querySelector("img[src*='Brisa.png']") !== null;
        }

        isStenchHere() {
            const index = this.position.y * this.cols + this.position.x;
            return this.cells[index].querySelector("img[src*='Fedor.png']") !== null;
        }

        move() {
            if (!this.wumpusAlive && !this.isPitHere()) {
                // Se o Wumpus está morto e não há um poço aqui, o agente não precisa fazer nada.
                this.explore();
            }
        
            if (this.isWumpusHere() || this.isPitHere()) {
                if (!this.wumpusAlive) {
                    // Se o Wumpus está morto, não faz nada.
                    this.explore();
                }
                this.alive = false;
                this.resetToInitialPosition();
                return;
            }
        
            if (this.isGoldHere()) {
                this.grabGold();
                console.log('Agente encontrou o ouro!');
                this.returning = true; // Inicia o retorno após pegar o ouro
            }
        
            if (this.returning) {
                if (this.path.length > 0) {
                    // Volta pelo caminho registrado
                    const previousPosition = this.path.pop();
                    this.position = previousPosition;
                    this.updatePosition(); // Atualiza a posição do agente na visualização
                } else {
                    // Chegou à posição inicial
                    this.returning = false;
                    console.log('Agente voltou para a posição inicial com o ouro!');
                }
            } else {
                // Marca a posição atual como visitada
                this.visited.add(`${this.position.x},${this.position.y}`);
                if (this.isStenchHere()) {
                    this.shootArrow();
                } else {
                    this.explore();
                }
            }
        }

        shootArrow() {
            const currentPosKey = `${this.position.x},${this.position.y}`;

            if (this.shotArrows.has(currentPosKey)) {
                this.explore();
                return;
            }

            this.shotArrows.add(currentPosKey);
            this.changeAgentImage("AgenteAtirando.png");

            setTimeout(() => {
                const nextPosition = this.getNextPosition();
                if (this.isStenchHere() && this.wumpusAlive && this.isWumpusAdjacent(nextPosition)) {
                    this.killWumpus(nextPosition);
                }
                this.changeAgentImage("AgenteAndando.gif");
            }, 1000);

            setTimeout(() => {
                this.removeAgentImage();
                this.explore();
            }, 1500);
        }

        isWumpusAdjacent(position) {
            const adjacentPositions = [
                { x: position.x, y: position.y - 1 },
                { x: position.x, y: position.y + 1 },
                { x: position.x - 1, y: position.y },
                { x: position.x + 1, y: position.y }
            ];

            return adjacentPositions.some(pos => {
                const index = pos.y * this.cols + pos.x;
                return this.cells[index] && this.cells[index].querySelector("img[src*='Wumpus.png']") !== null;
            });
        }

        killWumpus(position) {
            this.wumpusAlive = false;
            const adjacentPositions = [
                { x: position.x, y: position.y - 1 },
                { x: position.x, y: position.y + 1 },
                { x: position.x - 1, y: position.y },
                { x: position.x + 1, y: position.y }
            ];

            adjacentPositions.forEach(pos => {
                const index = pos.y * this.cols + pos.x;
                if (this.cells[index]) {
                    const wumpus = this.cells[index].querySelector("img[src*='Wumpus.png']");
                    const stench = this.cells[index].querySelector("img[src*='Fedor.png']");
                    if (wumpus) wumpus.remove();
                    if (stench) stench.remove();
                }
            });
        }
        
        explore() {

            const availableDirections = [];
            // Verifica cada direção disponível
            ['left', 'right', 'up', 'down'].forEach(direction => {
                this.turn(direction);
                const newPosition = this.getNextPosition();

                // Se a nova posição é válida e não foi visitada antes, adiciona à lista de direções disponíveis
                if (this.isPositionValid(newPosition) && !this.visited.has(`${newPosition.x},${newPosition.y}`)) {
                    availableDirections.push(direction);
                }

                // Reseta a orientação para a original
                this.turn(this.reverseDirection(direction));
            });
            if (this.isWumpusHere() || this.isPitHere()) {
                this.alive = false;
                this.resetToInitialPosition();
                return;
            }

            // Se houver direções disponíveis, escolhe uma aleatória para se mover
            if (availableDirections.length > 0) {
                const randomIndex = Math.floor(Math.random() * availableDirections.length);
                this.turn(availableDirections[randomIndex]);
                this.moveForward();
            } else {
                // Se não houver direções disponíveis, volta para a posição anterior
                this.backtrack();
            }
        }

        isPositionValid(position) {
            return position.x >= 0 && position.x < this.cols && position.y >= 0 && position.y < this.rows;
        }

        reverseDirection(direction) {
            switch (direction) {
                case 'left':
                    return 'right';
                case 'right':
                    return 'left';
                case 'up':
                    return 'down';
                case 'down':
                    return 'up';
                default:
                    return direction;
            }
        }

        turn(direction) {
            switch (direction) {
                case 'left':
                    this.turnLeft();
                    break;
                case 'up':
                    this.turnUp();
                    break;
                case 'down':
                    this.turnDown();
                    break;
                case 'right':
                    this.turnRight();
                    break;
            }
        }


        getNextPosition() {
            const nextPosition = { ...this.position };
            switch (this.orientation) {
                case 'N':
                    if (this.position.y > 0) nextPosition.y--;
                    break;
                case 'S':
                    if (this.position.y < this.rows - 1) nextPosition.y++;
                    break;
                case 'E':
                    if (this.position.x < this.cols - 1) nextPosition.x++;
                    break;
                case 'W':
                    if (this.position.x > 0) nextPosition.x--;
                    break;
            }
            return nextPosition;
        }

        backtrack() {
            if (this.path.length > 0) {
                const previousPosition = this.path.pop();
                this.position = previousPosition;
            }
        }

        resetToInitialPosition() {
            this.position = { x: 0, y: 0 };
            this.orientation = gerarOrientacaoAleatoria();
            this.path = [];
            this.shotArrows.clear(); // Reset the shot arrows to allow new shots
        }

        updatePosition() {
            const index = this.position.y * this.cols + this.position.x;
            let agent = document.querySelector("img[src*='AgenteAndando.gif'], img[src*='AgenteAtirando.gif']");
            if (agent) agent.remove();
            agent = document.createElement('img');
            agent.src = '../Images/AgenteAndando.gif';
            this.cells[index].appendChild(agent);
        }

        changeAgentImage(imageSrc) {
            const index = this.position.y * this.cols + this.position.x;
            let agent = document.querySelector("img[src*='AgenteAndando.gif'], img[src*='AgenteAtirando.gif']");
            if (agent) agent.src = `../Images/${imageSrc}`;
        }

        removeAgentImage() {
            const agentImages = document.querySelectorAll("img[src*='AgenteAtirando.png']");
            agentImages.forEach(img => img.remove());
        }
    }

    function startSecondAgent(callback) {
        const topSection = document.querySelector('.top');
        if (!topSection) {
            console.error("Elemento '.top' não encontrado.");
            return;
        }
        const cells = topSection.querySelectorAll('.cell');
        const rows = selectedLevel + 3;
        const cols = selectedLevel + 3;
        const agent = new SecondAgent(cells, rows, cols);

        const agentInterval = setInterval(() => {
            if (agent.alive && !agent.hasGold) {
                agent.move();
                agent.updatePosition();
            } else if (agent.alive && agent.hasGold && (agent.position.x !== 0 || agent.position.y !== 0)) {
                agent.backtrack();
                agent.updatePosition();
            } else if (agent.alive && agent.hasGold && agent.position.x === 0 && agent.position.y === 0) {
                clearInterval(agentInterval);
                agentTwoWin++;
                totalAgentTwo++;
                console.log(`win ${agentTwoWin}`);
                if (callback) callback(); // Chama o callback se o agente vencer
            } else if (!agent.alive) {
                clearInterval(agentInterval);
                if (callback) callback(); // Chama o callback se o agente morrer
                agentTwoDefeat++;
                totalAgentTwo++;
                console.log(`defeat ${agentTwoDefeat}`);
            }
        }, 1000);// Move o agente a cada segundo
    }

    //multiplas vezes
    function saveGame() {
        const gameState = {
            poçosIndices,
            wumpusIndex,
            ouroIndex,
            cells: cells.map(cell => cell.innerHTML)
        };
        localStorage.setItem('savedGameState', JSON.stringify(gameState));
        // Inicia a execução dos agentes 1 e 2 após salvar o estado do mundo
        executeAgentsInSequence(20);
    }

    function loadGameState() {
        const savedGameState = JSON.parse(localStorage.getItem('savedGameState'));
        if (savedGameState) {
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
        } else {
            alert('No saved game state found.');
        }
    }

    function showChartsModal() {
        const chartsModal = document.getElementById('charts-modal');
        modal.style.display = 'none';
        chartsModal.classList.remove('hidden');
        chartsModal.style.display = 'block';
    }


    function createCharts() {
        const chartsContainer = document.getElementById('charts-container');
        // Exemplo de como fechar a modal manualmente com o botão de fechar
        document.querySelectorAll('.close-button').forEach(button => {
            button.addEventListener('click', closeChartsModal);
        });
        chartsContainer.innerHTML = '';

        // Cria elementos canvas para os gráficos
        const canvasAgent1 = document.createElement('canvas');
        canvasAgent1.id = 'agent1-chart';
        chartsContainer.appendChild(canvasAgent1);

        const canvasAgent2 = document.createElement('canvas');
        canvasAgent2.id = 'agent2-chart';
        chartsContainer.appendChild(canvasAgent2);

        const ctxAgent1 = canvasAgent1.getContext('2d');
        const ctxAgent2 = canvasAgent2.getContext('2d');

        // Gráfico para Agente 1
        new Chart(ctxAgent1, {
            type: 'doughnut',
            data: {
                labels: ['Vitórias', 'Derrotas'],
                datasets: [{
                    data: [agentOneWin / totalAgentOne * 100, agentOneDefeat / totalAgentOne * 100],
                    backgroundColor: ['#36a2eb', '#ff6384'],
                    borderColor: ['#36a2eb', '#ff6384'],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Desempenho do Agente 1'
                    }
                }
            }
        });

        // Gráfico para Agente 2
        new Chart(ctxAgent2, {
            type: 'doughnut',
            data: {
                labels: ['Vitórias', 'Derrotas'],
                datasets: [{
                    data: [agentTwoWin / totalAgentTwo * 100, agentTwoDefeat / totalAgentTwo * 100],
                    backgroundColor: ['#36a2eb', '#ff6384'],
                    borderColor: ['#36a2eb', '#ff6384'],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Desempenho do Agente 2'
                    }
                }
            }
        });

        showChartsModal(); // Exibe a modal com os gráficos após criar os gráficos
    }

    function executeAgentAgain(agentName) {
        return new Promise((resolve) => {
            loadGameState(); // Carrega o labirinto salvo antes de cada execução do agente
            if (agentName === "Agente 1") {
                startAgent(resolve);
            } else if (agentName === "Agente 2") {
                startSecondAgent(resolve);
            }
        });
    }

    async function executeAgentMultipleTimes(agentName, times) {
        for (let i = 0; i < times; i++) {
            console.log(`Executando ${agentName}, execução número ${i + 1}`);
            console.log(`${agentOneWin} e ${agentOneDefeat}`);
            console.log(`${agentTwoWin} e ${agentTwoDefeat}`);
            await executeAgentAgain(agentName);
        }
    }

    async function executeAgentsInSequence(times) {
        await executeAgentMultipleTimes("Agente 1", times);
        if (totalAgentOne > times) {
            totalAgentOne--;
            if (agentOneDefeat > agentOneWin) {
                agentOneDefeat--;
            } else {
                agentOneWin--;
            }
            console.log(`${agentOneWin} e ${agentOneDefeat}`);
        }
        console.log(`total ${totalAgentOne}`);
        await executeAgentMultipleTimes("Agente 2", times);
        if (totalAgentTwo > times) {
            totalAgentTwo--;
            if (agentTwoDefeat > agentTwoWin) {
                agentTwoDefeat--;
            } else {
                agentTwoWin--;
            }
        }
        console.log(`total ${totalAgentTwo}`);
        createCharts();
    }
});
