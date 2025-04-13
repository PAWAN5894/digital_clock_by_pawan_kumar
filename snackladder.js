
document.addEventListener('DOMContentLoaded', () => {
    const snakeladderContainer = document.getElementById('snake-card');

    // Only run script if its container exists
    if (snakeladderContainer) {
        console.log("Initializing Basic Snake & Ladders Interface");

        const gridElement = document.getElementById('snakeladder-grid');
        const diceDisplay = document.getElementById('snakeladder-dice-display');
        const rollButton = document.getElementById('snakeladder-roll-btn');
        const messageElement = document.getElementById('snakeladder-message');

        const gridSize = 6; // 6x6 grid
        const totalSquares = gridSize * gridSize; // 36
        let playerPosition = 0; // Start outside the board (needs 1 to get on)
        let playerTokenElement = null;
        let gameWon = false;

        // --- Define Snakes and Ladders for the 6x6 board ---
        // Format: { startSquare: endSquare }
        // Remember squares are numbered 1-36
        const snakes = {
            34: 6,  // Long snake
            25: 10,
            18: 4
        };
        const ladders = {
            3: 15,  // Long ladder
            8: 26,
            20: 32
        };

        // --- Functions ---

        // Create the visual grid
        function createGrid() {
            gridElement.innerHTML = ''; // Clear previous grid
            for (let i = 1; i <= totalSquares; i++) {
                const cell = document.createElement('div');
                cell.classList.add('snakeladder-cell');
                cell.dataset.square = i; // Store square number
                cell.textContent = i; // Display square number

                // Add classes for visual snake/ladder indicators
                if (snakes[i]) cell.classList.add('snake-head');
                if (ladders[i]) cell.classList.add('ladder-base');
                // Find and mark tails/tops (less efficient but okay for small board)
                for (const head in snakes) { if (snakes[head] === i) cell.classList.add('snake-tail'); }
                for (const base in ladders) { if (ladders[base] === i) cell.classList.add('ladder-top'); }


                gridElement.appendChild(cell);
            }
            // Create player token
            playerTokenElement = document.createElement('div');
            playerTokenElement.classList.add('player-token');
            // Initially hide or place outside
        }

        // Update the visual position of the player token
        function updatePlayerPosition(newPosition) {
            const oldCell = gridElement.querySelector(`[data-square='${playerPosition}']`);
            // Remove token from old cell if it exists and token is on board
            if (oldCell && playerPosition > 0 && oldCell.contains(playerTokenElement)) {
                 oldCell.removeChild(playerTokenElement);
            }

            playerPosition = newPosition; // Update logical position

            // Add token to new cell if on board
            if (playerPosition > 0) {
                const newCell = gridElement.querySelector(`[data-square='${playerPosition}']`);
                if (newCell) {
                    newCell.appendChild(playerTokenElement);
                } else {
                    console.error(`Cell ${playerPosition} not found!`);
                }
            }
            console.log("Player moved to:", playerPosition);
        }

        // Handle the dice roll and subsequent moves
        function handleRoll() {
            if (gameWon) return; // Don't roll if game is over

            rollButton.disabled = true; // Disable button during roll/move
            messageElement.textContent = "Rolling...";

            const roll = Math.floor(Math.random() * 6) + 1;
            diceDisplay.textContent = roll;
            console.log(`Rolled a ${roll}`);

            let targetPosition = playerPosition + roll;

            // --- Movement Logic ---
            if (playerPosition === 0) { // Player is off-board
                if (roll === 1 || roll === 6) { // Need 1 or 6 to start (common rule variation)
                    targetPosition = 1; // Start at square 1
                    messageElement.textContent = `Rolled ${roll}. Starting on square 1!`;
                    movePlayerWithDelay(targetPosition);
                } else {
                    messageElement.textContent = `Rolled ${roll}. Need a 1 or 6 to start.`;
                    rollButton.disabled = false; // Re-enable button immediately
                }
            } else { // Player is on the board
                if (targetPosition > totalSquares) {
                    // Overshot the end - simple rule: stay put (or bounce back if desired)
                    messageElement.textContent = `Rolled ${roll}. Overshot ${totalSquares}! Stay put.`;
                    targetPosition = playerPosition; // Stay in the same place
                    movePlayerWithDelay(targetPosition); // Still call to re-enable button
                } else if (targetPosition === totalSquares) {
                    // Landed exactly on the end - WIN!
                    messageElement.textContent = `Rolled ${roll}. Landed on ${totalSquares}. You Win!`;
                    gameWon = true;
                    movePlayerWithDelay(targetPosition);
                    // No further rolls allowed
                } else {
                    // Normal move within the board
                    messageElement.textContent = `Rolled ${roll}. Moving to ${targetPosition}...`;
                    movePlayerWithDelay(targetPosition);
                }
            }
        }

        // Move player visually and check for snakes/ladders after a delay
        function movePlayerWithDelay(targetPos) {
             // Simulate move time
             setTimeout(() => {
                 updatePlayerPosition(targetPos);

                 // Check for snakes or ladders AFTER the initial move
                 const snakeEnd = snakes[playerPosition];
                 const ladderEnd = ladders[playerPosition];

                 if (snakeEnd) {
                     messageElement.textContent += ` Oh no! Snake! Sliding down to ${snakeEnd}.`;
                     console.log(`Landed on snake at ${playerPosition}, moving to ${snakeEnd}`);
                     // Add another delay for the slide/climb animation effect
                     setTimeout(() => {
                         updatePlayerPosition(snakeEnd);
                         if (!gameWon) rollButton.disabled = false; // Re-enable button after move completes
                     }, 600); // Delay for snake/ladder move
                 } else if (ladderEnd) {
                     messageElement.textContent += ` Yay! Ladder! Climbing up to ${ladderEnd}.`;
                     console.log(`Landed on ladder at ${playerPosition}, moving to ${ladderEnd}`);
                    setTimeout(() => {
                         updatePlayerPosition(ladderEnd);
                         // Check for win after ladder climb
                         if(ladderEnd === totalSquares) {
                             messageElement.textContent = `Climbed ladder to ${totalSquares}. You Win!`;
                             gameWon = true;
                         }
                         if (!gameWon) rollButton.disabled = false; // Re-enable button after move completes
                     }, 600); // Delay for snake/ladder move
                 } else {
                     // No snake or ladder, just re-enable the button
                     if (!gameWon) rollButton.disabled = false;
                 }

             }, 500); // Delay for initial dice move
        }


        // --- Event Listeners ---
        if (rollButton) {
            rollButton.addEventListener('click', handleRoll);
        } else {
            console.error("Snake & Ladders roll button not found!");
        }

        // --- Initial Setup ---
        createGrid(); // Create the visual board
        // Player starts at position 0 (off board)

    } // End if (snakeladderContainer)

}); // End DOMContentLoaded

