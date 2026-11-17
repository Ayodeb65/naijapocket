import { EXPENSE_CATEGORIES, PROMO_STYLES } from "./content.js";
import { businessTotals, invoiceTotal, promoText, receiptText, suggestPrice } from "./logic.js";
import { esc, formatDate, formatNaira, parseMoney, thisMonth, todayISO, uid } from "./money.js";
import { area, errLine, field, freeBadge, h1, moneyField, plusBadge, selectField, waLink } from "./ui.js";

export function render(route, api) {
  const path = route.path;
  if (path === "/biz") return hub(api);
  if (path === "/biz/book") return book(route, api);
  if (path === "/biz/profit") return profit(api);
  if (path === "/biz/invoice") return invoices(api);
  if (path === "/biz/invoice/edit") return invoiceEdit(route, api);
  if (path === "/biz/price") return pricing(api);
  if (path === "/biz/promo") return promo(route, api);
  return "";
}

function hub(api) {
  const month = thisMonth();
  const totals = businessTotals(inMonth(api.state.sales, month), inMonth(api.state.expenses, month));
  return `<div class="page">
    ${h1("PocketBusiness", "Small business")}
    <section class="card card--green">
      <p class="kicker">This month, from your record book</p>
      <p class="hero-num"><small>${totals.profit >= 0 ? "Sales minus expenses" : "Expenses are ahead of sales"}</small>${formatNaira(totals.profit)}</p>
      <p class="muted" style="margin-top:8px">Sales ${formatNaira(totals.sales)} · Expenses ${formatNaira(totals.expenses)}</p>
    </section>
    <div class="stack">
      ${link("/biz/book", "Record book", "Sales and expenses you type in.")}
      ${link("/biz/profit", "Profit calculator", "Price, cost and quantity.")}
      ${link("/biz/price", "Pricing helper", "Turn your cost into a selling price.")}
      ${link("/biz/invoice", "Receipts", "A simple receipt to share or print.")}
      ${link("/biz/promo", "Promo writer", "Templates for WhatsApp and captions.")}
    </div>
    <section class="card">
      <div class="spread"><h2>Month-to-month report</h2>${plusBadge()}</div>
      <p class="lede">A longer business report is Pocket Pro (₦1,000 / month). Your record book above is free.</p>
      <button class="btn btn--line" type="button" data-action="premium" data-feature="Month-to-month business report">Premium coming soon</button>
    </section>
  </div>`;
}

function link(href, title, text) {
  return `<a class="item" href="#${href}"><span class="split"><b>${title}</b>${freeBadge()}</span><small>${text}</small></a>`;
}

function book(route, api) {
  const month = route.params.month || thisMonth();
  const tab = route.params.tab === "expenses" ? "expenses" : "sales";
  const sales = inMonth(api.state.sales, month);
  const expenses = inMonth(api.state.expenses, month);
  const totals = businessTotals(sales, expenses);
  return `<div class="page">
    ${h1("Record book", monthLabel(month))}
    <div class="grid-3">
      <article class="card stat"><small class="sub">Sales</small><b>${formatNaira(totals.sales)}</b></article>
      <article class="card stat"><small class="sub">Expenses</small><b>${formatNaira(totals.expenses)}</b></article>
      <article class="card stat"><small class="sub">Difference</small><b>${formatNaira(totals.profit)}</b></article>
    </div>
    <div class="grid-2">
      <a class="btn ${tab === "sales" ? "btn--gold" : "btn--line"}" href="#/biz/book?month=${month}&tab=sales">Sales</a>
      <a class="btn ${tab === "expenses" ? "btn--gold" : "btn--line"}" href="#/biz/book?month=${month}&tab=expenses">Expenses</a>
    </div>
    ${tab === "sales" ? salesView(sales) : expensesView(expenses)}
    ${tab === "sales" ? saleForm() : expenseForm()}
    <p class="hint">These totals are the rows you saved for ${esc(monthLabel(month))}. They are not a tax return.</p>
  </div>`;
}

