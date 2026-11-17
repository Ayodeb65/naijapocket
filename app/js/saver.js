import { PRICE_ITEMS, TIPS, UNITS } from "./content.js";
import {
  buildFoodPlan, challengeProgress, comparePrices, emptyBudget, estimateBasket, planShareText, summariseBudget
} from "./logic.js";
import { esc as rawEsc, formatDate, formatNaira, parseMoney, shiftMonth, thisMonth, todayISO, uid } from "./money.js";
import { area, badge, bar, errLine, field, freeBadge, h1, moneyField, plusBadge, selectField, waLink } from "./ui.js";

const esc = rawEsc;

export function render(route, api) {
  const path = route.path;
  if (path === "/save") return hub(api);
  if (path === "/save/budget") return budgetPage(route, api);
  if (path === "/save/food") return foodPage(api);
  if (path === "/save/prices") return pricesPage(api);
  if (path === "/save/list") return listPage(api);
  if (path === "/save/goals") return goalsPage(api);
  if (path === "/save/tips") return tipsPage(route);
  if (path === "/save/report") return reportPage(api);
  return "";
}

function hub() {
  const tools = [
    ["/save/budget", "Monthly budget", "Income, plans and what you spent, in naira."],
    ["/save/food", "Food week", "Meals for your household and a shopping list."],
    ["/save/prices", "Market prices", "Prices you type yourself. Examples are marked."],
    ["/save/list", "Shopping list", "Tick items at the market."],
    ["/save/goals", "Savings goals", "A target and a 30-day challenge. We don't hold the cash."],
    ["/save/tips", "Money tips", "Practical ideas. No miracle claims."],
    ["/save/report", "Weekly report", "Share the plan on WhatsApp."]
  ];
  return `<div class="page">
    ${h1("PocketSaver", "Cost of living")}
    <p class="lede">Plan the money you have. Every price in here is either an example or a note you wrote.</p>
    <div class="stack">${tools.map(([href, title, text]) => `<a class="item" href="#${href}"><span class="split"><b>${title}</b>${freeBadge()}</span><small>${text}</small></a>`).join("")}</div>
  </div>`;
}

function budgetPage(route, api) {
  const month = route.params.month || thisMonth();
  const budget = api.state.budgets.find((b) => b.month === month);
  const prev = shiftMonth(month, -1);
  const next = shiftMonth(month, 1);
  const nav = `<div class="spread">
    <a class="btn btn--line btn--sm" href="#/save/budget?month=${prev}">Previous</a>
    <b>${esc(labelMonth(month))}</b>
    <a class="btn btn--line btn--sm" href="#/save/budget?month=${next}">Next</a>
  </div>`;
  if (!budget) {
    return `<div class="page">${h1("Monthly budget", "PocketSaver")}${nav}
      <section class="card">${emptyCopy("No budget for this month yet.", "Add your income and a plan. The numbers will be only what you type.")}
        <button class="btn btn--gold btn--block" type="button" data-action="budget-create" data-month="${esc(month)}">Start this month</button>
      </section></div>`;
  }
  const s = summariseBudget(budget);
  const pct = s.planned > 0 ? Math.round((s.spent / s.planned) * 100) : (s.spent > 0 ? 100 : 0);
  return `<div class="page">
    ${h1("Monthly budget", "PocketSaver")}
    ${nav}
    <section class="card card--green">
      <p class="hero-num"><small>${s.left >= 0 ? "Still unspent from income" : "Spent more than income"}</small>${s.left < 0 ? `<span class="over">${formatNaira(s.left)}</span>` : formatNaira(s.left)}</p>
      <div class="stats" style="margin-top:12px">
        <div class="stat"><small class="muted">Income</small><b>${formatNaira(s.income)}</b></div>
        <div class="stat"><small class="muted">Spent</small><b>${formatNaira(s.spent)}</b></div>
        <div class="stat"><small class="muted">Planned</small><b>${formatNaira(s.planned)}</b></div>
      </div>
      ${bar(pct, s.left < 0)}
    </section>
    <div class="grid-2">
      <button class="btn btn--gold" type="button" data-action="open-income" data-id="${esc(budget.id)}">Add income</button>
      <button class="btn btn--line" type="button" data-action="open-expense" data-id="${esc(budget.id)}">Add expense</button>
    </div>
    <section class="card stack">
      <div class="spread"><h2>Plan by category</h2><button class="btn btn--line btn--sm" type="button" data-action="open-plan" data-id="${esc(budget.id)}">Edit plan</button></div>
      ${s.byCategory.map((cat) => {
        const p = cat.planned > 0 ? Math.min(100, Math.round((cat.spent / cat.planned) * 100)) : (cat.spent > 0 ? 100 : 0);
        return `<div><div class="split"><b>${esc(cat.name)}</b><span>${formatNaira(cat.spent)} <small class="sub">/ ${formatNaira(cat.planned)}</small></span></div>${bar(p, cat.spent > cat.planned && cat.planned > 0)}</div>`;
      }).join("")}
    </section>
    <section class="stack">
      <h2>Income</h2>
      ${budget.income.length ? budget.income.map((row) => `<div class="item"><div class="split"><div><b>${esc(row.name)}</b><small>${formatDate(row.date)}</small></div><div class="row"><b>${formatNaira(row.amount)}</b><button class="btn btn--danger btn--sm" type="button" data-action="delete-income" data-budget="${esc(budget.id)}" data-id="${esc(row.id)}">Delete</button></div></div></div>`).join("") : `<p class="muted">No income recorded yet.</p>`}
    </section>
    <section class="stack">
      <h2>Expenses</h2>
      ${budget.expenses.length ? budget.expenses.slice().reverse().map((row) => {
        const cat = budget.categories.find((c) => c.id === row.categoryId);
        return `<div class="item"><div class="split"><div><b>${esc(row.note || cat?.name || "Expense")}</b><small>${esc(cat?.name || "")} · ${formatDate(row.date)}</small></div><div class="row"><b>${formatNaira(row.amount)}</b><button class="btn btn--danger btn--sm" type="button" data-action="delete-expense" data-budget="${esc(budget.id)}" data-id="${esc(row.id)}">Delete</button></div></div></div>`;
      }).join("") : `<p class="muted">No expenses yet. Add one when you spend.</p>`}
    </section>
  </div>`;
}

