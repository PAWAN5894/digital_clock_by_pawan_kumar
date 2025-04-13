
document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const hoursInput = document.getElementById('hours-input');
    const minutesInput = document.getElementById('minutes-input');
    const secondsInput = document.getElementById('seconds-input');
    const display = document.getElementById('countdown-display');
    const startBtn = document.getElementById('start-countdown-btn');
    const pauseBtn = document.getElementById('pause-countdown-btn');
    const resetBtn = document.getElementById('reset-countdown-btn');
    const endMessage = document.getElementById('end-message');

    // --- State Variables ---
    let intervalId = null;
    let targetTime = 0; // Timestamp when the countdown should end
    let remainingTime = 0; // Remaining time in milliseconds
    let initialDuration = 0; // Initial duration set by user in milliseconds
    let isRunning = false;
    let isPaused = false;

    // --- Helper Functions ---

    // Format time as HH:MM:SS
    function formatTime(timeMs) {
        if (timeMs < 0) timeMs = 0; // Ensure time doesn't go negative

        const totalSeconds = Math.floor(timeMs / 1000);
        const seconds = String(totalSeconds % 60).padStart(2, '0');
        const minutes = String(Math.floor(totalSeconds / 60) % 60).padStart(2, '0');
        const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');

        return `${hours}:${minutes}:${seconds}`;
    }

    // Update the display element
    function updateDisplay() {
        display.textContent = formatTime(remainingTime);
    }

    // Get duration from input fields in milliseconds
    function getDurationFromInput() {
        const hours = parseInt(hoursInput.value) || 0;
        const minutes = parseInt(minutesInput.value) || 0;
        const seconds = parseInt(secondsInput.value) || 0;
        return (hours * 3600 + minutes * 60 + seconds) * 1000;
    }

    // Enable/disable input fields
    function setInputState(enabled) {
        hoursInput.disabled = !enabled;
        minutesInput.disabled = !enabled;
        secondsInput.disabled = !enabled;
    }

    // Update button states based on timer status
    function updateButtonStates() {
        startBtn.disabled = isRunning;
        pauseBtn.disabled = !isRunning || isPaused;
        // Allow reset anytime except maybe during initial input phase? Let's allow always.
        // resetBtn.disabled = // depends on desired logic
    }

    // --- Core Countdown Logic ---
    function tick() {
        remainingTime = targetTime - Date.now();

        if (remainingTime <= 0) {
            stopCountdown(true); // Timer finished
        } else {
            updateDisplay();
        }
    }

    function startCountdown() {
        if (isRunning && !isPaused) return; // Already running

        initialDuration = getDurationFromInput();
        if (initialDuration <= 0) {
            alert("Please set a valid duration.");
            return;
        }

        if (isPaused) { // Resuming
            targetTime = Date.now() + remainingTime; // Recalculate target based on remaining
        } else { // Starting fresh or after reset
            remainingTime = initialDuration;
            targetTime = Date.now() + remainingTime;
            setInputState(false); // Disable inputs when starting
        }

        endMessage.textContent = ""; // Clear end message
        isRunning = true;
        isPaused = false;
        clearInterval(intervalId); // Clear any existing interval
        intervalId = setInterval(tick, 1000); // Update every second
        tick(); // Update display immediately
        updateButtonStates();
        pauseBtn.textContent = "Pause"; // Ensure button text is correct
    }

    function pauseCountdown() {
        if (!isRunning || isPaused) return; // Can't pause if not running or already paused

        clearInterval(intervalId);
        remainingTime = targetTime - Date.now(); // Store remaining time accurately
        isRunning = false; // Technically not running via interval
        isPaused = true;
        updateButtonStates();
        pauseBtn.textContent = "Resume"; // Change button text
    }

    function stopCountdown(finished = false) {
        clearInterval(intervalId);
        isRunning = false;
        isPaused = false;
        remainingTime = 0; // Reset remaining time
        updateDisplay(); // Show 00:00:00
        setInputState(true); // Re-enable inputs
        updateButtonStates();
        pauseBtn.textContent = "Pause"; // Reset button text

        if (finished) {
            endMessage.textContent = "Time's up!";
            // Optional: Play sound here
            console.log("Countdown finished!");
        } else {
             endMessage.textContent = ""; // Clear message if stopped manually via reset
        }
    }

     function resetCountdown() {
        stopCountdown(false); // Stop any running timer, don't show end message
        initialDuration = getDurationFromInput(); // Get current input values
        remainingTime = initialDuration; // Reset remaining time to input values
        updateDisplay(); // Update display to show input values formatted
        endMessage.textContent = ""; // Ensure end message is clear
        // Re-enable start, disable pause
        startBtn.disabled = (initialDuration <= 0); // Disable start if duration is 0
        pauseBtn.disabled = true;
        pauseBtn.textContent = "Pause";
    }


    // --- Event Listeners ---
    startBtn.addEventListener('click', startCountdown);
    pauseBtn.addEventListener('click', () => {
        if (isPaused) {
            startCountdown(); // Resume
        } else {
            pauseCountdown(); // Pause
        }
    });
    resetBtn.addEventListener('click', resetCountdown);

    // Update display and enable/disable start button when inputs change
    [hoursInput, minutesInput, secondsInput].forEach(input => {
        input.addEventListener('input', () => {
            if (!isRunning && !isPaused) { // Only update if timer is idle
                 initialDuration = getDurationFromInput();
                 remainingTime = initialDuration;
                 updateDisplay();
                 startBtn.disabled = (initialDuration <= 0);
            }
        });
         // Basic validation to prevent negative numbers
         input.addEventListener('change', () => {
             if (parseInt(input.value) < 0) {
                 input.value = 0;
             }
             // Optional: Enforce max for mins/secs if needed (already set in HTML)
             if ((input.id === 'minutes-input' || input.id === 'seconds-input') && parseInt(input.value) > 59) {
                 input.value = 59;
             }
             // Recalculate and update display/button state after validation
             if (!isRunning && !isPaused) {
                 initialDuration = getDurationFromInput();
                 remainingTime = initialDuration;
                 updateDisplay();
                 startBtn.disabled = (initialDuration <= 0);
             }
         });
    });

    // --- Initial State ---
    initialDuration = getDurationFromInput();
    remainingTime = initialDuration;
    updateDisplay(); // Set initial display based on default input values
    updateButtonStates(); // Set initial button states
    startBtn.disabled = (initialDuration <= 0); // Disable start if default is 0

    console.log("Countdown page JavaScript loaded.");
});
