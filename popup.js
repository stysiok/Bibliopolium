const noteField = document.getElementById("note");
const saveButton = document.getElementById("save");
const status = document.getElementById("status");

const setStatus = (message) => {
  status.textContent = message;
  if (!message) return;
  window.setTimeout(() => {
    status.textContent = "";
  }, 1500);
};

chrome.storage.local.get(["note"], (result) => {
  if (chrome.runtime.lastError) {
    setStatus("Storage error");
    return;
  }
  noteField.value = result.note || "";
});

saveButton.addEventListener("click", () => {
  chrome.storage.local.set({ note: noteField.value }, () => {
    if (chrome.runtime.lastError) {
      setStatus("Save failed");
      return;
    }
    setStatus("Saved");
  });
});
