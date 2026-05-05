document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const togglePasswordBtn = document.getElementById('togglePassword');
    const emailError = document.getElementById('emailError');
    const passwordError = document.getElementById('passwordError');
    const loginMessage = document.getElementById('loginMessage');

    togglePasswordBtn.addEventListener('click', () => {
        const isVisible = passwordInput.type === 'password';
        passwordInput.type = isVisible ? 'text' : 'password';
        togglePasswordBtn.classList.toggle('is-visible', isVisible);
        togglePasswordBtn.setAttribute('aria-label', isVisible ? 'Hide password' : 'Show password');
        togglePasswordBtn.setAttribute('title', isVisible ? 'Hide password' : 'Show password');
    });

    const isValidEmail = (email) => /.+@.+\..+/.test(email);

    const query = new URLSearchParams(window.location.search);
    const createdEmail = query.get('created');

    if (createdEmail) {
        emailInput.value = createdEmail;
        loginMessage.textContent = 'Account created. Sign in with your new credentials.';
    }

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        emailError.classList.remove('show');
        passwordError.classList.remove('show');
        loginMessage.textContent = '';

        const email = emailInput.value.trim().toLowerCase();
        const password = passwordInput.value;
        let valid = true;

        if (!isValidEmail(email)) {
            emailError.classList.add('show');
            valid = false;
        }

        if (password.length < 6) {
            passwordError.classList.add('show');
            valid = false;
        }

        if (!valid) {
            return;
        }

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                loginMessage.textContent = data.message || 'Invalid email or password.';
                return;
            }

            if (data.name) {
                sessionStorage.setItem('feedoUserName', data.name);
            }

            window.location.href = 'feedback.html';
        } catch (error) {
            loginMessage.textContent = 'Server unavailable. Please try again.';
        }
    });
});