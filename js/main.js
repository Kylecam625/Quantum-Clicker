// Game state
let gameState = {
    totalParticles: 0,
    totalParticlesEarned: 0,
    particlesPerClick: 1,
    particlesPerSecond: 0,
    totalClicks: 0,
    lastUpdate: Date.now(),
    lastSave: Date.now()
};

// Milestone trail system
const milestones = [10, 100, 1000, 10000, 100000, 1000000, 1e7, 1e8, 1e9, 1e10, 1e11, 1e12];

// Add these variables at the top with other game state variables
const clickTracker = {
    recentClicks: [],
    maxIntensity: 1.0,
    glowTimeout: null,
    glowDecayRate: 0.95
};

// Add these variables at the top with other game state variables
const bonusWheelState = {
    currentEnergy: 0,
    energyRequired: 500,
    isSpinning: false
};

const bonusRewards = [
    { name: "2x Production", description: "Double production for 30 seconds", color: "#4CAF50", action: () => applyTemporaryMultiplier(2, 30000) },
    { name: "5x Clicks", description: "Click power x5 for 20 seconds", color: "#2196F3", action: () => applyTemporaryClickMultiplier(5, 20000) },
    { name: "Instant Bonus", description: "Get 5 minutes of production instantly", color: "#9C27B0", action: () => addInstantProduction(300) },
    { name: "Chain Master", description: "Perfect chain multiplier for 15 seconds", color: "#FF9800", action: () => activatePerfectChain(15000) },
    { name: "Lucky Draw", description: "10x production for 10 seconds", color: "#F44336", action: () => applyTemporaryMultiplier(10, 10000) },
    { name: "Energy Surge", description: "Next wheel charges 2x faster", color: "#00BCD4", action: () => doubleNextWheelCharge() }
];

// Add these variables at the top with other game state variables
const autoClickState = {
    isActive: false,
    clicksPerSecond: 0,
    intervalId: null
};

// Animation state
const animationState = {
    isPlaying: false,
    lastPlayTime: 0,
    element: null
};

// Initialize game
document.addEventListener('DOMContentLoaded', () => {
    initGame();
    createStars(); // Initialize new stars
    
    // Reset production multiplier
    if (typeof window.getProductionMultiplier === 'function') {
        window.productionMultiplier = 1;
    }
    
    // Load saved game if exists
    loadGame();
    
    // Initialize game systems in correct order
    initClickArea(); // Initialize click functionality
    initBuildings();
    updateBuildingsDisplay();
    initUpgrades();
    initEvents();
    
    // Start game loop
    requestAnimationFrame(gameLoop);
    
    // Add initQuantumBar to the initialization
    initQuantumBar();
    initAcrossAnimation();
});

function createStars() {
    // Create star field container if it doesn't exist
    let starField = document.querySelector('.star-field');
    if (!starField) {
        starField = document.createElement('div');
        starField.className = 'star-field';
        document.body.appendChild(starField);
    }
    
    // Clear existing stars
    starField.innerHTML = '';
    
    // Get the center of the screen for the origin point
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    
    starField.style.setProperty('--center-x', `${centerX}px`);
    starField.style.setProperty('--center-y', `${centerY}px`);
    
    // Initial stars - increased from 100 to 300
    const numStars = 300;
    for (let i = 0; i < numStars; i++) {
        createSingleStar(starField);
    }
    
    // Continuously create new stars - increased max from 200 to 500, decreased interval from 100ms to 50ms
    setInterval(() => {
        if (starField.children.length < 500) {
            createSingleStar(starField);
            // Sometimes create multiple stars at once for a denser effect
            if (Math.random() < 0.3) { // 30% chance for extra stars
                createSingleStar(starField);
                createSingleStar(starField);
            }
        }
    }, 50);
}