function foodPage(api) {
  const plan = api.state.plans.find((p) => p.id === "latest");
  const people = plan?.household || api.state.profile.household || 4;
  const budget = plan?.budget || "";
  const prefs = new Set(plan?.prefs || []);
  const choices = ["rice", "beans", "yam", "garri", "plantain", "eggs", "noodles", "pap", "groundnut"];
  const basket = plan ? estimateBasket(plan.list, api.state.prices) : null;
  return `<div class="page">
    ${h1("Food week", "PocketSaver")}
    <p class="lede">Tell us the money and the people. We suggest common meals and a list. We do not look up market prices.</p>
    <form class="card stack" data-action="food-generate">
      ${field({ label: "People eating", name: "household", value: people, type: "number", inputmode: "numeric" })}
      ${moneyField("Weekly food budget", "budget", budget ? String(budget) : "")}
      <fieldset class="field"><legend>Foods you actually eat</legend>
        <div class="checks">${choices.map((c) => `<label class="check"><input type="checkbox" name="prefs" value="${c}"${prefs.has(c) ? " checked" : ""}><span>${c}</span></label>`).join("")}</div>
        <small class="hint">Leave them all off for a mixed Nigerian week.</small>
      </fieldset>
      ${errLine()}
      <button class="btn btn--gold btn--block" type="submit">Build this week</button>
    </form>
    ${plan ? renderPlan(plan, basket) : ""}
    <section class="card">
      <div class="spread"><h2>Another week</h2>${plusBadge()}</div>
      <p class="lede">A second, different week from the same budget is part of Pocket Plus (₦500 / month). Payments are not open.</p>
      <button class="btn btn--line btn--block" type="button" data-action="premium" data-feature="Extra weekly meal plans">Join the premium waitlist</button>
    </section>
  </div>`;
}

