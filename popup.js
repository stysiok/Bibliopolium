const loginForm = document.getElementById("login-form");
const loginButton = document.getElementById("login");
const hint = document.querySelector(".hint");
const LOGIN_URL =
  "https://www.opole-mbp.sowa.pl/index.php?KatID=0&typ=acc&id=info";
const LOGIN_POST_URL = "https://www.opole-mbp.sowa.pl/index.php?typ=acc";

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
          reject(new Error(response?.error || "Login request failed."));
          return;
        }
        resolve(response.text);
      }
    );
  });

const setHint = (message, isError = false) => {
  if (!hint) return;
  hint.textContent = message;
  hint.style.color = isError ? "#8b1f1f" : "";
};

const extractHiddenInputs = (html) => {
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
    return { ok: false, reason: "Niepoprawny login lub hasło." };
  }
  return { ok: false, reason: "Nie udało się potwierdzić logowania." };
};

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = loginForm.email?.value?.trim();
  const password = loginForm.password?.value ?? "";

  if (!email || !password) return;

  loginButton.disabled = true;
  setHint("Logowanie w toku...");

  try {
    const loginPageHtml = await fetchViaBackground(LOGIN_URL, {
      method: "GET",
    });
    const hiddenInputs = extractHiddenInputs(loginPageHtml);
    const body = buildLoginPayload(email, password, hiddenInputs);

    const loginResponseHtml = await fetchViaBackground(LOGIN_POST_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
      redirect: "follow",
    });

    const result = evaluateLoginResult(loginResponseHtml);
    if (result.ok) {
      setHint("Zalogowano. Mozesz otworzyc katalog MBP.");
    } else {
      setHint(result.reason || "Nie udalo sie zalogowac.", true);
    }
  } catch (error) {
    setHint(
      `Nie udalo sie zalogowac: ${error?.message || "blad logowania"}.`,
      true
    );
  } finally {
    loginButton.disabled = false;
  }
});
