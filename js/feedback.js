document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('feedbackForm');
    const nameDisplay = document.getElementById('name');

    const savedName = sessionStorage.getItem('feedoUserName');
    if (savedName) {
        nameDisplay.textContent = savedName;
    }
    const feedbackInput = document.getElementById('feedback');
    const nameError = document.getElementById('nameError');
    const feedbackError = document.getElementById('feedbackError');
    const ratingError = document.getElementById('ratingError');
    const successMessage = document.getElementById('successMessage');
    const thankYouModal = document.getElementById('thankYouModal');
    const thankYouClose = document.getElementById('thankYouClose');

    function openThankYouModal() {
        if (!thankYouModal) return;
        thankYouModal.hidden = false;
        // Force reflow so the transition runs
        void thankYouModal.offsetWidth;
        thankYouModal.classList.add('show');
    }

    function closeThankYouModal() {
        if (!thankYouModal) return;
        thankYouModal.classList.remove('show');
        setTimeout(function () {
            thankYouModal.hidden = true;
        }, 250);
    }

    if (thankYouClose) {
        thankYouClose.addEventListener('click', closeThankYouModal);
    }

    if (thankYouModal) {
        thankYouModal.addEventListener('click', function (event) {
            if (event.target === thankYouModal) {
                closeThankYouModal();
            }
        });
    }

    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && thankYouModal && !thankYouModal.hidden) {
            closeThankYouModal();
        }
    });

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        nameError.classList.remove('show');
        feedbackError.classList.remove('show');
        ratingError.classList.remove('show');
        successMessage.textContent = '';

        const name = nameDisplay.textContent.trim();
        const feedback = feedbackInput.value.trim();
        const selectedRating = document.querySelector('input[name="rating"]:checked');

        let isValid = true;

        if (!name) {
            nameError.classList.add('show');
            isValid = false;
        }

        if (!feedback) {
            feedbackError.classList.add('show');
            isValid = false;
        }

        if (!selectedRating) {
            ratingError.classList.add('show');
            isValid = false;
        }

        if (!isValid) {
            return;
        }

        try {
            const response = await fetch('/api/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    feedback: feedback,
                    rating: Number(selectedRating.value)
                })
            });

            const data = await response.json();

            if (!response.ok) {
                successMessage.style.color = '#c2410c';
                successMessage.textContent = data.message || 'Unable to save feedback.';
                return;
            }

            successMessage.style.color = '';
            successMessage.textContent = '';
            form.reset();
            openThankYouModal();
        } catch (error) {
            successMessage.style.color = '#c2410c';
            successMessage.textContent = 'Server unavailable. Please try again.';
        }
    });
});