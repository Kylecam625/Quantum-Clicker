// Building definitions
const buildings = [
    {
        id: 0,
        name: "Basic Detector",
        icon: "📡",
        baseCost: 15,
        baseQpS: 0.1,
        quantity: 0,
        description: "A simple quantum particle detector",
        unlockCondition: () => true // Always available
    },
    {
        id: 1,
        name: "Cryostat Chamber",
        icon: "❄️",
        baseCost: 100,
        baseQpS: 1,
        quantity: 0,
        description: "Keeps quantum particles in their ground state",
        unlockCondition: () => gameState.totalParticlesEarned >= 100
    },
    {
        id: 2,
        name: "Quantum Computer",
        icon: "💻",
        baseCost: 1100,
        baseQpS: 8,
        quantity: 0,
        description: "Processes quantum information",
        unlockCondition: () => buildings.find(b => b.id === 1).quantity >= 5
    },
    {
        id: 3,
        name: "Particle Accelerator",
        icon: "⚡",
        baseCost: 12000,
        baseQpS: 47,
        quantity: 0,
        description: "Accelerates particles to near light speed",
        unlockCondition: () => buildings.find(b => b.id === 2).quantity >= 10
    },
    {
        id: 4,
        name: "Quantum Entangler",
        icon: "🔮",
        baseCost: 130000,
        baseQpS: 260,
        quantity: 0,
        description: "Creates pairs of entangled particles",
        unlockCondition: () => gameState.totalParticlesEarned >= 50000
    },
    {
        id: 5,
        name: "Hadron Collider",
        icon: "💫",
        baseCost: 1400000,
        baseQpS: 1400,
        quantity: 0,
        description: "Collides particles to create new ones",
        unlockCondition: () => buildings.find(b => b.id === 4).quantity >= 25
    },
    {
        id: 6,
        name: "Quantum Condenser",
        icon: "🌀",
        baseCost: 20000000,
        baseQpS: 7800,
        quantity: 0,
        description: "Condenses quantum energy into particles",
        unlockCondition: () => gameState.totalParticlesEarned >= 10000000
    },
    {
        id: 7,
        name: "String Resonator",
        icon: "🎻",
        baseCost: 330000000,
        baseQpS: 44000,
        quantity: 0,
        description: "Vibrates quantum strings to generate particles",
        unlockCondition: () => buildings.find(b => b.id === 6).quantity >= 10
    },
    {
        id: 8,
        name: "Dimensional Gate",
        icon: "🌌",
        baseCost: 5100000000,
        baseQpS: 260000,
        quantity: 0,
        description: "Opens portals to quantum dimensions",
        unlockCondition: () => buildings.find(b => b.id === 7).quantity >= 15
    },
    {
        id: 9,
        name: "Time Loop Generator",
        icon: "⌛",
        baseCost: 75000000000,
        baseQpS: 1600000,
        quantity: 0,
        description: "Creates time loops to multiply particles",
        unlockCondition: () => gameState.totalParticlesEarned >= 50000000000
    },
    {
        id: 10,
        name: "Reality Shaper",
        icon: "🌟",
        baseCost: 1000000000000,
        baseQpS: 10000000,
        quantity: 0,
        description: "Shapes reality to generate particles",
        unlockCondition: () => buildings.find(b => b.id === 9).quantity >= 10
    },
    {
        id: 11,
        name: "Omniverse Core",
        icon: "🌍",
        baseCost: 14000000000000,
        baseQpS: 65000000,
        quantity: 0,
        description: "Harnesses energy from multiple universes",
        unlockCondition: () => buildings.find(b => b.id === 10).quantity >= 15
    },
    {
        id: 12,
        name: "Cosmic Harvester",
        icon: "🌠",
        baseCost: 170000000000000,
        baseQpS: 400000000,
        quantity: 0,
        description: "Harvests particles from cosmic phenomena",
        unlockCondition: () => gameState.totalParticlesEarned >= 100000000000000
    },
    {
        id: 13,
        name: "Neural Nexus",
        icon: "🧠",
        baseCost: 2.1e15,
        baseQpS: 2800000000,
        quantity: 0,
        description: "Quantum neural network that generates particles",
        unlockCondition: () => buildings.find(b => b.id === 12).quantity >= 10
    },
    {
        id: 14,
        name: "Void Extractor",
        icon: "🕳️",
        baseCost: 2.6e16,
        baseQpS: 21000000000,
        quantity: 0,
        description: "Extracts particles from the quantum void",
        unlockCondition: () => gameState.totalParticlesEarned >= 5e17
    },
    {
        id: 15,
        name: "Eternity Engine",
        icon: "♾️",
        baseCost: 3.1e17,
        baseQpS: 150000000000,
        quantity: 0,
        description: "Generates particles from eternal energy",
        unlockCondition: () => buildings.find(b => b.id === 14).quantity >= 10
    },
    {
        id: 16,
        name: "Celestial Matrix",
        icon: "✨",
        baseCost: 3.8e18,
        baseQpS: 1100000000000,
        quantity: 0,
        description: "Harnesses celestial quantum energies",
        unlockCondition: () => gameState.totalParticlesEarned >= 1e18
    },
    {
        id: 17,
        name: "Infinity Core",
        icon: "💫",
        baseCost: 4.2e19,
        baseQpS: 8400000000000,
        quantity: 0,
        description: "Channels infinite quantum potential",
        unlockCondition: () => buildings.find(b => b.id === 16).quantity >= 15
    },
    {
        id: 18,
        name: "Quantum Singularity",
        icon: "🌑",
        baseCost: 5e20,
        baseQpS: 65000000000000,
        quantity: 0,
        description: "Creates a quantum singularity for particle generation",
        unlockCondition: () => buildings.find(b => b.id === 17).quantity >= 10 && gameState.totalParticlesEarned >= 1e30
    }
];

