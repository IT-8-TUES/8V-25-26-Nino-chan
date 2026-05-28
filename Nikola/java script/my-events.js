document.addEventListener('DOMContentLoaded', function () {
    const STORAGE_KEY = 'my_events';

    const form = document.getElementById('eventForm');
    const titleInput = document.getElementById('eventTitle');
    const dateInput = document.getElementById('eventDate');
    const descriptionInput = document.getElementById('eventDescription');
    const submitBtn = document.getElementById('submitBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const listEl = document.getElementById('eventList');
    const emptyState = document.getElementById('emptyState');
    const message = document.getElementById('message');

    let events = loadEvents();
    let editingId = null;
    let messageTimer = null;

    function loadEvents() {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        try {
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            return [];
        }
    }

    function saveEvents() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    }

    function newId() {
        if (window.crypto && typeof window.crypto.randomUUID === 'function') {
            return window.crypto.randomUUID();
        }
        return Date.now().toString() + Math.random().toString(16).slice(2);
    }

    function showMessage(text, kind) {
        message.textContent = text;
        message.className = kind === 'error' ? 'msg-error' : 'msg-success';
        if (messageTimer) clearTimeout(messageTimer);
        messageTimer = setTimeout(function () {
            message.textContent = '';
            message.className = '';
        }, 1800);
    }

    function render() {
        listEl.textContent = '';

        if (events.length === 0) {
            emptyState.hidden = false;
            return;
        }
        emptyState.hidden = true;

        events.forEach(function (event) {
            const card = document.createElement('div');
            card.className = 'event-card';

            const title = document.createElement('h3');
            title.className = 'event-card-title';
            title.textContent = event.title;

            const date = document.createElement('span');
            date.className = 'event-card-date';
            date.textContent = '📅 ' + event.date;

            const desc = document.createElement('p');
            desc.className = 'event-card-description';
            desc.textContent = event.description;

            const actions = document.createElement('div');
            actions.className = 'actions';

            const editBtn = document.createElement('button');
            editBtn.type = 'button';
            editBtn.className = 'btn-edit';
            editBtn.textContent = 'Edit';
            editBtn.addEventListener('click', function () {
                startEdit(event.id);
            });

            const deleteBtn = document.createElement('button');
            deleteBtn.type = 'button';
            deleteBtn.className = 'btn-delete';
            deleteBtn.textContent = 'Delete';
            deleteBtn.addEventListener('click', function () {
                deleteEvent(event.id);
            });

            actions.appendChild(editBtn);
            actions.appendChild(deleteBtn);

            card.appendChild(title);
            card.appendChild(date);
            card.appendChild(desc);
            card.appendChild(actions);

            listEl.appendChild(card);
        });
    }

    function startEdit(id) {
        const target = events.find(function (e) { return e.id === id; });
        if (!target) return;

        editingId = id;
        titleInput.value = target.title;
        dateInput.value = target.date;
        descriptionInput.value = target.description;

        submitBtn.textContent = 'Save Changes';
        cancelBtn.hidden = false;
        titleInput.focus();
    }

    function cancelEdit() {
        editingId = null;
        form.reset();
        submitBtn.textContent = 'Add Event';
        cancelBtn.hidden = true;
    }

    function deleteEvent(id) {
        const target = events.find(function (e) { return e.id === id; });
        if (!target) return;
        if (!window.confirm('Delete "' + target.title + '"?')) return;

        events = events.filter(function (e) { return e.id !== id; });
        saveEvents();

        if (editingId === id) cancelEdit();

        render();
        showMessage('Event deleted.', 'success');
    }

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const title = titleInput.value.trim();
        const date = dateInput.value;
        const description = descriptionInput.value.trim();

        if (!title || !date || !description) {
            showMessage('Please fill in all fields.', 'error');
            return;
        }

        if (editingId) {
            events = events.map(function (ev) {
                if (ev.id !== editingId) return ev;
                return { id: ev.id, title: title, date: date, description: description };
            });
            saveEvents();
            cancelEdit();
            render();
            showMessage('Event updated.', 'success');
        } else {
            events.push({ id: newId(), title: title, date: date, description: description });
            saveEvents();
            form.reset();
            render();
            showMessage('Event added.', 'success');
        }
    });

    cancelBtn.addEventListener('click', cancelEdit);

    render();
});
