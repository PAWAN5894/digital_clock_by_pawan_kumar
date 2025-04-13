

document.addEventListener('DOMContentLoaded', () => {
    console.log("Create Account page JavaScript loaded.");

    const createAccountForm = document.getElementById('create-account-form');
    const usernameInput = document.getElementById('new-username');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('new-password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const messageDiv = document.getElementById('auth-message');

    // Function to display messages
    function showMessage(message, type) {
        messageDiv.textContent = message;
        messageDiv.className = ''; // Clear previous classes
        messageDiv.classList.add(type); // 'success' or 'error'
        messageDiv.style.display = 'block';
    }

    if (createAccountForm) {
        createAccountForm.addEventListener('submit', (event) => {
            event.preventDefault(); // Prevent default form submission
            messageDiv.style.display = 'none'; // Hide previous messages

            const username = usernameInput.value.trim();
            const email = emailInput.value.trim();
            const password = passwordInput.value;
            const confirmPassword = confirmPasswordInput.value;

            // --- Basic Validation ---
            if (!username || !email || !password || !confirmPassword) {
                showMessage("Please fill in all fields.", "error");
                return;
            }
            if (password !== confirmPassword) {
                showMessage("Passwords do not match.", "error");
                return;
            }
            // Add more validation if needed (e.g., password complexity, email format)

            console.log(`Attempting to create account for: ${username}`);

            // --- Save User to localStorage ---
            // WARNING: Storing plain text passwords - INSECURE!
            try {
                const storedUsers = localStorage.getItem('clockUsers');
                const users = storedUsers ? JSON.parse(storedUsers) : [];

                // Check if username already exists
                const existingUser = users.find(user => user.username === username);
                if (existingUser) {
                    showMessage("Username already taken. Please choose another.", "error");
                    return;
                }

                // Add new user
                const newUser = {
                    username: username,
                    email: email,
                    password: password // Storing plain password - BAD PRACTICE!
                };
                users.push(newUser);

                // Save updated user list back to localStorage
                localStorage.setItem('clockUsers', JSON.stringify(users));

                console.log("Account created successfully for:", username);
                showMessage("Account created successfully! You can now log in.", "success");

                // Optional: Clear form
                createAccountForm.reset();
                // Optional: Redirect to login page after delay
                // setTimeout(() => { window.location.href = 'login.html'; }, 2000);

            } catch (e) {
                console.error("Error accessing localStorage or saving user data:", e);
                showMessage("An error occurred creating the account. Please try again.", "error");
            }
            // --- End Save User Logic ---
        });
    } else {
        console.error("Create account form not found!");
    }
});
