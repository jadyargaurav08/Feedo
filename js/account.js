document.addEventListener('DOMContentLoaded', () => {
    const accountForm = document.getElementById('accountForm');
    const nameInput = document.getElementById('accountName');
    const emailInput = document.getElementById('accountEmail');
    const passwordInput = document.getElementById('accountPassword');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const nameError = document.getElementById('nameError');
    const emailError = document.getElementById('emailError');
    const passwordError = document.getElementById('passwordError');
    const confirmPasswordError = document.getElementById('confirmPasswordError');
    const accountMessage = document.getElementById('accountMessage');

    const isValidEmail = (email) => /.+@.+\..+/.test(email);

    const clearErrors = () => {
        nameError.classList.remove('show');
        emailError.classList.remove('show');
        passwordError.classList.remove('show');
        confirmPasswordError.classList.remove('show');
        accountMessage.textContent = '';
    };

    accountForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        clearErrors();

        const name = nameInput.value.trim();
        const email = emailInput.value.trim().toLowerCase();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        let isValid = true;

        if (!name) {
            nameError.classList.add('show');
            isValid = false;
        }

        if (!isValidEmail(email)) {
            emailError.textContent = 'Enter a valid email.';
            emailError.classList.add('show');
            isValid = false;
        }

        if (password.length < 6) {
            passwordError.classList.add('show');
            isValid = false;
        }

        if (password !== confirmPassword) {
            confirmPasswordError.classList.add('show');
            isValid = false;
        }

        if (!isValid) {
            return;
        }

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.field === 'email') {
                    emailError.textContent = data.message || 'Unable to use this email.';
                    emailError.classList.add('show');
                    return;
                }

                accountMessage.textContent = data.message || 'Unable to create account.';
                return;
            }

            accountMessage.textContent = 'Account created. Redirecting to login...';

            window.setTimeout(() => {
                window.location.href = `index.html?created=${encodeURIComponent(email)}`;
            }, 800);
        } catch (error) {
            accountMessage.textContent = 'Server unavailable. Please try again.';
        }
    });
});