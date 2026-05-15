document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const message = document.getElementById('message');
    message.textContent = '';

    try {
        const response = await fetch('http://localhost:5000/user/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();

        if (response.ok && data.jwt) {
            localStorage.setItem('jwt', data.jwt);
            const payload = JSON.parse(atob(data.jwt.split('.')[1]));
            localStorage.setItem('user_id', payload.user_id);
            window.location.href = '../../Kristian/templates/home.html';
        } else {
            message.textContent = data.message || 'Invalid email or password.';
        }
    } catch {
        message.textContent = 'Could not connect to the server.';
    }
});
