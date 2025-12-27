chrome.runtime.onInstalled.addListener(() => {
  console.log("Bibliopolium extension installed.");
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (!message || message.type !== "BIBLIOPOLIUM_FETCH") return false;

  fetch(message.url)
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
