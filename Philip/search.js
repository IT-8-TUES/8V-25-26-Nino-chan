let currentPage = 0;
let lastTitle = "";
let lastUser = "";

const titleInput = document.getElementById("title-input");
const userInput = document.getElementById("user-input");
const searchBtn = document.getElementById("search-btn");
const resultsContainer = document.getElementById("results-container");
const pagination = document.getElementById("pagination");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");
const pageIndicator = document.getElementById("page-indicator");

async function doSearch(page) {
  currentPage = page;
  const params = new URLSearchParams({ page_num: page });
  if (lastTitle) params.set("title", lastTitle);
  if (lastUser) params.set("user", lastUser);

  const results = await apiFetch(`/event?${params}`);
  renderResults(results);
  updatePagination(results.length, page);
}

function renderResults(events) {
  resultsContainer.innerHTML = "";

  if (!Array.isArray(events) || events.length === 0) {
    const msg = document.createElement("p");
    msg.className = "no-results";
    msg.textContent = currentPage === 0 ? "No events found." : "No more events.";
    resultsContainer.appendChild(msg);
    return;
  }

  const ul = document.createElement("ul");
  ul.className = "results-list";

  for (const ev of events) {
    const li = document.createElement("li");
    li.className = "result-item";

    const info = document.createElement("div");
    info.className = "result-info";

    const date = document.createElement("span");
    date.className = "result-date";
    date.textContent = ev.date;

    const title = document.createElement("span");
    title.className = "result-title";
    title.textContent = ev.title;

    info.appendChild(date);
    info.appendChild(title);

    const creator = document.createElement("span");
    creator.className = "result-creator";
    creator.textContent = ev.creator;

    li.appendChild(info);
    li.appendChild(creator);

    // Update this href to match the long description page location once it exists
    li.addEventListener("click", () => {
      window.location.href = `../event.html?id=${ev.eventid}`;
    });

    ul.appendChild(li);
  }

  resultsContainer.appendChild(ul);
}

function updatePagination(count, page) {
  const hasResults = Array.isArray(count) ? count > 0 : count > 0;
  pagination.classList.toggle("hidden", page === 0 && count === 0);
  prevBtn.disabled = page === 0;
  nextBtn.classList.toggle("hidden", count < 10);
  pageIndicator.textContent = `Page ${page + 1}`;
}

function onSearch() {
  lastTitle = titleInput.value.trim();
  lastUser = userInput.value.trim();
  doSearch(0);
}

searchBtn.addEventListener("click", onSearch);
titleInput.addEventListener("keydown", (e) => { if (e.key === "Enter") onSearch(); });
userInput.addEventListener("keydown", (e) => { if (e.key === "Enter") onSearch(); });
prevBtn.addEventListener("click", () => doSearch(currentPage - 1));
nextBtn.addEventListener("click", () => doSearch(currentPage + 1));