function renderPlan(plan, basket) {
  return `<section class="card card--green">
      <p class="kicker">Maths on your budget</p>
      <p class="hero-num"><small>Per person, per day</small>${formatNaira(plan.perPersonDay)}</p>
      <p class="muted" style="margin-top:8px">${plan.household} people · ${formatNaira(plan.perDay)} a day for the household · ${formatNaira(plan.perMeal)} if you count 3 meals</p>
    </section>
    <p class="hint">${esc(plan.notice)}</p>
    <section class="card days">${plan.days.map((d) => `<article class="day"><i>${esc(d.day.slice(0, 3))}</i><div class="meal"><b>${esc(d.breakfast.name)}</b><small class="sub">${esc(d.breakfast.note)}</small><b style="margin-top:6px">${esc(d.dinner.name)}</b><small class="sub">${esc(d.dinner.note)}</small></div></article>`).join("")}</section>
    <section class="card stack">
      <h2>Basket</h2>
      <p class="lede">Total uses only prices you saved, and only when the unit matches. Example prices are left out.</p>
      <p class="hero-num" style="font-size:32px">${formatNaira(basket.total)}</p>
      <p class="muted">${basket.covered} priced · ${basket.missing} still need a price you enter</p>
      <div class="list">${basket.lines.map((line) => `<div class="item"><div class="split"><b>${esc(line.item)}</b><span>${line.used ? formatNaira(line.cost) : "—"}</span></div><small>${line.qty} ${esc(line.unit)}${line.used ? " · " + esc(line.place) + " · " + formatDate(line.date) : " · " + esc(line.reason)}</small></div>`).join("")}</div>
      <button class="btn btn--gold" type="button" data-action="list-from-plan">Send list to shopping</button>
      <a class="btn btn--wa" href="${waLink(planShareText(plan, basket))}" target="_blank" rel="noopener">Share on WhatsApp</a>
    </section>`;
}

function pricesPage(api) {
  const groups = comparePrices(api.state.prices);
  const options = PRICE_ITEMS.map((item) => `<option value="${esc(item)}"></option>`).join("");
  return `<div class="page">
    ${h1("Market prices", "Your notes")}
    <aside class="note"><strong>Not a live price list.</strong> Example rows are ₦100 placeholders. A number becomes yours only after you save it. Nothing here is verified.</aside>
    <form class="card stack" data-action="price-save">
      <label class="field"><span>Item</span><input name="item" list="price-items" placeholder="e.g. Rice" required><datalist id="price-items">${options}</datalist></label>
      ${moneyField("Amount", "amount")}
      ${selectField("Unit", "unit", "cup", UNITS)}
      ${field({ label: "Market or stall", name: "place", placeholder: "e.g. Oja Oba" })}
      ${field({ label: "Area", name: "area", value: api.state.profile.city || "", placeholder: "e.g. Akure" })}
      ${field({ label: "Date you saw it", name: "date", type: "date", value: todayISO() })}
      ${selectField("What kind of note is this?", "kind", "entry", [{ value: "entry", label: "I paid this" }, { value: "estimate", label: "My own estimate" }])}
      ${area({ label: "Note", name: "note", placeholder: "Optional" })}
      ${errLine()}
      <button class="btn btn--gold btn--block" type="submit">Save price on this phone</button>
    </form>
    <div class="spread"><h2>Saved notes</h2><button class="btn btn--line btn--sm" type="button" data-action="premium" data-feature="Price alerts">Price alerts ${plusBadge()}</button></div>
    ${groups.length ? groups.map((group) => `<section class="card stack">
      <div class="split"><h2>${esc(group.item)}</h2>${group.cheapest ? `<span class="badge badge--you">Lower: ${formatNaira(group.cheapest.amount)}</span>` : ""}</div>
      <p class="hint">${esc(group.note)}</p>
      ${group.rows.map((row) => `<div class="item"><div class="split"><div><b>${formatNaira(row.amount)} <small>/ ${esc(row.unit)}</small></b><small>${esc(row.place || "No place")} · ${esc(row.area || "")} · ${formatDate(row.date)}</small></div>${badge(row.kind)}</div>
        ${row.note ? `<small>${esc(row.note)}</small>` : ""}
        <button class="btn btn--danger btn--sm" type="button" data-action="delete-price" data-id="${esc(row.id)}">Delete</button>
      </div>`).join("")}
    </section>`).join("") : `<p class="muted">No prices yet.</p>`}
    <button class="btn btn--line" type="button" data-action="remove-examples" data-store="prices">Remove example prices</button>
  </div>`;
}

