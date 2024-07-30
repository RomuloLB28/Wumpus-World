// Configurações do AG
const popSize = 100;
const genomeLength = 50;
const generations = 100;
const mutationRate = 0.02;

function gerarOrientacaoAleatoria() {
    var orientacoes = ['N', 'S', 'E', 'W', 'P'];  // Adiciona 'P' para permanecer parado
    var indiceAleatorio = Math.floor(Math.random() * orientacoes.length);
    return orientacoes[indiceAleatorio];
}

// Função para pegar o ouro visualmente
function grabGold(individual) {
    individual.hasGold = true;
    const index = individual.position.y * cols + individual.position.x;
    const gold = cells[index].querySelector("img[src*='Ouro.png']");
    const glitter = cells[index].querySelector("img[src*='Brilho.png']");
    if (gold) gold.remove();
    if (glitter) glitter.remove();
}

// Função para verificar se há ouro na célula atual
function isGoldHere(individual) {
    const index = individual.position.y * cols + individual.position.x;
    if (cells[index] && cells[index].querySelector("img[src*='Ouro.png']") !== null) {
        return true;
    }
    return false;
}

// Função para verificar se há Wumpus na célula atual
function isWumpusHere(individual) {
    const index = individual.position.y * cols + individual.position.x;
    if (cells[index] && cells[index].querySelector("img[src*='Wumpus.png']") !== null) {
        return true;
    }
    return false;
}

// Função para verificar se há poço na célula atual
function isPitHere(individual) {
    const index = individual.position.y * cols + individual.position.x;
    if (cells[index] && cells[index].querySelector("img[src*='Poço.png']") !== null) {
        return true;
    }
    return false;
}

// Geração inicial
function generatePopulation(size, genomeLength,n) {
    let population = [];
    for (let i = 0; i < size; i++) {
        let individual = {
            genome: [],
            position: { x: 0, y: 0 },
            orientation: gerarOrientacaoAleatoria(),
            hasGold: false,
            alive: true,
            fitness: 0, // Adiciona a propriedade fitness
            knowledge: Array(n).fill().map(() => Array(n).fill({ isPit: false, isWumpus: false })) // Memória do agente
        };
        for (let j = 0; j < genomeLength; j++) {
            individual.genome.push(Math.floor(Math.random() * 4));
        }
        population.push(individual);
    }
    return population;
}

function evaluate(individual, n, poços, wumpus, ouro) {
    let { position, genome, knowledge } = individual;
    let x = position.x, y = position.y;
    let hasGold = false;
    let fitness = 0;
    let genomeIndex = 0;

    while (genomeIndex < genome.length) {
        let action = genome[genomeIndex++];
        
        if (action === 0) {  // Up
            x = Math.max(0, x - 1);
        } else if (action === 1) {  // Down
            fitness -= 1;
            x = Math.min(n - 1, x + 1);
        } else if (action === 2) {  // Left
            fitness -= 1;
            y = Math.max(0, y - 1);
        } else if (action === 3) {  // Right
            fitness -= 1;
            y = Math.min(n - 1, y + 1);
        } else if (action === 4) {  // Stay (Permanecer parado)
            // x e y permanecem inalterados
        }

        individual.position = { x, y };

        if (isPitHere(individual)) {
            knowledge[x][y].isPit = true;
            individual.alive = false;
            individual.fitness -= 2500;
            console.log("Agente Morreu no poço");
            console.log(`${individual.fitness}`);
            break;
        }

        if (isWumpusHere(individual)) {
            knowledge[x][y].isWumpus = true;
            individual.alive = false;
            individual.fitness -= 2500;
            console.log("Agente Morreu para o wumpus");
            console.log(`${individual.fitness}`);
            break;
        }

        if (x === ouro[0] && y === ouro[1]) {
            hasGold = true;
            grabGold(individual);
        }

        if (hasGold && x === 0 && y === 0) {
            fitness += 3000;
            // Preenche o restante do genoma com 4
            for (let i = genomeIndex; i < genome.length; i++) {
                genome[i] = 4;
            }
            console.log("Agente Voltou com o ouro");
            console.log(`${individual.fitness}`);
            break;
        }

        if (x < 0 || x >= n || y < 0 || y >= n) {
            fitness -= 1000;
            break;
        }
    }

    individual.fitness = Math.max(0, fitness);
    return individual.fitness;
}

// Seleção (torneio) - Apenas entre indivíduos com fitness > 0 e vivos
function tournamentSelection(population, fitnesses) {
    let validIndividuals = population.filter((individual, index) => fitnesses[index] > 0 && individual.alive);

    if (validIndividuals.length === 0) {
        // Caso não haja indivíduos com fitness positivo e vivos, retorna um indivíduo aleatório
        let randomIndex = Math.floor(Math.random() * population.length);
        return population[randomIndex];
    }

    let selected = validIndividuals[0];
    for (let i = 1; i < validIndividuals.length; i++) {
        if (fitnesses[population.indexOf(validIndividuals[i])] > fitnesses[population.indexOf(selected)]) {
            selected = validIndividuals[i];
        }
    }
    return selected;
}