// Initialize buildings
function initBuildings() {
    const buildingsSection = document.getElementById('buildingsSection');
    if (!buildingsSection) return;
    
    buildingsSection.innerHTML = '<h2 class="section-header">Quantum Facilities</h2>';
    
    buildings.forEach(building => {
        const buildingElement = createBuildingElement(building);
        buildingsSection.appendChild(buildingElement);
    });
    
    // Initial QpS calculation
    recalculateQpS();
}

// Calculate cost for a single building
function getCurrentCost(building) {
    return Math.ceil(building.baseCost * Math.pow(1.15, building.quantity));
}

// Calculate total cost for buying N buildings
function calculateBulkCost(building, amount) {
    let totalCost = 0;
    const basePrice = building.baseCost;
    const growthRate = 1.15;
    
    for (let i = 0; i < amount; i++) {
        totalCost += Math.floor(basePrice * Math.pow(growthRate, building.quantity + i));
    }
    
    return Math.floor(totalCost);
}

// Calculate maximum buildings that can be bought with current particles
function calculateMaxBuyable(building) {
    const r = 1.15; // Cost multiplier
    const c = building.baseCost;
    const n = building.quantity || 0;
    const p = gameState.totalParticles;
    
    // Using the formula: maxBuyable = floor(log_r((p * (r-1))/(c * r^n) + 1))
    if (p < c * Math.pow(r, n)) return 0;  // Can't afford even one
    
    const maxBuyable = Math.floor(
        Math.log((p * (r-1))/(c * Math.pow(r, n)) + 1) / Math.log(r)
    );
    
    return Math.max(0, maxBuyable);
}

// Format numbers (if not defined in main.js)
function formatNumber(num, noDecimals = false) {
    if (num === 0) return "0";
    if (noDecimals) num = Math.floor(num);
    
    // For numbers less than 1 million, show the full number with commas
    if (num < 1e6) {
        return num.toLocaleString('en-US', {
            maximumFractionDigits: num % 1 === 0 ? 0 : 1
        });
    }
    
    // For larger numbers, use abbreviations
    if (num < 1e9) return (num/1e6).toFixed(1) + 'M';
    if (num < 1e12) return (num/1e9).toFixed(1) + 'B';
    return (num/1e12).toFixed(1) + 'T';
}

