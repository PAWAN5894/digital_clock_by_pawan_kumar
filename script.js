
// --- DOM Element Selectors ---
const clockElement = document.querySelector(".clock");
const dateElement = document.querySelector(".date");
const locationElement = document.querySelector(".location");
const settingsBtn = document.getElementById("settings-btn");
const fullscreenBtn = document.getElementById('fullscreen-btn');
const musicBtn = document.getElementById('music-btn');
const audioElement = document.getElementById('background-audio');

// Ensure essential elements exist
if (!clockElement || !dateElement || !locationElement || !settingsBtn || !fullscreenBtn || !musicBtn || !audioElement) {
    console.error("One or more essential HTML elements are missing!");
    // Optionally, disable buttons or show a message
    if(settingsBtn) settingsBtn.disabled = true;
    if(fullscreenBtn) fullscreenBtn.disabled = true;
    if(musicBtn) musicBtn.disabled = true;
}

// --- State Variables ---
let clockInterval;
let dateInterval;
let settings = { // Default settings
    timeFormat: "24",
    showSeconds: true,
    dateFormat: "full",
    bgColor: "#111111",
    textColor: "#00ff00",
    fontFamily: "Orbitron",
    fontSize: 70,
    bgImageUrl: "",
    darkMode: false,
    showLocation: true,
    musicPlaying: false,
};

// --- Settings Panel Creation ---
const settingsPanel = document.createElement("div");
settingsPanel.classList.add("settings-panel");
settingsPanel.id = "settings-panel";

function createSettingsPanel() {
    settingsPanel.innerHTML = `
        <label for="bg-color-picker">Background</label>
        <input type="color" id="bg-color-picker">

        <label for="bg-image-url">BG Image URL</label>
        <input type="text" id="bg-image-url" placeholder="Enter image URL">

        <label for="text-color-picker">Text Color</label>
        <input type="color" id="text-color-picker">

        <label for="font-select">Font</label>
        <select id="font-select">
            <option value="Orbitron">Orbitron</option>
            <option value="'Courier New', Courier, monospace">Courier New</option>
            <option value="'Times New Roman', Times, serif">Times New Roman</option>
            <option value="Arial, sans-serif">Arial</option>
            <option value="Verdana, sans-serif">Verdana</option>
            <option value="'Pacifico', cursive">Pacifico (Add Google Font)</option>
            <option value="'Roboto', sans-serif">Roboto (Add Google Font)</option>
        </select>

        <label for="font-size-slider">Text Size (${settings.fontSize}px)</label>
        <input type="range" id="font-size-slider" min="20" max="200" step="1">

        <label for="time-format-select">Time Format</label>
        <select id="time-format-select">
            <option value="24">24-Hour</option>
            <option value="12">12-Hour</option>
        </select>

        <label for="show-seconds-select">Show Seconds</label>
        <select id="show-seconds-select">
            <option value="true">Show</option>
            <option value="false">Hide</option>
        </select>

        <label for="date-format-select">Date Format</label>
        <select id="date-format-select">
            <option value="full">Full (Weekday, Month Day, Year)</option>
            <option value="long">Long (Month Day, Year)</option>
            <option value="short">Short (MM/DD/YYYY)</option>
            <option value="numeric">Numeric (YYYY-MM-DD)</option>
        </select>

        <label for="dark-mode-toggle">Dark Mode</label>
        <input type="checkbox" id="dark-mode-toggle">

        <label for="show-location-toggle">Show Location</label>
        <input type="checkbox" id="show-location-toggle">

        <div class="full-width">
             <input type="search" id="search-input" placeholder="Google Search...">
             <button id="search-btn"><i class="fas fa-search"></i></button>
        </div>


        <button id="close-settings" class="full-width">Close</button>
    `;
    document.body.appendChild(settingsPanel);

    const bgColorPicker = settingsPanel.querySelector("#bg-color-picker");
    const bgImageUrlInput = settingsPanel.querySelector("#bg-image-url");
    const textColorPicker = settingsPanel.querySelector("#text-color-picker");
    const fontSelect = settingsPanel.querySelector("#font-select");
    const fontSizeSlider = settingsPanel.querySelector("#font-size-slider");
    const timeFormatSelect = settingsPanel.querySelector("#time-format-select");
    const showSecondsSelect = settingsPanel.querySelector("#show-seconds-select");
    const dateFormatSelect = settingsPanel.querySelector("#date-format-select");
    const darkModeToggle = settingsPanel.querySelector("#dark-mode-toggle");
    const showLocationToggle = settingsPanel.querySelector("#show-location-toggle");
    const searchInput = settingsPanel.querySelector("#search-input");
    const searchBtn = settingsPanel.querySelector("#search-btn");
    const closeButton = settingsPanel.querySelector("#close-settings");

    bgColorPicker.addEventListener("input", (e) => updateSetting('bgColor', e.target.value));
    bgImageUrlInput.addEventListener("input", (e) => updateSetting('bgImageUrl', e.target.value));
    textColorPicker.addEventListener("input", (e) => updateSetting('textColor', e.target.value));
    fontSelect.addEventListener("change", (e) => updateSetting('fontFamily', e.target.value));
    fontSizeSlider.addEventListener("input", (e) => {
        updateSetting('fontSize', parseInt(e.target.value));
        const label = settingsPanel.querySelector('label[for="font-size-slider"]');
        if(label) label.textContent = `Text Size (${e.target.value}px)`;
    });
    timeFormatSelect.addEventListener("change", (e) => updateSetting('timeFormat', e.target.value));
    showSecondsSelect.addEventListener("change", (e) => updateSetting('showSeconds', e.target.value === "true"));
    dateFormatSelect.addEventListener("change", (e) => updateSetting('dateFormat', e.target.value));
    darkModeToggle.addEventListener("change", (e) => updateSetting('darkMode', e.target.checked));
    showLocationToggle.addEventListener("change", (e) => updateSetting('showLocation', e.target.checked));

    searchBtn.addEventListener("click", performSearch);
    searchInput.addEventListener("keypress", (e) => {
        if (e.key === 'Enter') performSearch();
    });

    if (closeButton) {
        closeButton.addEventListener("click", toggleSettingsPanel);
    }

    loadSettings();
    bgColorPicker.value = settings.bgColor;
    bgImageUrlInput.value = settings.bgImageUrl;
    textColorPicker.value = settings.textColor;
    fontSelect.value = settings.fontFamily;
    fontSizeSlider.value = settings.fontSize;
    settingsPanel.querySelector('label[for="font-size-slider"]').textContent = `Text Size (${settings.fontSize}px)`;
    timeFormatSelect.value = settings.timeFormat;
    showSecondsSelect.value = settings.showSeconds.toString();
    dateFormatSelect.value = settings.dateFormat;
    darkModeToggle.checked = settings.darkMode;
    showLocationToggle.checked = settings.showLocation;

}

