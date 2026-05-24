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

function makePicturePlaceholder(initial, extraClass) {
  const el = document.createElement("div");
  el.className = "profile-picture placeholder" + (extraClass ? " " + extraClass : "");
  el.textContent = (initial || "?").toUpperCase();
  return el;
}

function makePictureImg(src, extraClass) {
  const img = document.createElement("img");
  img.className = "profile-picture" + (extraClass ? " " + extraClass : "");
  img.alt = "Profile picture";
  img.src = src;
  return img;
}

async function fillPictureWrap(wrap, userId, fallbackInitial, extraClass) {
  wrap.innerHTML = "";
  const blob = await apiFetchBlob(`${PICS_BASE_URL}/pic/${userId}`);
  if (blob) {
    wrap.appendChild(makePictureImg(URL.createObjectURL(blob), extraClass));
  } else {
    wrap.appendChild(makePicturePlaceholder(fallbackInitial, extraClass));
  }
}

function renderView(data) {
  container.innerHTML = "";

  const card = document.createElement("div");
  card.className = "profile-card";

  const pic = document.createElement("div");
  pic.className = "profile-picture-wrap";
  card.appendChild(pic);
  fillPictureWrap(pic, profileUserId, (data.username || "?")[0]);

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
    const pref = document.createElement("p");
    pref.className = "profile-field";
    pref.innerHTML = `<span class="field-label">Preference</span><span class="field-value">${data.pref || "—"}</span>`;
    card.appendChild(pref);

    const editBtn = document.createElement("button");
    editBtn.className = "btn-edit";
    editBtn.textContent = "Edit Profile";
    editBtn.addEventListener("click", () => renderEdit(data));
    card.appendChild(editBtn);

    const verifyBtn = document.createElement("button");
    verifyBtn.className = "btn-edit";
    verifyBtn.textContent = "Request Verification";
    verifyBtn.addEventListener("click", () => {
      window.location.href = "../Nikola/templates/verify.html";
    });
    card.appendChild(verifyBtn);
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

  const picLabel = document.createElement("label");
  picLabel.textContent = "Profile picture";
  const picWrap = document.createElement("div");
  picWrap.className = "profile-picture-wrap";
  fillPictureWrap(picWrap, profileUserId, (data.username || "?")[0], "pic-upload-preview");
  const picInput = document.createElement("input");
  picInput.type = "file";
  picInput.accept = "image/jpeg,image/png,image/gif";
  picInput.className = "profile-input";
  picInput.addEventListener("change", () => {
    const file = picInput.files && picInput.files[0];
    if (!file) return;
    picWrap.innerHTML = "";
    picWrap.appendChild(makePictureImg(URL.createObjectURL(file), "pic-upload-preview"));
  });

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

  const prefLabel = document.createElement("label");
  prefLabel.textContent = "Preference";
  const prefInput = document.createElement("textarea");
  prefInput.value = data.pref || "";
  prefInput.placeholder = "Describe the kinds of events you're interested in...";
  prefInput.className = "profile-input";
  prefInput.rows = 3;

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
      pref: prefInput.value.trim(),
    };
    const res = await apiFetch("/user", {
      method: "PATCH",
      body: JSON.stringify(updated),
    });
    if (!res || res.code !== 200) {
      errorMsg.textContent = "Failed to save. Please try again.";
      errorMsg.classList.remove("hidden");
      return;
    }

    const file = picInput.files && picInput.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      const picRes = await apiUpload("/pic", formData, PICS_BASE_URL);
      if (!picRes || picRes.code !== 200) {
        errorMsg.textContent = "Profile saved, but picture upload failed.";
        errorMsg.classList.remove("hidden");
        return;
      }
    }

    renderView(updated);
  });

  cancelBtn.addEventListener("click", () => loadProfile());

  actions.appendChild(saveBtn);
  actions.appendChild(cancelBtn);

  card.appendChild(heading);
  card.appendChild(picLabel);
  card.appendChild(picWrap);
  card.appendChild(picInput);
  card.appendChild(usernameLabel);
  card.appendChild(usernameInput);
  card.appendChild(emailLabel);
  card.appendChild(emailInput);
  card.appendChild(bioLabel);
  card.appendChild(bioInput);
  card.appendChild(prefLabel);
  card.appendChild(prefInput);
  card.appendChild(errorMsg);
  card.appendChild(actions);

  container.appendChild(card);
}

loadProfile();
