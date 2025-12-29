const MOCK_STORAGE_KEY = "bibliopoliumMockReservation";

chrome.runtime.onInstalled.addListener(() => {
  console.log("Bibliopolium extension installed.");
});

const getMockReservationEnabled = () =>
  new Promise((resolve) => {
    chrome.storage.sync.get({ [MOCK_STORAGE_KEY]: false }, (result) => {
      resolve(Boolean(result[MOCK_STORAGE_KEY]));
    });
  });

const mockReservationResponse = () =>
  [
    "<html><body>",
    "<h1>Rezerwacja przyjeta</h1>",
    "<p>Rezerwacja testowa zostala zapisana.</p>",
    "</body></html>",
  ].join("");

const performFetch = (message, sendResponse) => {
  const requestOptions =
    message.options && typeof message.options === "object"
      ? message.options
      : {};

  fetch(message.url, { credentials: "include", ...requestOptions })
    .then((response) =>
      response
        .text()
        .then((text) =>
          sendResponse({ ok: response.ok, status: response.status, text })
        )
    )
    .catch((error) =>
      sendResponse({ ok: false, error: error?.message || "Fetch failed" })
    );
};

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (!message) return false;

  if (
    message.type !== "BIBLIOPOLIUM_FETCH" &&
    message.type !== "BIBLIOPOLIUM_LOGIN" &&
    message.type !== "BIBLIOPOLIUM_RESERVE"
  ) {
    return false;
  }

  if (message.type === "BIBLIOPOLIUM_RESERVE") {
    getMockReservationEnabled()
      .then((enabled) => {
        if (enabled) {
          sendResponse({
            ok: true,
            status: 200,
            text: mockReservationResponse(),
          });
          return;
        }
        performFetch(message, sendResponse);
      })
      .catch((error) =>
        sendResponse({ ok: false, error: error?.message || "Fetch failed" })
      );
    return true;
  }

  performFetch(message, sendResponse);

  return true;
});
