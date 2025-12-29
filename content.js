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
    :root {
      --bibliopolium-primary: #1b5e20;
      --bibliopolium-primary-ink: #ffffff;
      --bibliopolium-surface: #ffffff;
      --bibliopolium-surface-variant: #f3f4f6;
      --bibliopolium-outline: #d1d5db;
      --bibliopolium-on-surface: #111827;
      --bibliopolium-on-surface-muted: #4b5563;
      --bibliopolium-error: #b91c1c;
      --bibliopolium-shadow: 0 18px 40px rgba(17, 24, 39, 0.18);
      --bibliopolium-radius: 16px;
      font-family: "Roboto", "Segoe UI", Tahoma, sans-serif;
    }

    .bibliopolium-reserve-button {
      margin-left: 12px;
      padding: 8px 16px;
      border-radius: 999px;
      border: 1px solid var(--bibliopolium-outline);
      background: var(--bibliopolium-surface);
      color: var(--bibliopolium-on-surface);
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.02em;
      text-transform: uppercase;
      cursor: pointer;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
      transition: transform 0.15s ease, box-shadow 0.15s ease,
        background 0.15s ease;
    }

    .bibliopolium-reserve-button:hover {
      background: #f8fafc;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.12);
      transform: translateY(-1px);
    }

    .bibliopolium-reserve-button.is-available {
      border-color: transparent;
      background: var(--bibliopolium-primary);
      color: var(--bibliopolium-primary-ink);
      box-shadow: 0 6px 18px rgba(27, 94, 32, 0.35);
    }

    .bibliopolium-reserve-button.is-unavailable {
      border-color: transparent;
      background: #6b7280;
      color: #fff;
      cursor: not-allowed;
      box-shadow: none;
    }

    .bibliopolium-reserve-button:disabled {
      opacity: 0.9;
    }

    .bibliopolium-reserve-overlay {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.52);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2147483647;
    }

    .bibliopolium-reserve-modal {
      width: min(440px, calc(100% - 32px));
      background: var(--bibliopolium-surface);
      color: var(--bibliopolium-on-surface);
      border-radius: var(--bibliopolium-radius);
      padding: 22px 24px 20px;
      box-shadow: var(--bibliopolium-shadow);
      font-family: "Roboto", "Segoe UI", Tahoma, sans-serif;
    }

    .bibliopolium-reserve-modal h2 {
      margin: 0 0 10px;
      font-size: 18px;
      font-weight: 700;
      letter-spacing: 0.01em;
    }

    .bibliopolium-reserve-modal p {
      margin: 0 0 16px;
      font-size: 13px;
      line-height: 1.5;
      color: var(--bibliopolium-on-surface-muted);
    }

    .bibliopolium-reserve-modal .book-title {
      font-weight: 600;
      color: var(--bibliopolium-on-surface);
    }

    .bibliopolium-book-details {
      display: grid;
      grid-template-columns: 64px 1fr;
      gap: 12px;
      margin: 12px 0 16px;
      align-items: start;
    }

    .bibliopolium-book-cover {
      width: 64px;
      height: 96px;
      object-fit: cover;
      border-radius: 12px;
      box-shadow: 0 6px 16px rgba(17, 24, 39, 0.18);
      background: var(--bibliopolium-surface-variant);
    }

    .bibliopolium-book-meta {
      display: grid;
      gap: 6px;
      font-size: 12px;
      color: var(--bibliopolium-on-surface-muted);
    }

    .bibliopolium-book-meta strong {
      font-weight: 700;
      color: var(--bibliopolium-on-surface);
    }

    .bibliopolium-book-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: 6px;
    }

    .bibliopolium-book-tag {
      padding: 4px 10px;
      border-radius: 999px;
      background: var(--bibliopolium-surface-variant);
      font-size: 11px;
      color: var(--bibliopolium-on-surface-muted);
    }

    .bibliopolium-reserve-status {
      margin: 8px 0 0;
      font-size: 12px;
      color: var(--bibliopolium-on-surface);
    }

    .bibliopolium-reserve-status.is-error {
      color: var(--bibliopolium-error);
    }

    .bibliopolium-reserve-account {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 14px;
      border-radius: 999px;
      border: none;
      background: var(--bibliopolium-primary);
      color: var(--bibliopolium-primary-ink);
      font-size: 12px;
      font-weight: 700;
      text-decoration: none;
      box-shadow: 0 6px 16px rgba(27, 94, 32, 0.3);
    }

    .bibliopolium-reserve-actions {
      display: flex;
      gap: 10px;
      justify-content: flex-end;
      align-items: center;
    }

    .bibliopolium-reserve-action.cancel {
      margin-right: auto;
    }

    .bibliopolium-reserve-action {
      border: none;
      border-radius: 999px;
      padding: 8px 16px;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    }

    .bibliopolium-reserve-action.confirm {
      background: var(--bibliopolium-primary);
      color: var(--bibliopolium-primary-ink);
      box-shadow: 0 6px 16px rgba(27, 94, 32, 0.3);
    }

    .bibliopolium-reserve-action.cancel {
      background: #ef4444;
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

const TARGET_AGENDA = "01";

const parseAvailability = (body) => {
  const hasNoResults =
    body.includes('id="no-results"') || body.includes(NO_RESULTS_TEXT);
  if (hasNoResults) {
    return { available: false, noResults: true };
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(body, "text/html");
  const rows = Array.from(
    doc.querySelectorAll(".record-availability-details .record-av-details-row")
  );
  const agendaRow = rows.find((row) =>
    row.querySelector(`div[data-agenda="${TARGET_AGENDA}"]`)
  );

  if (agendaRow) {
    const hasAvailable = Boolean(
      agendaRow.querySelector(".record-av-agenda-button-available")
    );
    return { available: hasAvailable, noResults: false };
  }

  const hasAnyStatus =
    body.includes('data-opacit-best="') ||
    body.includes("av-status-") ||
    body.includes("record-availability");

  if (hasAnyStatus) return { available: false, noResults: false };
  return { available: true, noResults: false };
};

const fetchViaBackground = (url, options) =>
  new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      { type: "BIBLIOPOLIUM_FETCH", url, options },
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

const loginViaBackground = (url, options) =>
  new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      { type: "BIBLIOPOLIUM_LOGIN", url, options },
      (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        if (!response || !response.ok) {
          reject(new Error(response?.error || "Login request failed."));
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

const parseMbpRecordDetails = (body) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(body, "text/html");
  const record = doc.querySelector(".record-details");
  if (!record) return null;

  const getTextList = (selector) =>
    Array.from(record.querySelectorAll(selector))
      .map((node) => node.textContent?.trim())
      .filter(Boolean);

  const title =
    record.querySelector(".desc-o-mb-title")?.textContent?.trim() || "";
  const cover =
    record.querySelector(".record-thumb img")?.getAttribute("src") || "";

  const authorLinks = Array.from(
    record.querySelectorAll(".desc-descr-block-author .desc-descr-items a")
  );
  let authors = authorLinks
    .filter((link) => {
      const role = link.querySelector("span")?.textContent?.trim();
      return role === "Autor";
    })
    .map((link) => {
      const clone = link.cloneNode(true);
      clone.querySelectorAll("span").forEach((span) => span.remove());
      return clone.textContent?.trim();
    })
    .filter(Boolean);

  if (!authors.length) {
    authors = authorLinks
      .map((link) => {
        const clone = link.cloneNode(true);
        clone.querySelectorAll("span").forEach((span) => span.remove());
        return clone.textContent?.trim();
      })
      .filter(Boolean);
  }

  let origin = getTextList(
    ".desc-descr-block-demographic .desc-descr-items a"
  );
  if (!origin.length) {
    const publication = record
      .querySelector(".desc-o-publ")
      ?.textContent?.trim();
    if (publication) {
      const place = publication.split(":")[0]?.trim();
      if (place) origin = [place];
    }
  }

  return {
    title,
    cover,
    authors,
    formType: getTextList(".desc-descr-block-form .desc-descr-items a"),
    origin,
    tags: getTextList(".desc-descr-block-subject .desc-descr-items a"),
    genre: getTextList(".desc-descr-block-genre .desc-descr-items a"),
  };
};

const parseMbpReservationForm = (body) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(body, "text/html");
  const forms = Array.from(doc.querySelectorAll('form[name^="booking-form-"]'));
  if (!forms.length) return null;
  const form =
    forms.find((candidate) =>
      candidate.querySelector(`input[name="agenda"][value="${TARGET_AGENDA}"]`)
    ) || forms[0];
  if (!form) return null;

  const action = form.getAttribute("action") || "";
  const resolvedAction = new URL(action, "https://www.opole-mbp.sowa.pl/").toString();
  const inputs = Array.from(form.querySelectorAll('input[type="hidden"]'));

  const fields = inputs.reduce((acc, input) => {
    if (input.name) acc[input.name] = input.value || "";
    return acc;
  }, {});

  return { action: resolvedAction, fields };
};

const extractLoginHiddenInputs = (html) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const form = doc.querySelector('form[name="log"]');
  if (!form) return {};
  const hiddenInputs = Array.from(form.querySelectorAll('input[type="hidden"]'));
  return hiddenInputs.reduce((acc, input) => {
    if (input.name) acc[input.name] = input.value || "";
    return acc;
  }, {});
};

const buildLoginPayload = (email, password, hiddenInputs) => {
  const payload = new URLSearchParams();
  Object.entries(hiddenInputs || {}).forEach(([key, value]) => {
    payload.set(key, value ?? "");
  });
  payload.set("swww_user", email);
  payload.set("swww_pass", password);
  return payload.toString();
};

const evaluateLoginResult = (html) => {
  if (!html) return { ok: false, reason: "Brak odpowiedzi serwera." };
  const hasLoginForm =
    html.includes('name="log"') ||
    html.includes('id="acc-login-box"') ||
    html.includes("Zaloguj się");
  const hasLogout =
    html.includes("Wyloguj") ||
    html.includes("logout") ||
    html.includes("acc-logout");

  if (hasLogout && !hasLoginForm) {
    return { ok: true };
  }
  if (hasLoginForm) {
    return { ok: false, reason: "Niepoprawny login lub haslo." };
  }
  return { ok: false, reason: "Nie udalo sie potwierdzic logowania." };
};

const checkAvailability = async (isbn, button) => {
  try {
    const body = await fetchSearchResults(isbn);
    const availability = parseAvailability(body);
    const details = parseMbpRecordDetails(body);
    if (details) {
      button.dataset.mbpDetails = JSON.stringify(details);
    }
    const reservation = parseMbpReservationForm(body);
    if (reservation) {
      button.dataset.mbpReservation = JSON.stringify(reservation);
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

const closeReserveModal = () => {
  const existing = document.getElementById(MODAL_ID);
  if (existing) existing.remove();
};

const openReserveModal = ({ title, details, reservation, sourceButton }) => {
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

  let detailsBlock = null;
  if (details) {
    detailsBlock = document.createElement("div");
    detailsBlock.className = "bibliopolium-book-details";

    const cover = document.createElement("img");
    cover.className = "bibliopolium-book-cover";
    cover.alt = "Okladka ksiazki";
    if (details.cover) cover.src = details.cover;

    const meta = document.createElement("div");
    meta.className = "bibliopolium-book-meta";

    const authorLine = document.createElement("div");
    authorLine.innerHTML = `<strong>Autor:</strong> ${
      details.authors?.length ? details.authors.join(", ") : "Brak danych"
    }`;

    const formLine = document.createElement("div");
    formLine.innerHTML = `<strong>Forma i typ:</strong> ${
      details.formType?.length ? details.formType.join(", ") : "Brak danych"
    }`;

    const originLine = document.createElement("div");
    originLine.innerHTML = `<strong>Pochodzenie:</strong> ${
      details.origin?.length ? details.origin.join(", ") : "Brak danych"
    }`;

    const genreLine = document.createElement("div");
    genreLine.innerHTML = `<strong>Gatunek:</strong> ${
      details.genre?.length ? details.genre.join(", ") : "Brak danych"
    }`;

    meta.append(authorLine, formLine, originLine, genreLine);

    if (details.tags?.length) {
      const tagsWrap = document.createElement("div");
      tagsWrap.className = "bibliopolium-book-tags";
      details.tags.slice(0, 8).forEach((tag) => {
        const chip = document.createElement("span");
        chip.className = "bibliopolium-book-tag";
        chip.textContent = tag;
        tagsWrap.appendChild(chip);
      });
      meta.appendChild(tagsWrap);
    }

    detailsBlock.append(cover, meta);
  } else {
    detailsBlock = document.createElement("p");
    detailsBlock.textContent =
      "Brak szczegolow z katalogu MBP dla tej ksiazki.";
  }

  const status = document.createElement("p");
  status.className = "bibliopolium-reserve-status";

  const actions = document.createElement("div");
  actions.className = "bibliopolium-reserve-actions";

  const cancelButton = document.createElement("button");
  cancelButton.type = "button";
  cancelButton.className = "bibliopolium-reserve-action cancel";
  cancelButton.textContent = "Anuluj";
  cancelButton.addEventListener("click", closeReserveModal);

  const accountLink = document.createElement("a");
  accountLink.className = "bibliopolium-reserve-account";
  accountLink.href =
    "https://www.opole-mbp.sowa.pl/index.php?KatID=0&typ=acc&id=reserved";
  accountLink.target = "_blank";
  accountLink.rel = "noopener";
  accountLink.textContent = "Przejdz do konta MBP";
  accountLink.style.display = "none";

  const confirmButton = document.createElement("button");
  confirmButton.type = "button";
  confirmButton.className = "bibliopolium-reserve-action confirm";
  confirmButton.textContent = "Potwierdz rezerwacje";

  const loginForm = document.createElement("form");
  loginForm.style.display = "none";
  loginForm.style.margin = "12px 0 0";
  loginForm.className = "bibliopolium-login-form";

  const loginEmail = document.createElement("input");
  loginEmail.type = "email";
  loginEmail.placeholder = "email";
  loginEmail.autocomplete = "email";
  loginEmail.required = true;
  loginEmail.style.width = "100%";
  loginEmail.style.marginBottom = "8px";

  const loginPassword = document.createElement("input");
  loginPassword.type = "password";
  loginPassword.placeholder = "haslo";
  loginPassword.autocomplete = "current-password";
  loginPassword.required = true;
  loginPassword.style.width = "100%";

  loginForm.append(loginEmail, loginPassword);

  let pendingReservation = null;

  const submitReservation = (reservationPayload) => {
    const payload = new URLSearchParams(reservationPayload.fields).toString();
    return fetchViaBackground(reservationPayload.action, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: payload,
      redirect: "follow",
    });
  };

  const loginAndReserve = () => {
    if (!pendingReservation) return;

    console.log("[Bibliopolium] Login attempt started.", {
      emailLength: loginEmail.value.trim().length,
      hasPassword: Boolean(loginPassword.value),
    });
    status.textContent = "Logowanie w toku...";
    status.classList.remove("is-error");
    status.style.display = "block";

    return (() => {
      const loginPageUrl =
        "https://www.opole-mbp.sowa.pl/index.php?KatID=0&typ=acc&id=info";
      const loginPostUrl = "https://www.opole-mbp.sowa.pl/index.php?typ=acc";
      console.log("[Bibliopolium] Login request start.", {
        hasEmail: Boolean(loginEmail.value.trim()),
      });
      return loginViaBackground(loginPageUrl, { method: "GET" })
        .then((loginPageHtml) => {
          console.log("[Bibliopolium] Login page fetched.", {
            length: loginPageHtml?.length || 0,
          });
          const hiddenInputs = extractLoginHiddenInputs(loginPageHtml);
          console.log("[Bibliopolium] Login hidden inputs.", {
            keys: Object.keys(hiddenInputs),
          });
          const body = buildLoginPayload(
            loginEmail.value.trim(),
            loginPassword.value,
            hiddenInputs
          );
          return loginViaBackground(loginPostUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body,
            redirect: "follow",
          });
        });
    })()
      .then((loginResponseHtml) => {
        const result = evaluateLoginResult(loginResponseHtml);
        console.log("[Bibliopolium] Login response analyzed.", {
          ok: result.ok,
          length: loginResponseHtml?.length || 0,
        });
        if (!result.ok) {
          throw new Error(result.reason || "Niepoprawny login lub haslo.");
        }
        return submitReservation(pendingReservation);
      })
      .then((reservationHtml) => {
        const lowered = reservationHtml.toLowerCase();
        console.log("[Bibliopolium] Reservation after login response.", {
          length: reservationHtml?.length || 0,
          hasKeywords:
            lowered.includes("wypo") ||
            lowered.includes("rezerw") ||
            lowered.includes("zamow"),
        });
        if (
          lowered.includes("wypo") ||
          lowered.includes("rezerw") ||
          lowered.includes("zamow")
        ) {
          status.textContent = "";
          status.style.display = "none";
          accountLink.style.display = "none";
          confirmButton.textContent = "Idz do MBP";
          confirmButton.disabled = false;
          confirmButton.style.display = "inline-flex";
          confirmButton.addEventListener(
            "click",
            () => {
              window.open(
                "https://www.opole-mbp.sowa.pl/index.php?KatID=0&typ=acc&id=reserved",
                "_blank",
                "noopener"
              );
            },
            { once: true }
          );
          cancelButton.style.display = "inline-flex";
          loginForm.style.display = "none";
          pendingReservation = null;
          return;
        }

        status.textContent = "";
        status.style.display = "none";
        confirmButton.style.display = "inline-flex";
        cancelButton.style.display = "inline-flex";
      })
      .catch((error) => {
        status.textContent = `Nie udalo sie zalogowac: ${
          error?.message || "blad"
        }`;
        status.classList.add("is-error");
        status.style.display = "block";
      })
      .finally(() => {
        confirmButton.disabled = false;
        cancelButton.disabled = false;
      });
  };

  confirmButton.addEventListener("click", () => {
    if (!reservation) {
      status.textContent = "Brak danych do wypozyczenia z katalogu MBP.";
      status.classList.add("is-error");
      return;
    }

    if (pendingReservation && loginForm.style.display === "block") {
      confirmButton.disabled = true;
      cancelButton.disabled = true;
      loginAndReserve();
      return;
    }

    confirmButton.disabled = true;
    cancelButton.disabled = true;
    status.textContent = "";
    status.classList.remove("is-error");
    status.style.display = "none";

    submitReservation(reservation)
      .then((html) => {
        if (!html) {
          throw new Error("Brak odpowiedzi serwera.");
        }

        const lowered = html.toLowerCase();
        console.log("[Bibliopolium] Reservation response.", {
          length: html?.length || 0,
          hasLoginPrompt:
            lowered.includes("zaloguj") || lowered.includes("logowanie"),
          hasKeywords:
            lowered.includes("wypo") ||
            lowered.includes("rezerw") ||
            lowered.includes("zamow"),
        });
        if (lowered.includes("zaloguj") || lowered.includes("logowanie")) {
          status.textContent =
            "Musisz sie zalogowac w MBP, aby wypozyczyc ksiazke.";
          status.classList.add("is-error");
          status.style.display = "block";
          confirmButton.textContent = "Zaloguj sie i potwierdz";
          confirmButton.disabled = false;
          loginForm.style.display = "block";
          pendingReservation = reservation;
          return;
        }

        if (
          lowered.includes("wypo") ||
          lowered.includes("rezerw") ||
          lowered.includes("zamow")
        ) {
          status.textContent = "";
          status.style.display = "none";
          accountLink.style.display = "none";
          confirmButton.textContent = "Idz do MBP";
          confirmButton.disabled = false;
          confirmButton.style.display = "inline-flex";
          confirmButton.addEventListener(
            "click",
            () => {
              window.open(
                "https://www.opole-mbp.sowa.pl/index.php?KatID=0&typ=acc&id=reserved",
                "_blank",
                "noopener"
              );
            },
            { once: true }
          );
          cancelButton.style.display = "inline-flex";
          if (sourceButton) {
            sourceButton.textContent = "Konto MBP";
            sourceButton.classList.remove("is-available");
            sourceButton.classList.add("is-unavailable");
            sourceButton.disabled = false;
            sourceButton.addEventListener(
              "click",
              () => {
                window.open(
                  "https://www.opole-mbp.sowa.pl/index.php?KatID=0&typ=acc",
                  "_blank",
                  "noopener"
                );
              },
              { once: true }
            );
          }
          return;
        }

        status.textContent = "";
        status.style.display = "none";
        accountLink.style.display = "none";
        confirmButton.textContent = "Idz do MBP";
        confirmButton.disabled = false;
        confirmButton.style.display = "inline-flex";
        confirmButton.addEventListener(
          "click",
          () => {
            window.open(
              "https://www.opole-mbp.sowa.pl/index.php?KatID=0&typ=acc&id=reserved",
              "_blank",
              "noopener"
            );
          },
          { once: true }
        );
        cancelButton.style.display = "inline-flex";
        if (sourceButton) {
          sourceButton.textContent = "Konto MBP";
          sourceButton.classList.remove("is-available");
          sourceButton.classList.add("is-unavailable");
          sourceButton.disabled = false;
          sourceButton.addEventListener(
            "click",
            () => {
              window.open(
                "https://www.opole-mbp.sowa.pl/index.php?KatID=0&typ=acc",
                "_blank",
                "noopener"
              );
            },
            { once: true }
          );
        }
      })
      .catch((error) => {
        status.textContent = `Nie udalo sie wypozyczyc: ${
          error?.message || "blad"
        }`;
        status.classList.add("is-error");
        status.style.display = "block";
      })
      .finally(() => {
        confirmButton.disabled = false;
        cancelButton.disabled = false;
      });
  });

  actions.append(cancelButton, accountLink, confirmButton);
  modal.append(heading, message, detailsBlock, loginForm, status, actions);
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
    let details = null;
    let reservation = null;
    if (button.dataset.mbpDetails) {
      try {
        details = JSON.parse(button.dataset.mbpDetails);
      } catch (error) {
        details = null;
      }
    }
    if (button.dataset.mbpReservation) {
      try {
        reservation = JSON.parse(button.dataset.mbpReservation);
      } catch (error) {
        reservation = null;
      }
    }
    if (button.classList.contains("is-available")) {
      openReserveModal({
        title: rawTitle,
        details,
        reservation,
        sourceButton: button,
      });
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
