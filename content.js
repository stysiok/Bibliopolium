const BUTTON_ID = "bibliopolium-reserve-button";
const STYLE_ID = "bibliopolium-reserve-style";
const MODAL_ID = "bibliopolium-reserve-modal";
const NO_RESULTS_TEXT =
  "Nie znaleziono żadnych rekordów pasujących do wybranej kombinacji kryteriów filtrujących";

const injectStyle = () => {
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    .bibliopolium-reserve-button {
      margin-left: 12px;
      padding: 6px 14px;
      border-radius: 999px;
      border: 1px solid #2b2b2b;
      background: #fff;
      color: #2b2b2b;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      cursor: pointer;
    }

    .bibliopolium-reserve-button:hover {
      background: #f1f1f1;
    }

    .bibliopolium-reserve-button.is-available {
      border-color: #1f6f3d;
      background: #1f6f3d;
      color: #fff;
    }

    .bibliopolium-reserve-button.is-unavailable {
      border-color: #8b1f1f;
      background: #8b1f1f;
      color: #fff;
      cursor: not-allowed;
    }

    .bibliopolium-reserve-button:disabled {
      opacity: 0.9;
    }

    .bibliopolium-reserve-overlay {
      position: fixed;
      inset: 0;
      background: rgba(15, 15, 15, 0.55);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2147483647;
    }

    .bibliopolium-reserve-modal {
      width: min(420px, calc(100% - 32px));
      background: #fff;
      color: #1f1f1f;
      border-radius: 18px;
      padding: 22px 24px 20px;
      box-shadow: 0 18px 40px rgba(0, 0, 0, 0.2);
      font-family: "Segoe UI", Tahoma, sans-serif;
    }

    .bibliopolium-reserve-modal h2 {
      margin: 0 0 10px;
      font-size: 18px;
      font-weight: 700;
    }

    .bibliopolium-reserve-modal p {
      margin: 0 0 18px;
      font-size: 14px;
      line-height: 1.4;
      color: #333;
    }

    .bibliopolium-reserve-modal .book-title {
      font-weight: 600;
    }

    .bibliopolium-reserve-actions {
      display: flex;
      gap: 10px;
      justify-content: flex-end;
    }

    .bibliopolium-reserve-action {
      border: none;
      border-radius: 999px;
      padding: 8px 16px;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
    }

    .bibliopolium-reserve-action.confirm {
      background: #1f6fdb;
      color: #fff;
    }

    .bibliopolium-reserve-action.cancel {
      background: #c0392b;
      color: #fff;
    }
  `;
  document.head.appendChild(style);
};

const getIsbn = () => {
  const isbnMeta = document.querySelector('meta[property="books:isbn"]');
  if (isbnMeta && isbnMeta.content) return isbnMeta.content.trim();

  const detailList = document.querySelector("#book-details");
  if (detailList) {
    const terms = Array.from(detailList.querySelectorAll("dt"));
    for (const term of terms) {
      const label = term.textContent?.trim().toLowerCase();
      if (label === "isbn:" || label === "isbn") {
        const value = term.nextElementSibling;
        if (value && value.tagName === "DD" && value.textContent) {
          return value.textContent.trim();
        }
      }
    }
  }

  return "";
};

const buildSearchUrl = (isbn) => {
  const encodedIsbn = encodeURIComponent(isbn.trim());
  return (
    "https://www.opole-mbp.sowa.pl/index.php?KatID=0&typ=repl&plnk=__isbn_" +
    encodedIsbn +
    "&sort=byscore&forigin=opole_mbp_ks&fform=Ksi%C4%85%C5%BCki&floans.branch=01"
  );
};

const parseAvailability = (body) => {
  const hasNoResults =
    body.includes('id="no-results"') || body.includes(NO_RESULTS_TEXT);
  if (hasNoResults) {
    return { available: false, noResults: true };
  }

  const hasAvailable =
    /record-av-agenda-button-available/i.test(body) ||
    body.includes('data-opacit-best="available"') ||
    body.includes("av-status-available");

  const hasAnyStatus =
    body.includes('data-opacit-best="') ||
    body.includes("av-status-") ||
    body.includes("record-availability");

  if (hasAvailable) return { available: true, noResults: false };
  if (hasAnyStatus) return { available: false, noResults: false };
  return { available: true, noResults: false };
};

const fetchViaBackground = (url) =>
  new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      { type: "BIBLIOPOLIUM_FETCH", url },
      (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        if (!response || !response.ok) {
          reject(new Error(response?.error || "Search request failed."));
          return;
        }
        resolve(response.text);
      }
    );
  });

const fetchSearchResults = async (isbn) => {
  const url = buildSearchUrl(isbn);
  console.log("[Bibliopolium] Fetching availability:", { isbn, url });
  try {
    const text = await fetchViaBackground(url);
    console.log("[Bibliopolium] Availability response OK:", { url });
    return text;
  } catch (error) {
    console.warn("[Bibliopolium] Availability fetch failed:", {
      url,
      error: error?.message || String(error),
    });
    throw error;
  }
};

const checkAvailability = async (isbn, button) => {
  try {
    const body = await fetchSearchResults(isbn);
    const availability = parseAvailability(body);

    if (!availability.available) {
      button.classList.remove("is-available");
      button.classList.add("is-unavailable");
      button.textContent = "Niedostępna";
      button.disabled = false;
      return;
    }

    button.classList.remove("is-unavailable");
    button.classList.add("is-available");
    button.textContent = "Zarezerwuj";
    button.disabled = false;
  } catch (error) {
    button.classList.remove("is-available");
    button.classList.add("is-unavailable");
    button.textContent = "Niedostępna";
    button.disabled = false;
  }
};

const closeReserveModal = () => {
  const existing = document.getElementById(MODAL_ID);
  if (existing) existing.remove();
};

const openReserveModal = ({ title, targetUrl }) => {
  closeReserveModal();

  const overlay = document.createElement("div");
  overlay.id = MODAL_ID;
  overlay.className = "bibliopolium-reserve-overlay";

  const modal = document.createElement("div");
  modal.className = "bibliopolium-reserve-modal";

  const heading = document.createElement("h2");
  heading.textContent = "Potwierdzenie rezerwacji";

  const message = document.createElement("p");
  message.textContent =
    "Czy chcesz potwierdzic rezerwacje ksiazki w MBP?";

  const bookTitle = document.createElement("span");
  bookTitle.className = "book-title";
  bookTitle.textContent = title;

  message.append(document.createElement("br"), bookTitle);

  const actions = document.createElement("div");
  actions.className = "bibliopolium-reserve-actions";

  const cancelButton = document.createElement("button");
  cancelButton.type = "button";
  cancelButton.className = "bibliopolium-reserve-action cancel";
  cancelButton.textContent = "Anuluj";
  cancelButton.addEventListener("click", closeReserveModal);

  const confirmButton = document.createElement("button");
  confirmButton.type = "button";
  confirmButton.className = "bibliopolium-reserve-action confirm";
  confirmButton.textContent = "Potwierdz rezerwacje";
  confirmButton.addEventListener("click", () => {
    window.open(targetUrl, "_blank", "noopener");
    closeReserveModal();
  });

  actions.append(cancelButton, confirmButton);
  modal.append(heading, message, actions);
  overlay.appendChild(modal);

  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) closeReserveModal();
  });

  document.body.appendChild(overlay);
};

const addReserveButton = () => {
  if (document.getElementById(BUTTON_ID)) return true;

  const title =
    document.querySelector(".title-container .book__title") ||
    document.querySelector("h1.book__title");

  if (!title) return false;

  injectStyle();

  const button = document.createElement("button");
  button.id = BUTTON_ID;
  button.type = "button";
  button.className = "bibliopolium-reserve-button";
  button.textContent = "Sprawdzam...";
  button.disabled = true;
  button.addEventListener("click", () => {
    const rawTitle = title.textContent || "";
    const isbn = getIsbn();
    const targetUrl = buildSearchUrl(isbn);
    if (button.classList.contains("is-available")) {
      openReserveModal({ title: rawTitle, targetUrl });
    }
  });

  title.insertAdjacentElement("afterend", button);
  const isbn = getIsbn();
  if (!isbn) {
    button.classList.add("is-unavailable");
    button.textContent = "Brak ISBN";
    button.disabled = false;
    return true;
  }
  checkAvailability(isbn, button);
  return true;
};

if (!addReserveButton()) {
  const observer = new MutationObserver(() => {
    if (addReserveButton()) {
      observer.disconnect();
    }
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
}
