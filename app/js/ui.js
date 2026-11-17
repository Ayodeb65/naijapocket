import { esc } from "./money.js";

export { esc };

const ICONS = {
  home: '<path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>',
  save: '<path d="M4 7.5h16l-1.4 11.2a2 2 0 0 1-2 1.8H7.4a2 2 0 0 1-2-1.8zM8 7.5 11 3M16 7.5 13 3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
  jobs: '<path d="M4 8h16v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zM9 8V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
  tools: '<path d="M14.5 5.5a3.5 3.5 0 0 0-4.9 4.4L4 15.5 8.5 20l5.6-5.6a3.5 3.5 0 0 0 4.4-4.9L16 12l-2-2z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>',
  me: '<circle cx="12" cy="8" r="3.2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M5 19.2c1.4-3 3.8-4.5 7-4.5s5.6 1.5 7 4.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
  back: '<path d="M15 5 8 12l7 7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>',
  shield: '<path d="M12 3 19 6v6c0 4.2-2.8 7.4-7 8.8C7.8 19.4 5 16.2 5 12V6z" fill="none" stroke="currentColor" stroke-width="1.8"/>',
  heart: '<path d="M12 19s-6.5-3.8-6.5-8.2A3.6 3.6 0 0 1 12 8a3.6 3.6 0 0 1 6.5 2.8C18.5 15.2 12 19 12 19z" fill="none" stroke="currentColor" stroke-width="1.8"/>',
  megaphone: '<path d="M4 10v4h3l5 3V7L7 10zm9-1a4 4 0 0 1 0 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
  plus: '<path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>'
};

export function icon(name) {
  return `<svg class="ico" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] || ""}</svg>`;
}

export function parentPath(path) {
  if (path.startsWith("/save/")) return "/save";
  if (path.startsWith("/jobs/")) return "/jobs";
  if (path.startsWith("/biz/")) return "/biz";
  if (path.startsWith("/safe/")) return "/safe";
  if (path.startsWith("/health/")) return "/health";
  if (path.startsWith("/me/")) return "/me";
  if (path === "/biz" || path === "/safe" || path === "/health" || path === "/start") return path === "/start" ? "/home" : "/tools";
  return "/home";
}

const TITLES = {
  "/home": "Home",
  "/start": "Set up",
  "/save": "PocketSaver",
  "/save/budget": "Monthly budget",
  "/save/food": "Food week",
  "/save/prices": "Market prices",
  "/save/list": "Shopping list",
  "/save/goals": "Savings goals",
  "/save/tips": "Money tips",
  "/save/report": "Weekly report",
  "/jobs": "PocketJobs",
  "/jobs/new": "Add an opportunity",
  "/jobs/item": "Opportunity",
  "/jobs/cv": "CV builder",
  "/jobs/track": "Applications",
  "/jobs/skills": "Skill tips",
  "/tools": "Tools",
  "/biz": "PocketBusiness",
  "/biz/book": "Record book",
  "/biz/profit": "Profit calculator",
  "/biz/invoice": "Receipts",
  "/biz/invoice/edit": "Receipt",
  "/biz/price": "Pricing helper",
  "/biz/promo": "Promo writer",
  "/safe": "PocketSafe",
  "/safe/message": "Check a message",
  "/safe/link": "Check a link",
  "/safe/types": "Scam types",
  "/safe/quiz": "Red-flag quiz",
  "/safe/checklist": "Before you transfer",
  "/safe/report": "How to report",
  "/health": "PocketHealth",
  "/health/meals": "Budget meals",
  "/health/reminders": "Reminders",
  "/health/aid": "First aid",
  "/health/care": "Finding care",
  "/me": "Profile",
  "/me/plan": "Plans",
  "/me/data": "Your data"
};

export function titleFor(path) {
  return TITLES[path] || "NaijaPocket";
}

export function isRoot(path) {
  return ["/home", "/save", "/jobs", "/tools", "/me"].includes(path);
}

export function tabFor(path) {
  if (path.startsWith("/save")) return "save";
  if (path.startsWith("/jobs")) return "jobs";
  if (path === "/tools" || path.startsWith("/biz") || path.startsWith("/safe") || path.startsWith("/health")) return "tools";
  if (path.startsWith("/me")) return "me";
  return "home";
}

const TABS = [
  ["home", "/home", "Home"],
  ["save", "/save", "Save"],
  ["jobs", "/jobs", "Jobs"],
  ["tools", "/tools", "Tools"],
  ["me", "/me", "Profile"]
];

