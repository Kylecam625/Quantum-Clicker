// Upgrade definitions
const upgrades = [
    {
        id: 'clickingPower',
        name: 'Clicking Power',
        description: 'Harness more particles per click',
        icon: '👆',
        cost: 500,
        requirement: { totalClicks: 100 },
        effect: () => {
            gameState.particlesPerClick *= 2;
        },
        purchased: false
    },
    {
        id: 'quantumEfficiency',
        name: 'Quantum Efficiency',
        description: 'All buildings produce 50% more particles',
        icon: '⚡',
        cost: 2000,
        requirement: { totalParticles: 5000 },
        effect: () => {
            buildings.forEach(building => {
                building.baseQpS *= 1.5;
            });
            recalculateQpS();
        },
        purchased: false
    },
    {
        id: 'criticalMass',
        name: 'Critical Mass',
        description: '5% chance for clicks to be 10x more powerful',
        icon: '💥',
        cost: 3000,
        requirement: { totalClicks: 300 },
        effect: () => {
            initCriticalClick();
        },
        purchased: false
    },
    {
        id: 'quantumChain',
        name: 'Quantum Chain',
        description: 'Clicking quickly builds up a chain multiplier (up to 3x)',
        icon: '⛓️',
        cost: 4000,
        requirement: { totalClicks: 500 },
        effect: () => {
            initChainClick();
        },
        purchased: false
    },
    {
        id: 'particleField',
        name: 'Particle Field',
        description: 'Automatically generates 1% of click power every second',
        icon: '🌌',
        cost: 5000,
        requirement: { totalParticles: 10000 },
        effect: () => {
            initParticleField();
        },
        purchased: false
    },
    {
        id: 'clickNova',
        name: 'Click Nova',
        description: 'Every 50th click triggers a massive 50x burst',
        icon: '🌟',
        cost: 7500,
        requirement: { totalClicks: 1000 },
        effect: () => {
            initClickNova();
        },
        purchased: false
    },
    {
        id: 'quantumMomentum',
        name: 'Quantum Momentum',
        description: 'Each building owned increases click power by 1%',
        icon: '🔄',
        cost: 10000,
        requirement: { totalParticles: 25000 },
        effect: () => {
            initQuantumMomentum();
        },
        purchased: false
    },
    {
        id: 'timeFreeze',
        name: 'Time Freeze',
        description: 'Buying a building temporarily boosts click power by 5x',
        icon: '⏱️',
        cost: 15000,
        requirement: { totalParticles: 50000 },
        effect: () => {
            initTimeFreeze();
        },
        purchased: false
    },
    {
        id: 'multiverseClick',
        name: 'Multiverse Click',
        description: 'Each click triggers 1-5 clicks across parallel universes',
        icon: '🌌',
        cost: 25000,
        requirement: { totalParticles: 100000 },
        effect: () => {
            initMultiverseClick();
        },
        purchased: false
    },
    {
        id: 'quantumSupremacy',
        name: 'Quantum Supremacy',
        description: 'All clicks are 50% more powerful',
        icon: '👑',
        cost: 50000,
        requirement: { totalParticles: 200000 },
        effect: () => {
            initQuantumSupremacy();
        },
        purchased: false
    },
    {
        id: 'entanglement',
        name: 'Quantum Entanglement',
        description: 'Buildings occasionally trigger bonus production',
        icon: '🔮',
        cost: 75000,
        requirement: { totalParticles: 300000 },
        effect: () => {
            setInterval(() => {
                if (Math.random() < 0.1) { // 10% chance every second
                    const bonus = gameState.particlesPerSecond * 10;
                    gameState.totalParticles += bonus;
                    gameState.totalParticlesEarned += bonus;
                    updateDisplay();
                }
            }, 1000);
        },
        purchased: false
    },
    {
        id: 'quantumTunneling',
        name: 'Quantum Tunneling',
        description: 'Chance to skip building cost scaling on purchase',
        icon: '🚇',
        cost: 100000,
        requirement: { totalParticles: 500000 },
        effect: () => {
            const originalGetTotalCost = window.getTotalCost;
            window.getTotalCost = (building, amount) => {
                if (Math.random() < 0.15) { // 15% chance
                    return building.baseCost * amount;
                }
                return originalGetTotalCost(building, amount);
            };
        },
        purchased: false
    }
];

