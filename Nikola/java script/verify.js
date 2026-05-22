document.addEventListener('DOMContentLoaded', function () {
    const jwt = localStorage.getItem('jwt');
    const userId = localStorage.getItem('user_id');
    if (!jwt || !userId) {
        window.location.href = '../../Marti/html/login.html';
        return;
    }

    document.getElementById('verifyForm').addEventListener('submit', async function (e) {
        e.preventDefault();

        const password = document.getElementById('password').value;
        const message = document.getElementById('message');
        message.textContent = '';
        message.className = '';

        const response = await fetch('http://localhost:5000/user/verify', {
            method: 'POST',
            headers: {
                'jwt': jwt,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ password: password })
        });

        if (response.status === 401) {
            message.textContent = 'Incorrect password.';
            message.className = 'msg-error';
            return;
        }

        if (response.ok) {
            message.textContent = 'Request sent! The admins will review and approve your account.';
            message.className = 'msg-success';
            document.getElementById('password').disabled = true;
            document.querySelector('input[type="submit"]').disabled = true;
            return;
        }

        message.textContent = 'Something went wrong. Please try again.';
        message.className = 'msg-error';
    });
});
