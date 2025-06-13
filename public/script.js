const launchDate = new Date('Sep 20, 2025 00:00:00').getTime();
const daysEl = document.getElementById('days');
const hoursEl = document.getElementById('hours');
const minutesEl = document.getElementById('minutes');
const secondsEl = document.getElementById('seconds');

const countdownInterval = setInterval(() => {
    const now = new Date().getTime();
    const distance = launchDate - now;
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
    daysEl.innerHTML = days < 10 ? '0' + days : days;
    hoursEl.innerHTML = hours < 10 ? '0' + hours : hours;
    minutesEl.innerHTML = minutes < 10 ? '0' + minutes : minutes;
    secondsEl.innerHTML = seconds < 10 ? '0' + seconds : seconds;
    if (distance < 0) {
        clearInterval(countdownInterval);
        document.getElementById('countdown').innerHTML = '<div class="text-4xl font-bold">WE ARE LIVE!</div>';
    }
}, 1000);

// --- Notification Form Logic (Updated) ---
const notifyForm = document.getElementById('notify-form');
const formContainer = document.getElementById('form-container');
const messageArea = document.getElementById('message-area');
const submitButton = document.getElementById('submit-button');

notifyForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Prevent default form submission

    const emailInput = document.getElementById('email-input');
    const email = emailInput.value;

    if (!email || !emailInput.checkValidity()) {
        // Show an error message if email is invalid
        showMessage('Please enter a valid email address.', 'error');
        return;
    }

    // Disable button to prevent multiple submissions
    submitButton.disabled = true;
    submitButton.textContent = 'Sending...';

    try {
        const response = await fetch('/notify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: email }),
        });

        if (response.ok) {
            // On success, hide the form and show a success message
            formContainer.style.display = 'none';
            showMessage('Thank you! We\'ll notify you at launch.', 'success');
        } else {
            // On failure, show an error message
            showMessage('Something went wrong. Please try again.', 'error');
            submitButton.disabled = false;
            submitButton.textContent = 'Notify Me';
        }
    } catch (error) {
        console.error('Fetch error:', error);
        showMessage('An error occurred. Please check your connection and try again.', 'error');
        submitButton.disabled = false;
        submitButton.textContent = 'Notify Me';
    }
});

function showMessage(text, type) {
    messageArea.textContent = text;
    messageArea.className = 'max-w-md mx-auto mt-4 p-4 rounded-md'; // Reset classes
    if (type === 'success') {
        messageArea.classList.add('bg-green-500/20', 'text-green-300', 'border', 'border-green-500/30');
    } else {
        messageArea.classList.add('bg-red-500/20', 'text-red-300', 'border', 'border-red-500/30');
    }
    messageArea.classList.remove('hidden');
}

// This script should be placed inside your HTML file or linked as a separate JS file.
// It will send a request to your backend to notify about traffic whenever the page loads.
window.onload = function() {
    fetch('/track-traffic')
        .then(response => response.json())
        .then(data => console.log('Traffic notification response:', data))
        .catch(error => console.error('Error tracking traffic:', error));
};
