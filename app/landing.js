import { state, loadState, saveState } from "./state.js";

export function initLanding({ pages, setActive, els, initDatePage }) {
  const {
    btnYes,
    btnNo,
    heartsEl,
    choiceGrid,
    formDate,
    stampNote,
  } = els;

  function initChoicesUI() {
    if (!choiceGrid) return;
    // Landing -> date page radio choices are initialized in datePage.js
  }

  function initLandingNoRunAway() {
    if (!btnNo) return;

    // Avoid stacking duplicate listeners. Recreate the node, then rebind local reference.
    btnNo.replaceWith(btnNo.cloneNode(true));
    const freshBtnNo = document.getElementById("btn-no");
    if (!freshBtnNo) return;

    let noClicks = 0;
    let justWiggled = false;

    const appRect = () => {
      const app = document.querySelector(".app");
      return app.getBoundingClientRect();
    };

    const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

    const moveNo = (avoidEl = null) => {
      noClicks += 1;
      const scale = Math.max(0.3, 1 - noClicks * 0.08);
      freshBtnNo.style.transform = `scale(${scale})`;

      const appR = appRect();
      const rect = freshBtnNo.getBoundingClientRect();

      const padding = 14;
      const maxX = appR.width - rect.width - padding;
      const maxY = appR.height - rect.height - padding;

      const bandTop = 78;
      const bandBottom = Math.min(appR.height - 140, bandTop + 190);
      const safeMinY = clamp(bandTop, padding, maxY);
      const safeMaxY = clamp(bandBottom, padding, maxY);

      const cursor = avoidEl
        ? { x: avoidEl.clientX, y: avoidEl.clientY }
        : { x: appR.left + appR.width / 2, y: appR.top + appR.height / 3 };

      let newX = padding;
      let newY = safeMinY;

      const minDist = 140;
      for (let i = 0; i < 18; i++) {
        const candidateX = Math.max(padding, Math.random() * Math.max(0, maxX));
        const candidateY = safeMinY + Math.random() * Math.max(0, safeMaxY - safeMinY);

        const candidateCenterX = appR.left + candidateX + rect.width / 2;
        const candidateCenterY = appR.top + candidateY + rect.height / 2;

        const dx = candidateCenterX - cursor.x;
        const dy = candidateCenterY - cursor.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist >= minDist) {
          newX = candidateX;
          newY = candidateY;
          break;
        }
      }

      freshBtnNo.style.position = "absolute";
      freshBtnNo.style.left = `${newX}px`;
      freshBtnNo.style.top = `${newY}px`;

      if (!justWiggled) {
        justWiggled = true;
        freshBtnNo.animate(
          [
            { transform: `scale(${scale}) rotate(-6deg)` },
            { transform: `scale(${scale}) rotate(6deg)` },
            { transform: `scale(${scale}) rotate(-3deg)` },
            { transform: `scale(${scale}) rotate(0deg)` },
          ],
          { duration: 520, easing: "ease-out" }
        );
        setTimeout(() => (justWiggled = false), 650);
      }
    };

    const boopAudio = new Audio(
      "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQAAAAA="
    );

    const booNoSad = () => {
      if (freshBtnNo) freshBtnNo.textContent = "No… please? 😢💔";
      if (stampNote) stampNote.textContent = "(no button running away… 💨)";
      try {
        boopAudio.currentTime = 0;
        boopAudio.play().catch(() => {});
      } catch {
        // ignore
      }
    };

    freshBtnNo.addEventListener("mouseenter", () => {
      moveNo();
      try {
        boopAudio.currentTime = 0;
        boopAudio.play().catch(() => {});
      } catch {}
    });

    freshBtnNo.addEventListener("click", (e) => {
      e.preventDefault();
      booNoSad();
      moveNo();
    });
  }

  function initFloatingHearts() {
    if (!heartsEl) return;

    const emojis = ["💖", "💗", "💕", "💘", "💞"];

    const spawn = () => {
      const el = document.createElement("div");
      el.className = "heart-float";
      el.textContent = emojis[Math.floor(Math.random() * emojis.length)];

      const left = 10 + Math.random() * 80;
      el.style.left = `${left}%`;

      const dur = 2.6 + Math.random() * 2.2;
      el.style.setProperty("--dur", `${dur}s`);

      const drift = (-90 + Math.random() * 180).toFixed(0);
      el.style.setProperty("--drift", `${drift}px`);

      heartsEl.appendChild(el);
      el.addEventListener("animationend", () => el.remove());
    };

    const interval = setInterval(() => {
      if (heartsEl.childElementCount > 42) return; /* more floating hearts */
      spawn();
    }, 220); /* faster spawn rate */


    const observer = new MutationObserver(() => {
      const landingActive = pages.landing.classList.contains("page--active");
      if (!landingActive) {
        clearInterval(interval);
        observer.disconnect();
      }
    });

    observer.observe(pages.landing, { attributes: true, attributeFilter: ["class"] });
  }

  function resetNoButton() {
    const currentNo = document.getElementById("btn-no");
    if (!currentNo) return;
    currentNo.style.position = "relative";
    currentNo.style.left = "";
    currentNo.style.top = "";
    currentNo.style.transform = "";
    currentNo.textContent = "Tiny NO 🙈";
  }

  loadState();
  setActive("landing");
  resetNoButton();
  initLandingNoRunAway();
  initFloatingHearts();

    // bind YES once per landing init (don’t replace btnNo while moving references around)
  btnYes?.replaceWith(btnYes.cloneNode(true));
  const freshBtnYes = document.getElementById("btn-yes");
  freshBtnYes?.addEventListener(
    "click",
    () => {
      setActive("date");
      initDatePage();
    },
    { once: true }
  );
}


