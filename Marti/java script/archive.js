document.addEventListener('DOMContentLoaded', async function () {
    const jwt = localStorage.getItem('jwt');
    const userId = localStorage.getItem('user_id');

    if (!jwt || !userId) {
        window.location.href = './login.html';
        return;
    }

    const list = document.getElementById('event-list');

    try {
        const response = await fetch(`http://localhost:5000/user/${userId}?mode=archive`, {
            headers: { 'jwt': jwt }
        });

        if (response.status === 401) {
            localStorage.removeItem('jwt');
            localStorage.removeItem('user_id');
            window.location.href = './login.html';
            return;
        }

        const events = await response.json();

        if (!events || events.length === 0) {
            list.innerHTML = '<p class="empty-state">You have no upcoming bookmarked events.</p>';
            return;
        }

        const details = await Promise.all(
            events.map(ev =>
                fetch(`http://localhost:5000/event/${ev.id}`, { headers: { 'jwt': jwt } })
                    .then(r => r.ok ? r.json() : null)
                    .catch(() => null)
            )
        );

        function formatDate(iso) {
            const [y, m, d] = iso.split('-');
            const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
            return `${parseInt(d)} ${months[parseInt(m) - 1]} ${y}`;
        }

        events.forEach(function (event, i) {
            const date = details[i]?.date ? formatDate(details[i].date) : '';
            const card = document.createElement('div');
            card.className = 'event-card';
            card.innerHTML = `
                <div class="event-info">
                    ${date ? `<span class="event-date">${date}</span>` : ''}
                    <a href="../../Nikola/templates/long-description.html?id=${event.id}">${event.title}</a>
                </div>
                <span class="creator">${event.creator}</span>
            `;
            list.appendChild(card);
        });
    } catch {
        list.innerHTML = '<p class="empty-state">Could not load your bookmarks. Please try again later.</p>';
    }
});
