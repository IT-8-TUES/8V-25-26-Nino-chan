document.addEventListener('DOMContentLoaded', async function () {
    const jwt = localStorage.getItem('jwt');
    const userId = localStorage.getItem('user_id');
    if (!jwt || !userId) {
        window.location.href = '../../Marti/html/login.html';
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const eventId = params.get('id');
    if (!eventId) {
        document.getElementById('loading').textContent = 'No event specified.';
        return;
    }

    let bookmarked = false;

    const response = await fetch('http://localhost:5000/event/' + eventId, {
        headers: { 'jwt': jwt }
    });

    if (response.status === 401) {
        localStorage.removeItem('jwt');
        localStorage.removeItem('user_id');
        window.location.href = '../../Marti/html/login.html';
        return;
    }

    if (!response.ok) {
        document.getElementById('loading').textContent = 'Event not found.';
        return;
    }

    const event = await response.json();

    document.getElementById('loading').style.display = 'none';
    document.getElementById('event-content').style.display = 'block';

    document.getElementById('event-title').textContent = event.title;
    document.getElementById('event-date').textContent = '📅 ' + event.date;
    document.getElementById('event-description').textContent = event.description;

    const creatorEl = document.getElementById('event-creator');
    const creatorLink = document.createElement('a');
    creatorLink.href = '../../Philip/profile.html?id=' + event.creatorid;
    creatorLink.textContent = event.creator;
    creatorEl.textContent = 'by ';
    creatorEl.appendChild(creatorLink);

    const btn = document.getElementById('btn-bookmark');
    btn.addEventListener('click', async function () {
        bookmarked = !bookmarked;
        const res = await fetch('http://localhost:5000/user/' + userId, {
            method: 'POST',
            headers: {
                'jwt': jwt,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ eventid: eventId, participating: bookmarked })
        });

        if (res.status === 401) {
            localStorage.removeItem('jwt');
            localStorage.removeItem('user_id');
            window.location.href = '../../Marti/html/login.html';
            return;
        }

        if (res.ok) {
            btn.textContent = bookmarked ? 'Bookmarked ✓' : 'Bookmark';
            btn.classList.toggle('bookmarked', bookmarked);
        } else {
            bookmarked = !bookmarked;
        }
    });
});
