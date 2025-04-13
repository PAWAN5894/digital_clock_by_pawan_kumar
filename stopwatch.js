
document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const display = document.getElementById('stopwatch-display');
    const startBtn = document.getElementById('start-btn');
    const stopBtn = document.getElementById('stop-btn');
    const resetBtn = document.getElementById('reset-btn');
    const lapBtn = document.getElementById('lap-btn');
    const lapsList = document.getElementById('laps-list');

    // --- State Variables ---
    let startTime = 0;
    let elapsedTime = 0;
    let intervalId = null;
    let laps = [];
    let lapCounter = 0;
    let isRunning = false;

    // --- Helper Functions ---

    // Format time as HH:MM:SS.ms
    function formatTime(time) {
        const milliseconds = Math.floor((time % 1000) / 10); // Show 2 digits for ms
        const seconds = Math.floor((time / 1000) % 60);
        const minutes = Math.floor((time / (1000 * 60)) % 60);
        const hours = Math.floor(time / (1000 * 60 * 60));

        return (
            String(hours).padStart(2, '0') + ':' +
            String(minutes).padStart(2, '0') + ':' +
            String(seconds).padStart(2, '0') + '.' +
            String(milliseconds).padStart(2, '0')
        );
    }

    // Update the display element
    function updateDisplay() {
        const currentTime = Date.now();
        elapsedTime = currentTime - startTime;
        display.textContent = formatTime(elapsedTime);
    }

    // Render the laps list
    function renderLaps() {
        lapsList.innerHTML = ''; // Clear previous laps
        laps.forEach((lap, index) => {
            const li = document.createElement('li');
            const lapNumSpan = document.createElement('span');
            const lapTimeSpan = document.createElement('span');

            lapNumSpan.textContent = `Lap ${index + 1}`;
            lapTimeSpan.textContent = formatTime(lap);

            li.appendChild(lapNumSpan);
            li.appendChild(lapTimeSpan);
            lapsList.appendChild(li);
        });
         // Scroll to the bottom of the laps list
         lapsList.parentNode.scrollTop = lapsList.parentNode.scrollHeight;
    }

    // --- Event Handlers ---

    function startStopwatch() {
        if (isRunning) return; // Prevent multiple starts

        startTime = Date.now() - elapsedTime; // Adjust start time if resuming
        intervalId = setInterval(updateDisplay, 10); // Update display frequently
        isRunning = true;

        // Update button states
        startBtn.disabled = true;
        stopBtn.disabled = false;
        lapBtn.disabled = false; // Enable lap button when running
        resetBtn.disabled = true; // Disable reset while running
    }

    function stopStopwatch() {
        if (!isRunning) return; // Prevent stopping if not running

        clearInterval(intervalId);
        elapsedTime = Date.now() - startTime; // Capture final elapsed time
        isRunning = false;

        // Update button states
        startBtn.disabled = false;
        stopBtn.disabled = true;
        lapBtn.disabled = true; // Disable lap button when stopped
        resetBtn.disabled = false; // Enable reset when stopped
    }

    function resetStopwatch() {
        stopStopwatch(); // Ensure it's stopped first
        elapsedTime = 0;
        startTime = 0;
        laps = [];
        lapCounter = 0;
        display.textContent = formatTime(0);
        renderLaps(); // Clear laps display

        // Reset button states
        startBtn.disabled = false;
        stopBtn.disabled = true;
        lapBtn.disabled = true;
        resetBtn.disabled = false; // Keep reset enabled initially, or disable if preferred
    }

    function recordLap() {
        if (!isRunning) return; // Can only record laps while running

        const lapTime = Date.now() - startTime;
        laps.push(lapTime);
        renderLaps();
    }

    // --- Attach Event Listeners ---
    startBtn.addEventListener('click', startStopwatch);
    stopBtn.addEventListener('click', stopStopwatch);
    resetBtn.addEventListener('click', resetStopwatch);
    lapBtn.addEventListener('click', recordLap);

    // --- Initial State ---
    display.textContent = formatTime(0); // Set initial display
    stopBtn.disabled = true;
    lapBtn.disabled = true;

    console.log("Stopwatch page JavaScript loaded.");
});
