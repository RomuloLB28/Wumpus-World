// Configurações do AG
const popSize = 100;
const genomeLength = 50;
const generations = 100;
const mutationRate = 0.05;

function gerarOrientacaoAleatoria() {
    var orientacoes = ['N', 'S', 'E', 'W'];
    var indiceAleatorio = Math.floor(Math.random() * orientacoes.length);
    return orientacoes[indiceAleatorio];
}

// Geração inicial
function generatePopulation(size, genomeLength) {
    let population = [];
    for (let i = 0; i < size; i++) {
        let individual = {
            genome: [],
            position: { x: 0, y: 0 },
            orientation: gerarOrientacaoAleatoria(),
            hasGold: false,
            alive: true
        };
        for (let j = 0; j < genomeLength; j++) {
            individual.genome.push(Math.floor(Math.random() * 4));
        }
        population.push(individual);
    }
    return population;
}

// Função de avaliação
function evaluate(individual, n, poços, wumpus, ouro) {
    let { position, genome } = individual;
    let x = position.x, y = position.y;  // Posição inicial
    let hasGold = false;
    let fitness = 0;

    for (let action of genome) {
        if (action === 0) {  // Up
            x = Math.max(0, x - 1);
        } else if (action === 1) {  // Down
            x = Math.min(n - 1, x + 1);
        } else if (action === 2) {  // Left
            y = Math.max(0, y - 1);
        } else if (action === 3) {  // Right
            y = Math.min(n - 1, y + 1);
        }

        if (poços.some(p => p[0] === x && p[1] === y) || (x === wumpus[0] && y === wumpus[1])) {
            return -1000;  // Perdeu, punição alta
        }

        if (x === ouro[0] && y === ouro[1]) {
            hasGold = true;
        }

        if (hasGold && x === 0 && y === 0) {
            return 1000 - genome.length;  // Encontrou o ouro e voltou, bônus por eficiência
        }
    }

    return fitness;
}

// Seleção (torneio)
function tournamentSelection(population, fitnesses, k = 3) {
    let selected = [];
    for (let i = 0; i < k; i++) {
        let idx = Math.floor(Math.random() * population.length);
        selected.push({ individual: population[idx], fitness: fitnesses[idx] });
    }
    selected.sort((a, b) => b.fitness - a.fitness);
    return selected[0].individual;
}

// Crossover de um ponto
function crossover(parent1, parent2) {
    let point = Math.floor(Math.random() * (genomeLength - 1)) + 1;
    return parent1.genome.slice(0, point).concat(parent2.genome.slice(point));
}

// Mutação
function mutate(individual, mutationRate) {
    for (let i = 0; i < individual.genome.length; i++) {
        if (Math.random() < mutationRate) {
            individual.genome[i] = Math.floor(Math.random() * 4);
        }
    }
    return individual;
}

// Algoritmo Genético
async function runGeneticAlgorithm(n, poços, wumpus, ouro) {
    let population = generatePopulation(popSize, genomeLength);

    for (let generation = 0; generation < generations; generation++) {
        let fitnesses = population.map(individual => evaluate(individual, n, poços, wumpus, ouro));
        let newPopulation = [];

        for (let i = 0; i < popSize; i++) {
            let parent1 = tournamentSelection(population, fitnesses);
            let parent2 = tournamentSelection(population, fitnesses);
            let offspringGenome = mutate({ genome: crossover(parent1, parent2) }, mutationRate);
            newPopulation.push({ ...offspringGenome, position: { x: 0, y: 0 }, orientation: gerarOrientacaoAleatoria(), hasGold: false, alive: true });
        }

        population = newPopulation;

        // Desenhar o melhor indivíduo de cada geração e aguardar a conclusão
        let bestFitness = Math.max(...fitnesses);
        let bestIndividual = population[fitnesses.indexOf(bestFitness)];
        await drawIndividual(bestIndividual, n, poços, wumpus, ouro, generation);

        // Aguardar um momento antes de passar para a próxima geração
        await new Promise(resolve => setTimeout(resolve, 2000));
    }

    let finalFitnesses = population.map(individual => evaluate(individual, n, poços, wumpus, ouro));
    let bestFitness = Math.max(...finalFitnesses);
    let bestIndividual = population[finalFitnesses.indexOf(bestFitness)];

    console.log(`Melhor solução encontrada: ${bestIndividual.genome}, Fitness: ${bestFitness}`);

    return { population, fitness: bestFitness };
}

// Função para iniciar o terceiro agente
async function startThirdAgent() {
    const n = rows;  // Tamanho do mundo
    const poços = poçosIndices.map(index => [Math.floor(index / cols), index % cols]);
    const wumpus = [Math.floor(wumpusIndex / cols), wumpusIndex % cols];
    const ouro = [Math.floor(ouroIndex / cols), ouroIndex % cols];

    await runGeneticAlgorithm(n, poços, wumpus, ouro);
}

async function drawIndividual(individual, n, poços, wumpus, ouro, generation) {
    let x = 0, y = 0;
    const individualElement = document.createElement('img');
    individualElement.src = '../Images/AgenteAndando.gif';
    individualElement.classList.add('individual');

    // Remove o indivíduo da posição anterior, se existir
    const previousElement = document.querySelector('.individual');
    if (previousElement && previousElement.parentElement) {
        previousElement.parentElement.removeChild(previousElement);
    }

    if (cells && cells[0]) {
        cells[0].appendChild(individualElement);
    }

    for (let step = 0; step < individual.genome.length; step++) {
        await new Promise(resolve => setTimeout(resolve, 1000));  // Delay entre os passos

        const action = individual.genome[step];

        // Verifica se a célula atual e o elemento existem antes de tentar remover o elemento
        if (cells[x * cols + y] && cells[x * cols + y].contains(individualElement)) {
            cells[x * cols + y].removeChild(individualElement);
        }

        // Atualiza a posição com base na ação
        if (action === 0) {  // Up
            x = Math.max(0, x - 1);
        } else if (action === 1) {  // Down
            x = Math.min(n - 1, x + 1);
        } else if (action === 2) {  // Left
            y = Math.max(0, y - 1);
        } else if (action === 3) {  // Right
            y = Math.min(n - 1, y + 1);
        }

        // Verifica se a nova célula existe antes de tentar adicionar o elemento
        if (cells[x * cols + y]) {
            cells[x * cols + y].appendChild(individualElement);
        }

        // Se o indivíduo morrer ou pegar o ouro e voltar para a posição inicial, parar de desenhar
        if (evaluate(individual, n, poços, wumpus, ouro) !== 0) {
            break;
        }
    }

    // Remove o indivíduo ao finalizar a execução
    if (cells[x * cols + y] && cells[x * cols + y].contains(individualElement)) {
        cells[x * cols + y].removeChild(individualElement);
    }

    console.log(`Geração ${generation}: Melhor indivíduo ${JSON.stringify(individual)}`);
}

// Inicia o terceiro agente
startThirdAgent();