function listPage(api) {
  const list = api.state.lists.find((l) => l.id === "market") || api.state.lists[0];
  return `<div class="page">
    ${h1("Shopping list", "PocketSaver")}
    ${list ? `<section class="card stack">
      <div class="spread"><h2>${esc(list.name)}</h2><span class="badge">${list.items.filter((i) => i.done).length}/${list.items.length}</span></div>
      ${list.items.length ? list.items.map((item) => `<div class="item" style="display:grid;grid-template-columns:28px 1fr auto;align-items:center;gap:8px">
        <input type="checkbox" data-change="list-toggle" data-id="${esc(item.id)}" ${item.done ? "checked" : ""} aria-label="Tick ${esc(item.item)}">
        <span>${item.done ? "<s>" : ""}<b>${esc(item.item)}</b> <small>${esc(String(item.qty))} ${esc(item.unit || "")}</small>${item.done ? "</s>" : ""}</span>
        <button class="btn btn--danger btn--sm" type="button" data-action="list-delete" data-id="${esc(item.id)}">Delete</button>
      </div>`).join("") : `<p class="muted">The list is empty.</p>`}
    </section>
    <form class="card stack" data-action="list-add">
      ${field({ label: "Add an item", name: "item", placeholder: "e.g. Salt" })}
      <div class="grid-2">${field({ label: "Quantity", name: "qty", value: "1", inputmode: "decimal" })}${field({ label: "Unit", name: "unit", placeholder: "piece" })}</div>
      ${errLine()}
      <button class="btn btn--gold" type="submit">Add</button>
    </form>
    <button class="btn btn--line" type="button" data-action="list-clear">Clear ticked items</button>` : `<section class="card">
      <p class="lede">Build a food week first, or start a blank list.</p>
      <button class="btn btn--gold btn--block" type="button" data-action="list-blank">Start a blank list</button>
    </section>`}
  </div>`;
}

function goalsPage(api) {
  const goals = api.state.goals;
  const challenge = api.state.challenges.find((c) => c.id === "current");
  const progress = challenge ? challengeProgress(challenge) : null;
  return `<div class="page">
    ${h1("Savings goals", "On this phone only")}
    <aside class="note"><strong>NaijaPocket does not hold your money.</strong> This is a notebook. Moving the cash is still your bank, your cash box, or your ajo group.</aside>
    ${goals.map((goal) => {
      const pct = goal.target > 0 ? Math.round((goal.saved / goal.target) * 100) : 0;
      return `<section class="card stack">
        <div class="split"><h2>${esc(goal.name)}</h2><b>${formatNaira(goal.saved)}</b></div>
        <p class="muted">Target ${formatNaira(goal.target)}${goal.deadline ? " · by " + formatDate(goal.deadline) : ""}</p>
        ${bar(pct)}
        <form class="stack" data-action="goal-add">
          <input type="hidden" name="id" value="${esc(goal.id)}">
          ${moneyField("Add what you put aside", "amount")}
          ${errLine()}
          <button class="btn btn--gold btn--sm" type="submit">Add to this goal</button>
        </form>
        <button class="btn btn--danger btn--sm" type="button" data-action="delete-goal" data-id="${esc(goal.id)}">Delete goal</button>
      </section>`;
    }).join("")}
    <form class="card stack" data-action="goal-create">
      <h2>New goal</h2>
      ${field({ label: "Name", name: "name", placeholder: "e.g. Rent buffer" })}
      ${moneyField("Target", "target")}
      ${field({ label: "Date", name: "deadline", type: "date" })}
      ${errLine()}
      <button class="btn btn--line" type="submit">Save goal</button>
    </form>
    <section class="card stack">
      <div class="spread"><h2>30-day challenge</h2>${freeBadge()}</div>
      <p class="lede">Tick a day when you put that amount aside. The total is arithmetic, not a balance we can see.</p>
      ${progress ? `<p class="hero-num" style="font-size:32px">${formatNaira(progress.saved)} <small style="font-size:14px">of ${formatNaira(progress.target)} if you finish</small></p>
        <div class="ticks">${progress.days.map((d) => `<button class="tick${d.done ? " on" : ""}" type="button" data-action="challenge-tick" data-date="${d.date}" ${d.future ? "disabled" : ""} aria-pressed="${d.done ? "true" : "false"}" aria-label="Day ${d.index}">${d.index}</button>`).join("")}</div>
        <button class="btn btn--line btn--sm" type="button" data-action="challenge-reset">Reset challenge</button>`
        : `<form class="stack" data-action="challenge-start">${moneyField("Amount to put aside each day", "daily")}${errLine()}<button class="btn btn--gold" type="submit">Start 30 days</button></form>`}
    </section>
  </div>`;
}

