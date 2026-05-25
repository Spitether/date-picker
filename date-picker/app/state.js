// State + persistence helpers

export const STORAGE_KEY = "datePickerAnswers_v1";

export const state = {
  choice: null,
  openEnded: "",
  stampedDateISO: null,
  interval: "evening",
};

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    state.choice = parsed.choice ?? null;
    state.openEnded = parsed.openEnded ?? "";
    state.stampedDateISO = parsed.stampedDateISO ?? null;
    state.interval = parsed.interval ?? state.interval;
  } catch {
    // ignore
  }
}

export function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function clearState() {
  state.choice = null;
  state.openEnded = "";
  state.stampedDateISO = null;
  state.interval = "evening";
  localStorage.removeItem(STORAGE_KEY);
}

