document.addEventListener('DOMContentLoaded', () => {
    // Agente Selector
    const agents = ['Agente 1', 'Agente 2', 'Agente 3'];
    let currentAgentIndex = 0;

    let agentOneWin = 0;
    let agentOneDefeat = 0;
    let agentTwoWin = 0;
    let agentTwoDefeat = 0;

    const agentNameElement = document.getElementById('agent-name');
    const leftArrowAgent = document.getElementById('left-arrow-agent');
    const rightArrowAgent = document.getElementById('right-arrow-agent');

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
                this.alive = false;
                alert('Agente morreu!');
                agentOneDefeat += 1;
                this.resetToInitialPosition();
                return;
            }

            if (this.isGoldHere()) {
                this.grabGold();
                alert('Agente encontrou o ouro!');
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
                agentOneWin += 1;
                clearInterval(agentInterval);
                alert('Agente venceu o jogo!');
                if (callback) callback(); // Chama o callback se o agente vencer
            } else {
                clearInterval(agentInterval);
                if (callback) callback(); // Chama o callback se o agente morrer
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
                this.alive = false;
                alert('Agente morreu!');
                this.resetToInitialPosition();
                return;
            }
    
            if (this.isGoldHere()) {
                this.grabGold();
                alert('Agente encontrou o ouro!');
            }
    
            // Marca a posição atual como visitada
            this.visited.add(`${this.position.x},${this.position.y}`);
    
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
            const nextPosition = this.getNextPosition();
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
                alert('Agente venceu o jogo!');
                if (callback) callback();
            } else {
                clearInterval(agentInterval);
                if (callback) callback();
            }
        }, 1000); // Move o agente a cada segundo
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
        executeAgentsInSequence(3);
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
            await executeAgentAgain(agentName);
        }
    }
    
    async function executeAgentsInSequence(times) {
        await executeAgentMultipleTimes("Agente 1", times);
        await executeAgentMultipleTimes("Agente 2", times);
    }       
});