function tipsPage(route) {
  const tag = route.params.tag || "All";
  const tags = ["All", ...new Set(TIPS.map((t) => t.tag))];
  const rows = TIPS.filter((t) => tag === "All" || t.tag === tag);
  return `<div class="page">
    ${h1("Money-saving tips", "PocketSaver")}
    <div class="checks">${tags.map((t) => `<a class="btn btn--sm ${t === tag ? "btn--gold" : "btn--line"}" href="#/save/tips?tag=${encodeURIComponent(t)}">${esc(t)}</a>`).join("")}</div>
    ${rows.map((tip) => `<article class="card"><span class="badge">${esc(tip.tag)}</span><h2 style="margin:8px 0">${esc(tip.title)}</h2><p class="lede">${esc(tip.body)}</p></article>`).join("")}
    <aside class="note">These are general habits, not a promise of a particular saving. Your market will differ.</aside>
  </div>`;
}

function reportPage(api) {
  const plan = api.state.plans.find((p) => p.id === "latest");
  const month = thisMonth();
  const budget = api.state.budgets.find((b) => b.month === month);
  const summary = budget ? summariseBudget(budget) : null;
  const goals = api.state.goals;
  const basket = plan ? estimateBasket(plan.list, api.state.prices) : null;
  const text = [
    "NaijaPocket weekly report",
    summary ? "This month: income " + formatNaira(summary.income) + ", spent " + formatNaira(summary.spent) + ", left " + formatNaira(summary.left) + "." : "No monthly budget yet.",
    plan ? planShareText(plan, basket) : "No food plan yet.",
    goals.length ? "Goals: " + goals.map((g) => g.name + " " + formatNaira(g.saved) + " of " + formatNaira(g.target)).join("; ") : "",
    "Figures are what I typed into NaijaPocket. They are not a bank statement."
  ].filter(Boolean).join("\n\n");
  return `<div class="page">
    ${h1("Weekly report", "Share what you typed")}
    <article class="card stack" id="report">
      <p class="kicker">${esc(labelMonth(month))}</p>
      ${summary ? `<p>Income <b>${formatNaira(summary.income)}</b> · Spent <b>${formatNaira(summary.spent)}</b> · Left <b>${formatNaira(summary.left)}</b></p>` : `<p class="muted">Add a monthly budget to include it.</p>`}
      ${plan ? `<p>${plan.household} people · food budget ${formatNaira(plan.budget)} · ${formatNaira(plan.perPersonDay)} per person per day.</p>
        <p class="hint">Basket from your own prices: ${formatNaira(basket.total)}. ${basket.missing} items have no price from you.</p>` : `<p class="muted">Build a food week to include meals.</p>`}
      ${goals.map((g) => `<p>${esc(g.name)}: ${formatNaira(g.saved)} of ${formatNaira(g.target)}</p>`).join("")}
    </article>
    <div class="grid-2 no-print">
      <a class="btn btn--wa" href="${waLink(text)}" target="_blank" rel="noopener">WhatsApp</a>
      <button class="btn btn--line" type="button" data-action="print-page">Print / Save PDF</button>
    </div>
    <button class="btn btn--line no-print" type="button" data-action="copy-text" data-text="${esc(text)}">Copy report</button>
  </div>`;
}

function labelMonth(ym) {
  const [y, m] = ym.split("-");
  return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString("en-NG", { month: "long", year: "numeric" });
}
function emptyCopy(title, text) {
  return `<h2>${esc(title)}</h2><p class="lede">${esc(text)}</p>`;
}

function budgetById(api, id) {
  return api.state.budgets.find((b) => b.id === id);
}

