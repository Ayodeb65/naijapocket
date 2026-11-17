import { STATES } from "./content.js";
import { scamForToday, summariseBudget, tipForToday } from "./logic.js";
import { formatNaira, greeting, thisMonth, todayISO } from "./money.js";
import { esc, field, freeBadge, h1, icon, moneyField, selectField, errLine } from "./ui.js";

export function render(route, api) {
  if (route.path === "/start") return setup(api);
  if (route.path === "/tools") return tools();
  if (route.path !== "/home") return "";
  const { profile, budgets, reminders, plans } = api.state;
  const name = profile.name ? profile.name.split(/\s+/)[0] : "";
  const month = thisMonth();
  const budget = budgets.find((b) => b.month === month);
  const summary = budget ? summariseBudget(budget) : null;
  const tip = tipForToday();
  const scam = scamForToday();
  const due = reminders.filter((r) => r.enabled !== false && r.lastDone !== todayISO());
  const plan = plans.find((p) => p.id === "latest");

  return `<div class="page">
    <header class="page-head">
      <p class="kicker">More value. Less spending.</p>
      <h1 id="page-title" tabindex="-1">${esc(greeting())}${name ? ", " + esc(name) : ""}.</h1>
      <p class="lede">Your plans stay on this phone. NaijaPocket does not hold your money, and it is not a bank.</p>
    </header>
    ${profile.onboarded ? "" : `<section class="card card--gold">
      <p class="kicker">One minute</p>
      <h2>Tell us your state and household</h2>
      <p class="lede">You can use every tool without this. It only personalises the greeting and the food planner.</p>
      <div class="row" style="margin-top:12px">
        <a class="btn btn--gold" href="#/start">Set up</a>
        <button class="btn btn--line" type="button" data-action="skip-setup">Skip</button>
      </div>
    </section>`}
    ${api.state.memory ? `<aside class="note note--warn"><strong>Saving is off in this browser.</strong> You can still try the tools, but entries disappear when you close the tab.</aside>` : ""}
    <section class="card card--green">
      <p class="kicker">This month</p>
      ${summary ? `<p class="hero-num"><small>${summary.left >= 0 ? "Left from what you recorded" : "Over the income you recorded"}</small>${summary.left < 0 ? `<span class="over">${formatNaira(summary.left)}</span>` : formatNaira(summary.left)}</p>
        <p class="muted" style="margin-top:8px">Income ${formatNaira(summary.income)} · Spent ${formatNaira(summary.spent)}</p>`
        : `<p class="hero-num"><small>No budget yet</small>Start with what comes in.</p>`}
      <a class="btn btn--gold btn--block" style="margin-top:14px" href="#/save/budget">Open monthly budget</a>
    </section>
    <section class="card">
      <div class="spread"><p class="kicker">Today's tip</p>${freeBadge()}</div>
      <h2 style="margin:6px 0">${esc(tip.title)}</h2>
      <p class="lede">${esc(tip.body)}</p>
      <a class="btn btn--line btn--sm" style="margin-top:10px" href="#/save/tips">More tips</a>
    </section>
    <div class="quick">
      <a href="#/save/food">${icon("save")}<b>Plan food week</b><small class="sub">${plan ? "Plan saved on this phone" : "Meals from your budget"}</small></a>
      <a href="#/save/prices">${icon("plus")}<b>Log a price</b><small class="sub">Your note, not a live quote</small></a>
      <a href="#/jobs">${icon("jobs")}<b>Opportunities</b><small class="sub">Examples are marked</small></a>
      <a href="#/safe/message">${icon("shield")}<b>Check a message</b><small class="sub">Free, always</small></a>
    </div>
    <section class="card">
      <p class="kicker">Scam warning</p>
      <h2 style="margin:6px 0">${esc(scam.title)}</h2>
      <p class="lede">${esc(scam.summary)}</p>
      <a class="btn btn--line btn--sm" style="margin-top:10px" href="#/safe/types">See the warning signs</a>
    </section>
    ${due.length ? `<section class="card">
      <p class="kicker">Reminders</p>
      <div class="list" style="margin-top:8px">${due.slice(0, 3).map((r) => `<div class="item"><b>${esc(r.title)}</b><small>${esc(r.time || "Anytime")} · you set this</small></div>`).join("")}</div>
      <a class="btn btn--line btn--sm" style="margin-top:10px" href="#/health/reminders">Open reminders</a>
    </section>` : ""}
    <aside class="note"><strong>Example cards are not live data.</strong> Sample prices, sample opportunities and the sample clinic are placeholders so you can click around. Edit or delete them. NaijaPocket does not fetch market prices or job boards.</aside>
  </div>`;
}

function tools() {
  const cards = [
    ["/biz", "PocketBusiness", "Record sales and expenses, price a product, write a receipt, and draft a WhatsApp promo.", "megaphone"],
    ["/safe", "PocketSafe", "Learn common scam patterns, check a message or link, and see where to report. Always free.", "shield"],
    ["/health", "PocketHealth", "Budget meal ideas, reminders you write yourself, first aid and places you know. Not medical advice.", "heart"]
  ];
  return `<div class="page">
    ${h1("Tools", "Three more pockets")}
    <p class="lede">Business, safety and health. Safety information is never locked. Health tools are general information, not a clinic.</p>
    ${cards.map(([href, title, text, name]) => `<a class="tool" href="#${href}">${icon(name)}<b>${title}</b><small class="sub">${text}</small></a>`).join("")}
  </div>`;
}

function setup(api) {
  const p = api.state.profile;
  const interests = new Set(p.interests || []);
  const boxes = ["PocketSaver", "PocketJobs", "PocketBusiness", "PocketSafe", "PocketHealth"].map((name) =>
    `<label class="check"><input type="checkbox" name="interests" value="${name}"${interests.has(name) ? " checked" : ""}><span>${name}</span></label>`
  ).join("");
  return `<div class="page">
    ${h1("Set up on this phone", "No account needed")}
    <p class="lede">We do not create a login. This stays in your browser. You can skip anything.</p>
    <form class="card stack" data-action="save-setup">
      ${field({ label: "What should we call you?", name: "name", value: p.name, placeholder: "e.g. Amaka" })}
      ${selectField("State", "state", p.state, [{ value: "", label: "Select a state" }, ...STATES])}
      ${field({ label: "City or area", name: "city", value: p.city, placeholder: "e.g. Akure" })}
      ${field({ label: "People you cook for", name: "household", value: p.household || 4, type: "number", inputmode: "numeric" })}
      <fieldset class="field"><legend>What do you want help with?</legend><div class="checks">${boxes}</div></fieldset>
      ${errLine()}
      <button class="btn btn--gold btn--block" type="submit">Save on this phone</button>
    </form>
  </div>`;
}

export const actions = {
  async "skip-setup"(api) {
    const profile = { ...api.state.profile, onboarded: true };
    await api.save("profile", profile);
    api.toast("You can set this later in Profile.");
    api.rerender();
  },
  async "save-setup"(api, form, data) {
    const household = Math.max(1, Math.min(20, parseInt(data.get("household"), 10) || 4));
    const profile = {
      ...api.state.profile,
      name: String(data.get("name") || "").trim(),
      state: String(data.get("state") || ""),
      city: String(data.get("city") || "").trim(),
      household,
      interests: data.getAll("interests"),
      onboarded: true
    };
    await api.save("profile", profile);
    if (api.state.cv && !api.state.cv.name && profile.name) {
      await api.save("cv", { ...api.state.cv, name: profile.name, city: profile.city, state: profile.state });
    }
    api.toast("Saved on this phone.");
    api.go("/home");
  }
};