// --- Core Update Functions ---

function updateClock() {
    if (!clockElement) return;
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    let seconds = now.getSeconds();
    let ampm = "";

    if (settings.timeFormat === "12") {
        ampm = hours >= 12 ? " PM" : " AM";
        hours = hours % 12;
        hours = hours ? hours : 12;
    }

    hours = String(hours).padStart(2, "0");
    minutes = String(minutes).padStart(2, "0");
    seconds = String(seconds).padStart(2, "0");

    clockElement.textContent = settings.showSeconds
        ? `${hours}:${minutes}:${seconds}${ampm}`
        : `${hours}:${minutes}${ampm}`;
}

function updateDate() {
    if (!dateElement) return;
    const now = new Date();
    let options = {};

    switch (settings.dateFormat) {
        case "full":
            options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            break;
        case "long":
             options = { year: 'numeric', month: 'long', day: 'numeric' };
             break;
        case "short":
            options = { year: 'numeric', month: 'numeric', day: 'numeric' };
            break;
        case "numeric":
             const year = now.getFullYear();
             const month = String(now.getMonth() + 1).padStart(2, '0');
             const day = String(now.getDate()).padStart(2, '0');
             dateElement.textContent = `${year}-${month}-${day}`;
             return;
        default:
            options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    }
    dateElement.textContent = now.toLocaleDateString(undefined, options);
}


function updateLocation() {
    if (!locationElement || !settings.showLocation) {
         if(locationElement) locationElement.textContent = "";
         return;
    }

    if (!navigator.geolocation) {
        locationElement.textContent = "Geolocation is not supported by your browser.";
        return;
    }

    locationElement.textContent = "Fetching location...";

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            locationElement.textContent = `Lat: ${latitude.toFixed(3)}, Lon: ${longitude.toFixed(3)}`;
        },
        (error) => {
            let errorMessage = "Could not fetch location: ";
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    errorMessage += "Permission denied.";
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMessage += "Position unavailable.";
                    break;
                case error.TIMEOUT:
                    errorMessage += "Request timed out.";
                    break;
                default:
                    errorMessage += "Unknown error.";
            }
            locationElement.textContent = errorMessage;
            console.error(errorMessage, error);
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 }
    );
}

// --- Settings Application and Persistence ---

function applySettings() {
    document.body.style.backgroundColor = settings.bgColor;
     if (settings.bgImageUrl && settings.bgImageUrl.trim() !== "") {
         document.body.style.backgroundImage = `url('${settings.bgImageUrl}')`;
     } else {
         document.body.style.backgroundImage = 'none';
     }

    [clockElement, dateElement, locationElement].forEach(el => {
        if(el) {
            el.style.color = settings.textColor;
            el.style.fontFamily = settings.fontFamily;
        }
    });
     if(clockElement) clockElement.style.fontSize = `${settings.fontSize}px`;


    document.body.classList.toggle('dark-mode', settings.darkMode);

    updateClock();
    updateDate();
    if (settings.showLocation) {
        updateLocation();
    } else {
         if(locationElement) locationElement.textContent = "";
    }
     addGoogleFontLink(settings.fontFamily);
}

