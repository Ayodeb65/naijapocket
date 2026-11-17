import { CHECKLIST, QUIZ, REPORT_CHANNELS, SCAM_TYPES } from "./content.js";
import { checkLink, checkMessage, scoreQuiz } from "./logic.js";
import { esc, formatNaira, parseMoney, todayISO, uid } from "./money.js";
import { area, errLine, field, freeBadge, h1, moneyField, waLink } from "./ui.js";

export function render(route, api) {
  const path = route.path;
  if (path === "/safe") return hub();
  if (path === "/safe/message") return messagePage(api);
  if (path === "/safe/link") return linkPage(api);
  if (path === "/safe/types") return typesPage(route);
  if (path === "/safe/quiz") return quizPage(api);
  if (path === "/safe/checklist") return checkPage(api);
  if (path === "/safe/report") return reportPage(api);
  return "";
}

function hub() {
  const tools = [
    ["/safe/message", "Check a message", "Paste a WhatsApp or SMS and see common warning words."],
    ["/safe/link", "Check a link", "Look at a web address before you open it."],
    ["/safe/types", "Common scams", "Patterns people in Nigeria run into."],
    ["/safe/quiz", "Red-flag quiz", "Six short questions. Practice, not a certificate."],
    ["/safe/checklist", "Before you transfer", "Six questions to answer slowly."],
    ["/safe/report", "How to report", "Official places to go. We do not report for you."]
  ];
  return `<div class="page">
    ${h1("PocketSafe", "Scam awareness")}
    ${safety()}
    <div class="stack">${tools.map(([href, title, text]) => `<a class="item" href="#${href}"><span class="split"><b>${title}</b>${freeBadge()}</span><small>${text}</small></a>`).join("")}</div>
    <p class="hint">Safety information stays free. We will not charge you to read it.</p>
  </div>`;
}

function safety() {
  return `<aside class="note note--warn"><strong>We cannot promise you are safe.</strong> These tools point out warning signs. They cannot confirm that a message, link or payment is genuine, and they cannot get stolen money back.</aside>`;
}

function messagePage(api) {
  const last = api.state.lastCheck;
  return `<div class="page">
    ${h1("Check a message", "On this phone")}
    ${safety()}
    <form class="card stack" data-action="check-message">
      ${area({ label: "Paste the message", name: "text", placeholder: "Paste the SMS or WhatsApp here. It is not uploaded." })}
      ${errLine()}
      <button class="btn btn--gold" type="submit">Look for warning signs</button>
    </form>
    ${last ? resultCard(last) : ""}
    ${api.state.checks.slice(0, 5).map((row) => `<article class="card"><small class="sub">${esc(row.createdAt?.slice(0, 10) || "")} · ${esc(row.level)}</small><p>${esc(row.summary)}</p></article>`).join("")}
  </div>`;
}

function resultCard(result) {
  const tone = result.level === "high" ? "note--warn" : result.level === "some" ? "" : "note--ok";
  return `<section class="note ${tone}">
    <strong>${esc(result.summary)}</strong>
    ${result.flags?.length ? `<ul>${result.flags.map((flag) => `<li>${esc(flag.flag)}</li>`).join("")}</ul>` : ""}
    <p>${esc(result.disclaimer || "")}</p>
  </section>`;
}

function linkPage(api) {
  const last = api.state.lastLink;
  return `<div class="page">
    ${h1("Check a link", "PocketSafe")}
    ${safety()}
    <form class="card stack" data-action="check-link">
      ${field({ label: "Web address", name: "url", placeholder: "https://…" })}
      ${errLine()}
      <button class="btn btn--gold" type="submit">Look at the address</button>
    </form>
    ${last ? `<section class="note"><strong>${esc(last.summary)}</strong>${last.host ? `<p>Host: ${esc(last.host)}</p>` : ""}${last.notes?.length ? `<ul>${last.notes.map((note) => `<li>${esc(note)}</li>`).join("")}</ul>` : ""}<p>${esc(last.disclaimer)}</p></section>` : ""}
    <p class="hint">If you were not expecting the link, do not open it. Type the organisation's address yourself.</p>
  </div>`;
}