function createSingleStar(container) {
    const star = document.createElement('div');
    star.className = 'star';
    
    // Calculate direction from center (random angle)
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * 0.5; // Increased from 0.3 to 0.5 for wider spread
    
    // Calculate final position
    const endX = Math.cos(angle) * distance;
    const endY = Math.sin(angle) * distance;
    
    // Set custom properties for the animation
    star.style.setProperty('--star-x', endX);
    star.style.setProperty('--star-y', endY);
    
    // Randomly assign star sizes with adjusted distribution
    const size = Math.random();
    if (size < 0.5) star.classList.add('small'); // 50% small (was 70%)
    else if (size < 0.8) star.classList.add('medium'); // 30% medium (was 20%)
    else star.classList.add('large'); // 20% large (was 10%)
    
    // Increased chance for twinkle effect
    if (Math.random() < 0.5) { // Increased from 0.3 to 0.5
        star.classList.add('twinkle');
    }
    
    // Randomly assign colors with adjusted probabilities
    const colors = [
        'blue', 'blue', // More blue stars
        'red', 
        'yellow', 'yellow', // More yellow stars
        'purple',
        '' // White stars
    ];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    if (randomColor) {
        star.classList.add(randomColor);
    }
    
    // Add the star to container
    container.appendChild(star);
    
    // Remove the star after animation completes
    star.addEventListener('animationend', () => {
        star.remove();
    });
}

// Update star field position when window is resized
window.addEventListener('resize', () => {
    createStars();
});

// Initialize draggable world
function initDraggableWorld() {
    const gameContainer = document.getElementById('gameContainer');
    
    gameContainer.addEventListener('mousedown', (e) => {
        if (e.target.closest('#clickArea, .building-item, .upgrade-item, button')) return;
        viewState.isDragging = true;
        viewState.lastMouseX = e.clientX;
        viewState.lastMouseY = e.clientY;
        gameContainer.classList.add('dragging');
    });

    document.addEventListener('mousemove', (e) => {
        if (!viewState.isDragging) return;
        
        const dx = e.clientX - viewState.lastMouseX;
        const dy = e.clientY - viewState.lastMouseY;
        
        viewState.translateX += dx;
        viewState.translateY += dy;
        
        viewState.lastMouseX = e.clientX;
        viewState.lastMouseY = e.clientY;
        
        updateWorldTransform();
        updateMinimap();
    });

    document.addEventListener('mouseup', () => {
        viewState.isDragging = false;
        gameContainer.classList.remove('dragging');
    });

    // Add zoom with mouse wheel
    gameContainer.addEventListener('wheel', (e) => {
        e.preventDefault();
        const delta = e.deltaY * -0.001;
        const newScale = Math.max(0.5, Math.min(2, viewState.scale + delta));
        
        // Calculate mouse position relative to container
        const rect = gameContainer.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        // Adjust translation to zoom towards mouse position
        const scaleChange = newScale - viewState.scale;
        viewState.translateX -= mouseX * scaleChange;
        viewState.translateY -= mouseY * scaleChange;
        
        viewState.scale = newScale;
        updateWorldTransform();
        updateMinimap();
    });
}

// Add zoom controls
function addZoomControls() {
    const controls = document.createElement('div');
    controls.className = 'zoom-controls';
    controls.innerHTML = `
        <button onclick="zoomIn()">+</button>
        <button onclick="zoomOut()">-</button>
    `;
    document.body.appendChild(controls);
}

// Add minimap
function addMinimap() {
    const minimap = document.createElement('div');
    minimap.className = 'minimap';
    minimap.innerHTML = '<div class="minimap-player"></div>';
    document.body.appendChild(minimap);
}

// Update minimap player position
function updateMinimap() {
    const player = document.querySelector('.minimap-player');
    const worldSize = 5000;
    const minimapSize = 200;
    
    const x = ((worldSize / 2 - viewState.translateX) / worldSize) * minimapSize;
    const y = ((worldSize / 2 - viewState.translateY) / worldSize) * minimapSize;
    
    player.style.left = x + 'px';
    player.style.top = y + 'px';
}

// Update world transform
function updateWorldTransform() {
    const gameWorld = document.getElementById('gameWorld');
    gameWorld.style.transform = `translate(-50%, -50%) translate(${viewState.translateX}px, ${viewState.translateY}px) scale(${viewState.scale})`;
}

// Zoom functions
function zoomIn() {
    viewState.scale = Math.min(2, viewState.scale + 0.1);
    updateWorldTransform();
    updateMinimap();
}

