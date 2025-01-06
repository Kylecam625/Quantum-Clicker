// Event definitions
const events = [
    {
        id: 'quantumGlitch',
        name: 'Quantum Glitch',
        description: 'A quantum anomaly has appeared! Click to get a random bonus!',
        duration: 15000, // 15 seconds to click
        probability: 0.1, // 10% chance per check
        effects: [
            {
                name: 'Particle Surge',
                description: 'Production x7 for 77 seconds!',
                action: () => {
                    const duration = 77000;
                    const multiplier = 7;
                    applyTemporaryMultiplier(multiplier, duration);
                }
            },
            {
                name: 'Quantum Jackpot',
                description: 'Instant particles equal to 15 minutes of production!',
                action: () => {
                    const reward = gameState.particlesPerSecond * 900; // 15 minutes
                    gameState.totalParticles += reward;
                }
            },
            {
                name: 'Entanglement Chain',
                description: 'Click power x777 for 7 seconds!',
                action: () => {
                    const duration = 7000;
                    const oldClickPower = gameState.particlesPerClick;
                    gameState.particlesPerClick *= 777;
                    setTimeout(() => {
                        gameState.particlesPerClick = oldClickPower;
                    }, duration);
                }
            }
        ]
    },
    {
        id: 'darkMatterBubble',
        name: 'Dark Matter Bubble',
        description: 'Dark matter is leaking into our dimension!',
        duration: 20000, // 20 seconds to click
        probability: 0.05, // 5% chance per check
        effects: [
            {
                name: 'Dark Energy Boost',
                description: 'All buildings produce double particles for 2 minutes!',
                action: () => {
                    const duration = 120000;
                    const multiplier = 2;
                    applyTemporaryMultiplier(multiplier, duration);
                }
            }
        ]
    }
];

let activeEvents = [];
let productionMultiplier = 1;

// Initialize events system
function initEvents() {
    // Reset multiplier to 1 on init
    resetMultiplier();
    
    // Start event check loop
    setInterval(checkForNewEvent, 30000); // Check every 30 seconds
    
    // Add CSS for events if not already present
    addEventStyles();
}

// Add required CSS styles
function addEventStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .quantum-event {
            position: fixed;
            cursor: pointer;
            padding: 20px;
            border-radius: 10px;
            background: rgba(33, 150, 243, 0.9);
            color: white;
            animation: float 3s ease-in-out infinite;
            z-index: 1000;
            text-align: center;
        }

        @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0px); }
        }

        .event-notification {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px;
            background: rgba(76, 175, 80, 0.9);
            color: white;
            border-radius: 5px;
            z-index: 1001;
            animation: slideIn 0.5s ease-out;
        }

        @keyframes slideIn {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
        }
    `;
    document.head.appendChild(style);
}

// Check for new random events
function checkForNewEvent() {
    if (window.eventCheckTimeout) {
        clearTimeout(window.eventCheckTimeout);
    }
    
    window.eventCheckTimeout = setTimeout(() => {
        events.forEach(event => {
            if (Math.random() < event.probability && !activeEvents.includes(event.id)) {
                spawnEvent(event);
            }
        });
    }, 250);
}

// Spawn a new event
function spawnEvent(event) {
    activeEvents.push(event.id);
    
    // Create event element
    const element = document.createElement('div');
    element.className = 'quantum-event';
    element.innerHTML = `
        <h3>${event.name}</h3>
        <p>${event.description}</p>
    `;
    
    // Random position on screen
    element.style.left = Math.random() * (window.innerWidth - 200) + 'px';
    element.style.top = Math.random() * (window.innerHeight - 200) + 'px';
    
    // Click handler
    element.addEventListener('click', () => {
        const effect = event.effects[Math.floor(Math.random() * event.effects.length)];
        effect.action();
        showNotification(effect.description);
        element.remove();
        activeEvents = activeEvents.filter(id => id !== event.id);
    });
    
    document.body.appendChild(element);
    
    // Remove event if not clicked
    setTimeout(() => {
        if (element.parentNode) {
            element.remove();
            activeEvents = activeEvents.filter(id => id !== event.id);
        }
    }, event.duration);
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'event-notification';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => notification.remove(), 5000);
}

// Apply temporary multiplier to production
function applyTemporaryMultiplier(multiplier, duration) {
    // Store the current multiplier before applying new one
    const previousMultiplier = productionMultiplier;
    
    // Apply new multiplier
    productionMultiplier *= multiplier;
    recalculateQpS();
    
    // Clear any existing timeout to prevent stacking
    if (window.multiplierTimeout) {
        clearTimeout(window.multiplierTimeout);
    }
    
    // Set new timeout to restore previous multiplier
    window.multiplierTimeout = setTimeout(() => {
        productionMultiplier = previousMultiplier;
        recalculateQpS();
        showNotification('Production multiplier effect has ended!');
    }, duration);
}

// Reset multiplier when game loads
function resetMultiplier() {
    productionMultiplier = 1;
    if (window.multiplierTimeout) {
        clearTimeout(window.multiplierTimeout);
    }
    recalculateQpS();
}

// Export production multiplier for use in QpS calculations
window.getProductionMultiplier = () => productionMultiplier; 