function typesPage(route) {
  const open = route.params.id;
  return `<div class="page">
    ${h1("Common scam types", "General patterns")}
    <p class="lede">These are widely seen patterns, described in general. There are no statistics on this page, because we are not publishing a count we cannot stand behind.</p>
    ${SCAM_TYPES.map((type) => `<article class="card stack">
      <h2>${esc(type.title)}</h2>
      <p class="lede">${esc(type.summary)}</p>
      <ul>${type.signs.map((sign) => `<li>${esc(sign)}</li>`).join("")}</ul>
      <p><b>A careful next step.</b> ${esc(type.do)}</p>
    </article>`).join("")}
    ${open ? "" : ""}
  </div>`;
}

function quizPage(api) {
  if (api.state.quizResult) {
    const result = api.state.quizResult;
    return `<div class="page">
      ${h1("Quiz result", "Practice")}
      <section class="card card--green"><p class="hero-num"><small>You matched the careful answer on</small>${result.correct} of ${result.total}</p><p class="muted" style="margin-top:8px">${esc(result.note)}</p></section>
      ${result.review.map((item, i) => `<article class="card"><p class="${item.ok ? "ok" : "no"}">${item.ok ? "Careful answer" : "Worth another look"}</p><h2>${esc(item.q)}</h2><p class="lede" style="margin-top:6px">${esc(item.why)}</p></article>`).join("")}
      <button class="btn btn--line" type="button" data-action="quiz-reset">Try again</button>
    </div>`;
  }
  return `<div class="page">
    ${h1("Red-flag quiz", "PocketSafe")}
    <p class="lede">Pick the careful response. This does not certify you, and a high score does not mean the next message is safe.</p>
    <form class="stack" data-action="quiz-submit">
      ${QUIZ.map((item, i) => `<fieldset class="card quiz"><legend><h3>${i + 1}. ${esc(item.q)}</h3></legend>
        ${item.options.map((opt, n) => `<label class="opt"><input type="radio" name="q${i}" value="${n}" required><span>${esc(opt)}</span></label>`).join("")}
      </fieldset>`).join("")}
      ${errLine()}
      <button class="btn btn--gold btn--block" type="submit">See the explanations</button>
    </form>
  </div>`;
}

function checkPage(api) {
  const saved = api.state.meta.checklist || {};
  const today = saved.date === todayISO() ? saved.ticks || {} : {};
  const done = CHECKLIST.filter((item) => today[item.id]).length;
  return `<div class="page">
    ${h1("Before you transfer", "Slow down")}
    ${safety()}
    <section class="card stack">
      <p class="kicker">${done} of ${CHECKLIST.length} checked today</p>
      ${CHECKLIST.map((item) => `<label class="item" style="display:grid;grid-template-columns:24px 1fr;gap:10px;align-items:start">
        <input type="checkbox" data-change="check-tick" data-id="${item.id}" ${today[item.id] ? "checked" : ""}>
        <span>${esc(item.text)}</span>
      </label>`).join("")}
      ${done === CHECKLIST.length ? `<p class="note note--ok"><strong>You ticked every line.</strong> That is a pause, not approval. If anything still feels wrong, do not send the money.</p>` : `<p class="hint">An unticked line is a reason to wait.</p>`}
    </section>
  </div>`;
}