function zoomOut() {
    viewState.scale = Math.max(0.5, viewState.scale - 0.1);
    updateWorldTransform();
    updateMinimap();
}

// Add quantum particle animation
function addQuantumParticleAnimation() {
    const clickArea = document.getElementById('clickArea');
    
    // Add electron orbits
    const orbits = ['orbit-1', 'orbit-2', 'orbit-3'];
    orbits.forEach(orbitClass => {
        const orbit = document.createElement('div');
        orbit.className = `electron-orbit ${orbitClass}`;
        
        // Add electrons to each orbit
        for (let i = 0; i < 3; i++) {
            const electron = document.createElement('div');
            electron.className = 'electron';
            electron.style.animationDelay = `${-i * 1.33}s`;
            orbit.appendChild(electron);
        }
        
        clickArea.appendChild(orbit);
    });

    // Add particle core
    const core = document.createElement('div');
    core.className = 'particle-core';
    clickArea.appendChild(core);
}

// Update the particle animation based on total particles
function updateParticleAnimation() {
    const orbits = document.querySelectorAll('.electron-orbit');
    const totalParticles = gameState.totalParticlesEarned;
    
    orbits.forEach((orbit, index) => {
        const threshold = Math.pow(10, index + 2); // 100, 1000, 10000
        const electrons = orbit.querySelectorAll('.electron');
        
        electrons.forEach(electron => {
            if (totalParticles >= threshold) {
                electron.style.display = 'block';
            } else {
                electron.style.display = 'none';
            }
        });
    });
}

// Handle particle click with enhanced effects
function handleParticleClick(event) {
    // Track total clicks
    gameState.totalClicks++;
    
    // Base click value
    let clickValue = gameState.particlesPerClick;
    let totalClickValue = clickValue;
    
    // Update the fill bar progress
    const fillBar = document.querySelector('.fill-bar');
    const fillBarBanner = document.querySelector('.fill-bar-banner');
    bonusWheelState.currentEnergy++;
    
    if (bonusWheelState.currentEnergy >= bonusWheelState.energyRequired) {
        const fillBar = document.querySelector('.fill-bar');
        const fillBarBanner = document.querySelector('.fill-bar-banner');
        if (fillBar && fillBarBanner) {
            fillBar.style.display = 'block';
            fillBarBanner.textContent = getRandomEnergyPhrase();
            fillBarBanner.style.display = 'block';
            setTimeout(() => {
                fillBar.style.display = 'none';
                fillBarBanner.style.display = 'none';
                bonusWheelState.currentEnergy = 0;
                showBonusWheel();
            }, 2000);
        }
    }
    
    // Apply Critical Mass (5% chance for 10x)
    if (upgrades.find(u => u.id === 'criticalMass')?.purchased && Math.random() < 0.05) {
        totalClickValue *= 10;
    }
    
    // Apply Quantum Chain (up to 3x based on click speed)
    if (upgrades.find(u => u.id === 'quantumChain')?.purchased) {
        const now = Date.now();
        if (now - lastClickTime < 1000) {
            chainMultiplier = Math.min(3, chainMultiplier + 0.2);
        } else {
            chainMultiplier = 1;
        }
        lastClickTime = now;
        totalClickValue *= chainMultiplier;
    }
    
    // Apply Quantum Momentum (1% per building)
    if (upgrades.find(u => u.id === 'quantumMomentum')?.purchased) {
        const totalBuildings = buildings.reduce((sum, b) => sum + b.quantity, 0);
        totalClickValue *= (1 + totalBuildings * 0.01);
    }
    
    // Apply Quantum Supremacy (50% more)
    if (upgrades.find(u => u.id === 'quantumSupremacy')?.purchased) {
        totalClickValue *= 1.5;
    }
    
    // Apply Time Freeze (5x if active)
    if (timeFreezeActive) {
        totalClickValue *= 5;
    }
    
    // Apply Multiverse Click (1-5 clicks)
    if (upgrades.find(u => u.id === 'multiverseClick')?.purchased) {
        const universes = Math.floor(Math.random() * 5) + 1;
        totalClickValue *= universes;
    }
    
    // Apply Click Nova (50x every 50th click)
    if (upgrades.find(u => u.id === 'clickNova')?.purchased) {
        clickCount = (clickCount || 0) + 1;
        if (clickCount >= 50) {
            clickCount = 0;
            totalClickValue *= 50;
        }
    }
    
    // Apply Burst Click (10% chance for 5 extra clicks)
    if (upgrades.find(u => u.id === 'burstClick')?.purchased && Math.random() < 0.1) {
        totalClickValue *= 6; // Original click + 5 extra
    }
    
    // Add particles
    gameState.totalParticles += totalClickValue;
    gameState.totalParticlesEarned += totalClickValue;
    
    // Create click effect
    createClickEffect(event, Math.floor(totalClickValue));
    
    // Update displays immediately
    updateDisplay();
    updateBuildingsDisplay();
    
    // Add energy to the quantum bar
    bonusWheelState.currentEnergy += gameState.particlesPerClick * 0.1;
    updateQuantumBar();
}