// Add these new upgrades to the upgrades array
const clickUpgrades = [
    {
        id: 'holdClick',
        name: 'Hold to Click',
        description: 'Hold mouse button to auto-click (2 clicks per second)',
        icon: '✊',
        cost: 1000,
        requirement: { totalClicks: 50 },
        effect: () => {
            initHoldClick();
        },
        purchased: false
    },
    {
        id: 'burstClick',
        name: 'Burst Click',
        description: 'Each click has a 10% chance to trigger 5 extra clicks',
        icon: '💥',
        cost: 5000,
        requirement: { totalClicks: 200 },
        effect: () => {
            initBurstClick();
        },
        purchased: false
    }
];

// Add the new upgrades to the main upgrades array
upgrades.push(...clickUpgrades);

// Initialize upgrades
function initUpgrades() {
    const upgradesSection = document.getElementById('upgradesSection');
    upgradesSection.innerHTML = '<h2 class="section-header">Quantum Upgrades</h2>';
    
    // First, reapply effects of purchased upgrades
    upgrades.forEach(upgrade => {
        if (upgrade.purchased && typeof upgrade.effect === 'function') {
            try {
                upgrade.effect();
            } catch (error) {
                console.error(`Error reapplying upgrade ${upgrade.name}:`, error);
            }
        }
    });

    // Then show only unpurchased upgrades that meet requirements
    upgrades.forEach(upgrade => {
        if (!upgrade.purchased && checkUpgradeRequirement(upgrade)) {
            const upgradeElement = createUpgradeElement(upgrade);
            upgradesSection.appendChild(upgradeElement);
        }
    });
}

// Create HTML element for an upgrade
function createUpgradeElement(upgrade) {
    const element = document.createElement('div');
    element.className = 'upgrade-item';
    element.id = `upgrade-${upgrade.id}`;
    
    const meetsRequirement = checkUpgradeRequirement(upgrade);
    const canAfford = gameState.totalParticles >= upgrade.cost;
    
    if (!meetsRequirement) {
        element.className += ' locked';
        element.innerHTML = `
            <div class="upgrade-icon">❓</div>
            <div class="upgrade-info">
                <div class="upgrade-name">???</div>
                <div class="upgrade-description">This upgrade is yet to be discovered...</div>
            </div>
            <button class="buy-button" disabled>???</button>
        `;
        return element;
    }
    
    element.innerHTML = `
        <div class="upgrade-icon">${upgrade.icon}</div>
        <div class="upgrade-info">
            <div class="upgrade-name">${upgrade.name}</div>
            <div class="upgrade-description">${upgrade.description}</div>
            <div class="upgrade-cost">Cost: ⚛️${formatNumber(upgrade.cost)}</div>
        </div>
        <button class="buy-button" ${canAfford ? '' : 'disabled'}>Buy</button>
    `;
    
    const buyButton = element.querySelector('.buy-button');
    buyButton.addEventListener('click', () => buyUpgrade(upgrade.id));
    
    return element;
}

// Check if upgrade requirements are met
function checkUpgradeRequirement(upgrade) {
    if (!upgrade.requirement) return true;
    
    if (upgrade.requirement.buildingId !== undefined) {
        const building = buildings.find(b => b.id === upgrade.requirement.buildingId);
        return building && building.quantity >= upgrade.requirement.quantity;
    }
    if (upgrade.requirement.totalParticles !== undefined) {
        return gameState.totalParticles >= upgrade.requirement.totalParticles;
    }
    if (upgrade.requirement.totalClicks !== undefined) {
        return gameState.totalClicks >= upgrade.requirement.totalClicks;
    }
    return true;
}

// Check if player can afford upgrade
function canAffordUpgrade(upgrade) {
    return gameState.totalParticles >= upgrade.cost;
}

