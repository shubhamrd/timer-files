// Game variables
let canvas = document.getElementById('gameCanvas');
let ctx = canvas.getContext('2d');
let score = 0;
let lives = 3;
let gameRunning = false;
let gameLoop;
let playerName = "Player";

// Basket properties
let basket = {
    x: canvas.width / 2 - 50,
    y: canvas.height - 50,
    width: 100,
    height: 30,
    speed: 12 // Increased speed for better responsiveness
};

// Falling objects array
let objects = [];

// Mouse position for dragging
let mouseX = 0;
let mouseY = 0;
let isDragging = false;

// DOM elements
let startButton, restartButton, setNameButton, userNameInput, welcomeMessage, finalScoreMessage;

// Initialize when page loads
window.addEventListener('DOMContentLoaded', function() {
    // Get all DOM elements
    startButton = document.getElementById('startButton');
    restartButton = document.getElementById('restartButton');
    setNameButton = document.getElementById('setNameButton');
    userNameInput = document.getElementById('userName');
    welcomeMessage = document.getElementById('welcomeMessage');
    finalScoreMessage = document.getElementById('finalScoreMessage');
    
    // Set up event listeners
    if (startButton) startButton.addEventListener('click', startGame);
    if (restartButton) restartButton.addEventListener('click', startGame);
    if (setNameButton) setNameButton.addEventListener('click', setPlayerName);
    
    // Allow Enter key to submit name
    if (userNameInput) {
        userNameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                setPlayerName();
            }
        });
    }
    
    // Initially hide the start button
    if (startButton) {
        startButton.style.display = 'none';
    }
});

// Keyboard controls with better response
document.addEventListener('keydown', (e) => {
    if (!gameRunning) return;
    
    switch(e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
            basket.x = Math.max(0, basket.x - basket.speed);
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            basket.x = Math.min(canvas.width - basket.width, basket.x + basket.speed);
            break;
    }
});

document.addEventListener('keyup', (e) => {
    // No action needed on key release
});

// Mouse controls
canvas.addEventListener('mousemove', (e) => {
    if (!gameRunning) return;
    
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
    
    // Only move basket if dragging
    if (isDragging) {
        basket.x = mouseX - basket.width / 2;
        // Keep basket within canvas bounds
        basket.x = Math.max(0, Math.min(canvas.width - basket.width, basket.x));
    }
});

canvas.addEventListener('mousedown', (e) => {
    if (!gameRunning) return;
    
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
    
    // Check if mouse is over basket
    if (mouseX > basket.x && mouseX < basket.x + basket.width &&
        mouseY > basket.y && mouseY < basket.y + basket.height) {
        isDragging = true;
    }
});

canvas.addEventListener('mouseup', () => {
    isDragging = false;
});

canvas.addEventListener('mouseleave', () => {
    isDragging = false;
});

// Touch controls for mobile devices
canvas.addEventListener('touchmove', (e) => {
    if (!gameRunning) return;
    e.preventDefault();
    
    const rect = canvas.getBoundingClientRect();
    mouseX = e.touches[0].clientX - rect.left;
    mouseY = e.touches[0].clientY - rect.top;
    
    if (isDragging) {
        basket.x = mouseX - basket.width / 2;
        basket.x = Math.max(0, Math.min(canvas.width - basket.width, basket.x));
    }
});

canvas.addEventListener('touchstart', (e) => {
    if (!gameRunning) return;
    e.preventDefault();
    
    const rect = canvas.getBoundingClientRect();
    mouseX = e.touches[0].clientX - rect.left;
    mouseY = e.touches[0].clientY - rect.top;
    
    // Check if touch is over basket
    if (mouseX > basket.x && mouseX < basket.x + basket.width &&
        mouseY > basket.y && mouseY < basket.y + basket.height) {
        isDragging = true;
    }
});

canvas.addEventListener('touchend', () => {
    isDragging = false;
});

// Set player name function
function setPlayerName() {
    const name = userNameInput.value.trim();
    if (name) {
        playerName = name;
        welcomeMessage.textContent = `Welcome, ${playerName}!`;
        welcomeMessage.style.color = "#4ecdc4";
        welcomeMessage.style.animation = "pulse 0.5s";
        // Hide the input area and show start button
        document.getElementById('playerNameInput').style.display = 'none';
        if (startButton) {
            startButton.style.display = 'inline-block';
        }
        // Add a little celebration effect
        setTimeout(() => {
            if (welcomeMessage) {
                welcomeMessage.style.animation = "";
            }
        }, 500);
    } else {
        playerName = "Player";
        if (welcomeMessage) {
            welcomeMessage.textContent = "Welcome to the game!";
            welcomeMessage.style.color = "#ff6b6b";
        }
    }
}

// Start game function
function startGame() {
    // Reset game state
    score = 0;
    lives = 3;
    objects = [];
    gameRunning = true;
    isDragging = false;
    
    // Hide screens
    if (document.getElementById('startScreen')) {
        document.getElementById('startScreen').classList.add('hidden');
    }
    if (document.getElementById('gameOver')) {
        document.getElementById('gameOver').classList.add('hidden');
    }
    
    // Update UI
    updateUI();
    
    // Start game loop
    if (gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(update, 20);
}

// Update UI elements
function updateUI() {
    document.getElementById('score').textContent = `Score: ${score}`;
    document.getElementById('lives').textContent = `Lives: ${lives}`;
    document.getElementById('finalScoreMessage').textContent = `${playerName}'s score: ${score}`;
}

// Update game state
function update() {
    if (!gameRunning) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw basket
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(basket.x, basket.y, basket.width, basket.height);
    
    // Draw basket details for better visibility
    ctx.fillStyle = '#CC0000';
    ctx.fillRect(basket.x, basket.y, basket.width, 5); // Top highlight
    ctx.fillRect(basket.x, basket.y + basket.height - 5, basket.width, 5); // Bottom highlight
    
    // Generate new objects with adjusted frequency and speed
    if (Math.random() < 0.05) { // Increased frequency
        objects.push({
            x: Math.random() * (canvas.width - 40),
            y: 0,
            width: 40, // Larger objects for easier catching
            height: 40,
            speed: 1 + Math.random() * 2 // Slower falling speed
        });
    }
    
    // Update and draw objects
    for (let i = objects.length - 1; i >= 0; i--) {
        let obj = objects[i];
        obj.y += obj.speed;
        
        // Draw object with better visual
        ctx.fillStyle = '#0000FF';
        ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
        
        // Add some detail to objects
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(obj.x + obj.width/4, obj.y + obj.height/4, obj.width/6, obj.height/6);
        
        // Check collision with basket
        if (obj.y + obj.height >= basket.y && 
            obj.x + obj.width > basket.x && 
            obj.x < basket.x + basket.width) {
            
            // Caught object - visual feedback
            ctx.fillStyle = '#FFFF00'; // Yellow flash
            ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
            
            // Caught object
            score += 10;
            objects.splice(i, 1);
            updateUI();
        }
        // Check if object missed
        else if (obj.y > canvas.height) {
            lives--;
            objects.splice(i, 1);
            updateUI();
            
            if (lives <= 0) {
                gameOver();
            }
        }
    }
}

// Game over function
function gameOver() {
    gameRunning = false;
    clearInterval(gameLoop);
    
    document.getElementById('finalScore').textContent = score;
    document.getElementById('gameOver').classList.remove('hidden');
}

// Initialize the game
window.onload = function() {
    // Set canvas dimensions if needed
    canvas.width = 800;
    canvas.height = 600;
};