// Create particle effect on click
function createClickParticle(event) {
    const particle = document.createElement('div');
    particle.className = 'click-particle';
    particle.textContent = '+' + formatNumber(gameState.particlesPerClick);
    
    // Position particle at click location
    particle.style.left = event.clientX + 'px';
    particle.style.top = event.clientY + 'px';
    
    document.body.appendChild(particle);
    setTimeout(() => particle.remove(), 1000);
}

// Create expanding wave effect
function createClickWave(event) {
    const wave = document.createElement('div');
    wave.className = 'click-wave';
    wave.style.left = event.clientX + 'px';
    wave.style.top = event.clientY + 'px';
    
    document.body.appendChild(wave);
    setTimeout(() => wave.remove(), 1000);
}

// Create spark effects
function createSparkEffects(event) {
    for (let i = 0; i < 12; i++) {
        const spark = document.createElement('div');
        spark.className = 'particle-spark';
        
        const angle = (i * 30) * (Math.PI / 180);
        const distance = 40 + Math.random() * 20;
        const x = event.clientX + Math.cos(angle) * distance;
        const y = event.clientY + Math.sin(angle) * distance;
        
        spark.style.left = x + 'px';
        spark.style.top = y + 'px';
        
        document.body.appendChild(spark);
        setTimeout(() => spark.remove(), 800);
    }
}

// Main game loop
function gameLoop(timestamp) {
    const now = Date.now();
    const delta = (now - gameState.lastUpdate) / 1000;
    
    // Add particles from buildings
    if (delta > 0) {
        const production = gameState.particlesPerSecond * delta;
        gameState.totalParticles += production;
        gameState.totalParticlesEarned += production;
        
        // Update display only if there's a meaningful change
        if (production > 0) {
            updateDisplay();
            updateBuildingsDisplay(); // Update buildings more frequently
        }
    }
    
    // Always update the last update time
    gameState.lastUpdate = now;
    
    // Continue loop
    requestAnimationFrame(gameLoop);
}

