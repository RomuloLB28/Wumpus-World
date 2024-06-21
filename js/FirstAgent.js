
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
function startAgent() {
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
            alert('Agente venceu o jogo!');
        } else {
            clearInterval(agentInterval);
        }
    }, 1000); // Move o agente a cada segundo
}

document.addEventListener('DOMContentLoaded', (event) => {
    startAgent();
});