// Crossover alternando genes de forma aleatória entre os pais
function crossover(parent1, parent2) {
    // Verifica se os pais são definidos e têm o atributo 'genome'
    if (!parent1 || !parent2 || !parent1.genome || !parent2.genome) {
        console.error('Pais inválidos ou sem genoma:', parent1, parent2);
        return [];
    }
    let offspringGenome = [];
    for (let i = 0; i < genomeLength; i++) {
        if (Math.random() < 0.5) {
            offspringGenome.push(parent1.genome[i]);
        } else {
            offspringGenome.push(parent2.genome[i]);
        }
    }
    return offspringGenome;
}

// Mutação
function mutate(individual, mutationRate) {
    for (let i = 0; i < individual.genome.length; i++) {
        if (Math.random() < mutationRate) {
            individual.genome[i] = Math.floor(Math.random() * 5);  // Atualiza para 5 ações possíveis
        }
    }
    return individual;
}

async function runGeneticAlgorithm(n, poços, wumpus, ouro) {
    let population = generatePopulation(popSize, genomeLength, n);  // Gera a população inicial

    for (let generation = 0; generation < generations; generation++) {
        let fitnesses = population.map(individual => evaluate(individual, n, poços, wumpus, ouro));  // Avalia o fitness de cada indivíduo

        // Filtra indivíduos com fitness positivo e vivos
        let survivingPopulation = population.filter((individual, index) => fitnesses[index] > 0 && individual.alive);

        let selectedIndividuals = [...survivingPopulation];  // Começa com os indivíduos sobreviventes

        // Seleciona os pais e cria novos indivíduos para preencher a população
        while (selectedIndividuals.length < popSize) {
            let parent1 = tournamentSelection(population, fitnesses);  // Seleciona o primeiro pai
            let parent2 = tournamentSelection(population, fitnesses);  // Seleciona o segundo pai
            let offspringGenome = crossover(parent1, parent2);  // Cria o genoma do filho através do crossover
            mutate({ genome: offspringGenome }, mutationRate);  // Passa o genoma do filho para a função de mutação
            selectedIndividuals.push({  // Adiciona o filho à nova população
                genome: offspringGenome,
                position: { x: 0, y: 0 },
                orientation: parent1.orientation,
                hasGold: false,
                alive: true,
                fitness: 0,  // Adiciona a propriedade fitness
                knowledge: Array(n).fill().map(() => Array(n).fill({ isPit: false, isWumpus: false })) // Memória do agente
            });
        }

        population = selectedIndividuals;  // Atualiza a população para a próxima geração
    }

    // Avalia a última população para encontrar o melhor indivíduo
    let finalFitnesses = population.map(individual => evaluate(individual, n, poços, wumpus, ouro));
    let bestFitness = Math.max(...finalFitnesses);
    
    // Encontra o melhor indivíduo vivo com a maior fitness
    let bestIndividual = population.reduce((best, current) => {
        if (current.alive && evaluate(current, n, poços, wumpus, ouro) === bestFitness) {
            return current;
        }
        return best;
    }, null);

    console.log(`Melhor solução encontrada: ${JSON.stringify(bestIndividual)}, Fitness: ${bestFitness}`);

    // Desenha o melhor indivíduo da última geração
    await drawIndividual(bestIndividual, n, poços, wumpus, ouro, generations);

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

    const previousElement = document.querySelector('.individual');
    if (previousElement && previousElement.parentElement) {
        previousElement.parentElement.removeChild(previousElement);
    }

    if (cells && cells[0]) {
        cells[0].appendChild(individualElement);
    }

    for (let step = 0; step < individual.genome.length; step++) {
        await new Promise(resolve => setTimeout(resolve, 1000));

        const action = individual.genome[step];

        if (cells[x * cols + y] && cells[x * cols + y].contains(individualElement)) {
            cells[x * cols + y].removeChild(individualElement);
        }

        if (action === 0) {  // Up
            x = Math.max(0, x - 1);
        } else if (action === 1) {  // Down
            x = Math.min(n - 1, x + 1);
        } else if (action === 2) {  // Left
            y = Math.max(0, y - 1);
        } else if (action === 3) {  // Right
            y = Math.min(n - 1, y + 1);
        } else if (action === 4) {  // Stay (Permanecer parado)
            // Não altera a posição
        }

        if (cells[x * cols + y]) {
            cells[x * cols + y].appendChild(individualElement);
        }
    }

    console.log(`Geração ${generation}: Melhor indivíduo ${JSON.stringify(individual)}`);
}

document.addEventListener('DOMContentLoaded', (event) => {
    // Inicia o terceiro agente
    startThirdAgent();
});
