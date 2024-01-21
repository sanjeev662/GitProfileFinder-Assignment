const resultContainer = document.getElementById("resultContainer");
let currentPage = 1;
let userData;

function handleEnter(event) {
  if (event.key === "Enter") {
    searchUser();
  }
}

async function searchUser() {
  const usernameInput = document.getElementById("usernameInput");
  const loader = document.getElementById("loader");
  const reposPerPageSelect = document.getElementById("reposPerPageSelect");

  const username = usernameInput.value.trim();

  if (username === "") {
    alert("Please enter a valid username.");
    return;
  }

  try {
    loader.style.display = "block";

    userData = await getUserData(username);
    const totalRepos = userData.public_repos;
    const reposPerPage = parseInt(reposPerPageSelect.value);

    const repoData = await getUserRepos(username, currentPage, reposPerPage);
    updatePagination(totalRepos, reposPerPage);
    displayUserProfile(userData);
    displayUserRepo(repoData, currentPage);
  } catch (error) {
    console.error("Error:", error.message);
    alert("An error occurred while fetching user data.");
  } finally {
    loader.style.display = "none";
  }
}

function updatePagination(totalRepos, reposPerPage) {
  const totalPages = Math.ceil(totalRepos / reposPerPage);
  const paginationContainer = document.getElementById("paginationContainer");

  paginationContainer.innerHTML = "";

  const previousPageItem = createPaginationItem("<<", currentPage - 1);
  paginationContainer.appendChild(previousPageItem);

  const maxPageButtons = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
  let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);

  if (totalPages - endPage < Math.floor(maxPageButtons / 2)) {
    startPage = Math.max(1, endPage - maxPageButtons + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    const pageItem = createPaginationItem(i, i);
    paginationContainer.appendChild(pageItem);
  }

  const nextPageItem = createPaginationItem(">>", currentPage + 1);
  paginationContainer.appendChild(nextPageItem);
}

function createPaginationItem(label, page) {
  const pageItem = document.createElement("li");
  pageItem.className = "page-item";
  const pageLink = document.createElement("a");
  pageLink.className = "page-link";
  pageLink.setAttribute("href", "#");
  pageLink.textContent = label;
  pageLink.addEventListener("click", () => changePage(page));
  pageItem.appendChild(pageLink);
  if (page == currentPage) {
    pageItem.classList.add("active");
  }
  return pageItem;
}

function changePage(newPage) {
  if (
    newPage < 1 ||
    newPage > Math.ceil(userData.public_repos / reposPerPageSelect.value)
  ) {
    return;
  }
  currentPage = newPage;
  searchUser();
}

async function getUserData(username) {
  try {
    const response = await fetch(`https://api.github.com/users/${username}`);
    if (!response.ok) {
      throw new Error("User not found.");
    }
    return await response.json();
  } catch (error) {
    throw new Error(`Error fetching user data: ${error.message}`);
  }
}

async function getUserRepos(username, page = 1, reposPerPage = 10) {
  try {
    const response = await fetch(
      `https://api.github.com/users/${username}/repos?sort=created&page=${page}&per_page=${reposPerPage}`
    );
    if (!response.ok) {
      throw new Error("Error fetching repositories.");
    }
    return await response.json();
  } catch (error) {
    throw new Error(`Error fetching repositories: ${error.message}`);
  }
}

function displayUserProfile(userData) {
  const imgContainer = document.getElementById("imgContainer");
  const bioContainer = document.getElementById("bioContainer");

  imgContainer.innerHTML = `
  <img
  src=${userData.avatar_url}
  alt="userImg"
  class="img-fluid mb-3 rounded-circle border border-secondary"
  style="width: 120px; height: 120px"
/>
<a href=${userData.html_url} target="_blank"
  ><i class="fa-solid fa-link"></i> ${userData.html_url}</a
>
    `;

  bioContainer.innerHTML = `<h3>${userData.name}</h3>
    <p>${userData.bio}</p>
    <p><i class="fa-solid fa-location-dot"></i> ${userData.location}</p>
    <p>Twitter:${userData.twitter_username || "Not available"}</p>`;
}

function displayUserRepo(repoData, currentPage) {
  const repoContainer = document.getElementById("repoContainer");
  repoContainer.innerHTML = "";

  const repoCol12 = document.createElement("div");
  repoCol12.className = "col-md-12";

  for (let i = 0; i < repoData.length; i += 2) {
    const rowDiv = document.createElement("div");
    rowDiv.className = "row equal-height-row";

    for (let j = 0; j < 2; j++) {
      const repoIndex = i + j;

      if (repoIndex < repoData.length) {
        const repo = repoData[repoIndex];

        const colDiv = document.createElement("div");
        colDiv.className = "col-md-6 mb-4 d-flex";

        const borderDiv = document.createElement("div");
        borderDiv.className = "border border-dark p-3 w-100";

        const shortDescription = repo.description
          ? repo.description.split(/\s+/).slice(0, 25).join(" ") + "..."
          : "No description available";

        borderDiv.innerHTML = `
                  <h4 style="color: #0d6efd">${repo.name}</h4>
                  <p>${shortDescription}</p>
                  <div class="mt-2">
                      ${repo.topics
                        .slice(0, 5)
                        .map(
                          (topic) =>
                            `<button class="repoBtn btn btn-primary mb-2">${topic}</button>`
                        )
                        .join(" ")}
                      ${
                        repo.topics.length > 5
                          ? `<button class="repoBtn btn btn-primary mb-2">+</button>`
                          : ""
                      }
                  </div>
              `;
        colDiv.appendChild(borderDiv);
        rowDiv.appendChild(colDiv);
      }
    }
    repoCol12.appendChild(rowDiv);
  }
  repoContainer.appendChild(repoCol12);
}