// Initialize click area
function initClickArea() {
    const clickArea = document.getElementById('clickArea');
    const atomBackground = clickArea.querySelector('.atom-background');
    const fillBarContainer = clickArea.querySelector('.fill-bar-container');
    
    // Store the existing elements
    const existingElements = {
        atomBackground: atomBackground,
        fillBarContainer: fillBarContainer
    };
    
    // Clear the click area while preserving the background and fill bar
    clickArea.innerHTML = '';
    
    // Add back the stored elements
    if (existingElements.atomBackground) {
        clickArea.appendChild(existingElements.atomBackground);
    }
    
    // Add the quantum core and orbs
    const quantumCore = document.createElement('div');
    quantumCore.className = 'quantum-core';
    quantumCore.innerHTML = `
        <div class="core-orb blue" style="transform: translate(-20px, -20px)"></div>
        <div class="core-orb red" style="transform: translate(20px, -20px)"></div>
        <div class="core-orb yellow" style="transform: translate(-20px, 20px)"></div>
        <div class="core-orb purple" style="transform: translate(20px, 20px)"></div>
    `;
    clickArea.appendChild(quantumCore);
    
    // Add the electron orbits
    const orbits = [
        { class: 'orbit-1', electrons: 3 },
        { class: 'orbit-2', electrons: 3 },
        { class: 'orbit-3', electrons: 3 }
    ];
    
    orbits.forEach(orbit => {
        const orbitElement = document.createElement('div');
        orbitElement.className = `electron-orbit ${orbit.class}`;
        
        for (let i = 0; i < orbit.electrons; i++) {
            const electron = document.createElement('div');
            electron.className = 'electron';
            electron.style.display = 'none';
            orbitElement.appendChild(electron);
        }
        
        clickArea.appendChild(orbitElement);
    });
    
    // Add back the fill bar container
    if (existingElements.fillBarContainer) {
        clickArea.appendChild(existingElements.fillBarContainer);
    }

    // Add click event listener to quantum core
    quantumCore.addEventListener('click', (e) => {
        e.stopPropagation();
        
        // Update particles
        gameState.totalParticles += gameState.particlesPerClick;
        gameState.totalParticlesEarned += gameState.particlesPerClick;
        gameState.totalClicks++;
        
        // Update quantum energy
        bonusWheelState.currentEnergy++;
        updateQuantumBar();
        
        // Visual effects
        quantumCore.classList.add('clicked');
        setTimeout(() => {
            quantumCore.classList.remove('clicked');
        }, 300);
        
        // Create ripple effect
        const ripple = document.createElement('div');
        ripple.className = 'click-effect';
        quantumCore.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
        
        // Create floating number at cursor position
        const clickParticle = document.createElement('div');
        clickParticle.className = 'click-particle';
        clickParticle.textContent = '+' + formatNumber(gameState.particlesPerClick);
        clickParticle.style.left = e.clientX + 'px';
        clickParticle.style.top = e.clientY + 'px';
        document.body.appendChild(clickParticle);
        setTimeout(() => clickParticle.remove(), 1000);

        // Create spark effects
        for (let i = 0; i < 8; i++) {
            const spark = document.createElement('div');
            spark.className = 'spark';
            const angle = (i / 8) * Math.PI * 2;
            const distance = 50 + Math.random() * 30;
            spark.style.setProperty('--tx', `${Math.cos(angle) * distance}px`);
            spark.style.setProperty('--ty', `${Math.sin(angle) * distance}px`);
            quantumCore.appendChild(spark);
            setTimeout(() => spark.remove(), 600);
        }
        
        // Update displays
        updateDisplay();
        updateElectrons();
    });
}

function updateElectrons() {
    const totalParticles = gameState.totalParticlesEarned;
    const electrons = document.querySelectorAll('.electron');
    
    // Define milestones for showing electrons
    const milestones = [
        { count: 1000, electrons: 9 },
        { count: 500, electrons: 8 },
        { count: 250, electrons: 7 },
        { count: 100, electrons: 6 },
        { count: 50, electrons: 5 },
        { count: 25, electrons: 4 },
        { count: 10, electrons: 3 },
        { count: 5, electrons: 2 },
        { count: 1, electrons: 1 },
        { count: 0, electrons: 0 }
    ];
    
    // Find the highest milestone reached
    const milestone = milestones.find(m => totalParticles >= m.count) || milestones[milestones.length - 1];
    
    // Show/hide electrons based on milestone
    electrons.forEach((electron, index) => {
        electron.style.display = index < milestone.electrons ? 'block' : 'none';
    });
}

