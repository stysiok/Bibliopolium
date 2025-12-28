chrome.runtime.onInstalled.addListener(() => {
  console.log("Bibliopolium extension installed.");
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (!message) return false;

  if (
    message.type !== "BIBLIOPOLIUM_FETCH" &&
    message.type !== "BIBLIOPOLIUM_LOGIN"
  ) {
    return false;
  }

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

  return true;
});
