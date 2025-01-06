// Reset game state
function resetGameState() {
    // Reset game state
    gameState.totalParticles = 0;
    gameState.totalParticlesEarned = 0;
    gameState.particlesPerClick = 1;
    gameState.particlesPerSecond = 0;
    gameState.totalClicks = 0;
    gameState.lastUpdate = Date.now();
    gameState.lastSave = Date.now();

    // Reset buildings
    buildings.forEach(building => {
        building.quantity = 0;
    });

    // Reset upgrades
    upgrades.forEach(upgrade => {
        upgrade.purchased = false;
    });

    // Reset achievements
    if (typeof achievements !== 'undefined') {
        achievements.forEach(achievement => {
            achievement.earned = false;
        });
    }

    // Update displays
    updateDisplay();
    updateBuildingsDisplay();
    initUpgrades();
    if (typeof updateAchievementProgress === 'function') {
        updateAchievementProgress();
    }
}

// Save game state to localStorage
function saveGame() {
    const saveData = {
        version: 1.1,
        timestamp: Date.now(),
        gameState: {
            totalParticles: gameState.totalParticles,
            totalParticlesEarned: gameState.totalParticlesEarned,
            particlesPerClick: gameState.particlesPerClick,
            particlesPerSecond: gameState.particlesPerSecond,
            totalClicks: gameState.totalClicks
        },
        buildings: buildings.map(b => ({
            id: b.id,
            quantity: b.quantity
        })),
        upgrades: upgrades.map(u => ({
            id: u.id,
            purchased: u.purchased
        }))
    };

    try {
        localStorage.setItem('quantumWorkshopSave', JSON.stringify(saveData));
        showSaveNotification('Game saved successfully!');
    } catch (error) {
        console.error('Failed to save game:', error);
        showSaveNotification('Failed to save game!', true);
    }
}

// Load game state from localStorage
function loadGame() {
    try {
        const savedData = localStorage.getItem('quantumWorkshopSave');
        if (!savedData) return false;

        const saveData = JSON.parse(savedData);
        
        // Version check
        if (!saveData.version || saveData.version !== 1.1) {
            console.warn('Save version mismatch, some data might not load correctly');
        }

        // Restore game state
        if (saveData.gameState) {
            Object.assign(gameState, {
                totalParticles: saveData.gameState.totalParticles || 0,
                totalParticlesEarned: saveData.gameState.totalParticlesEarned || 0,
                particlesPerClick: saveData.gameState.particlesPerClick || 1,
                particlesPerSecond: saveData.gameState.particlesPerSecond || 0,
                totalClicks: saveData.gameState.totalClicks || 0,
                lastUpdate: Date.now(),
                lastSave: Date.now()
            });
        }

        // Restore buildings
        if (saveData.buildings) {
            saveData.buildings.forEach(savedBuilding => {
                const building = buildings.find(b => b.id === savedBuilding.id);
                if (building) {
                    building.quantity = savedBuilding.quantity;
                }
            });
        }

        // Restore upgrades
        if (saveData.upgrades) {
            saveData.upgrades.forEach(savedUpgrade => {
                const upgrade = upgrades.find(u => u.id === savedUpgrade.id);
                if (upgrade) {
                    upgrade.purchased = savedUpgrade.purchased;
                    if (upgrade.purchased && typeof upgrade.effect === 'function') {
                        upgrade.effect();
                    }
                }
            });
        }

        // Update displays
        updateDisplay();
        updateBuildingsDisplay();
        recalculateQpS();
        initUpgrades(); // Refresh upgrades display
        
        return true;
    } catch (error) {
        console.error('Failed to load game:', error);
        return false;
    }
}

// Reset game
function resetGame() {
    if (!confirm('Are you sure you want to reset your game? This cannot be undone!')) {
        return;
    }

    try {
        // Clear save data
        localStorage.removeItem('quantumWorkshopSave');
        
        // Reset game state
        resetGameState();
        
        showSaveNotification('Game reset successfully!');
    } catch (error) {
        console.error('Failed to reset game:', error);
        showSaveNotification('Failed to reset game!', true);
    }
}

// Auto-save functionality
function initAutoSave() {
    // Save every minute
    setInterval(saveGame, 60000);

    // Save before page unload
    window.addEventListener('beforeunload', () => {
        saveGame();
    });
}

// Export game
function exportSave() {
    try {
        const saveData = localStorage.getItem('quantumWorkshopSave');
        if (!saveData) {
            showSaveNotification('No save data found!', true);
            return;
        }

        // Create and trigger download
        const blob = new Blob([saveData], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `quantum_workshop_save_${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(a.href);

        showSaveNotification('Save exported successfully!');
    } catch (error) {
        console.error('Failed to export save:', error);
        showSaveNotification('Failed to export save!', true);
    }
}

// Import game
function importSave(file) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const saveData = e.target.result;
            localStorage.setItem('quantumWorkshopSave', saveData);
            loadGame();
            showSaveNotification('Save imported successfully!');
        } catch (error) {
            console.error('Failed to import save:', error);
            showSaveNotification('Failed to import save!', true);
        }
    };

    reader.readAsText(file);
}

// Show save notification
function showSaveNotification(message, isError = false) {
    const notification = document.createElement('div');
    notification.className = `save-notification ${isError ? 'error' : 'success'}`;
    notification.textContent = message;
    
    // Add styles if not already present
    if (!document.getElementById('save-notification-styles')) {
        const style = document.createElement('style');
        style.id = 'save-notification-styles';
        style.textContent = `
            .save-notification {
                position: fixed;
                bottom: 20px;
                right: 20px;
                padding: 10px 20px;
                border-radius: 5px;
                color: white;
                z-index: 1000;
                animation: fadeInOut 3s ease-in-out;
            }
            .save-notification.success {
                background-color: rgba(76, 175, 80, 0.9);
            }
            .save-notification.error {
                background-color: rgba(244, 67, 54, 0.9);
            }
            @keyframes fadeInOut {
                0% { opacity: 0; transform: translateY(20px); }
                10% { opacity: 1; transform: translateY(0); }
                90% { opacity: 1; transform: translateY(0); }
                100% { opacity: 0; transform: translateY(-20px); }
            }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

// Initialize save system
function initSaveSystem() {
    initAutoSave();
    
    // Set up import save handler
    document.getElementById('importSave').addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            importSave(e.target.files[0]);
        }
    });
}

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', initSaveSystem); 