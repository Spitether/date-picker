import { state, loadState, saveState } from "./state.js";

export function initDatePage({ els }) {
  const { choiceGrid, openEnded } = els;

  const choices = [
    "Coffee + cute chat ☕️",
    "Dinner & dessert 🍰",
    "Movie night 🎬",
    "Walk + ice cream 🍦",
    "Adventure day 🧭",
    "Surprise me 😘",
  ];

  function initChoices() {
    if (!choiceGrid) return;
    choiceGrid.innerHTML = "";

    choices.forEach((label, idx) => {
      const id = `choice_${idx}`;
      const wrap = document.createElement("label");
      wrap.className = "choice";
      wrap.setAttribute("for", id);

      const input = document.createElement("input");
      input.type = "radio";
      input.name = "choices";
      input.id = id;
      input.value = label;
      input.addEventListener("change", () => {
        state.choice = label;
        saveState();
        renderChoiceSelected();
      });

      const text = document.createElement("div");
      text.textContent = label;

      wrap.appendChild(input);
      wrap.appendChild(text);
      choiceGrid.appendChild(wrap);
    });

    renderChoiceSelected();
  }

  function renderChoiceSelected() {
    if (!choiceGrid) return;
    const labels = Array.from(choiceGrid.querySelectorAll(".choice"));
    labels.forEach((wrap) => {
      const input = wrap.querySelector("input");
      const selected = input && input.value === state.choice;
      wrap.classList.toggle("choice--selected", !!selected);
      if (input) input.checked = !!selected;
    });
  }

  initChoices();
  loadState();

  if (openEnded) {
    openEnded.value = state.openEnded || "";
  }
  renderChoiceSelected();
}

