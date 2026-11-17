import { STATES } from "./content.js";
import { buildSeed } from "./logic.js";
import { esc } from "./money.js";
import { errLine, field, h1, selectField } from "./ui.js";

export function render(route, api) {
  if (route.path === "/me/plan") return planPage();
  if (route.path === "/me/data") return dataPage(api);
  if (route.path !== "/me") return "";
  const p = api.state.profile;
  const initial = (p.name || "N").trim().charAt(0).toUpperCase();
  return `<div class="page">
    ${h1("Profile", "On this phone")}
    <section class="card card--green">
      <div class="row">
        <div class="hero-num" style="width:64px;height:64px;border-radius:20px;display:grid;place-items:center;background:rgba(255,255,255,.1);font-size:28px">${esc(initial)}</div>
        <div><b>${esc(p.name || "Friend")}</b><p class="muted">${esc([p.city, p.state].filter(Boolean).join(", ") || "Add your state when you like")}</p></div>
      </div>
      <p class="muted" style="margin-top:10px">Free plan · Premium is not taking payment yet</p>
    </section>
    <form class="card stack" data-action="profile-save">
      ${field({ label: "Name", name: "name", value: p.name })}
      ${selectField("State", "state", p.state, [{ value: "", label: "Select a state" }, ...STATES])}
      ${field({ label: "City or area", name: "city", value: p.city })}
      ${field({ label: "People you cook for", name: "household", value: p.household || 4, type: "number", inputmode: "numeric" })}
      ${field({ label: "Phone, for receipts and promos", name: "phone", value: p.phone, inputmode: "tel" })}
      ${field({ label: "Business name", name: "businessName", value: p.businessName })}
      ${errLine()}
      <button class="btn btn--gold" type="submit">Save profile</button>
    </form>
    <a class="item" href="#/me/plan"><b>Free, Plus and Pro</b><small>₦0, ₦500 and ₦1,000 — test prices. No card.</small></a>
    <a class="item" href="#/me/data"><b>Your data</b><small>Export, restore or delete everything on this phone.</small></a>
    <section class="card stack">
      <h2>Add to your home screen</h2>
      <p class="lede">NaijaPocket works in the browser and can be installed. On iPhone: Share, then Add to Home Screen. On Android: use the button if your browser offers it, or the browser menu.</p>
      <button class="btn btn--gold" type="button" data-action="install-app">Install NaijaPocket</button>
      <p class="hint" id="install-hint"></p>
    </section>
    <section class="card stack">
      <h2>About</h2>
      <p class="lede">NaijaPocket helps Nigerians plan spending, keep their own notes on opportunities, run a small record book, spot scam patterns and keep simple health reminders. It is made for Coach Ayodeb and the Mega Success Team, Akure.</p>
      <p class="lede">It is not a bank, a job board, a hospital or a guarantee against fraud.</p>
      <a class="btn btn--line" href="../privacy.html">Privacy notice</a>
      <a class="btn btn--line" href="../#join">Early-access list</a>
      <a class="btn btn--line" href="../">Back to the landing page</a>
    </section>
  </div>`;
}

function planPage() {
  const plans = [
    ["Free", "₦0", "What works today", ["Monthly budget, food week, shopping list, savings goals and tips", "Your own prices, opportunities, CV and application tracker", "Record book, profit calculator, pricing helper, receipts and four promo templates", "All of PocketSafe", "Budget meals, reminders, first aid and places you save"], false],
    ["Pocket Plus", "₦500", "per month, test price", ["Everything free", "Extra meal-plan weeks", "Extra promo templates and cover-letter styles", "Price alerts when you log a lower price"], true],
    ["Pocket Pro", "₦1,000", "per month, test price", ["Everything in Plus", "Month-to-month business report", "Higher limits as accounts arrive later"], true]
  ];
  return `<div class="page">
    ${h1("Plans", "No payment yet")}
    <p class="lede">You are on Free. Plus and Pro are shown so you can see the test prices. We are not charging anyone. Joining the waitlist uses the early-access form on the landing page.</p>
    ${plans.map(([name, price, period, items, premium]) => `<article class="card stack ${name === "Pocket Plus" ? "card--green" : ""}">
      <p class="kicker">${premium ? "Coming soon" : "Your plan"}</p>
      <h2>${name}</h2>
      <p class="hero-num" style="font-size:36px">${price} <small style="font-size:14px">${period}</small></p>
      <ul>${items.map((item) => `<li>${item}</li>`).join("")}</ul>
      ${premium ? `<a class="btn ${name === "Pocket Plus" ? "btn--gold" : "btn--line"}" href="../#join">Join the waitlist</a>` : `<p class="hint">This is the plan already open in the app.</p>`}
    </article>`).join("")}
  </div>`;
}

