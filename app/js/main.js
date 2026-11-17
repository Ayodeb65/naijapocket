import { createMemoryRepo, defaultCv, defaultProfile, loadState, openRepo } from "./db.js";
import { dueReminders } from "./health.js";
import { buildSeed } from "./logic.js";
import { esc, todayISO, uid } from "./money.js";
import { renderSide, renderTabs, renderTopbar } from "./ui.js";
import * as home from "./home.js";
import * as saver from "./saver.js";
import * as jobs from "./jobs.js";
import * as business from "./business.js";
import * as safe from "./safe.js";
import * as health from "./health.js";
import * as profile from "./profile.js";

const pages = [home, saver, jobs, business, safe, health, profile];
const actions = Object.assign({
  "close-sheet"(api) { api.closeSheet(); },
  premium(api, el) { api.premium(el.dataset.feature || "This feature"); },
  "print-page"() { window.print(); }
}, home.actions, saver.actions, jobs.actions, business.actions, safe.actions, health.actions, profile.actions);

const state = {
  ready: false,
  memory: false,
  online: navigator.onLine,
  route: { path: "/home", params: {} },
  meta: { id: "app", seeded: false },
  profile: defaultProfile(),
  cv: defaultCv(),
  budgets: [], prices: [], lists: [], goals: [], challenges: [],
  opportunities: [], applications: [], sales: [], expenses: [], invoices: [],
  reminders: [], places: [], reports: [], checks: [], plans: [],
  letter: "", quizResult: null, lastCheck: null, lastLink: null, promo: null, priceResult: null
};

let repo;
let toastTimer;
const api = {
  state,
  repo: null,
  installEvent: null,
  async save(store, record) {
    if (!record.id) record.id = uid();
    record.updatedAt = new Date().toISOString();
    await repo.put(store, record);
    if (store === "profile") state.profile = record;
    else if (store === "cv") state.cv = record;
    else if (store === "meta") state.meta = record;
    else {
      const list = state[store];
      const index = list.findIndex((row) => row.id === record.id);
      if (index >= 0) list[index] = record;
      else list.unshift(record);
    }
    return record;
  },
  async remove(store, id) {
    await repo.remove(store, id);
    if (state[store]) state[store] = state[store].filter((row) => row.id !== id);
  },
  async reload() {
    const loaded = await loadState(repo);
    Object.assign(state, loaded);
  },
  go(path) {
    const next = path.startsWith("#") ? path : "#" + (path.startsWith("/") ? path : "/" + path);
    if (location.hash === next) {
      state.route = parseHash();
      render({ scroll: "top" });
      return;
    }
    location.hash = next;
  },
  rerender() { render({ scroll: "keep" }); },
  toast(message) {
    const el = document.getElementById("toast");
    el.textContent = message;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 3200);
  },
  sheet(html) {
    const dlg = document.getElementById("sheet");
    dlg.innerHTML = html;
    if (!dlg.open) dlg.showModal();
    dlg.querySelector("input, select, textarea")?.focus();
  },
  closeSheet() {
    const dlg = document.getElementById("sheet");
    if (dlg.open) dlg.close();
  },
  premium(feature) {
    api.sheet(`<form class="sheet__pad">
      <h2 id="sheet-title">Premium coming soon</h2>
      <p class="lede">${esc(feature)} is part of Pocket Plus (₦500 a month) or Pocket Pro (₦1,000 a month). Those are test prices. NaijaPocket is not taking payment.</p>
      <a class="btn btn--gold btn--block" href="../#join">Join the waitlist</a>
      <button class="btn btn--line btn--block" type="button" data-action="close-sheet">Keep using the free app</button>
    </form>`);
  },
  formError(form, message) {
    const el = form.querySelector(".form-err");
    if (el) el.textContent = message;
  }
};