function salesView(rows) {
  if (!rows.length) return `<p class="muted">No sales this month yet.</p>`;
  return `<div class="list">${rows.map((row) => `<div class="item"><div class="split"><div><b>${esc(row.item)}</b><small>${formatDate(row.date)} · ${esc(row.customer || "No customer name")} · ${esc(row.method || "")}</small></div><b>${formatNaira(row.qty * row.unitPrice)}</b></div><button class="btn btn--danger btn--sm" type="button" data-action="delete-row" data-store="sales" data-id="${esc(row.id)}">Delete</button></div>`).join("")}</div>`;
}
function expensesView(rows) {
  if (!rows.length) return `<p class="muted">No expenses this month yet.</p>`;
  return `<div class="list">${rows.map((row) => `<div class="item"><div class="split"><div><b>${esc(row.category)}</b><small>${formatDate(row.date)} · ${esc(row.note || "")}</small></div><b>${formatNaira(row.amount)}</b></div><button class="btn btn--danger btn--sm" type="button" data-action="delete-row" data-store="expenses" data-id="${esc(row.id)}">Delete</button></div>`).join("")}</div>`;
}
function saleForm() {
  return `<form class="card stack" data-action="sale-save">
    <h2>Record a sale</h2>
    ${field({ label: "What you sold", name: "item", placeholder: "e.g. 1 crate of zobo" })}
    <div class="grid-2">${field({ label: "Quantity", name: "qty", value: "1", inputmode: "decimal" })}${moneyField("Price each", "unitPrice")}</div>
    ${field({ label: "Customer", name: "customer", placeholder: "Optional" })}
    ${selectField("How they paid", "method", "Cash", ["Cash", "Transfer", "POS", "Not yet paid"])}
    ${field({ label: "Date", name: "date", type: "date", value: todayISO() })}
    ${errLine()}
    <button class="btn btn--gold" type="submit">Save sale</button>
  </form>`;
}
function expenseForm() {
  return `<form class="card stack" data-action="expense-save">
    <h2>Record an expense</h2>
    ${selectField("Category", "category", "Stock", EXPENSE_CATEGORIES)}
    ${moneyField("Amount", "amount")}
    ${field({ label: "Note", name: "note" })}
    ${field({ label: "Date", name: "date", type: "date", value: todayISO() })}
    ${errLine()}
    <button class="btn btn--gold" type="submit">Save expense</button>
  </form>`;
}

function profit() {
  return `<div class="page">
    ${h1("Profit calculator", "PocketBusiness")}
    <p class="lede">Type your own figures. The result is arithmetic, not a forecast.</p>
    <form class="card stack" data-action="profit-calc">
      ${moneyField("Selling price for one", "price")}
      ${moneyField("Cost of one", "cost")}
      ${field({ label: "How many", name: "qty", value: "1", inputmode: "decimal" })}
      ${errLine()}
      <button class="btn btn--gold" type="submit">Calculate</button>
    </form>
    <div id="profit-out"></div>
  </div>`;
}

function invoices(api) {
  const rows = api.state.invoices;
  return `<div class="page">
    ${h1("Receipts", "PocketBusiness")}
    <p class="lede">A receipt you can show a customer. Add any tax line your business is required to show. NaijaPocket does not file tax.</p>
    <button class="btn btn--gold" type="button" data-action="invoice-new">New receipt</button>
    <div class="list">${rows.map((row) => `<a class="item" href="#/biz/invoice/edit?id=${esc(row.id)}"><span class="split"><b>${esc(row.number)} · ${esc(row.customer || "No customer")}</b><span>${formatNaira(invoiceTotal(row.items).total)}</span></span><small>${formatDate(row.date)}</small></a>`).join("") || `<p class="muted">No receipts yet.</p>`}</div>
  </div>`;
}

