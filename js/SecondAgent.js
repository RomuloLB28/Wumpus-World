function gerarOrientacaoAleatoria() {
    var orientacoes = ['N', 'S', 'E', 'W'];
    var indiceAleatorio = Math.floor(Math.random() * orientacoes.length);
    return orientacoes[indiceAleatorio];
}

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

function startSecondAgent() {
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
        } else {
            clearInterval(agentInterval);
        }
    }, 1000); // Move o agente a cada segundo
}

document.addEventListener('DOMContentLoaded', (event) => {
    console.log("DOM completamente carregado e analisado.");
    startSecondAgent();
});
