document.addEventListener('DOMContentLoaded', () => {
    // Agente Selector
    const agents = ['Agente 1', 'Agente 2', 'Agente 3'];
    let currentAgentIndex = 0;

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
        for (let i = 1; i <= 11; i++) {
            const bar = document.createElement('div');
            bar.className = 'bar';
            if (i <= currentLevel) {
                bar.classList.add('active');
            }
            levelBarsElement.appendChild(bar);
        }
    }

    leftArrowLevel.addEventListener('click', () => {
        currentLevel = (currentLevel > 1) ? currentLevel - 1 : 11;
        updateLevelBars();
    });

    rightArrowLevel.addEventListener('click', () => {
        currentLevel = (currentLevel < 11) ? currentLevel + 1 : 1;
        updateLevelBars();
    });

    updateLevelBars();

    // Save Configuration
    const saveConfigButton = document.getElementById('save-config');
    saveConfigButton.addEventListener('click', () => {
        localStorage.setItem('selectedAgent', agents[currentAgentIndex]);
        localStorage.setItem('selectedLevel', currentLevel);
        window.location.href = '../TelaMenu.html';
    });
});
