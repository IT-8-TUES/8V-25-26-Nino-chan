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

  let currentDate = null;
  let ul = null;

  for (const ev of events) {
    if (ev.date !== currentDate) {
      currentDate = ev.date;
      const header = document.createElement("h3");
      header.className = "results-date-header";
      header.textContent = ev.date;
      resultsContainer.appendChild(header);

      ul = document.createElement("ul");
      ul.className = "results-list";
      resultsContainer.appendChild(ul);
    }

    const li = document.createElement("li");
    li.className = "result-item";

    const info = document.createElement("div");
    info.className = "result-info";

    const title = document.createElement("span");
    title.className = "result-title";
    title.textContent = ev.title;

    info.appendChild(title);

    const creator = document.createElement("span");
    creator.className = "result-creator";
    creator.textContent = ev.creator;

    li.appendChild(info);
    li.appendChild(creator);

    li.addEventListener("click", () => {
      window.location.href = `../Nikola/templates/long-description.html?id=${ev.eventid}`;
    });

    ul.appendChild(li);
  }
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

(async () => {
  const results = await apiFetch("/event?page_num=0");
  renderResults(results);
  updatePagination(results.length, 0);
})();