// Create HTML element for a building
function createBuildingElement(building) {
    const buildingElement = document.createElement('div');
    buildingElement.className = 'building-item';
    buildingElement.dataset.buildingId = building.id;
    
    // Check if building is unlocked
    const isUnlocked = building.unlockCondition();
    if (!isUnlocked) {
        buildingElement.className += ' locked';
        buildingElement.innerHTML = `
            <div class="building-info">
                <div class="building-icon">❓</div>
                <div class="building-name">???</div>
                <div class="building-description">This facility is yet to be discovered...</div>
            </div>
        `;
        return buildingElement;
    }
    
    const buildingInfo = document.createElement('div');
    buildingInfo.className = 'building-info';
    
    const maxBuyable = calculateMaxBuyable(building);
    const singleCost = getCurrentCost(building);
    const maxCost = maxBuyable > 0 ? calculateBulkCost(building, maxBuyable) : singleCost;
    const canAffordSingle = gameState.totalParticles >= singleCost;
    const canAffordMax = maxBuyable > 0 && gameState.totalParticles >= maxCost;
    
    buildingInfo.innerHTML = `
        <div class="building-icon">${building.icon}</div>
        <div class="building-name">${building.name}</div>
        <div class="building-description">${building.description}</div>
        <div class="building-production">Producing ${formatNumber(building.baseQpS * (building.quantity || 0))} QpS</div>
        <div class="building-count">Owned: ${building.quantity || 0}</div>
        <div class="building-controls">
            <button class="buy-single">Buy ⚛️${formatNumber(singleCost)}</button>
            <button class="buy-max">${maxBuyable > 0 ? `Buy ${formatNumber(maxBuyable)} (⚛️${formatNumber(maxCost)})` : 'Buy Max'}</button>
        </div>
    `;
    
    buildingElement.appendChild(buildingInfo);
    
    // Add event listeners after the buttons are in the DOM
    const buyButton = buildingInfo.querySelector('.buy-single');
    const maxButton = buildingInfo.querySelector('.buy-max');
    
    if (buyButton) {
        buyButton.disabled = !canAffordSingle;
        buyButton.addEventListener('click', () => {
            console.log('Buy button clicked for building:', building.id);
            window.buyBuilding(building.id, 1);
        });
    }
    
    if (maxButton) {
        maxButton.disabled = !canAffordMax;
        maxButton.addEventListener('click', () => {
            console.log('Max button clicked for building:', building.id);
            window.buyBuilding(building.id, 'max');
        });
    }
    
    return buildingElement;
}

// Buy building function
function buyBuilding(buildingId, amount = 1) {
    console.log('Attempting to buy building:', buildingId, 'amount:', amount);
    
    const building = buildings.find(b => b.id === buildingId);
    if (!building) {
        console.error('Building not found:', buildingId);
        return;
    }

    console.log('Current particles:', gameState.totalParticles);
    console.log('Building:', building);

    let purchaseAmount, totalCost;
    
    if (amount === 'max') {
        // Calculate max buyable amount
        purchaseAmount = calculateMaxBuyable(building);
        console.log('Max buyable:', purchaseAmount);
        if (purchaseAmount <= 0) {
            console.log('Cannot buy any - max buyable is 0');
            return;
        }
        totalCost = calculateBulkCost(building, purchaseAmount);
    } else {
        purchaseAmount = 1;
        totalCost = building.baseCost * Math.pow(1.15, building.quantity || 0);
    }

    console.log('Purchase amount:', purchaseAmount);
    console.log('Total cost:', totalCost);

    // Check if player can afford the purchase
    if (gameState.totalParticles < totalCost) {
        console.log('Cannot afford. Need:', totalCost, 'Have:', gameState.totalParticles);
        return;
    }

    // Apply the purchase
    gameState.totalParticles -= totalCost;
    building.quantity = (building.quantity || 0) + purchaseAmount;
    
    console.log('Purchase successful!');
    console.log('New building quantity:', building.quantity);
    console.log('Remaining particles:', gameState.totalParticles);
    
    // Recalculate QPS and update display
    recalculateQpS();
    updateBuildingsDisplay();
    updateDisplay();
}

function getTotalCost(building, amount) {
    const r = 1.15;  // Cost multiplier
    const c = building.baseCost;
    const n = building.quantity || 0;
    
    // Using the formula: totalCost = c * (r^n) * (r^amount - 1)/(r-1)
    return Math.floor(
        c * Math.pow(r, n) * (Math.pow(r, amount) - 1)/(r-1)
    );
}