// Buy an upgrade
function buyUpgrade(upgradeId) {
    const upgrade = upgrades.find(u => u.id === upgradeId);
    if (!upgrade || upgrade.purchased) return;
    
    const currentCanAfford = gameState.totalParticles >= upgrade.cost;
    if (!currentCanAfford) return;
    
    // Deduct the cost and mark as purchased
    gameState.totalParticles -= upgrade.cost;
    upgrade.purchased = true;
    
    // Apply the upgrade effect
    if (typeof upgrade.effect === 'function') {
        try {
            upgrade.effect();
            console.log(`Upgrade ${upgrade.name} effect applied successfully`);
        } catch (error) {
            console.error(`Error applying upgrade ${upgrade.name}:`, error);
        }
    }
    
    // Remove the upgrade element
    const element = document.getElementById(`upgrade-${upgrade.id}`);
    if (element) {
        element.style.animation = 'purchaseEffect 0.5s ease-out forwards';
        setTimeout(() => element.remove(), 500);
    }
    
    // Update game state
    recalculateQpS();
    updateBuildingsDisplay();
    updateDisplay();
    
    // Show purchase notification
    showUpgradeNotification(upgrade);
    
    // Save the game
    if (typeof saveGame === 'function') {
        saveGame();
    }
}

// Show upgrade purchase notification
function showUpgradeNotification(upgrade) {
    const notification = document.createElement('div');
    notification.className = 'upgrade-notification';
    notification.innerHTML = `
        <div class="upgrade-icon">${upgrade.icon}</div>
        <div class="upgrade-content">
            <h3>${upgrade.name} Purchased!</h3>
            <p>${upgrade.description}</p>
        </div>
    `;
    
    // Add notification styles if not present
    if (!document.getElementById('upgrade-notification-styles')) {
        const style = document.createElement('style');
        style.id = 'upgrade-notification-styles';
        style.textContent = `
            .upgrade-notification {
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: rgba(33, 150, 243, 0.9);
                color: white;
                padding: 1rem;
                border-radius: 8px;
                display: flex;
                align-items: center;
                gap: 1rem;
                animation: slideIn 0.5s ease-out;
                z-index: 1000;
                backdrop-filter: blur(5px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            }
            
            @keyframes purchaseEffect {
                0% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.1); opacity: 0.5; }
                100% { transform: scale(0); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.5s ease-in forwards';
        setTimeout(() => notification.remove(), 500);
    }, 3000);
}

// Check for new available upgrades
function checkUpgrades() {
    const upgradesSection = document.getElementById('upgradesSection');
    if (!upgradesSection) return;
    
    upgrades.forEach(upgrade => {
        if (!upgrade.purchased) {
            const element = document.getElementById(`upgrade-${upgrade.id}`);
            const meetsRequirement = checkUpgradeRequirement(upgrade);
            const canAfford = gameState.totalParticles >= upgrade.cost;
            
            if (element) {
                if (meetsRequirement && element.classList.contains('locked')) {
                    // Upgrade just became available, recreate its element
                    const newElement = createUpgradeElement(upgrade);
                    newElement.classList.add('just-unlocked');
                    element.parentNode.replaceChild(newElement, element);
                    setTimeout(() => {
                        newElement.classList.remove('just-unlocked');
                    }, 2000);
                } else if (meetsRequirement) {
                    // Update existing unlocked upgrade
                    const buyButton = element.querySelector('.buy-button');
                    if (buyButton) {
                        buyButton.disabled = !canAfford;
                    }
                    
                    const costElement = element.querySelector('.upgrade-cost');
                    if (costElement) {
                        costElement.textContent = `Cost: ⚛️${formatNumber(upgrade.cost)}`;
                    }
                }
            } else if (meetsRequirement) {
                // Add newly available upgrade
                const upgradeElement = createUpgradeElement(upgrade);
                upgradesSection.appendChild(upgradeElement);
                upgradeElement.style.animation = 'appear 0.5s ease-out';
            }
        }
    });
}

// Add upgrade checking to the game loop
if (typeof gameLoop === 'function') {
    const originalGameLoop = gameLoop;
    gameLoop = function(timestamp) {
        originalGameLoop(timestamp);
        checkUpgrades();
    };
}

// Initialize hold click functionality
function initHoldClick() {
    let holdInterval = null;
    const clickArea = document.getElementById('clickArea');
    const quantumCore = clickArea.querySelector('.quantum-core');
    
    quantumCore.addEventListener('mousedown', (e) => {
        if (holdInterval) return;
        
        // Trigger initial click
        quantumCore.click();
        
        // Start auto-clicking
        holdInterval = setInterval(() => {
            quantumCore.click();
        }, 250); // Click every 250ms (4 clicks per second)
    });
    
    document.addEventListener('mouseup', () => {
        if (holdInterval) {
            clearInterval(holdInterval);
            holdInterval = null;
        }
    });
    
    // Clear interval if mouse leaves the window
    document.addEventListener('mouseleave', () => {
        if (holdInterval) {
            clearInterval(holdInterval);
            holdInterval = null;
        }
    });
}

// Initialize burst click functionality
function initBurstClick() {
    const originalClick = handleParticleClick;
    handleParticleClick = (event) => {
        originalClick(event);
        if (Math.random() < 0.1) { // 10% chance
            for (let i = 0; i < 5; i++) {
                setTimeout(() => originalClick(event), i * 50);
            }
        }
    };
}

// Initialize chain click functionality
let lastClickTime = 0;
let chainMultiplier = 1;

function initChainClick() {
    const originalClick = handleParticleClick;
    handleParticleClick = (event) => {
        const now = Date.now();
        if (now - lastClickTime < 1000) {
            chainMultiplier = Math.min(3, chainMultiplier + 0.2);
        } else {
            chainMultiplier = 1;
        }
        lastClickTime = now;
        
        const originalPerClick = gameState.particlesPerClick;
        gameState.particlesPerClick *= chainMultiplier;
        originalClick(event);
        gameState.particlesPerClick = originalPerClick;
    };
}

// Initialize critical click functionality
function initCriticalClick() {
    const originalClick = handleParticleClick;
    handleParticleClick = (event) => {
        if (Math.random() < 0.05) { // 5% chance
            const originalPerClick = gameState.particlesPerClick;
            gameState.particlesPerClick *= 10;
            originalClick(event);
            gameState.particlesPerClick = originalPerClick;
        } else {
            originalClick(event);
        }
    };
}

// Initialize particle field (passive clicking)
function initParticleField() {
    setInterval(() => {
        gameState.totalParticles += gameState.particlesPerClick * 0.01;
        gameState.totalParticlesEarned += gameState.particlesPerClick * 0.01;
        updateDisplay();
    }, 1000);
}

// Initialize click nova
function initClickNova() {
    let clickCount = 0;
    const originalClick = handleParticleClick;
    handleParticleClick = (event) => {
        originalClick(event);
        clickCount++;
        if (clickCount >= 50) {
            clickCount = 0;
            const originalPerClick = gameState.particlesPerClick;
            gameState.particlesPerClick *= 50;
            originalClick(event);
            gameState.particlesPerClick = originalPerClick;
        }
    };
}

// Initialize quantum momentum
function initQuantumMomentum() {
    const originalClick = handleParticleClick;
    handleParticleClick = (event) => {
        const totalBuildings = buildings.reduce((sum, b) => sum + b.quantity, 0);
        const originalPerClick = gameState.particlesPerClick;
        gameState.particlesPerClick *= (1 + totalBuildings * 0.01);
        originalClick(event);
        gameState.particlesPerClick = originalPerClick;
    };
}

// Initialize time freeze
let timeFreezeActive = false;
function initTimeFreeze() {
    // Instead of replacing buyBuilding, we'll hook into the building purchase event
    const originalBuyBuilding = window.buyBuilding;
    window.buyBuilding = function(buildingId, amount) {
        // Call the original function first
        originalBuyBuilding.call(this, buildingId, amount);
        
        // Then apply the time freeze effect if it's not already active
        if (!timeFreezeActive) {
            timeFreezeActive = true;
            const originalPerClick = gameState.particlesPerClick;
            gameState.particlesPerClick *= 5;
            setTimeout(() => {
                gameState.particlesPerClick = originalPerClick;
                timeFreezeActive = false;
            }, 5000);
        }
    };
}

// Initialize multiverse click
function initMultiverseClick() {
    const originalClick = handleParticleClick;
    handleParticleClick = (event) => {
        const universes = Math.floor(Math.random() * 5) + 1;
        for (let i = 0; i < universes; i++) {
            originalClick(event);
        }
    };
}

// Initialize quantum supremacy
function initQuantumSupremacy() {
    const originalClick = handleParticleClick;
    handleParticleClick = (event) => {
        const originalPerClick = gameState.particlesPerClick;
        gameState.particlesPerClick *= 1.5;
        originalClick(event);
        gameState.particlesPerClick = originalPerClick;
    };
} 