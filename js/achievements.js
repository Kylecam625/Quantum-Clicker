// Achievement definitions
const achievements = [
    {
        id: 'firstClick',
        name: 'Quantum Pioneer',
        description: 'Click your first particle',
        icon: '🔍',
        requirement: () => gameState.totalClicks > 0,
        reward: {
            description: 'Particles per click +1',
            effect: () => { gameState.particlesPerClick += 1; }
        },
        earned: false
    },
    {
        id: 'hundredParticles',
        name: 'Particle Collector',
        description: 'Accumulate 100 particles',
        icon: '💫',
        requirement: () => gameState.totalParticles >= 100,
        reward: {
            description: 'All buildings production +10%',
            effect: () => {
                buildings.forEach(building => {
                    building.baseQpS *= 1.1;
                });
                recalculateQpS();
            }
        },
        earned: false
    },
    {
        id: 'firstDetector',
        name: 'Detection Initiated',
        description: 'Build your first Basic Detector',
        icon: '📡',
        requirement: () => {
            const detector = buildings.find(b => b.id === 'basicDetector');
            return detector && detector.quantity > 0;
        },
        reward: {
            description: 'Basic Detector production +25%',
            effect: () => {
                const detector = buildings.find(b => b.id === 'basicDetector');
                if (detector) {
                    detector.baseQpS *= 1.25;
                    recalculateQpS();
                }
            }
        },
        earned: false
    },
    {
        id: 'quantumMastery',
        name: 'Quantum Mastery',
        description: 'Own 10 of each building',
        icon: '🌟',
        requirement: () => buildings.every(b => b.quantity >= 10),
        reward: {
            description: 'All buildings production +50%',
            effect: () => {
                buildings.forEach(building => {
                    building.baseQpS *= 1.5;
                });
                recalculateQpS();
            }
        },
        earned: false
    },
    {
        id: 'speedDemons',
        name: 'Speed Demons',
        description: 'Reach 1000 particles per second',
        icon: '⚡',
        requirement: () => gameState.particlesPerSecond >= 1000,
        reward: {
            description: 'Particles per click +100',
            effect: () => { gameState.particlesPerClick += 100; }
        },
        earned: false
    }
];

// Initialize achievements
function initAchievements() {
    updateAchievementProgress();
    // Start checking for achievements
    setInterval(checkAchievements, 1000);
}

// Check for earned achievements
function checkAchievements() {
    let newAchievements = false;
    
    achievements.forEach(achievement => {
        if (!achievement.earned && achievement.requirement()) {
            achievement.earned = true;
            achievement.reward.effect();
            showAchievementNotification(achievement);
            newAchievements = true;
        }
    });
    
    if (newAchievements) {
        updateAchievementProgress();
        saveGame(); // Save after earning achievement
    }
}

// Show achievement notification
function showAchievementNotification(achievement) {
    const notification = document.createElement('div');
    notification.className = 'achievement-notification';
    notification.innerHTML = `
        <div class="achievement-icon">${achievement.icon}</div>
        <div class="achievement-content">
            <h3>${achievement.name}</h3>
            <p>${achievement.description}</p>
            <p class="reward">Reward: ${achievement.reward.description}</p>
        </div>
    `;
    
    // Add styles if not already present
    if (!document.getElementById('achievement-styles')) {
        const style = document.createElement('style');
        style.id = 'achievement-styles';
        style.textContent = `
            .achievement-notification {
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: rgba(76, 175, 80, 0.9);
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
            
            .achievement-icon {
                font-size: 2rem;
            }
            
            .achievement-content h3 {
                margin: 0;
                font-size: 1.2rem;
            }
            
            .achievement-content p {
                margin: 0.2rem 0;
                font-size: 0.9rem;
            }
            
            .achievement-content .reward {
                color: #FFEB3B;
                font-style: italic;
            }
            
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Remove notification after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.5s ease-in forwards';
        setTimeout(() => notification.remove(), 500);
    }, 5000);
}

// Update achievement progress display
function updateAchievementProgress() {
    const earnedCount = achievements.filter(a => a.earned).length;
    const totalCount = achievements.length;
    const progressPercent = (earnedCount / totalCount) * 100;
    
    const progressBar = document.querySelector('#achievementProgress .progress');
    const progressText = document.querySelector('#achievementProgress span');
    
    if (progressBar && progressText) {
        progressBar.style.width = `${progressPercent}%`;
        progressText.textContent = `${earnedCount}/${totalCount} Unlocked`;
    }
}

// Add achievements to save data
const originalSaveGame = saveGame;
saveGame = function() {
    const saveData = {
        version: 1,
        timestamp: Date.now(),
        gameState: {
            totalParticles: gameState.totalParticles,
            particlesPerClick: gameState.particlesPerClick,
            particlesPerSecond: gameState.particlesPerSecond,
            totalClicks: gameState.totalClicks
        },
        buildings: buildings.map(building => ({
            id: building.id,
            quantity: building.quantity,
            baseQpS: building.baseQpS
        })),
        upgrades: upgrades.map(upgrade => ({
            id: upgrade.id,
            purchased: upgrade.purchased
        })),
        achievements: achievements.map(achievement => ({
            id: achievement.id,
            earned: achievement.earned
        }))
    };

    try {
        localStorage.setItem('quantumWorkshopSave', JSON.stringify(saveData));
        showSaveNotification('Game saved successfully!');
    } catch (error) {
        console.error('Failed to save game:', error);
        showSaveNotification('Failed to save game!', true);
    }
};

// Add achievements to load data
const originalLoadGame = loadGame;
loadGame = function() {
    try {
        const savedData = localStorage.getItem('quantumWorkshopSave');
        if (!savedData) return false;

        const saveData = JSON.parse(savedData);
        
        // Load achievements
        if (saveData.achievements) {
            saveData.achievements.forEach(savedAchievement => {
                const achievement = achievements.find(a => a.id === savedAchievement.id);
                if (achievement) {
                    achievement.earned = savedAchievement.earned;
                    if (achievement.earned) {
                        achievement.reward.effect();
                    }
                }
            });
        }
        
        // Update achievement display
        updateAchievementProgress();
        
        return originalLoadGame();
    } catch (error) {
        console.error('Failed to load game:', error);
        showSaveNotification('Failed to load game!', true);
        return false;
    }
}; 