// Update buildings display
function updateBuildingsDisplay() {
    buildings.forEach(building => {
        const buildingElement = document.querySelector(`[data-building-id="${building.id}"]`);
        if (!buildingElement) return;

        // Check if building unlock state has changed
        const isUnlocked = building.unlockCondition();
        if (!isUnlocked) {
            if (!buildingElement.classList.contains('locked')) {
                buildingElement.className = 'building-item locked';
                buildingElement.innerHTML = `
                    <div class="building-info">
                        <div class="building-icon">❓</div>
                        <div class="building-name">???</div>
                        <div class="building-description">This facility is yet to be discovered...</div>
                    </div>
                `;
            }
            return;
        } else if (buildingElement.classList.contains('locked')) {
            // Building was just unlocked, recreate its element
            const newElement = createBuildingElement(building);
            newElement.classList.add('just-unlocked');
            buildingElement.parentNode.replaceChild(newElement, buildingElement);
            // Remove the animation class after it plays
            setTimeout(() => {
                newElement.classList.remove('just-unlocked');
            }, 2000);
            return;
        }

        const buyButton = buildingElement.querySelector('.buy-single');
        const maxButton = buildingElement.querySelector('.buy-max');
        const nextCost = getCurrentCost(building);
        const maxBuyable = calculateMaxBuyable(building);
        const maxCost = maxBuyable > 0 ? calculateBulkCost(building, maxBuyable) : nextCost;
        
        if (buyButton) {
            buyButton.textContent = `Buy ⚛️${formatNumber(nextCost)}`;
            buyButton.disabled = gameState.totalParticles < nextCost;
        }
        
        if (maxButton) {
            maxButton.textContent = maxBuyable > 0 ? `Buy ${formatNumber(maxBuyable)} (⚛️${formatNumber(maxCost)})` : 'Buy Max';
            maxButton.disabled = maxBuyable <= 0;
        }
        
        const productionDisplay = buildingElement.querySelector('.building-production');
        if (productionDisplay) {
            productionDisplay.textContent = `Producing ${formatNumber(building.baseQpS * (building.quantity || 0))} QpS`;
        }
        
        const countDisplay = buildingElement.querySelector('.building-count');
        if (countDisplay) {
            countDisplay.textContent = `Owned: ${building.quantity || 0}`;
        }
    });
}

// Update the particle creation system
function updateBuildingParticles(totalBuildings) {
    const clickArea = document.getElementById('clickArea');
    
    // Add electron orbits if they don't exist
    const orbits = ['orbit-1', 'orbit-2', 'orbit-3'].forEach(orbitClass => {
        if (!clickArea.querySelector(`.${orbitClass}`)) {
            const orbit = document.createElement('div');
            orbit.className = `electron-orbit ${orbitClass}`;
            clickArea.appendChild(orbit);
        }
    });
    
    // Update existing particle rings code
    const rings = document.querySelectorAll('.particle-ring');
    rings.forEach(ring => ring.remove());
    
    const particlesPerRing = 10;
    const maxRings = 5;
    const totalRings = Math.min(maxRings, Math.ceil(totalBuildings / particlesPerRing));
    
    for (let ringIndex = 0; ringIndex < totalRings; ringIndex++) {
        const ring = document.createElement('div');
        ring.className = `particle-ring ring-${ringIndex + 1}`;
        clickArea.appendChild(ring);
        
        const remainingBuildings = totalBuildings - (ringIndex * particlesPerRing);
        const particlesInThisRing = Math.min(particlesPerRing, remainingBuildings);
        
        for (let i = 0; i < particlesInThisRing; i++) {
            const particle = document.createElement('div');
            particle.className = 'floating-particle';
            
            const colors = ['#2196F3', '#FF4081', '#00BCD4', '#FFC107', '#9C27B0'];
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            particle.style.background = color;
            particle.style.boxShadow = `0 0 10px ${color}`;
            
            const orbitRadius = (ringIndex + 1) * 50;
            particle.style.setProperty('--orbit-radius', `${orbitRadius}px`);
            
            const angle = (i / particlesPerRing) * 360;
            const duration = 5 + Math.random() * 5;
            const delay = -Math.random() * duration;
            
            particle.style.animation = `orbitRotate ${duration}s linear infinite ${delay}s`;
            particle.style.transform = `rotate(${angle}deg) translateX(${orbitRadius}px) rotate(-${angle}deg)`;
            
            ring.appendChild(particle);
        }
    }
}

// Check if player can afford building
function canAffordBuilding(building) {
    return gameState.totalParticles >= getCurrentCost(building);
}

// Recalculate total Particles per Second
function recalculateQpS() {
    let total = 0;
    buildings.forEach(building => {
        total += building.baseQpS * building.quantity;
    });
    
    // Apply production multiplier if it exists
    if (typeof window.getProductionMultiplier === 'function') {
        total *= window.getProductionMultiplier();
    }
    
    gameState.particlesPerSecond = total;
}

// Export functions for global use
window.buyBuilding = buyBuilding;
window.recalculateQpS = recalculateQpS;
window.updateBuildingsDisplay = updateBuildingsDisplay; 