function reportPage(api) {
  return `<div class="page">
    ${h1("How to report", "PocketSafe")}
    <aside class="note"><strong>NaijaPocket does not submit reports and cannot recover money.</strong> Use the official channels below. If someone sends you a “report” link, ignore it and type the address yourself.</aside>
    ${REPORT_CHANNELS.map((channel) => `<article class="card stack">
      <h2>${esc(channel.name)}</h2>
      <p class="lede">${esc(channel.detail)}</p>
      ${channel.href ? `<a class="btn btn--line" href="${esc(channel.href)}" ${channel.href.startsWith("http") ? 'target="_blank" rel="noopener"' : ""}>${esc(channel.label)}</a>` : ""}
    </article>`).join("")}
    <form class="card stack" data-action="report-save">
      <h2>Write a note for yourself</h2>
      <p class="hint">Saved only on this phone, so you have the details when you call your bank or write a petition.</p>
      ${area({ label: "What happened?", name: "what", placeholder: "A short description" })}
      ${field({ label: "Where it happened", name: "channel", placeholder: "WhatsApp, SMS, Instagram…" })}
      ${moneyField("Amount, if money moved", "amount")}
      ${field({ label: "When", name: "when", type: "date", value: todayISO() })}
      ${errLine()}
      <button class="btn btn--gold" type="submit">Save note on this phone</button>
    </form>
    ${api.state.reports.map((row) => {
      const text = reportText(row);
      return `<article class="card stack"><b>${esc(row.what)}</b><small>${esc(row.when)} · ${esc(row.channel)} · ${row.amount ? formatNaira(row.amount) : "No amount"}</small><a class="btn btn--wa btn--sm" href="${waLink(text)}" target="_blank" rel="noopener">Copy into WhatsApp for your bank</a><button class="btn btn--danger btn--sm" type="button" data-action="delete-report" data-id="${esc(row.id)}">Delete</button></article>`;
    }).join("")}
  </div>`;
}

function reportText(row) {
  return [
    "NaijaPocket note — saved on my phone, not sent to NaijaPocket.",
    "What happened: " + row.what,
    "Channel: " + (row.channel || ""),
    "When: " + (row.when || ""),
    "Amount: " + (row.amount ? formatNaira(row.amount) : "not stated"),
    "I need to tell my bank using the number on my card, or an official agency website I typed myself.",
    "NaijaPocket cannot recover this money."
  ].join("\n");
}

export const actions = {
  async "check-message"(api, form, data) {
    const text = String(data.get("text") || "").trim();
    if (!text) return api.formError(form, "Paste a message first.");
    const result = checkMessage(text);
    api.state.lastCheck = result;
    await api.save("checks", {
      id: uid(),
      level: result.level,
      summary: result.summary,
      flags: result.flags.map((flag) => flag.flag),
      createdAt: new Date().toISOString()
    });
    api.rerender();
  },
  "check-link"(api, form, data) {
    const url = String(data.get("url") || "").trim();
    if (!url) return api.formError(form, "Paste a web address.");
    api.state.lastLink = checkLink(url);
    api.rerender();
  },
  "quiz-submit"(api, form, data) {
    const answers = QUIZ.map((_, i) => data.get("q" + i));
    if (answers.some((value) => value == null)) return api.formError(form, "Answer every question.");
    api.state.quizResult = scoreQuiz(answers);
    api.rerender();
  },
  "quiz-reset"(api) {
    api.state.quizResult = null;
    api.rerender();
  },
  async "check-tick"(api, el) {
    const meta = { ...api.state.meta, id: "app" };
    const today = todayISO();
    if (meta.checklist?.date !== today) meta.checklist = { date: today, ticks: {} };
    meta.checklist.ticks[el.dataset.id] = el.checked;
    await api.save("meta", meta);
    api.rerender();
  },
  async "report-save"(api, form, data) {
    const what = String(data.get("what") || "").trim();
    if (what.length < 5) return api.formError(form, "Write a short description so future-you understands it.");
    await api.save("reports", {
      id: uid(),
      what,
      channel: String(data.get("channel") || "").trim(),
      amount: parseMoney(data.get("amount")),
      when: data.get("when") || todayISO()
    });
    api.toast("Note saved on this phone only.");
    api.rerender();
  },
  async "delete-report"(api, el) {
    await api.remove("reports", el.dataset.id);
    api.rerender();
  }
};
