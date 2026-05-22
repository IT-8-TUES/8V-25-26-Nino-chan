const registerForm = document.getElementById('registerForm');
const messageEl = document.getElementById('message');

registerForm.addEventListener('submit', async (event) => {
	event.preventDefault();
	messageEl.textContent = '';

	const payload = {
		email: registerForm.email.value.trim(),
		username: registerForm.username.value.trim(),
		password: registerForm.password.value,
	};

	try {
		const response = await fetch('http://localhost:5000/user/register', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload),
		});

		const result = await response.json();

		if (response.ok && result.code === 200) {
			window.location.href = '../../Marti/html/login.html';
			return;
		}

		if (result.code === 409) {
			messageEl.textContent = 'A user with that email already exists.';
		} else {
			messageEl.textContent = 'Registration failed. Please try again.';
		}
	} catch (error) {
		messageEl.textContent = 'Unable to complete registration. Check your connection.';
	}
});
