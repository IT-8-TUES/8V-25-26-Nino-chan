const jwt = localStorage.getItem('jwt');
const userId = localStorage.getItem('user_id');

        if (!jwt || !userId) {
            window.location.href = '../../Marti/html/login.html';
        }

const monthNames = ['January','February','March','April','May','June',
                    'July','August','September','October','November','December'];
const shortMonths = ['Jan','Feb','Mar','Apr','May','Jun',
                        'Jul','Aug','Sep','Oct','Nov','Dec'];
const weekdays = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

const today = new Date();
let viewYear = today.getFullYear();
let viewMonth = today.getMonth();
let selectedDate = null;

const grid = document.getElementById('calendar-grid');
const monthLabel = document.getElementById('month-label');
const dayLabel = document.getElementById('selected-day-label');
const eventList = document.getElementById('event-list');
const subtitle = document.querySelector('.day-events .subtitle');

function pad(n) {
    return n < 10 ? '0' + n : '' + n;
}

function isoDate(y, m, d) {
    return `${y}-${pad(m + 1)}-${pad(d)}`;
}

function formatDateLong(y, m, d) {
    return `${d} ${shortMonths[m]} ${y}`;
}

function resetEventPanel() {
    selectedDate = null;
    dayLabel.textContent = 'Pick a date';
    subtitle.style.display = '';
    subtitle.textContent = 'Click any day above to see the events for that date.';
    eventList.innerHTML = '';
}

function renderCalendar() {
    grid.innerHTML = '';
    monthLabel.textContent = `${monthNames[viewMonth]} ${viewYear}`;

    weekdays.forEach(function (w) {
        const head = document.createElement('div');
        head.className = 'weekday';
        head.textContent = w;
        grid.appendChild(head);
    });

    const firstDow = new Date(viewYear, viewMonth, 1).getDay();
    const leading = (firstDow + 6) % 7;
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    for (let i = 0; i < leading; i++) {
        const blank = document.createElement('div');
        blank.className = 'day-cell empty';
        grid.appendChild(blank);
    }

    const todayIso = isoDate(today.getFullYear(), today.getMonth(), today.getDate());

    for (let d = 1; d <= daysInMonth; d++) {
        const cell = document.createElement('div');
        cell.className = 'day-cell';
        const iso = isoDate(viewYear, viewMonth, d);
        cell.dataset.date = iso;
        cell.textContent = d;
        if (iso === todayIso) {
            cell.classList.add('today');
        }
        if (iso === selectedDate) {
            cell.classList.add('selected');
        }
        cell.addEventListener('click', function () {
            selectDay(cell, iso, viewYear, viewMonth, d);
        });
        grid.appendChild(cell);
    }
}

async function selectDay(cell, iso, y, m, d) {
    const prev = grid.querySelector('.day-cell.selected');
    if (prev) prev.classList.remove('selected');
    cell.classList.add('selected');
    selectedDate = iso;

    dayLabel.textContent = `Events on ${formatDateLong(y, m, d)}`;
    subtitle.style.display = 'none';
    eventList.innerHTML = '<p class="empty-state">Loading…</p>';

    try {
        const response = await fetch(`http://localhost:5000/event/${iso}`, {
            headers: { 'jwt': jwt }
        });

                if (response.status === 401) {
                    localStorage.removeItem('jwt');
                    localStorage.removeItem('user_id');
                    window.location.href = '../../Marti/html/login.html';
                    return;
                }

        const events = await response.json();

        if (!Array.isArray(events) || events.length === 0) {
            eventList.innerHTML = '<p class="empty-state">No events on this date.</p>';
            return;
        }

        eventList.innerHTML = '';
        events.forEach(function (ev) {
            const card = document.createElement('div');
            card.className = 'event-card';
            card.innerHTML = `
                <div class="event-info">
                    <a href="../../Nikola/templates/long-description.html?id=${ev.id}">${ev.title}</a>
                </div>
                <span class="creator">${ev.creator}</span>
            `;
            eventList.appendChild(card);
        });
    } catch {
        eventList.innerHTML = '<p class="empty-state">Could not load events. Please try again later.</p>';
    }
}

document.getElementById('prev-month').addEventListener('click', function () {
    viewMonth--;
    if (viewMonth < 0) {
        viewMonth = 11;
        viewYear--;
    }
    resetEventPanel();
    renderCalendar();
});

document.getElementById('next-month').addEventListener('click', function () {
    viewMonth++;
    if (viewMonth > 11) {
        viewMonth = 0;
        viewYear++;
    }
    resetEventPanel();
    renderCalendar();
});

renderCalendar();