function invoiceEdit(route, api) {
  const row = api.state.invoices.find((item) => item.id === route.params.id);
  if (!row) return `<div class="page">${h1("Receipt")}<p class="lede">That receipt is not on this phone.</p><a class="btn btn--line" href="#/biz/invoice">Back to receipts</a></div>`;
  const calc = invoiceTotal(row.items);
  return `<div class="page">
    ${h1(row.number || "Receipt", "Edit")}
    <form class="card stack" data-action="invoice-save">
      <input type="hidden" name="id" value="${esc(row.id)}">
      ${field({ label: "Business name", name: "business", value: row.business })}
      ${field({ label: "Customer", name: "customer", value: row.customer })}
      ${field({ label: "Date", name: "date", type: "date", value: row.date || todayISO() })}
      <p class="kicker">Lines</p>
      ${(row.items || []).map((item, index) => `<div class="card stack">
        ${field({ label: "Description", name: "desc", value: item.desc })}
        <div class="grid-2">${field({ label: "Qty", name: "qty", value: String(item.qty ?? ""), inputmode: "decimal" })}${moneyField("Price", "price", item.price ? String(item.price) : "")}</div>
        <button class="btn btn--danger btn--sm" type="button" data-action="invoice-remove-line" data-id="${esc(row.id)}" data-index="${index}">Remove line</button>
      </div>`).join("")}
      <button class="btn btn--line" type="button" data-action="invoice-add-line" data-id="${esc(row.id)}">Add a line</button>
      ${area({ label: "Note", name: "note", value: row.note || "" })}
      <label class="check"><input type="checkbox" name="paid" ${row.paid ? "checked" : ""}><span>Marked as paid</span></label>
      ${errLine()}
      <button class="btn btn--gold" type="submit">Save receipt</button>
    </form>
    <article class="receipt">
      <header><b>${esc(row.business || "Your business")}</b><span>Receipt ${esc(row.number)}</span><span>${formatDate(row.date)}</span><span>${row.customer ? "To " + esc(row.customer) : ""}</span></header>
      <ul>${calc.lines.map((item) => `<li><span>${esc(item.desc || "Item")} × ${esc(item.qty)}</span><b>${formatNaira(item.amount)}</b></li>`).join("")}</ul>
      <p class="total">${formatNaira(calc.total)}</p>
      <p class="hint">${row.paid ? "Marked paid." : "Not marked paid."} ${esc(row.note || "")}</p>
    </article>
    <div class="grid-2 no-print">
      <a class="btn btn--wa" href="${waLink(receiptText(row))}" target="_blank" rel="noopener">WhatsApp</a>
      <button class="btn btn--line" type="button" data-action="print-page">Print</button>
    </div>
    <button class="btn btn--danger no-print" type="button" data-action="delete-row" data-store="invoices" data-id="${esc(row.id)}" data-back="#/biz/invoice">Delete receipt</button>
  </div>`;
}

function pricing(api) {
  const result = api.state.priceResult;
  return `<div class="page">
    ${h1("Pricing helper", "PocketBusiness")}
    <p class="lede">Add what the item costs you, plus transport, nylon and airtime, then the margin you want. You choose the final price.</p>
    <form class="card stack" data-action="price-help">
      ${moneyField("Cost of the item", "cost")}
      ${moneyField("Other costs for this one item", "extra")}
      ${field({ label: "Margin you want (%)", name: "margin", value: "30", inputmode: "decimal" })}
      ${errLine()}
      <button class="btn btn--gold" type="submit">Suggest a price</button>
    </form>
    ${result ? `<section class="card card--green">
      <p class="kicker">Suggestion from your numbers</p>
      <p class="hero-num">${formatNaira(result.price)}</p>
      <p class="muted" style="margin-top:8px">Cost ${formatNaira(result.totalCost)} · margin ${result.margin}% · profit ${formatNaira(result.profit)} on one sale.</p>
    </section>
    <p class="hint">Round it to a price customers can pay. This is not a rule and not a market survey.</p>` : ""}
  </div>`;
}

