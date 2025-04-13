
document.addEventListener('DOMContentLoaded', () => {
    const sudokuContainer = document.getElementById('sudoku-card');

    // Only run Sudoku script if its container exists
    if (sudokuContainer) {
        console.log("Initializing Basic Sudoku Interface");

        const gridElement = document.getElementById('sudoku-grid');
        const checkButton = document.getElementById('sudoku-check-btn');
        const resetButton = document.getElementById('sudoku-reset-btn');
        const newButton = document.getElementById('sudoku-new-btn'); // Optional
        const messageElement = document.getElementById('sudoku-message');

        // --- Fixed Sudoku Puzzles ---
        // 0 represents an empty cell
        const puzzles = [
            {
                puzzle: [
                    [5, 3, 0, 0, 7, 0, 0, 0, 0],
                    [6, 0, 0, 1, 9, 5, 0, 0, 0],
                    [0, 9, 8, 0, 0, 0, 0, 6, 0],
                    [8, 0, 0, 0, 6, 0, 0, 0, 3],
                    [4, 0, 0, 8, 0, 3, 0, 0, 1],
                    [7, 0, 0, 0, 2, 0, 0, 0, 6],
                    [0, 6, 0, 0, 0, 0, 2, 8, 0],
                    [0, 0, 0, 4, 1, 9, 0, 0, 5],
                    [0, 0, 0, 0, 8, 0, 0, 7, 9]
                ]
                // Add solution if needed for a "solve" button later
                // solution: [...]
            },
            // Add more puzzles here if desired
             {
                 puzzle: [
                     [0, 0, 0, 2, 6, 0, 7, 0, 1],
                     [6, 8, 0, 0, 7, 0, 0, 9, 0],
                     [1, 9, 0, 0, 0, 4, 5, 0, 0],
                     [8, 2, 0, 1, 0, 0, 0, 4, 0],
                     [0, 0, 4, 6, 0, 2, 9, 0, 0],
                     [0, 5, 0, 0, 0, 3, 0, 2, 8],
                     [0, 0, 9, 3, 0, 0, 0, 7, 4],
                     [0, 4, 0, 0, 5, 0, 0, 3, 6],
                     [7, 0, 3, 0, 1, 8, 0, 0, 0]
                 ]
             }
        ];
        let currentPuzzleIndex = 0;
        let currentBoardState = []; // Will hold the current values including user input

        // --- Functions ---

        function loadPuzzle(puzzleIndex) {
            gridElement.innerHTML = ''; // Clear previous grid
            messageElement.textContent = "Enter numbers (1-9).";
            const puzzleData = puzzles[puzzleIndex].puzzle;
            currentBoardState = JSON.parse(JSON.stringify(puzzleData)); // Deep copy

            for (let row = 0; row < 9; row++) {
                for (let col = 0; col < 9; col++) {
                    const cell = document.createElement('div');
                    cell.classList.add('sudoku-cell');
                    cell.dataset.row = row;
                    cell.dataset.col = col;

                    const value = puzzleData[row][col];

                    if (value !== 0) {
                        // Pre-filled cell
                        cell.textContent = value;
                        cell.classList.add('prefilled');
                    } else {
                        // Empty cell - add input field
                        const input = document.createElement('input');
                        input.type = 'number';
                        input.min = 1;
                        input.max = 9;
                        input.dataset.row = row; // Add data attributes for easy access
                        input.dataset.col = col;
                        input.addEventListener('input', handleInput);
                        cell.appendChild(input);
                    }
                    gridElement.appendChild(cell);
                }
            }
             // Show 'New Puzzle' button only if more than one puzzle exists
             newButton.style.display = puzzles.length > 1 ? 'inline-block' : 'none';
        }

        function handleInput(event) {
            const input = event.target;
            const value = input.value;
            const row = parseInt(input.dataset.row);
            const col = parseInt(input.dataset.col);

            // Remove non-numeric characters and keep only the last digit (1-9)
            const cleanedValue = value.replace(/[^1-9]/g, '');
            input.value = cleanedValue.slice(-1); // Keep only the last valid digit

            if (input.value) {
                 currentBoardState[row][col] = parseInt(input.value);
            } else {
                 currentBoardState[row][col] = 0; // Treat empty as 0
            }

            // Optional: Immediately check for conflicts on input
            // checkBoard(false); // Pass false to not show success message
        }

        // Basic Check: Highlights immediate conflicts (doesn't check for solvability/completion)
        function checkBoard(showSuccess = true) {
            messageElement.textContent = "Checking...";
            clearErrors();
            let isValid = true;

            for (let r = 0; r < 9; r++) {
                for (let c = 0; c < 9; c++) {
                    const num = currentBoardState[r][c];
                    if (num !== 0) {
                        if (!isValidPlacement(currentBoardState, r, c, num)) {
                            isValid = false;
                            markError(r, c);
                        }
                    }
                }
            }

            if (isValid && showSuccess) {
                messageElement.textContent = "No immediate conflicts found.";
                 // Check if board is full (basic completion check)
                 if (isBoardFull()) {
                     messageElement.textContent = "Board filled! (Manual check needed for correctness)";
                 }

            } else if (!isValid) {
                messageElement.textContent = "Conflicts found (highlighted).";
            } else {
                 messageElement.textContent = "Enter numbers (1-9)."; // Reset message if no errors on intermediate check
            }
            return isValid;
        }

        function isBoardFull() {
             for (let r = 0; r < 9; r++) {
                for (let c = 0; c < 9; c++) {
                    if (currentBoardState[r][c] === 0) {
                        return false; // Found an empty cell
                    }
                }
            }
            return true; // No empty cells found
        }


        // Checks if placing 'num' at [row, col] is valid *against current board*
        function isValidPlacement(board, row, col, num) {
            // Check Row
            for (let c = 0; c < 9; c++) {
                if (c !== col && board[row][c] === num) return false;
            }
            // Check Column
            for (let r = 0; r < 9; r++) {
                if (r !== row && board[r][col] === num) return false;
            }
            // Check 3x3 Box
            const startRow = Math.floor(row / 3) * 3;
            const startCol = Math.floor(col / 3) * 3;
            for (let r = startRow; r < startRow + 3; r++) {
                for (let c = startCol; c < startCol + 3; c++) {
                    if (r !== row && c !== col && board[r][c] === num) return false;
                }
            }
            return true;
        }

        function markError(row, col) {
            const cell = gridElement.querySelector(`[data-row='${row}'][data-col='${col}']`);
            if (cell) {
                 if (cell.classList.contains('prefilled')) {
                     cell.classList.add('error'); // Special highlight for prefilled
                 } else {
                     const input = cell.querySelector('input');
                     if (input) input.classList.add('error');
                 }
            }
        }

        function clearErrors() {
            gridElement.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
        }

        // --- Event Listeners ---
        checkButton.addEventListener('click', () => checkBoard(true));
        resetButton.addEventListener('click', () => {
             loadPuzzle(currentPuzzleIndex); // Reload the current puzzle
             messageElement.textContent = "Board reset.";
        });
         newButton.addEventListener('click', () => {
             currentPuzzleIndex = (currentPuzzleIndex + 1) % puzzles.length; // Cycle through puzzles
             loadPuzzle(currentPuzzleIndex);
             messageElement.textContent = `Loaded Puzzle ${currentPuzzleIndex + 1}.`;
         });


        // --- Initial Load ---
        loadPuzzle(currentPuzzleIndex);

    } // End if (sudokuContainer)

}); // End DOMContentLoaded
