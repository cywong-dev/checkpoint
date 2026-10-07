import { getData, setData } from "./storage.js";
import {
  sortBookmarksReverseChronological,
  createBookmarkObject,
  incrementLikeCount,
} from "./helper.js";

const bookmarkForm = document.getElementById("bookmark-form");
const bookmarksContainer = document.getElementById("bookmarks-container");
const tbodyElement = document.getElementById("tableBody");

let selectedUserId = null;

function getBookmarks() {
  const data = getData(selectedUserId);
  return Array.isArray(data) ? data : [];
}

// Render bookmarks for the selected user
function renderBookmarks() {
  const bookmarks = getBookmarks();

  if (bookmarks.length === 0) {
    bookmarksContainer.innerHTML = "<p>No bookmarks found for this user.</p>";
    tbodyElement.innerHTML = "";
    return;
  }

  const sortedBookmarks = sortBookmarksReverseChronological(bookmarks);

  bookmarksContainer.innerHTML = "";
  tbodyElement.innerHTML = "";

  sortedBookmarks.forEach((bookmark) => {
    let row = tbodyElement.insertRow(-1);

    // URL hyperlink and title
    let URLCell = row.insertCell(0);

    const titleLink = document.createElement("a");
    titleLink.href = bookmark.url;
    titleLink.textContent = bookmark.title;
    titleLink.target = "_blank";
    titleLink.rel = "noopener noreferrer";

    URLCell.append(titleLink);

    // Description
    let descCell = row.insertCell(1);
    descCell.textContent = bookmark.description;

    // Date
    let timeCell = row.insertCell(2);
    timeCell.textContent = `Added: ${new Date(bookmark.createdAt).toLocaleString()}`;

    // Copy to Clipboard Button
    const copyBtn = document.createElement("button");
    copyBtn.textContent = "Copy URL";
    copyBtn.type = "button";
    copyBtn.addEventListener("click", () => {
      navigator.clipboard.writeText(bookmark.url);
      copyBtn.textContent = "Copied!";
      setTimeout(() => {
        copyBtn.textContent = "Copy URL";
      }, 2000);
    });

    // Like Button
    const likeBtn = document.createElement("button");
    likeBtn.textContent = `Like (${bookmark.likes || 0})`;
    likeBtn.type = "button";
    likeBtn.addEventListener("click", () => {
      const currentBookmarks = getBookmarks();
      const updatedBookmarks = incrementLikeCount(
        currentBookmarks,
        bookmark.id,
      );
      setData(selectedUserId, updatedBookmarks);
      renderBookmarks();
    });

    let copyCell = row.insertCell(3);
    copyCell.append(copyBtn);

    let likeCell = row.insertCell(4);
    likeCell.append(likeBtn);
  });
}

// Handle Form Submission
bookmarkForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const url = document.getElementById("bookmark-url").value.trim();
  const title = document.getElementById("bookmark-title").value.trim();
  const description = document
    .getElementById("bookmark-description")
    .value.trim();

  const newBookmark = createBookmarkObject(url, title, description);
  const currentBookmarks = getBookmarks();
  currentBookmarks.push(newBookmark);

  setData(selectedUserId, currentBookmarks);
  bookmarkForm.reset();
  renderBookmarks();
});

// Initial Setup
window.onload = function () {
  const params = new URLSearchParams(window.location.search);

  if (params.has("userId")) {
    selectedUserId = params.get("userId");
    renderBookmarks();
  } else {
    throw new Error("userId not found, please go back to the main page");
  }
};
