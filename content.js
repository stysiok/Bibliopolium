const BUTTON_ID = "bibliopolium-reserve-button";
const STYLE_ID = "bibliopolium-reserve-style";
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
  `;
  document.head.appendChild(style);
};

const getAuthor = () => {
  const authorMeta = document.querySelector('meta[property="books:author"]');
  if (authorMeta && authorMeta.content) return authorMeta.content.trim();
  return "";
};

const buildSearchUrl = (title, author) => {
  const encodedTitle = encodeURIComponent(title.trim());
  const encodedAuthor = author ? encodeURIComponent(author.trim()) : "";
  const authorFilter = encodedAuthor ? `_i_autor_${encodedAuthor}` : "";
  return (
    "https://www.opole-mbp.sowa.pl/index.php?KatID=0&typ=repl&plnk=__tytul_" +
    encodedTitle +
    authorFilter +
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

const fetchSearchResults = async (title, author) => {
  const url = buildSearchUrl(title, author);
  console.log("[Bibliopolium] Fetching availability:", { title, author, url });
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

const checkAvailability = async (title, author, button) => {
  try {
    let body = await fetchSearchResults(title, author);
    let availability = parseAvailability(body);

    if (author && !availability.available) {
      body = await fetchSearchResults(title, "");
      const fallbackAvailability = parseAvailability(body);
      if (!fallbackAvailability.noResults) {
        availability = fallbackAvailability;
      }
    }

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
    const rawAuthor = getAuthor();
    const targetUrl = buildSearchUrl(rawTitle, rawAuthor);
    window.open(targetUrl, "_blank", "noopener");
  });

  title.insertAdjacentElement("afterend", button);
  checkAvailability(title.textContent || "", getAuthor(), button);
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