// Update display
function updateDisplay() {
    const particleCount = document.getElementById('particleCount');
    const particlesPerSecond = document.getElementById('particlesPerSecond');
    const totalParticlesEarned = document.getElementById('totalParticlesEarned');
    
    // Add scale effect to only the number part when it changes
    const oldValue = parseFloat(particleCount.getAttribute('data-value') || 0);
    const newValue = Math.floor(gameState.totalParticles);
    
    if (oldValue !== newValue) {
        const valueSpan = particleCount.querySelector('.particle-value');
        if (valueSpan) {
            valueSpan.style.transform = 'scale(1.02)';
            valueSpan.style.filter = 'brightness(1.1)';
            setTimeout(() => {
                valueSpan.style.transform = 'scale(1)';
                valueSpan.style.filter = 'brightness(1)';
            }, 100);
        }
        // Update buildings when particle count changes
        updateBuildingsDisplay();
    }
    
    particleCount.setAttribute('data-value', newValue);
    
    // Format current particles (whole numbers only)
    const currentParticles = Math.floor(gameState.totalParticles);
    const currentFormatted = currentParticles < 1e12 ? 
        currentParticles.toLocaleString('en-US') : 
        formatNumber(currentParticles);
    
    // Format total particles (one decimal place)
    const totalFormatted = gameState.totalParticlesEarned < 1e12 ? 
        gameState.totalParticlesEarned.toLocaleString('en-US', {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1
        }) : 
        formatNumber(gameState.totalParticlesEarned, true);
    
    particleCount.innerHTML = `
        <span class="particle-value">${currentFormatted}</span>
        <span class="particle-label"> particles</span>
    `;
    
    particlesPerSecond.textContent = `Quantum particles per second: ${Math.floor(gameState.particlesPerSecond).toLocaleString('en-US')}`;
    totalParticlesEarned.textContent = `Total Quantum particles: ${totalFormatted}`;
}

// Format large numbers with proper suffixes
function formatNumber(num, showDecimals = false) {
    if (num === undefined || num === null || isNaN(num)) return "0";
    
    // For numbers less than 1 trillion, show full number
    if (num < 1e12) {
        return num.toLocaleString('en-US', {
            minimumFractionDigits: showDecimals ? 1 : 0,
            maximumFractionDigits: showDecimals ? 1 : 0
        });
    }
    
    // For larger numbers, use abbreviations
    const suffixes = ['T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc'];
    let suffixIndex = 0;
    let number = num / 1e12;
    
    while (number >= 1000 && suffixIndex < suffixes.length - 1) {
        number /= 1000;
        suffixIndex++;
    }
    
    // Format with one decimal place if requested or if less than 10
    return ((showDecimals || number < 10) ? number.toFixed(1) : Math.floor(number)) + suffixes[suffixIndex];
}

// Export game state for other modules
window.gameState = gameState;

function initMilestoneTrail() {
    const leftPanel = document.getElementById('leftPanel');
    const trail = document.createElement('div');
    trail.className = 'milestone-trail';
    
    // Create milestone markers
    milestones.forEach((value, index) => {
        const marker = document.createElement('div');
        marker.className = 'milestone-marker';
        marker.setAttribute('data-value', formatNumber(value));
        marker.style.left = `${(index / (milestones.length - 1)) * 100}%`;
        trail.appendChild(marker);
    });
    
    // Create progress atom
    const atom = document.createElement('div');
    atom.className = 'progress-atom';
    atom.style.left = '0%';
    trail.appendChild(atom);
    
    leftPanel.appendChild(trail);
}

function updateMilestoneTrail() {
    const totalParticles = gameState.totalParticlesEarned;
    const trail = document.querySelector('.milestone-trail');
    if (!trail) return;
    
    // Find current milestone position
    let currentIndex = 0;
    let nextMilestone = milestones[0];
    
    for (let i = 0; i < milestones.length; i++) {
        const marker = trail.children[i];
        if (marker.classList.contains('milestone-marker')) {
            if (totalParticles >= milestones[i]) {
                marker.classList.add('reached');
                marker.classList.remove('next');
                currentIndex = i;
                nextMilestone = milestones[i + 1];
            } else {
                marker.classList.remove('reached');
                if (i === currentIndex + 1) {
                    marker.classList.add('next');
                } else {
                    marker.classList.remove('next');
                }
            }
        }
    }
    
    // Update atom position
    const progressAtom = trail.querySelector('.progress-atom');
    if (progressAtom) {
        let progress;
        if (currentIndex >= milestones.length - 1) {
            progress = 100;
        } else {
            const currentMilestone = milestones[currentIndex];
            const progressToNext = Math.log10(totalParticles) - Math.log10(currentMilestone);
            const totalProgress = Math.log10(nextMilestone) - Math.log10(currentMilestone);
            progress = (currentIndex / (milestones.length - 1) + (progressToNext / totalProgress) * (1 / (milestones.length - 1))) * 100;
        }
        progressAtom.style.left = `${Math.min(100, Math.max(0, progress))}%`;
    }
}