function updateSetting(key, value) {
    if (settings.hasOwnProperty(key)) {
        settings[key] = value;
        applySettings();
        saveSettings();
    }
}

function saveSettings() {
    try {
        localStorage.setItem('clockDashboardSettings', JSON.stringify(settings));
    } catch (e) {
        console.error("Could not save settings to localStorage:", e);
    }
}

function loadSettings() {
    try {
        const savedSettings = localStorage.getItem('clockDashboardSettings');
        if (savedSettings) {
            settings = { ...settings, ...JSON.parse(savedSettings) };
        }
    } catch (e) {
        console.error("Could not load settings from localStorage:", e);
    }
     settings.showSeconds = (settings.showSeconds === true || settings.showSeconds === 'true');
     settings.darkMode = (settings.darkMode === true || settings.darkMode === 'true');
     settings.showLocation = (settings.showLocation === true || settings.showLocation === 'true');
     settings.fontSize = parseInt(settings.fontSize) || 70;
}

function addGoogleFontLink(fontFamily) {
     const fontName = fontFamily.split(',')[0].replace(/'/g, "").replace(/ /g, '+');
     const knownGoogleFonts = ['Pacifico', 'Roboto'];
     if (knownGoogleFonts.includes(fontName.replace(/\+/g, ' '))) {
        const linkId = `google-font-${fontName}`;
        if (!document.getElementById(linkId)) {
            const link = document.createElement('link');
            link.id = linkId;
            link.rel = 'stylesheet';
            link.href = `https://fonts.googleapis.com/css2?family=${fontName}&display=swap`;
            document.head.appendChild(link);
        }
    }
}


// --- Feature Implementations ---

// Settings Panel Toggle
function toggleSettingsPanel() {
    settingsPanel.classList.toggle('settings-panel--visible');
}

// Fullscreen
function toggleFullscreen() {
    const fullscreenIcon = fullscreenBtn?.querySelector('i');
    if (!fullscreenIcon) return;

    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen()
            .then(() => {  })
            .catch(err => {
                alert(`Could not enter fullscreen mode: ${err.message}`);
                console.error(err);
            });
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen()
                .then(() => {  })
                .catch(err => {
                    alert(`Could not exit fullscreen mode: ${err.message}`);
                    console.error(err);
                });
        }
    }
}

function handleFullscreenChange() {
    const fullscreenIcon = fullscreenBtn?.querySelector('i');
     if (!fullscreenIcon || !fullscreenBtn) return;
    if (document.fullscreenElement) {
        fullscreenIcon.classList.replace('fa-expand', 'fa-compress');
        fullscreenBtn.title = "Exit Fullscreen";
    } else {
        fullscreenIcon.classList.replace('fa-compress', 'fa-expand');
        fullscreenBtn.title = "Toggle Fullscreen";
    }
}

// Music Player
function toggleMusic() {
    if (!audioElement || !musicBtn) return;
     const musicIcon = musicBtn?.querySelector('i');

    if (settings.musicPlaying) {
        audioElement.pause();
        musicBtn.title = "Play Music";
        if(musicIcon) musicIcon.classList.replace('fa-pause', 'fa-play');
    } else {
        audioElement.play().catch(e => console.error("Audio play failed:", e));
        musicBtn.title = "Pause Music";
         if(musicIcon) musicIcon.classList.replace('fa-play', 'fa-pause');
    }
    settings.musicPlaying = !settings.musicPlaying;
}

// Search
function performSearch() {
    const searchInput = settingsPanel.querySelector("#search-input");
    if (!searchInput) return;
    const query = searchInput.value.trim();
    if (query) {
        const searchURL = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
        window.open(searchURL, '_blank');
    }
}


// --- Initialization ---

createSettingsPanel();

applySettings();

updateClock();
updateDate();

clockInterval = setInterval(updateClock, 1000);
dateInterval = setInterval(updateDate, 60000);

if(settingsBtn) settingsBtn.addEventListener("click", toggleSettingsPanel);
if(fullscreenBtn) fullscreenBtn.addEventListener('click', toggleFullscreen);
if(musicBtn) musicBtn.addEventListener('click', toggleMusic);

document.addEventListener('fullscreenchange', handleFullscreenChange);
document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
document.addEventListener('mozfullscreenchange', handleFullscreenChange);
document.addEventListener('MSFullscreenChange', handleFullscreenChange);

console.log("Enhanced Clock Dashboard Initialized.");