function parseHash() {
  let raw = (location.hash || "").replace(/^#/, "");
  if (!raw || raw === "/") raw = "/home";
  const [path, qs] = raw.split("?");
  const params = Object.fromEntries(new URLSearchParams(qs || ""));
  return { path: path.startsWith("/") ? path : "/" + path, params };
}

function render({ scroll } = { scroll: "top" }) {
  const view = document.getElementById("view");
  const y = scroll === "keep" ? view.scrollTop : 0;
  let html = "";
  for (const page of pages) {
    const part = page.render(state.route, api);
    if (part) { html = part; break; }
  }
  if (!html) {
    html = `<div class="page"><h1 id="page-title" tabindex="-1">That page is not here</h1><p class="lede">The link does not match a NaijaPocket tool.</p><a class="btn btn--gold" href="#/home">Go home</a></div>`;
  }
  view.innerHTML = html;
  view.scrollTop = y;
  document.getElementById("topbar").innerHTML = renderTopbar(state.route, state.online);
  document.getElementById("tabbar").innerHTML = renderTabs(state.route.path);
  document.getElementById("sidebar").innerHTML = renderSide(state.route.path);
  if (scroll !== "keep") document.getElementById("page-title")?.focus({ preventScroll: true });
}

async function boot() {
  try {
    repo = await openRepo();
  } catch {
    repo = createMemoryRepo();
  }
  api.repo = repo;
  state.memory = repo.memory;
  Object.assign(state, await loadState(repo));
  if (!state.meta.seeded) {
    const seed = buildSeed();
    for (const [store, rows] of Object.entries(seed)) {
      for (const row of rows) await repo.put(store, row);
    }
    const meta = { id: "app", seeded: true, createdAt: new Date().toISOString() };
    await repo.put("meta", meta);
    Object.assign(state, await loadState(repo));
  }
  state.ready = true;
  state.route = parseHash();
  if (!location.hash) history.replaceState(null, "", "#/home");
  render({ scroll: "top" });
  document.getElementById("boot")?.remove();
}

function remind() {
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  const due = dueReminders(state.reminders);
  due.forEach((row) => {
    const stamp = todayISO() + "T" + String(row.time).slice(0, 5);
    row.notifiedAt = stamp;
    repo.put("reminders", { ...row }).catch(() => {});
    try {
      new Notification("NaijaPocket reminder", { body: row.title + " — you set this. It is not medical advice.", tag: row.id + stamp });
    } catch { /* some browsers block the constructor */ }
  });
}

document.body.addEventListener("click", (event) => {
  const el = event.target.closest("[data-action]");
  if (!el || el.tagName === "FORM" || !actions[el.dataset.action]) return;
  try {
    Promise.resolve(actions[el.dataset.action](api, el, null)).catch(() => {
      api.toast("That did not save. Please try again.");
    });
  } catch {
    api.toast("That did not save. Please try again.");
  }
});

document.body.addEventListener("submit", (event) => {
  const form = event.target;
  if (!(form instanceof HTMLFormElement) || !form.dataset.action) return;
  event.preventDefault();
  const data = new FormData(form);
  const fn = actions[form.dataset.action];
  if (!fn) return;
  try {
    Promise.resolve(fn(api, form, data)).catch(() => {
      api.toast("That did not save. Please try again.");
    });
  } catch {
    api.toast("That did not save. Please try again.");
  }
});

document.body.addEventListener("change", (event) => {
  const el = event.target.closest("[data-change]");
  if (!el || !actions[el.dataset.change]) return;
  Promise.resolve(actions[el.dataset.change](api, el, null)).catch(() => {
    api.toast("That did not update.");
  });
});

window.addEventListener("hashchange", () => {
  state.route = parseHash();
  api.closeSheet();
  render({ scroll: "top" });
});

window.addEventListener("online", () => { state.online = true; render({ scroll: "keep" }); });
window.addEventListener("offline", () => { state.online = false; render({ scroll: "keep" }); });

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  api.installEvent = event;
});

document.getElementById("sheet").addEventListener("click", (event) => {
  if (event.target.id === "sheet") api.closeSheet();
});

boot().catch(() => {
  const bootEl = document.getElementById("boot");
  if (bootEl) bootEl.innerHTML = `<p>NaijaPocket could not open storage in this browser.</p><button class="btn btn--gold" type="button" onclick="location.reload()">Try again</button>`;
});

setInterval(remind, 20000);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}