function promo(route, api) {
  const style = route.params.style || "whatsapp";
  const chosen = PROMO_STYLES.find((item) => item.id === style) || PROMO_STYLES[0];
  const locked = chosen.tier !== "free";
  const draft = api.state.promoDraft || {};
  return `<div class="page">
    ${h1("Promo writer", "Templates")}
    <p class="lede">Fill the blanks and edit the result. This is not a live AI writer, and it does not post for you.</p>
    <div class="checks">${PROMO_STYLES.map((item) => `<a class="btn btn--sm ${item.id === chosen.id ? "btn--gold" : "btn--line"}" href="#/biz/promo?style=${item.id}">${esc(item.name)}${item.tier === "free" ? "" : " · Premium"}</a>`).join("")}</div>
    <p class="hint">${esc(chosen.blurb)}</p>
    ${locked ? `<section class="card">
      <div class="spread"><h2>${esc(chosen.name)}</h2>${plusBadge()}</div>
      <p class="lede">This template is part of Pocket Plus at the test price of ₦500 a month. The four free templates above work today. Payments are not open.</p>
      <button class="btn btn--gold" type="button" data-action="premium" data-feature="${esc(chosen.name)}">Join the waitlist</button>
    </section>` : `<form class="card stack" data-action="promo-make">
      <input type="hidden" name="style" value="${esc(chosen.id)}">
      ${field({ label: "Product", name: "product", value: draft.product || "", placeholder: "e.g. Zobo, 1 litre" })}
      ${field({ label: "Price, as you want it written", name: "price", value: draft.price || "", placeholder: "₦500" })}
      ${field({ label: "One true benefit", name: "benefit", value: draft.benefit || "", placeholder: "Cold, not too sweet" })}
      ${field({ label: "Area", name: "area", value: draft.area || api.state.profile.city || "" })}
      ${field({ label: "Contact", name: "contact", value: draft.contact || api.state.profile.phone || "", placeholder: "Your WhatsApp number" })}
      ${errLine()}
      <button class="btn btn--gold" type="submit">Write the template</button>
    </form>`}
    ${api.state.promo && api.state.promo.style === chosen.id ? `<pre class="out">${esc(api.state.promo.text)}</pre>
      <a class="btn btn--wa" href="${waLink(api.state.promo.text)}" target="_blank" rel="noopener">Share on WhatsApp</a>` : ""}
  </div>`;
}

function inMonth(rows, month) {
  return (rows || []).filter((row) => String(row.date || "").startsWith(month));
}
function monthLabel(ym) {
  const [y, m] = ym.split("-");
  return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString("en-NG", { month: "long", year: "numeric" });
}

function readLines(data) {
  const desc = data.getAll("desc");
  const qty = data.getAll("qty");
  const price = data.getAll("price");
  return desc.map((name, i) => ({
    id: uid(),
    desc: String(name || "").trim(),
    qty: parseMoney(qty[i]),
    price: parseMoney(price[i])
  })).filter((line) => line.desc);
}