// Initialize game state
function initGame() {
    // Initialize game state if it doesn't exist
    if (!gameState) {
        gameState = {
            totalParticles: 0, // Start with 0 particles
            totalParticlesEarned: 0,
            particlesPerClick: 1,
            particlesPerSecond: 0,
            totalClicks: 0,
            lastUpdate: Date.now(),
            lastSave: Date.now()
        };
    }
    
    // Initialize all game systems
    initBuildings();
    initUpgrades();
    updateDisplay();
    
    // Start autosave
    setInterval(saveGame, 60000);
}

function initQuantumBar() {
    const statsPanel = document.getElementById('statsPanel');
    const barContainer = document.createElement('div');
    barContainer.className = 'quantum-bar-container';
    barContainer.innerHTML = `
        <div class="quantum-bar">
            <div class="quantum-bar-fill"></div>
            <div class="quantum-bar-glow"></div>
        </div>
        <div class="quantum-bar-text">Quantum Energy: 0/${bonusWheelState.energyRequired}</div>
    `;
    statsPanel.appendChild(barContainer);
}

function updateQuantumBar() {
    const barFill = document.querySelector('.quantum-bar-fill');
    const barText = document.querySelector('.quantum-bar-text');
    const progress = (bonusWheelState.currentEnergy / bonusWheelState.energyRequired) * 100;
    
    barFill.style.width = `${progress}%`;
    barText.textContent = `Quantum Energy: ${Math.floor(bonusWheelState.currentEnergy)}/${bonusWheelState.energyRequired}`;
    
    if (bonusWheelState.currentEnergy >= bonusWheelState.energyRequired && !bonusWheelState.isSpinning) {
        // Show fill bar animation for 5 seconds before bonus wheel
        const fillBar = document.querySelector('.fill-bar');
        const fillBarBanner = document.querySelector('.fill-bar-banner');
        if (fillBar && fillBarBanner) {
            fillBar.style.display = 'block';
            fillBarBanner.style.display = 'block';
            setTimeout(() => {
                fillBar.style.display = 'none';
                fillBarBanner.style.display = 'none';
                bonusWheelState.currentEnergy = 0;
                // Show bonus wheel after fill bar animation
                setTimeout(() => {
                    showBonusWheel();
                }, 100); // Small delay to ensure smooth transition
            }, 5000); // 5 second delay
        }
    }
}

