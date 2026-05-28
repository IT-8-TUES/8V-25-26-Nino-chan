document.addEventListener('DOMContentLoaded', function () {
    const jwt = localStorage.getItem('jwt');
    const userId = localStorage.getItem('user_id');

    if (!jwt || !userId) {
        window.location.href = './login.html';
        return;
    }

    const vibeInput = document.getElementById('vibe-input');
    const usePref = document.getElementById('use-pref');
    const findBtn = document.getElementById('find-btn');
    const container = document.getElementById('results-container');

    usePref.addEventListener('change', async function () {
        if (this.checked) {
            vibeInput.disabled = true;
            try {
                const res = await fetch('http://localhost:5000/user/' + userId, {
                    headers: { 'jwt': jwt }
                });
                if (res.ok) {
                    const data = await res.json();
                    vibeInput.value = data.pref || '';
                    search();
                } else {
                    this.checked = false;
                    vibeInput.disabled = false;
                }
            } catch {
                this.checked = false;
                vibeInput.disabled = false;
            }
        } else {
            vibeInput.value = '';
            vibeInput.disabled = false;
        }
    });

    findBtn.addEventListener('click', search);

    vibeInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            search();
        }
    });

    function formatDate(iso) {
        const parts = iso.split('-');
        const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        return parseInt(parts[2]) + ' ' + months[parseInt(parts[1]) - 1] + ' ' + parts[0];
    }

    async function search() {
        const prompt = vibeInput.value.trim();
        if (!prompt) return;

        findBtn.disabled = true;
        container.innerHTML = '';

        try {
            const url = 'http://localhost:5000/vibeSearch?prompt=' + encodeURIComponent(prompt);
            const res = await fetch(url, { headers: { 'jwt': jwt } });

            if (res.status === 401) {
                localStorage.removeItem('jwt');
                localStorage.removeItem('user_id');
                window.location.href = './login.html';
                return;
            }

            const events = await res.json();

            if (!events || events.length === 0) {
                container.innerHTML = '<p class="empty-state">No events match that description. Try something else.</p>';
                findBtn.disabled = false;
                return;
            }

            events.forEach(function (event) {
                const date = event.date ? formatDate(event.date) : '';
                const card = document.createElement('div');
                card.className = 'event-card';
                card.innerHTML =
                    '<div class="event-info">' +
                        (date ? '<span class="event-date">' + date + '</span>' : '') +
                        '<a href="../../Nikola/templates/long-description.html?id=' + event.id + '">' + event.title + '</a>' +
                    '</div>' +
                    '<span class="creator">' + event.creator + '</span>';
                container.appendChild(card);
            });
        } catch {
            container.innerHTML = '<p class="empty-state">Could not load recommendations. Please try again later.</p>';
        }

        findBtn.disabled = false;
    }
});
