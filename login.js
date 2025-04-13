document.addEventListener('DOMContentLoaded', () => {
    console.log("Login page JavaScript loaded.");

    const loginForm = document.getElementById('login-form');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const messageDiv = document.getElementById('auth-message');

    // Function to display messages
    function showMessage(message, type) {
        messageDiv.textContent = message;
        messageDiv.className = ''; // Clear previous classes
        messageDiv.classList.add(type); // 'success' or 'error'
        messageDiv.style.display = 'block';
    }

    if (loginForm) {
        loginForm.addEventListener('submit', (event) => {
            event.preventDefault(); // Prevent actual form submission
            messageDiv.style.display = 'none'; // Hide previous messages

            const username = usernameInput.value.trim();
            const password = passwordInput.value; // Get password as entered

            if (!username || !password) {
                showMessage("Please enter both username and password.", "error");
                return;
            }

            console.log(`Attempting login for user: ${username}`);

            // --- Authentication Logic (using localStorage) ---
            try {
                const storedUsers = localStorage.getItem('clockUsers');
                const users = storedUsers ? JSON.parse(storedUsers) : [];

                // Find user with matching username and password
                // WARNING: Comparing plain text passwords - INSECURE!
                const foundUser = users.find(user => user.username === username && user.password === password);

                if (foundUser) {
                    console.log("Login successful for:", username);
                    showMessage(`Login Successful! Welcome, ${username}!`, "success");
                    // Optional: Store login status
                    sessionStorage.setItem('loggedInUser', username); // Use sessionStorage for session-only login
                    // Optional: Redirect after a short delay
                    // setTimeout(() => { window.location.href = 'index.html'; }, 1500);
                } else {
                    console.log("Login failed: Invalid credentials for", username);
                    showMessage("Invalid username or password.", "error");
                }

            } catch (e) {
                console.error("Error accessing localStorage or parsing user data:", e);
                showMessage("An error occurred during login. Please try again.", "error");
            }
            // --- End Authentication Logic ---
        });
    } else {
        console.error("Login form not found!");
    }
});