function dataPage(api) {
  const counts = [
    ["Budgets", api.state.budgets.length],
    ["Prices", api.state.prices.length],
    ["Opportunities", api.state.opportunities.length],
    ["Sales", api.state.sales.length],
    ["Reminders", api.state.reminders.length]
  ];
  return `<div class="page">
    ${h1("Your data", "On this device")}
    <p class="lede">Nothing here is sent to a server. If you clear this browser's data, the notes are gone unless you exported them.</p>
    <section class="card">${counts.map(([name, n]) => `<p class="split"><span>${name}</span><b>${n}</b></p>`).join("")}</section>
    <button class="btn btn--gold" type="button" data-action="export-data">Download a backup</button>
    <form class="card stack" data-action="import-data">
      <h2>Restore a backup</h2>
      <label class="field"><span>NaijaPocket JSON file</span><input name="file" type="file" accept="application/json,.json"></label>
      ${errLine()}
      <button class="btn btn--line" type="submit">Replace what is on this phone</button>
    </form>
    <button class="btn btn--line" type="button" data-action="restore-examples">Put the example cards back</button>
    <form class="card stack" data-action="wipe-data">
      <h2>Delete everything</h2>
      <p class="lede">Type DELETE to remove budgets, prices, listings, the record book and reminders from this browser.</p>
      ${field({ label: "Confirmation", name: "confirm", placeholder: "DELETE" })}
      ${errLine()}
      <button class="btn btn--danger" type="submit">Delete all data on this phone</button>
    </form>
  </div>`;
}

export const actions = {
  async "profile-save"(api, form, data) {
    const household = Math.max(1, Math.min(20, parseInt(data.get("household"), 10) || 1));
    await api.save("profile", {
      ...api.state.profile,
      name: String(data.get("name") || "").trim(),
      state: String(data.get("state") || ""),
      city: String(data.get("city") || "").trim(),
      household,
      phone: String(data.get("phone") || "").trim(),
      businessName: String(data.get("businessName") || "").trim(),
      onboarded: true
    });
    api.toast("Profile saved on this phone.");
  },
  async "export-data"(api) {
    const payload = await api.repo.exportAll();
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "naijapocket-backup.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    api.toast("Backup downloaded. Keep that file private.");
  },
  async "import-data"(api, form, data) {
    const file = data.get("file");
    if (!file || !file.size) return api.formError(form, "Choose a backup file first.");
    let payload;
    try {
      payload = JSON.parse(await file.text());
    } catch {
      return api.formError(form, "That file is not valid JSON.");
    }
    if (payload?.app !== "naijapocket" || !payload.stores) return api.formError(form, "This is not a NaijaPocket backup.");
    await api.repo.replaceAll(payload);
    await api.reload();
    api.toast("Backup restored on this phone.");
    api.go("/me");
  },
  async "restore-examples"(api) {
    const seed = buildSeed();
    for (const [store, rows] of Object.entries(seed)) {
      for (const row of rows) {
        if (!api.state[store].some((item) => item.id === row.id)) await api.save(store, row);
      }
    }
    api.toast("Example cards are back. They are still not real.");
    api.rerender();
  },
  async "wipe-data"(api, form, data) {
    if (String(data.get("confirm") || "") !== "DELETE") return api.formError(form, "Type DELETE in capital letters.");
    await api.repo.wipe();
    await api.save("meta", { id: "app", seeded: true, wiped: true });
    await api.reload();
    api.toast("Everything on this phone was deleted.");
    api.go("/home");
  },
  async "install-app"(api) {
    const hint = document.getElementById("install-hint");
    if (api.installEvent) {
      api.installEvent.prompt();
      const choice = await api.installEvent.userChoice;
      api.installEvent = null;
      if (hint) hint.textContent = choice.outcome === "accepted" ? "Installed." : "Install dismissed.";
      return;
    }
    if (hint) hint.textContent = "If you do not see a prompt, open the browser menu and choose Add to Home screen or Install app.";
  }
};
