
document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const hoursInput = document.getElementById('timer-hours-input');
    const minutesInput = document.getElementById('timer-minutes-input');
    const secondsInput = document.getElementById('timer-seconds-input');
    const display = document.getElementById('timer-display');
    const startBtn = document.getElementById('start-timer-btn');
    const pauseBtn = document.getElementById('pause-timer-btn');
    const addTimeBtn = document.getElementById('add-time-btn');
    const resetBtn = document.getElementById('reset-timer-btn');
    const endMessage = document.getElementById('timer-end-message');
    const progressBar = document.getElementById('progress-bar');
    const presetSection = document.querySelector('.preset-section');
    const customEndMessageInput = document.getElementById('custom-end-message');
    const breakDurationRadios = document.querySelectorAll('input[name="break-duration"]'); // New break selectors
    const modeIndicator = document.getElementById('mode-indicator'); // New mode indicator

    // --- State Variables ---
    let intervalId = null;
    let targetTime = 0;
    let remainingTime = 0;
    let initialDuration = 0; // Duration of the CURRENT phase (work or break)
    let workDurationMs = 0; // Store the originally set work duration
    let breakDurationMs = 0; // Selected break duration
    let isRunning = false;
    let isPaused = false;
    let currentMode = 'idle'; // 'idle', 'work', 'break'

    // --- Helper Functions ---

    // Format time as HH:MM:SS
    function formatTime(timeMs) {
        if (timeMs < 0) timeMs = 0;
        const totalSeconds = Math.round(timeMs / 1000);
        const seconds = String(totalSeconds % 60).padStart(2, '0');
        const minutes = String(Math.floor(totalSeconds / 60) % 60).padStart(2, '0');
        const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    }

    // Update the display element
    function updateDisplay() {
        display.textContent = formatTime(remainingTime);
    }

    // Update the progress bar
    function updateProgressBar() {
        if (initialDuration > 0) {
            const percentage = Math.max(0, (remainingTime / initialDuration) * 100);
            progressBar.style.width = `${percentage}%`;
            // Change color based on mode
            progressBar.classList.toggle('break', currentMode === 'break');
        } else {
            progressBar.style.width = '100%'; // Start full when idle/reset
            progressBar.classList.remove('break');
        }
    }

    // Get duration from input fields in milliseconds
    function getWorkDurationFromInput() {
        const hours = parseInt(hoursInput.value) || 0;
        const minutes = parseInt(minutesInput.value) || 0;
        const seconds = parseInt(secondsInput.value) || 0;
        return (hours * 3600 + minutes * 60 + seconds) * 1000;
    }

    // Get selected break duration in milliseconds
    function getBreakDuration() {
        const selectedRadio = document.querySelector('input[name="break-duration"]:checked');
        const minutes = parseInt(selectedRadio.value) || 0;
        return minutes * 60 * 1000;
    }


    // Set input fields from milliseconds
    function setInputFromDuration(durationMs) {
        if (durationMs < 0) durationMs = 0;
        const totalSeconds = Math.floor(durationMs / 1000);
        hoursInput.value = Math.floor(totalSeconds / 3600);
        minutesInput.value = Math.floor((totalSeconds % 3600) / 60);
        secondsInput.value = totalSeconds % 60;
    }


    // Enable/disable input fields and break selection
    function setSetupState(enabled) {
        hoursInput.disabled = !enabled;
        minutesInput.disabled = !enabled;
        secondsInput.disabled = !enabled;
        presetSection.querySelectorAll('button').forEach(btn => btn.disabled = !enabled);
        breakDurationRadios.forEach(radio => radio.disabled = !enabled);
    }

    // Update button states based on timer status
    function updateButtonStates() {
        startBtn.disabled = isRunning;
        pauseBtn.disabled = !(isRunning || isPaused);
        // Only allow adding time during 'work' phase
        addTimeBtn.disabled = !(currentMode === 'work' && (isRunning || isPaused));
    }

    // Update Mode Indicator Text
    function updateModeIndicator() {
        switch (currentMode) {
            case 'work':
                modeIndicator.textContent = 'Work Time';
                break;
            case 'break':
                modeIndicator.textContent = 'Break Time';
                break;
            case 'idle':
            default:
                modeIndicator.textContent = 'Set Work Time';
                break;
        }
    }

    // --- Core Timer Logic ---
    function tick() {
        remainingTime = targetTime - Date.now();

        if (remainingTime <= 0) {
            stopTimer(true); // Timer phase finished
        } else {
            updateDisplay();
            updateProgressBar();
        }
    }

    function startTimer() {
        if (isRunning && !isPaused) return;

        // Determine duration based on mode
        if (!isPaused) { // Starting fresh phase
            if (currentMode === 'idle') { // Starting work phase
                workDurationMs = getWorkDurationFromInput();
                if (workDurationMs <= 0) {
                    alert("Please set a valid work duration.");
                    return;
                }
                initialDuration = workDurationMs;
                currentMode = 'work';
            } else if (currentMode === 'break') { // Starting break phase
                // breakDurationMs should already be set
                if (breakDurationMs <= 0) { // Should not happen if logic is correct
                    console.error("Attempted to start break with no duration.");
                    resetTimer();
                    return;
                }
                initialDuration = breakDurationMs;
            } else { // Starting work phase (explicitly)
                 initialDuration = workDurationMs;
            }
            remainingTime = initialDuration; // Set remaining time for the new phase
        }
        // If resuming (isPaused is true), remainingTime is already set

        if (remainingTime <= 0) return;

        targetTime = Date.now() + remainingTime;
        setSetupState(false); // Disable inputs and break selection

        endMessage.textContent = "";
        isRunning = true;
        isPaused = false;
        clearInterval(intervalId);
        intervalId = setInterval(tick, 200);
        tick(); // Update display & progress immediately
        updateButtonStates();
        updateModeIndicator();
        pauseBtn.textContent = "Pause";
    }

    function pauseTimer() {
        if (!isRunning || isPaused) return;

        clearInterval(intervalId);
        remainingTime = targetTime - Date.now();
        isRunning = false;
        isPaused = true;
        updateButtonStates();
        pauseBtn.textContent = "Resume";
    }

    function stopTimer(finished = false) {
        clearInterval(intervalId);
        const wasRunning = isRunning; // Store if it was running before stopping
        isRunning = false;
        isPaused = false;

        if (finished) {
            remainingTime = 0;
            updateDisplay();
            updateProgressBar();

            // Check if it was the work phase and a break is selected
            if (currentMode === 'work') {
                breakDurationMs = getBreakDuration(); // Get latest selection
                if (breakDurationMs > 0) {
                    // Transition to break
                    currentMode = 'break';
                    endMessage.textContent = "Work complete! Starting break...";
                    console.log("Work finished, starting break!");
                    // Use setTimeout to allow message display before starting break
                    setTimeout(() => {
                        if (currentMode === 'break') { // Check if user hasn't reset in the meantime
                             startTimer(); // Automatically start the break timer
                        }
                    }, 1500); // Delay before starting break
                } else {
                    // Work finished, no break selected
                    const customMessage = customEndMessageInput.value.trim();
                    endMessage.textContent = customMessage || "Work Time Finished!";
                    console.log("Work finished!");
                    currentMode = 'idle'; // Go back to idle
                    setSetupState(true); // Re-enable inputs
                    updateModeIndicator();
                }
            } else if (currentMode === 'break') {
                // Break finished
                const customMessage = customEndMessageInput.value.trim();
                 // Use a different default message for break end
                endMessage.textContent = customMessage || "Break Finished!";
                console.log("Break finished!");
                currentMode = 'idle'; // Go back to idle
                setSetupState(true); // Re-enable inputs
                updateModeIndicator();
                // Reset inputs to original work duration? Or leave as is? Let's reset.
                setInputFromDuration(workDurationMs);
                resetTimer(); // Fully reset to initial state
            }
        } else { // Stopped manually via Reset
            remainingTime = initialDuration; // Reset remaining to current phase's initial
            updateDisplay();
            updateProgressBar();
            endMessage.textContent = "";
            currentMode = 'idle'; // Always go to idle on manual reset
            setSetupState(true);
            updateModeIndicator();
        }

        // Update buttons unless transitioning to break automatically
         if (!(finished && currentMode === 'break' && wasRunning)) {
            updateButtonStates();
         }
        pauseBtn.textContent = "Pause";
    }

     function resetTimer() {
        const currentlyRunning = isRunning;
        const currentlyPaused = isPaused;
        stopTimer(false); // Stop any running timer, clear messages

        // Reset to the duration currently in the input fields (work duration)
        workDurationMs = getWorkDurationFromInput();
        initialDuration = workDurationMs;
        remainingTime = initialDuration;
        currentMode = 'idle'; // Ensure mode is idle

        updateDisplay();
        updateProgressBar(); // Reset progress bar
        updateModeIndicator();
        setSetupState(true); // Ensure setup is enabled

        // Set button states for idle
        startBtn.disabled = (initialDuration <= 0);
        pauseBtn.disabled = true;
        addTimeBtn.disabled = true;
        pauseBtn.textContent = "Pause";
    }

    function addOneMinute() {
        // Only allow adding time during the 'work' phase
        if (currentMode !== 'work' || (!isRunning && !isPaused)) return;

        const oneMinuteMs = 60 * 1000;
        targetTime += oneMinuteMs;

        if (isPaused) {
            remainingTime += oneMinuteMs;
             if (remainingTime > 0) {
                 updateDisplay();
                 updateProgressBar();
             }
        }
         if (remainingTime > 0 && endMessage.textContent !== "") {
             endMessage.textContent = "";
         }
        console.log("Added 1 minute to work time");
        // Update initialDuration as well if we want progress bar to be accurate after adding time
        initialDuration += oneMinuteMs;
        workDurationMs += oneMinuteMs; // Update the stored work duration too
    }

    // --- Event Listeners ---
    startBtn.addEventListener('click', startTimer);
    pauseBtn.addEventListener('click', () => {
        if (isPaused) {
            startTimer(); // Resume
        } else {
            pauseTimer(); // Pause
        }
    });
    resetBtn.addEventListener('click', resetTimer);
    addTimeBtn.addEventListener('click', addOneMinute);

    // Preset Buttons Listener (only works when idle)
    presetSection.addEventListener('click', (event) => {
        if (event.target.tagName === 'BUTTON' && currentMode === 'idle') {
            const minutes = parseInt(event.target.dataset.minutes);
            if (!isNaN(minutes)) {
                setInputFromDuration(minutes * 60 * 1000);
                resetTimer(); // Reset state and update display based on new input
            }
        }
    });


    // Update display/button state when inputs change (only when idle)
    [hoursInput, minutesInput, secondsInput].forEach(input => {
        input.addEventListener('input', () => {
            if (currentMode === 'idle') {
                 workDurationMs = getDurationFromInput(); // Update work duration on input
                 initialDuration = workDurationMs;
                 remainingTime = initialDuration;
                 updateDisplay();
                 updateProgressBar();
                 startBtn.disabled = (initialDuration <= 0);
            }
        });
         input.addEventListener('change', () => { // Validate on change
             if (parseInt(input.value) < 0) input.value = 0;
             if ((input.id === 'timer-minutes-input' || input.id === 'timer-seconds-input') && parseInt(input.value) > 59) {
                 input.value = 59;
             }
             // Recalculate and update display/button state after validation
             if (currentMode === 'idle') {
                 workDurationMs = getDurationFromInput();
                 initialDuration = workDurationMs;
                 remainingTime = initialDuration;
                 updateDisplay();
                 updateProgressBar();
                 startBtn.disabled = (initialDuration <= 0);
             }
         });
    });

    // --- Initial State ---
    workDurationMs = getDurationFromInput(); // Store initial work duration
    initialDuration = workDurationMs;
    remainingTime = initialDuration;
    updateDisplay();
    updateProgressBar();
    updateButtonStates();
    updateModeIndicator();
    startBtn.disabled = (initialDuration <= 0);

    console.log("Enhanced Timer page with breaks JavaScript loaded.");
});
