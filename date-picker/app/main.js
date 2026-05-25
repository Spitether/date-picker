import { initLanding } from "./landing.js";
import { initDatePage } from "./datePage.js";
import { initStamp } from "./calendar.js";
import { clearState } from "./state.js";

function getEls() {
  return {
    btnYes: document.getElementById("btn-yes"),
    btnNo: document.getElementById("btn-no"),
    heartsEl: document.getElementById("hearts"),

    choiceGrid: document.getElementById("choice-grid"),
    formDate: document.getElementById("form-date"),
    openEnded: document.getElementById("open-ended"),

    calendarEl: document.getElementById("calendar"),
    calPrevBtn: document.getElementById("cal-prev"),
    calNextBtn: document.getElementById("cal-next"),
    calHeaderMonthEl: document.getElementById("cal-header-month"),

    monthSelect: document.getElementById("month"),
    daySelect: document.getElementById("day"),
    yearSelect: document.getElementById("year"),
    intervalSelect: document.getElementById("interval"),

    stamp: document.getElementById("stamp"),
    stampNote: document.getElementById("stamp-note"),
    stampTextEl: document.getElementById("stamp-text"),

    btnConfirm: document.getElementById("btn-confirm"),

    summary: document.getElementById("summary"),
    btnReset: document.getElementById("btn-reset"),
  };
}

const STORAGE_PAGES = {
  landing: document.getElementById("page-landing"),
  date: document.getElementById("page-date"),
  stamp: document.getElementById("page-stamp"),
  final: document.getElementById("page-final"),
};

const pages = STORAGE_PAGES;

function setActive(pageName) {
  Object.values(pages).forEach((el) => el.classList.remove("page--active"));
  pages[pageName].classList.add("page--active");
}

const els = getEls();

function initDatePageWrapper() {
  initDatePage({ els });
}

function resetAll() {
  clearState();
  if (els.summary) els.summary.textContent = "";
  initLandingWrapper();
}


initStamp({
  els: {
    ...els,
    setActive,
  },
});

function initLandingWrapper() {
  initLanding({
    pages,
    setActive,
    els,
    initDatePage: initDatePageWrapper,
  });
}

// reset
els.btnReset?.addEventListener("click", resetAll);

// initial
initLandingWrapper();