export const actions = {
  async "budget-create"(api, el) {
    const month = el.dataset.month || thisMonth();
    if (api.state.budgets.some((b) => b.month === month)) return;
    await api.save("budgets", emptyBudget(month));
    api.toast("Budget started.");
    api.rerender();
  },
  "open-income"(api, el) {
    api.sheet(`<form class="sheet__pad" data-action="budget-income">
      <h2 id="sheet-title">Add income</h2>
      <input type="hidden" name="budget" value="${esc(el.dataset.id)}">
      ${field({ label: "Source", name: "name", placeholder: "Salary, gift, side work" })}
      ${moneyField("Amount", "amount")}
      ${field({ label: "Date", name: "date", type: "date", value: todayISO() })}
      ${errLine()}
      <button class="btn btn--gold" type="submit">Save income</button>
    </form>`);
  },
  "open-expense"(api, el) {
    const budget = budgetById(api, el.dataset.id);
    if (!budget) return;
    api.sheet(`<form class="sheet__pad" data-action="budget-expense">
      <h2 id="sheet-title">Add expense</h2>
      <input type="hidden" name="budget" value="${esc(budget.id)}">
      ${selectField("Category", "categoryId", budget.categories[0]?.id || "", budget.categories.map((c) => ({ value: c.id, label: c.name })))}
      ${moneyField("Amount", "amount")}
      ${field({ label: "Note", name: "note", placeholder: "What was it?" })}
      ${field({ label: "Date", name: "date", type: "date", value: todayISO() })}
      ${errLine()}
      <button class="btn btn--gold" type="submit">Save expense</button>
    </form>`);
  },
  "open-plan"(api, el) {
    const budget = budgetById(api, el.dataset.id);
    if (!budget) return;
    api.sheet(`<form class="sheet__pad" data-action="budget-plan">
      <h2 id="sheet-title">Planned amounts</h2>
      <input type="hidden" name="budget" value="${esc(budget.id)}">
      ${budget.categories.map((c) => moneyField(c.name, "plan-" + c.id, c.planned ? String(c.planned) : "")).join("")}
      <button class="btn btn--gold" type="submit">Save plan</button>
    </form>`);
  },
  async "budget-income"(api, form, data) {
    const budget = budgetById(api, data.get("budget"));
    const amount = parseMoney(data.get("amount"));
    const name = String(data.get("name") || "").trim();
    if (!budget || !name || amount <= 0) return api.formError(form, "Add a name and an amount above zero.");
    budget.income.push({ id: uid(), name, amount, date: data.get("date") || todayISO() });
    await api.save("budgets", budget);
    api.closeSheet();
    api.toast("Income saved.");
    api.rerender();
  },
  async "budget-expense"(api, form, data) {
    const budget = budgetById(api, data.get("budget"));
    const amount = parseMoney(data.get("amount"));
    if (!budget || amount <= 0) return api.formError(form, "Enter an amount above zero.");
    budget.expenses.push({
      id: uid(),
      categoryId: data.get("categoryId"),
      amount,
      note: String(data.get("note") || "").trim(),
      date: data.get("date") || todayISO()
    });
    await api.save("budgets", budget);
    api.closeSheet();
    api.toast("Expense saved.");
    api.rerender();
  },
  async "budget-plan"(api, form, data) {
    const budget = budgetById(api, data.get("budget"));
    if (!budget) return;
    budget.categories = budget.categories.map((c) => ({ ...c, planned: parseMoney(data.get("plan-" + c.id)) }));
    await api.save("budgets", budget);
    api.closeSheet();
    api.toast("Plan saved.");
    api.rerender();
  },
  async "delete-income"(api, el) {
    const budget = budgetById(api, el.dataset.budget);
    if (!budget) return;
    budget.income = budget.income.filter((row) => row.id !== el.dataset.id);
    await api.save("budgets", budget);
    api.rerender();
  },
  async "delete-expense"(api, el) {
    const budget = budgetById(api, el.dataset.budget);
    if (!budget) return;
    budget.expenses = budget.expenses.filter((row) => row.id !== el.dataset.id);
    await api.save("budgets", budget);
    api.rerender();
  },
  async "food-generate"(api, form, data) {
    const household = parseInt(data.get("household"), 10);
    const budget = parseMoney(data.get("budget"));
    if (!household || household < 1) return api.formError(form, "Enter how many people eat.");
    if (budget <= 0) return api.formError(form, "Enter a weekly food budget.");
    const plan = buildFoodPlan({ household, budget, prefs: data.getAll("prefs") });
    plan.id = "latest";
    await api.save("plans", plan);
    api.toast("Week ready. Prices are still only the ones you save.");
    api.rerender();
  },
  async "list-from-plan"(api) {
    const plan = api.state.plans.find((p) => p.id === "latest");
    if (!plan) return;
    const items = plan.list.map((item) => ({ ...item, done: false }));
    await api.save("lists", { id: "market", name: "This week's market list", items, fromPlan: true });
    api.toast("Shopping list updated.");
    api.go("/save/list");
  },
  async "price-save"(api, form, data) {
    const item = String(data.get("item") || "").trim();
    const amount = parseMoney(data.get("amount"));
    if (!item || amount <= 0) return api.formError(form, "Add the item and an amount above zero.");
    await api.save("prices", {
      id: uid(),
      item,
      amount,
      unit: data.get("unit") || "piece",
      place: String(data.get("place") || "").trim(),
      area: String(data.get("area") || "").trim(),
      date: data.get("date") || todayISO(),
      kind: data.get("kind") === "estimate" ? "estimate" : "entry",
      note: String(data.get("note") || "").trim()
    });
    api.toast("Price saved as your note.");
    api.rerender();
  },
  async "delete-price"(api, el) {
    await api.remove("prices", el.dataset.id);
    api.rerender();
  },
  async "remove-examples"(api, el) {
    const store = el.dataset.store;
    const rows = api.state[store].filter((row) => row.kind === "example" || row.example);
    for (const row of rows) await api.remove(store, row.id);
    api.toast("Example cards removed.");
    api.rerender();
  },
  async "list-blank"(api) {
    await api.save("lists", { id: "market", name: "Market list", items: [] });
    api.rerender();
  },
  async "list-add"(api, form, data) {
    const list = api.state.lists.find((l) => l.id === "market") || { id: "market", name: "Market list", items: [] };
    const item = String(data.get("item") || "").trim();
    if (!item) return api.formError(form, "Name the item.");
    list.items.push({ id: uid(), item, qty: parseMoney(data.get("qty")) || 1, unit: String(data.get("unit") || "").trim(), done: false, group: "other" });
    await api.save("lists", list);
    api.rerender();
  },
  async "list-toggle"(api, el) {
    const list = api.state.lists.find((l) => l.id === "market");
    if (!list) return;
    const item = list.items.find((i) => i.id === el.dataset.id);
    if (item) item.done = el.checked;
    await api.save("lists", list);
    api.rerender();
  },
  async "list-delete"(api, el) {
    const list = api.state.lists.find((l) => l.id === "market");
    if (!list) return;
    list.items = list.items.filter((i) => i.id !== el.dataset.id);
    await api.save("lists", list);
    api.rerender();
  },
  async "list-clear"(api) {
    const list = api.state.lists.find((l) => l.id === "market");
    if (!list) return;
    list.items = list.items.filter((i) => !i.done);
    await api.save("lists", list);
    api.rerender();
  },
  async "goal-create"(api, form, data) {
    const name = String(data.get("name") || "").trim();
    const target = parseMoney(data.get("target"));
    if (!name || target <= 0) return api.formError(form, "Add a name and a target.");
    await api.save("goals", { id: uid(), name, target, saved: 0, deadline: data.get("deadline") || "", contributions: [] });
    api.toast("Goal saved on this phone.");
    api.rerender();
  },
  async "goal-add"(api, form, data) {
    const goal = api.state.goals.find((g) => g.id === data.get("id"));
    const amount = parseMoney(data.get("amount"));
    if (!goal || amount <= 0) return api.formError(form, "Enter an amount above zero.");
    goal.contributions = goal.contributions || [];
    goal.contributions.push({ id: uid(), amount, date: todayISO() });
    goal.saved = Math.round((goal.saved + amount) * 100) / 100;
    await api.save("goals", goal);
    api.toast("Added. The money is still wherever you keep it.");
    api.rerender();
  },
  async "delete-goal"(api, el) {
    await api.remove("goals", el.dataset.id);
    api.rerender();
  },
  async "challenge-start"(api, form, data) {
    const daily = parseMoney(data.get("daily"));
    if (daily <= 0) return api.formError(form, "Enter a daily amount.");
    await api.save("challenges", { id: "current", daily, start: todayISO(), ticks: {} });
    api.toast("Challenge started. Tick a day when you actually put money aside.");
    api.rerender();
  },
  async "challenge-tick"(api, el) {
    const challenge = api.state.challenges.find((c) => c.id === "current");
    if (!challenge) return;
    const date = el.dataset.date;
    challenge.ticks = challenge.ticks || {};
    challenge.ticks[date] = !challenge.ticks[date];
    await api.save("challenges", challenge);
    api.rerender();
  },
  async "challenge-reset"(api) {
    await api.remove("challenges", "current");
    api.rerender();
  },
  "premium"(api, el) {
    api.premium(el.dataset.feature || "This feature");
  },
  "print-page"() {
    window.print();
  },
  async "copy-text"(api, el) {
    const text = el.dataset.text || "";
    try {
      await navigator.clipboard.writeText(text);
      api.toast("Copied.");
    } catch {
      api.toast("Could not copy. Use WhatsApp share instead.");
    }
  }
};
