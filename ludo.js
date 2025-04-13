
document.addEventListener('DOMContentLoaded', () => {
    const ludoContainer = document.getElementById('ludo-card');

    // Only run Ludo script if its container exists
    if (ludoContainer) {
        console.log("Initializing Basic Ludo Interface");

        const turnIndicator = document.getElementById('ludo-turn-indicator');
        const diceDisplay = document.getElementById('ludo-dice-display');
        const rollButton = document.getElementById('ludo-roll-btn');

        const players = ['Red', 'Blue', 'Yellow', 'Green'];
        let currentPlayerIndex = 0; // Start with Red

        function updateTurnIndicator() {
            const currentPlayerName = players[currentPlayerIndex];
            turnIndicator.textContent = `${currentPlayerName}'s Turn`;
            // Update class for background color based on player
            turnIndicator.className = 'ludo-turn-indicator'; // Reset classes
            turnIndicator.classList.add(currentPlayerName.toLowerCase());
        }

        function rollDice() {
            // Simulate dice roll (1-6)
            const roll = Math.floor(Math.random() * 6) + 1;
            diceDisplay.textContent = roll;
            console.log(`${players[currentPlayerIndex]} rolled a ${roll}`);

            // --- Placeholder for Game Logic ---
            // Here you would:
            // 1. Check valid moves for the current player based on the roll.
            // 2. Handle piece selection (if multiple pieces can move).
            // 3. Update the board state based on the chosen move.
            // 4. Render the updated board visually (move pieces).
            // 5. Check for winning conditions.
            // 6. Determine if the player gets another turn (e.g., rolled a 6).
            // --- End Placeholder ---

            // Simple turn switching (doesn't account for rolling a 6)
            switchTurn();
        }

        function switchTurn() {
            currentPlayerIndex = (currentPlayerIndex + 1) % players.length; // Cycle through players
            updateTurnIndicator();
            // Reset dice display for next player? Optional.
            // diceDisplay.textContent = '?';
        }

        // --- Event Listeners ---
        if (rollButton) {
            rollButton.addEventListener('click', rollDice);
        } else {
            console.error("Ludo roll button not found!");
        }

        // --- Initial Setup ---
        updateTurnIndicator(); // Set initial turn indicator

    } // End if (ludoContainer)

}); // End DOMContentLoaded
