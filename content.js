const BUTTON_ID = "bibliopolium-reserve-button";
const STYLE_ID = "bibliopolium-reserve-style";

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
  `;
  document.head.appendChild(style);
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
  button.textContent = "Zarezerwuj";

  title.insertAdjacentElement("afterend", button);
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