export function renderTabs(path) {
  const on = tabFor(path);
  return TABS.map(([id, href, label]) =>
    `<a class="tab${on === id ? " on" : ""}" href="#${href}"${on === id ? ' aria-current="page"' : ""}>${icon(id)}<span>${label}</span></a>`
  ).join("");
}

export function renderSide(path) {
  const on = tabFor(path);
  return `<a class="brand" href="#/home"><img src="../assets/logo-mark.svg" alt=""><b>Naija<span>Pocket</span></b></a>` +
    TABS.map(([id, href, label]) =>
      `<a class="side-link${on === id ? " on" : ""}" href="#${href}"${on === id ? ' aria-current="page"' : ""}>${icon(id)}<span>${label}</span></a>`
    ).join("") +
    `<p class="muted" style="margin-top:auto;padding:12px;color:rgba(255,255,255,.55);font-size:13px">More value. Less spending. Better living.</p>`;
}

export function renderTopbar(route, online) {
  const path = route.path;
  const root = isRoot(path);
  const back = root ? `<a class="brand" href="#/home"><img src="../assets/logo-mark.svg" alt=""><b>Naija<span>Pocket</span></b></a>`
    : `<a class="back" href="#${parentPath(path)}" aria-label="Back">${icon("back")}</a><h1>${esc(titleFor(path))}</h1>`;
  const net = `<span class="net${online ? "" : " off"}">${online ? "On this phone" : "Offline"}</span>`;
  return `${back}<span class="spacer"></span>${net}`;
}

export function h1(text, kicker) {
  return `<header class="page-head">${kicker ? `<p class="kicker">${esc(kicker)}</p>` : ""}<h1 id="page-title" tabindex="-1">${esc(text)}</h1></header>`;
}

export function badge(kind) {
  if (kind === "example") return `<span class="badge badge--ex">Example</span>`;
  if (kind === "estimate") return `<span class="badge badge--est">My estimate</span>`;
  if (kind === "entry" || kind === "yours") return `<span class="badge badge--you">Mine</span>`;
  return "";
}

export function freeBadge() {
  return `<span class="badge badge--free">Free</span>`;
}
export function plusBadge() {
  return `<span class="badge badge--plus">Premium</span>`;
}

export function field({ label, name, value = "", type = "text", placeholder = "", hint = "", inputmode = "", required = false }) {
  return `<label class="field"><span>${esc(label)}</span><input name="${esc(name)}" type="${esc(type)}" value="${esc(value)}" placeholder="${esc(placeholder)}" ${inputmode ? `inputmode="${esc(inputmode)}"` : ""} ${required ? "required" : ""}>${hint ? `<small class="hint">${esc(hint)}</small>` : ""}</label>`;
}

export function area({ label, name, value = "", placeholder = "", hint = "" }) {
  return `<label class="field"><span>${esc(label)}</span><textarea name="${esc(name)}" placeholder="${esc(placeholder)}">${esc(value)}</textarea>${hint ? `<small class="hint">${esc(hint)}</small>` : ""}</label>`;
}

export function moneyField(label, name, value = "") {
  return `<label class="field"><span>${esc(label)}</span><span class="money-in"><b>₦</b><input name="${esc(name)}" inputmode="decimal" value="${esc(value)}" placeholder="0" autocomplete="off"></span></label>`;
}

export function selectField(label, name, value, options, hint = "") {
  const opts = options.map((opt) => {
    const v = typeof opt === "string" ? opt : opt.value;
    const text = typeof opt === "string" ? opt : opt.label;
    return `<option value="${esc(v)}"${String(v) === String(value) ? " selected" : ""}>${esc(text)}</option>`;
  }).join("");
  return `<label class="field"><span>${esc(label)}</span><select name="${esc(name)}">${opts}</select>${hint ? `<small class="hint">${esc(hint)}</small>` : ""}</label>`;
}

export function errLine() {
  return `<p class="form-err" role="alert"></p>`;
}

export function empty(title, text) {
  return `<div class="empty"><div class="ico">${icon("save")}</div><b>${esc(title)}</b><p class="muted">${esc(text)}</p></div>`;
}

export function bar(pct, hot) {
  const width = Math.max(0, Math.min(100, pct || 0));
  const cls = hot ? "hot" : width >= 85 ? "warn" : "";
  return `<div class="bar" role="progressbar" aria-valuenow="${width}" aria-valuemin="0" aria-valuemax="100"><span class="${cls}" style="width:${width}%"></span></div>`;
}

export function waLink(text) {
  return "https://wa.me/?text=" + encodeURIComponent(text);
}
