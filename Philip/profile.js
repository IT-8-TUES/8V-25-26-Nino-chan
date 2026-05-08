const params = new URLSearchParams(window.location.search);
const profileUserId = params.get("id") || getCurrentUserId();
const isOwnProfile = profileUserId === getCurrentUserId();
const container = document.getElementById("profile-container");

async function loadProfile() {
  if (!profileUserId) {
    container.innerHTML = "<p class='error'>Not logged in.</p>";
    return;
  }

  const data = await apiFetch(`/user/${profileUserId}?mode=profile`);

  if (data.code === 404) {
    container.innerHTML = "<p class='error'>User not found.</p>";
    return;
  }

  renderView(data);
}

function renderView(data) {
  container.innerHTML = "";

  const card = document.createElement("div");
  card.className = "profile-card";

  const heading = document.createElement("h2");
  heading.className = "profile-username";
  heading.textContent = data.username;

  const email = document.createElement("p");
  email.className = "profile-field";
  email.innerHTML = `<span class="field-label">Email</span><span class="field-value">${data.email}</span>`;

  const bio = document.createElement("p");
  bio.className = "profile-field";
  bio.innerHTML = `<span class="field-label">Bio</span><span class="field-value">${data.bio || "—"}</span>`;

  card.appendChild(heading);
  card.appendChild(email);
  card.appendChild(bio);

  if (isOwnProfile) {
    const editBtn = document.createElement("button");
    editBtn.className = "btn-edit";
    editBtn.textContent = "Edit Profile";
    editBtn.addEventListener("click", () => renderEdit(data));
    card.appendChild(editBtn);
  }

  container.appendChild(card);

  if (isOwnProfile) {
    container.appendChild(renderPostEventCard());
  }
}

function renderPostEventCard() {
  const card = document.createElement("div");
  card.className = "profile-card";

  const heading = document.createElement("h2");
  heading.textContent = "Post an Event";

  const titleLabel = document.createElement("label");
  titleLabel.textContent = "Title";
  const titleInput = document.createElement("input");
  titleInput.type = "text";
  titleInput.placeholder = "Event title";
  titleInput.className = "profile-input";

  const dateLabel = document.createElement("label");
  dateLabel.textContent = "Date";
  const dateInput = document.createElement("input");
  dateInput.type = "date";
  dateInput.className = "profile-input";

  const descLabel = document.createElement("label");
  descLabel.textContent = "Description";
  const descInput = document.createElement("textarea");
  descInput.placeholder = "Describe the event...";
  descInput.className = "profile-input";
  descInput.rows = 5;

  const feedback = document.createElement("p");
  feedback.className = "hidden";

  const submitBtn = document.createElement("button");
  submitBtn.className = "btn-save";
  submitBtn.textContent = "Post Event";

  submitBtn.addEventListener("click", async () => {
    const title = titleInput.value.trim();
    const date = dateInput.value;
    const description = descInput.value.trim();

    if (!title || !date || !description) {
      feedback.className = "error";
      feedback.textContent = "Please fill in all fields.";
      return;
    }

    const res = await apiFetch("/event", {
      method: "POST",
      body: JSON.stringify({ title, date, description }),
    });

    if (res.code === 200) {
      feedback.className = "success";
      feedback.textContent = "Event posted successfully!";
      titleInput.value = "";
      dateInput.value = "";
      descInput.value = "";
    } else if (res.code === 403) {
      feedback.className = "error";
      feedback.textContent = "Your account is not verified. Contact an admin to get publishing rights.";
    } else {
      feedback.className = "error";
      feedback.textContent = "Something went wrong. Please try again.";
    }
  });

  card.appendChild(heading);
  card.appendChild(titleLabel);
  card.appendChild(titleInput);
  card.appendChild(dateLabel);
  card.appendChild(dateInput);
  card.appendChild(descLabel);
  card.appendChild(descInput);
  card.appendChild(feedback);
  card.appendChild(submitBtn);

  return card;
}

function renderEdit(data) {
  container.innerHTML = "";

  const card = document.createElement("div");
  card.className = "profile-card";

  const heading = document.createElement("h2");
  heading.textContent = "Edit Profile";

  const usernameLabel = document.createElement("label");
  usernameLabel.textContent = "Username";
  const usernameInput = document.createElement("input");
  usernameInput.type = "text";
  usernameInput.value = data.username;
  usernameInput.className = "profile-input";

  const emailLabel = document.createElement("label");
  emailLabel.textContent = "Email";
  const emailInput = document.createElement("input");
  emailInput.type = "email";
  emailInput.value = data.email;
  emailInput.className = "profile-input";

  const bioLabel = document.createElement("label");
  bioLabel.textContent = "Bio";
  const bioInput = document.createElement("textarea");
  bioInput.value = data.bio || "";
  bioInput.className = "profile-input";
  bioInput.rows = 4;

  const errorMsg = document.createElement("p");
  errorMsg.className = "error hidden";

  const actions = document.createElement("div");
  actions.className = "edit-actions";

  const saveBtn = document.createElement("button");
  saveBtn.className = "btn-save";
  saveBtn.textContent = "Save";

  const cancelBtn = document.createElement("button");
  cancelBtn.className = "btn-cancel";
  cancelBtn.textContent = "Cancel";

  saveBtn.addEventListener("click", async () => {
    const updated = {
      username: usernameInput.value.trim(),
      email: emailInput.value.trim(),
      bio: bioInput.value.trim(),
    };
    const res = await apiFetch("/user", {
      method: "PATCH",
      body: JSON.stringify(updated),
    });
    if (res.code === 200) {
      renderView(updated);
    } else {
      errorMsg.textContent = "Failed to save. Please try again.";
      errorMsg.classList.remove("hidden");
    }
  });

  cancelBtn.addEventListener("click", () => loadProfile());

  actions.appendChild(saveBtn);
  actions.appendChild(cancelBtn);

  card.appendChild(heading);
  card.appendChild(usernameLabel);
  card.appendChild(usernameInput);
  card.appendChild(emailLabel);
  card.appendChild(emailInput);
  card.appendChild(bioLabel);
  card.appendChild(bioInput);
  card.appendChild(errorMsg);
  card.appendChild(actions);

  container.appendChild(card);
}

loadProfile();
