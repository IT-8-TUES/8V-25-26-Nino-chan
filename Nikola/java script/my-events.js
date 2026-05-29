document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('eventForm');
    const titleInput = document.getElementById('eventTitle');
    const dateInput = document.getElementById('eventDate');
    const descriptionInput = document.getElementById('eventDescription');
    const submitBtn = document.getElementById('submitBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const listEl = document.getElementById('eventList');
    const emptyState = document.getElementById('emptyState');
    const message = document.getElementById('message');

    let events = [];
    let editingId = null;
    let messageTimer = null;

    async function fetchEvents() {
        const res = await apiFetch('/event/mine');
        events = Array.isArray(res) ? res : [];
        render();
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
                startEdit(event.eventid);
            });

            const deleteBtn = document.createElement('button');
            deleteBtn.type = 'button';
            deleteBtn.className = 'btn-delete';
            deleteBtn.textContent = 'Delete';
            deleteBtn.addEventListener('click', function () {
                deleteEvent(event.eventid);
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
        const target = events.find(function (e) { return e.eventid === id; });
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

    async function deleteEvent(id) {
        const target = events.find(function (e) { return e.eventid === id; });
        if (!target) return;
        if (!window.confirm('Delete "' + target.title + '"?')) return;

        const res = await apiFetch('/event/' + id, { method: 'DELETE' });
        if (!res) return;

        if (res.code === 200) {
            if (editingId === id) cancelEdit();
            await fetchEvents();
            showMessage('Event deleted.', 'success');
        } else if (res.code === 403) {
            showMessage('You can only delete your own events.', 'error');
        } else if (res.code === 404) {
            showMessage('Event no longer exists.', 'error');
            await fetchEvents();
        } else {
            showMessage("Couldn't delete event.", 'error');
        }
    }

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        const title = titleInput.value.trim();
        const date = dateInput.value;
        const description = descriptionInput.value.trim();

        if (!title || !date || !description) {
            showMessage('Please fill in all fields.', 'error');
            return;
        }

        const body = JSON.stringify({ title: title, description: description, date: date });
        const res = editingId
            ? await apiFetch('/event/' + editingId, { method: 'PUT', body: body })
            : await apiFetch('/event', { method: 'POST', body: body });

        if (!res) return;

        if (res.code === 200) {
            if (editingId) {
                cancelEdit();
                await fetchEvents();
                showMessage('Event updated.', 'success');
            } else {
                form.reset();
                await fetchEvents();
                showMessage('Event added.', 'success');
            }
        } else if (res.code === 403) {
            showMessage('Your account is not verified. Contact an admin to get publishing rights.', 'error');
        } else if (res.code === 404) {
            showMessage('Event no longer exists.', 'error');
            cancelEdit();
            await fetchEvents();
        } else {
            showMessage('Something went wrong. Please try again.', 'error');
        }
    });

    cancelBtn.addEventListener('click', cancelEdit);

    fetchEvents();
});