export const actions = {
  async "sale-save"(api, form, data) {
    const item = String(data.get("item") || "").trim();
    const unitPrice = parseMoney(data.get("unitPrice"));
    const qty = parseMoney(data.get("qty")) || 0;
    if (!item || unitPrice <= 0 || qty <= 0) return api.formError(form, "Add the item, a quantity and a price.");
    await api.save("sales", {
      id: uid(), item, qty, unitPrice,
      customer: String(data.get("customer") || "").trim(),
      method: data.get("method") || "Cash",
      date: data.get("date") || todayISO()
    });
    api.toast("Sale saved.");
    api.rerender();
  },
  async "expense-save"(api, form, data) {
    const amount = parseMoney(data.get("amount"));
    if (amount <= 0) return api.formError(form, "Enter an amount above zero.");
    await api.save("expenses", {
      id: uid(),
      category: data.get("category") || "Other",
      amount,
      note: String(data.get("note") || "").trim(),
      date: data.get("date") || todayISO()
    });
    api.toast("Expense saved.");
    api.rerender();
  },
  async "delete-row"(api, el) {
    await api.remove(el.dataset.store, el.dataset.id);
    if (el.dataset.back) api.go(el.dataset.back.replace("#", ""));
    else api.rerender();
  },
  "profit-calc"(api, form, data) {
    const price = parseMoney(data.get("price"));
    const cost = parseMoney(data.get("cost"));
    const qty = parseMoney(data.get("qty"));
    if (price <= 0 || qty <= 0) return api.formError(form, "Add a selling price and a quantity.");
    const each = Math.round((price - cost) * 100) / 100;
    const total = Math.round(each * qty * 100) / 100;
    const margin = price > 0 ? Math.round((each / price) * 1000) / 10 : 0;
    const out = document.getElementById("profit-out");
    if (out) {
      out.innerHTML = `<section class="card card--green"><p class="kicker">From your figures</p><p class="hero-num">${formatNaira(total)}</p><p class="muted" style="margin-top:8px">${formatNaira(each)} on each one · ${margin}% of the selling price · cost ${formatNaira(cost)}.</p></section>`;
    }
  },
  async "invoice-new"(api) {
    const n = api.state.invoices.length + 1;
    const row = {
      id: uid(),
      number: "NP-" + String(n).padStart(3, "0"),
      date: todayISO(),
      business: api.state.profile.businessName || "",
      customer: "",
      items: [{ id: uid(), desc: "", qty: 1, price: 0 }],
      note: "",
      paid: false
    };
    await api.save("invoices", row);
    api.go("/biz/invoice/edit?id=" + row.id);
  },
  async "invoice-add-line"(api, el) {
    const row = api.state.invoices.find((item) => item.id === el.dataset.id);
    if (!row) return;
    syncInvoice(row, el.closest(".page")?.querySelector("form"));
    row.items.push({ id: uid(), desc: "", qty: 1, price: 0 });
    await api.save("invoices", row);
    api.rerender();
  },
  async "invoice-remove-line"(api, el) {
    const row = api.state.invoices.find((item) => item.id === el.dataset.id);
    if (!row) return;
    syncInvoice(row, el.closest(".page")?.querySelector("form"));
    row.items.splice(Number(el.dataset.index), 1);
    if (!row.items.length) row.items.push({ id: uid(), desc: "", qty: 1, price: 0 });
    await api.save("invoices", row);
    api.rerender();
  },
  async "invoice-save"(api, form, data) {
    const row = api.state.invoices.find((item) => item.id === data.get("id"));
    if (!row) return;
    const items = readLines(data);
    if (!items.length) return api.formError(form, "Add at least one line with a description.");
    row.business = String(data.get("business") || "").trim();
    row.customer = String(data.get("customer") || "").trim();
    row.date = data.get("date") || todayISO();
    row.note = String(data.get("note") || "").trim();
    row.paid = data.get("paid") === "on";
    row.items = items;
    await api.save("invoices", row);
    if (row.business && !api.state.profile.businessName) {
      await api.save("profile", { ...api.state.profile, businessName: row.business });
    }
    api.toast("Receipt saved on this phone.");
    api.rerender();
  },
  "price-help"(api, form, data) {
    const cost = parseMoney(data.get("cost"));
    if (cost <= 0) return api.formError(form, "Enter the cost of the item.");
    api.state.priceResult = suggestPrice({
      cost,
      extra: data.get("extra"),
      margin: data.get("margin")
    });
    api.rerender();
  },
  "promo-make"(api, form, data) {
    const product = String(data.get("product") || "").trim();
    if (!product) return api.formError(form, "Name the product.");
    api.state.promoDraft = {
      product,
      price: String(data.get("price") || ""),
      benefit: String(data.get("benefit") || ""),
      area: String(data.get("area") || ""),
      contact: String(data.get("contact") || "")
    };
    const made = promoText(data.get("style"), {
      product,
      price: data.get("price"),
      benefit: data.get("benefit"),
      area: data.get("area"),
      contact: data.get("contact")
    });
    api.state.promo = { style: made.style.id, text: made.text };
    api.rerender();
  }
};

function syncInvoice(row, form) {
  if (!form) return;
  const data = new FormData(form);
  const items = readLines(data);
  if (items.length) row.items = items;
  row.business = String(data.get("business") || row.business || "");
  row.customer = String(data.get("customer") || "");
  row.date = data.get("date") || row.date;
  row.note = String(data.get("note") || "");
  row.paid = data.get("paid") === "on";
}