function showBonusWheel() {
    if (bonusWheelState.isSpinning) return;
    bonusWheelState.isSpinning = true;
    
    const wheelContainer = document.createElement('div');
    wheelContainer.className = 'bonus-wheel-container';
    wheelContainer.innerHTML = `
        <div class="bonus-wheel-modal">
            <h2>Quantum Bonus Wheel</h2>
            <div class="wheel-outer">
                <div class="bonus-wheel">
                    ${bonusRewards.map((reward, index) => {
                        const angle = (index * 360 / bonusRewards.length);
                        const rotateAngle = angle + (360 / bonusRewards.length / 2);
                        return `
                            <div class="wheel-segment" style="
                                --segment-color: ${reward.color};
                                transform: rotate(${angle}deg)">
                                <div class="segment-content" style="
                                    transform: rotate(${rotateAngle}deg)">
                                    <span class="segment-text">${reward.name}</span>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
                <div class="wheel-pointer">▼</div>
            </div>
            <button class="spin-button">SPIN</button>
        </div>
    `;
    
    document.body.appendChild(wheelContainer);
    
    // Show fill bar animation behind the wheel
    const fillBar = document.querySelector('.fill-bar');
    const fillBarBanner = document.querySelector('.fill-bar-banner');
    if (fillBar && fillBarBanner) {
        fillBar.style.zIndex = '998'; // Below the wheel popup
        fillBarBanner.style.zIndex = '998';
        fillBar.style.display = 'block';
        fillBarBanner.style.display = 'block';
        fillBar.style.width = '100vw'; // Full screen width
        fillBar.style.left = '0';
        fillBar.style.position = 'fixed';
    }
    
    const spinButton = wheelContainer.querySelector('.spin-button');
    const wheel = wheelContainer.querySelector('.bonus-wheel');
    
    spinButton.addEventListener('click', () => {
        spinButton.disabled = true;
        const randomIndex = Math.floor(Math.random() * bonusRewards.length);
        const extraSpins = 5; // Number of full rotations
        const spinDegrees = -(extraSpins * 360 + (randomIndex * (360 / bonusRewards.length)));
        
        wheel.style.transition = 'transform 5s cubic-bezier(0.2, 0, 0.2, 1)';
        wheel.style.transform = `rotate(${spinDegrees}deg)`;
        
        setTimeout(() => {
            const reward = bonusRewards[randomIndex];
            reward.action();
            showNotification(`Bonus Activated: ${reward.description}`);
            
            // Hide the fill bar animation
            if (fillBar && fillBarBanner) {
                fillBar.style.display = 'none';
                fillBarBanner.style.display = 'none';
            }
            
            setTimeout(() => {
                wheelContainer.remove();
                bonusWheelState.currentEnergy = 0;
                bonusWheelState.isSpinning = false;
                updateQuantumBar();
            }, 2000);
        }, 5000);
    });
}

// Add these helper functions
function applyTemporaryClickMultiplier(multiplier, duration) {
    const originalClick = gameState.particlesPerClick;
    gameState.particlesPerClick *= multiplier;
    setTimeout(() => {
        gameState.particlesPerClick = originalClick;
        showNotification('Click power multiplier has ended!');
    }, duration);
}

function addInstantProduction(seconds) {
    const reward = gameState.particlesPerSecond * seconds;
    gameState.totalParticles += reward;
    gameState.totalParticlesEarned += reward;
    updateDisplay();
}

function activatePerfectChain(duration) {
    const originalChainMultiplier = window.chainMultiplier || 1;
    window.chainMultiplier = 3;
    setTimeout(() => {
        window.chainMultiplier = originalChainMultiplier;
        showNotification('Perfect chain multiplier has ended!');
    }, duration);
}

function doubleNextWheelCharge() {
    const originalRequired = bonusWheelState.energyRequired;
    bonusWheelState.energyRequired /= 2;
    setTimeout(() => {
        bonusWheelState.energyRequired = originalRequired;
    }, 60000);
}

// Update the quantum energy banner text
const energyPhrases = [
    "Quantum Energy Implosion Imminent!",
    "Dimensional Rift Detected!",
    "Quantum Surge Approaching!",
    "Energy Matrix Overload!",
    "Quantum Resonance Peak!"
];

function getRandomEnergyPhrase() {
    return energyPhrases[Math.floor(Math.random() * energyPhrases.length)];
}

function initAcrossAnimation() {
    const leftPanel = document.getElementById('leftPanel');
    const animElement = document.createElement('img');
    animElement.src = 'assets/across.gif';
    animElement.className = 'across-animation';
    leftPanel.appendChild(animElement);
    animationState.element = animElement;

    // Start the animation cycle
    setInterval(playRandomAcrossAnimation, 10000);
}

function playRandomAcrossAnimation() {
    if (animationState.isPlaying) return;
    
    const element = animationState.element;
    element.style.animation = 'none';
    element.classList.remove('active', 'horizontal', 'vertical', 'diagonal-right', 'diagonal-left');
    
    // Reset all positioning and transform properties
    element.style.transform = '';
    element.style.left = '';
    element.style.top = '';
    element.style.right = '';
    element.style.bottom = '';
    
    // Choose random direction
    const directions = ['horizontal', 'vertical', 'diagonal-right', 'diagonal-left'];
    const direction = directions[Math.floor(Math.random() * directions.length)];
    
    // Apply the chosen direction class
    element.classList.add(direction);
    
    // Force reflow
    void element.offsetWidth;
    
    // Show the GIF
    element.classList.add('active');
    animationState.isPlaying = true;
    
    // Hide after animation
    setTimeout(() => {
        element.classList.remove('active');
        animationState.isPlaying = false;
    }, 2000);
} 