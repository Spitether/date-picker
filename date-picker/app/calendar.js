import { state, loadState, saveState } from "./state.js";
import { formatHuman, isoFromYMD, isoToYMD, intervalLabel } from "./utils.js";

export function initStamp({ els }) {
  const {
    formDate,
    stampNote,
    calendarEl,
    monthSelect,
    daySelect,
    yearSelect,
    intervalSelect,
    stamp,
    stampTextEl,
    btnConfirm,
    summary,
    btnReset,
    setActive,
  } = els;

  function pad2(n) {
    return String(n).padStart(2, "0");
  }

  function ensureControlsPopulated() {
    if (!yearSelect || !monthSelect || !daySelect || !intervalSelect) return;

    if (!yearSelect.options.length) {
      const start = 2026;
      const end = 2036;
      yearSelect.innerHTML = "";
      for (let y = start; y <= end; y++) {
        const opt = document.createElement("option");
        opt.value = String(y);
        opt.textContent = String(y);
        yearSelect.appendChild(opt);
      }
    }

    if (!monthSelect.options.length) {
      monthSelect.innerHTML = "";
      for (let m = 1; m <= 12; m++) {
        const opt = document.createElement("option");
        opt.value = String(m);
        opt.textContent = new Date(2000, m - 1, 1).toLocaleDateString(undefined, { month: "short" });
        monthSelect.appendChild(opt);
      }
    }

    const y = Number(yearSelect.value);
    const m = Number(monthSelect.value);
    if (y && m) updateDayOptions(y, m);

    if (!intervalSelect.value) {
      intervalSelect.value = state.interval || "evening";
    }
  }

  function updateDayOptions(y, m) {
    if (!daySelect) return;
    const daysInMonth = new Date(y, m, 0).getDate();
    const current = Number(daySelect.value);

    daySelect.innerHTML = "";
    for (let d = 1; d <= daysInMonth; d++) {
      const opt = document.createElement("option");
      opt.value = String(d);
      opt.textContent = String(d);
      daySelect.appendChild(opt);
    }

    if (current >= 1 && current <= daysInMonth) {
      daySelect.value = String(current);
    } else {
      daySelect.value = "1";
    }
  }

  function syncControlsFromState() {
    if (!state.stampedDateISO) return;
    const ymd = isoToYMD(state.stampedDateISO);
    if (!ymd) return;
    if (yearSelect) yearSelect.value = String(ymd.y);
    if (monthSelect) monthSelect.value = String(ymd.m);
    updateDayOptions(ymd.y, ymd.m);
    if (daySelect) daySelect.value = String(ymd.d);
  }

  function getSelectedYMD() {
    const y = Number(yearSelect?.value);
    const m = Number(monthSelect?.value);
    const d = Number(daySelect?.value);
    if (!y || !m || !d) return null;
    return { y, m, d };
  }

  function isoFromSelectedControls() {
    const ymd = getSelectedYMD();
    if (!ymd) return null;
    return isoFromYMD(ymd.y, ymd.m, ymd.d);
  }

  function showStamp(iso) {
    const human = formatHuman(iso);
    const interval = intervalSelect?.value || state.interval || "evening";

    stampNote.style.color = "rgba(255,255,255,.7)";
    stampNote.textContent = `Stamped for ${human} — ${intervalLabel(interval)}.`;

    stamp.classList.remove("stamp--show");
    void stamp.offsetWidth;
    stamp.classList.add("stamp--show");

    const selectedBtn = Array.from(calendarEl.querySelectorAll(".day")).find((b) => b.dataset.iso === iso);
    if (selectedBtn) {
      const btnRect = selectedBtn.getBoundingClientRect();
      const appRect = document.querySelector(".app").getBoundingClientRect();
      const x = btnRect.left + btnRect.width / 2 - appRect.left;
      stamp.style.left = `${x}px`;
      stamp.style.transform = "translateX(-50%) rotate(-4deg)";
    }
  }

  function renderCalendar() {
    calendarEl.innerHTML = "";

    ensureControlsPopulated();
    syncControlsFromState();

    const selectedISO = isoFromSelectedControls();
    const viewYMD = isoToYMD(selectedISO || state.stampedDateISO);

    const year = viewYMD?.y ?? new Date().getFullYear();
    const month0 = viewYMD?.m ? viewYMD.m - 1 : new Date().getMonth();

    if (els.calHeaderMonthEl) {
      const tmp = new Date(year, month0, 1);
      els.calHeaderMonthEl.textContent = tmp.toLocaleDateString(undefined, { month: "long", year: "numeric" });
    }

    const first = new Date(year, month0, 1);
    const startDay = first.getDay();
    const daysInMonth = new Date(year, month0 + 1, 0).getDate();

    const totalSlots = 42;
    for (let slot = 0; slot < totalSlots; slot++) {
      const dayNum = slot - startDay + 1;
      const valid = dayNum >= 1 && dayNum <= daysInMonth;

      const day = document.createElement("button");
      day.type = "button";
      day.className = "day";

      if (!valid) {
        day.classList.add("day--disabled");
        day.disabled = true;
        day.textContent = "";
      } else {
        const iso = isoFromYMD(year, month0 + 1, dayNum);
        day.dataset.iso = iso;
        day.innerHTML = `<span>${dayNum}</span>`;

        if (state.stampedDateISO === iso) day.classList.add("day--selected");

        day.addEventListener("click", () => {
          state.stampedDateISO = iso;
          saveState();

          const clicked = isoToYMD(iso);
          if (clicked) {
            if (yearSelect) yearSelect.value = String(clicked.y);
            if (monthSelect) monthSelect.value = String(clicked.m);
            updateDayOptions(clicked.y, clicked.m);
            if (daySelect) daySelect.value = String(clicked.d);
          }

          Array.from(calendarEl.querySelectorAll(".day")).forEach((b) => {
            b.classList.toggle("day--selected", b.dataset.iso === iso);
          });

          showStamp(iso);
        });
      }

      calendarEl.appendChild(day);
    }
  }

  function syncStateFromControls() {
    const iso = isoFromSelectedControls();
    if (!iso) return;
    state.stampedDateISO = iso;
    saveState();
    showStamp(iso);

    if (calendarEl) {
      Array.from(calendarEl.querySelectorAll(".day")).forEach((b) => {
        b.classList.toggle("day--selected", b.dataset.iso === iso);
      });
    }
  }

  function initCalendarControlsListeners() {
    if (!monthSelect || !daySelect || !yearSelect || !intervalSelect) return;

    monthSelect.addEventListener("change", () => {
      updateDayOptions(Number(yearSelect.value), Number(monthSelect.value));
      syncStateFromControls();
      renderCalendar();
    });

    yearSelect.addEventListener("change", () => {
      updateDayOptions(Number(yearSelect.value), Number(monthSelect.value));
      syncStateFromControls();
      renderCalendar();
    });

    daySelect.addEventListener("change", () => {
      syncStateFromControls();
      Array.from(calendarEl.querySelectorAll(".day")).forEach((b) => {
        b.classList.toggle("day--selected", b.dataset.iso === state.stampedDateISO);
      });
    });

    const shiftViewByMonths = (delta) => {
      const baseISO = isoFromSelectedControls() || state.stampedDateISO;
      const base = baseISO ? isoToYMD(baseISO) : null;
      const now = new Date();

      const y = base?.y ?? now.getFullYear();
      const m0 = base?.m ? base.m - 1 : now.getMonth();

      const next = new Date(y, m0 + delta, 1);
      const nextY = next.getFullYear();
      const nextM1 = next.getMonth() + 1;

      if (yearSelect) yearSelect.value = String(nextY);
      if (monthSelect) monthSelect.value = String(nextM1);
      updateDayOptions(nextY, nextM1);

      syncStateFromControls();
      renderCalendar();
    };

    els.calPrevBtn?.addEventListener("click", () => shiftViewByMonths(-1));
    els.calNextBtn?.addEventListener("click", () => shiftViewByMonths(1));

    const onInterval = () => {
      state.interval = intervalSelect.value;
      saveState();
      if (state.stampedDateISO) showStamp(state.stampedDateISO);
    };

    intervalSelect.addEventListener("input", onInterval);
    intervalSelect.addEventListener("change", onInterval);
  }

  function makeStampConfetti() {
    const confetti = document.getElementById("confetti");
    if (!confetti) return;

    confetti.innerHTML = "";
    const colors = ["#ff4da6", "#7c5cff", "#27d7a6", "#ffd166", "#ffffff"];

    const pieces = 18;
    for (let i = 0; i < pieces; i++) {
      const p = document.createElement("div");
      p.className = "confetti-piece";
      p.style.left = `${Math.random() * 92 + 4}%`;
      p.style.background = colors[Math.floor(Math.random() * colors.length)];
      p.style.transform = `translateY(0) rotate(${Math.random() * 180}deg) scale(${0.6 + Math.random() * 0.5})`;
      p.style.animationDelay = `${Math.random() * 120}ms`;
      confetti.appendChild(p);
    }
  }

  function onConfirm() {
    loadState();

    if (!state.stampedDateISO) {
      stampNote.style.color = "rgba(255,77,166,.9)";
      stampNote.textContent = "Choose a date to stamp first 💕";
      return;
    }

    const choice = state.choice ? `You picked: ${state.choice}.` : "";
    const open = state.openEnded ? `Your note: “${state.openEnded}”.` : "";
    const interval = state.interval || "evening";
    const stamped = `Stamped: ${formatHuman(state.stampedDateISO)} (${intervalLabel(interval)}).`;

    summary.textContent = [choice, open, stamped].filter(Boolean).join(" ");
    setActive("final");
  }

  function wire() {
    // Form submit (landing -> stamp page)
    formDate?.addEventListener("submit", (e) => {
      e.preventDefault();

      if (!state.choice) {
        stampNote.textContent = "Pick one option first 💖";
        stampNote.style.color = "rgba(255,77,166,.9)";
        return;
      }

      state.openEnded = (els.openEnded?.value || "").trim();
      saveState();

      setActive("stamp");
      // initialize on each submit to keep UI fresh
      renderCalendar();
      initCalendarControlsListeners();

      if (state.stampedDateISO) showStamp(state.stampedDateISO);
    });

    if (btnConfirm) {
      btnConfirm.addEventListener("click", () => {
        if (!state.stampedDateISO) loadState();

        if (!state.stampedDateISO) {
          stampNote.style.color = "rgba(255,77,166,.9)";
          stampNote.textContent = "Choose a date to stamp first 💕";
          return;
        }

        const interval = state.interval || "evening";
        stampNote.style.color = "rgba(255,255,255,.9)";
        stampNote.textContent = `Confirmed: ${formatHuman(state.stampedDateISO)} — ${intervalLabel(interval)}.`;

        if (stampTextEl) stampTextEl.textContent = "💘 DATE SET 💘";

        stamp.classList.remove("stamp--show");
        void stamp.offsetWidth;
        stamp.classList.add("stamp--show");

        makeStampConfetti();
        onConfirm();
      });
    }

    // reset handled in main.js
  }

  wire();

  return {
    renderCalendar,
    showStamp,
  };
}

