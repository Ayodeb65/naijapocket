import { FIRST_AID, HEALTH_MEALS, REMINDER_KINDS } from "./content.js";
import { esc, telHref, todayISO, uid } from "./money.js";
import { area, errLine, field, freeBadge, h1, selectField } from "./ui.js";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function render(route, api) {
  const path = route.path;
  if (path === "/health") return hub(api);
  if (path === "/health/meals") return meals(api);
  if (path === "/health/reminders") return reminders(api);
  if (path === "/health/aid") return aid();
  if (path === "/health/care") return care(api);
  return "";
}

function disclaimer() {
  return `<aside class="note note--warn"><strong>Not medical advice.</strong> NaijaPocket shares general information. It does not diagnose, prescribe, or replace a doctor, nurse, midwife or pharmacist. In an emergency call 112.</aside>`;
}

function hub(api) {
  const open = api.state.reminders.filter((row) => row.enabled !== false && row.lastDone !== todayISO());
  return `<div class="page">
    ${h1("PocketHealth", "Everyday care")}
    ${disclaimer()}
    ${open.length ? `<section class="card"><p class="kicker">You asked to be reminded</p><div class="list" style="margin-top:8px">${open.slice(0, 4).map((row) => `<div class="item"><b>${esc(row.title)}</b><small>${esc(row.time || "Anytime today")}</small></div>`).join("")}</div></section>` : ""}
    <div class="stack">
      <a class="item" href="#/health/meals"><span class="split"><b>Budget meals</b>${freeBadge()}</span><small>Filling plates. Not a diet for an illness.</small></a>
      <a class="item" href="#/health/reminders"><span class="split"><b>Reminders</b>${freeBadge()}</span><small>Medicine you already take, water, appointments.</small></a>
      <a class="item" href="#/health/aid"><span class="split"><b>First-aid basics</b>${freeBadge()}</span><small>What to do while you get help.</small></a>
      <a class="item" href="#/health/care"><span class="split"><b>Finding care</b>${freeBadge()}</span><small>How to look, plus places you save yourself.</small></a>
    </div>
  </div>`;
}

function meals() {
  return `<div class="page">
    ${h1("Budget meals", "General ideas")}
    ${disclaimer()}
    <p class="lede">These are ordinary food ideas for a tight week. They are not a meal plan for diabetes, ulcers, pregnancy or any other condition. Ask a clinician before you change how you eat for a health reason.</p>
    ${HEALTH_MEALS.map((meal) => `<article class="card stack"><h2>${esc(meal.title)}</h2><p class="lede">${esc(meal.body)}</p><ul>${meal.ideas.map((idea) => `<li>${esc(idea)}</li>`).join("")}</ul></article>`).join("")}
    <a class="btn btn--line" href="#/save/food">Build a food week in PocketSaver</a>
  </div>`;
}

function reminders(api) {
  return `<div class="page">
    ${h1("Reminders", "You write them")}
    ${disclaimer()}
    <p class="lede">NaijaPocket only reminds you of what you type. It will not tell you which medicine to take, or the dose. While the app is open it can notify you if you allow notifications. It cannot guarantee a reminder if the phone is asleep.</p>
    ${api.state.reminders.map((row) => `<article class="card stack">
      <div class="split"><b>${esc(row.title)}</b><span class="badge">${esc(kindLabel(row.kind))}</span></div>
      <p class="muted">${esc(row.time || "No time")} · ${row.repeat === "daily" ? "Every day" : daysLabel(row.days)}</p>
      ${row.note ? `<p>${esc(row.note)}</p>` : ""}
      <div class="grid-2">
        <button class="btn btn--gold btn--sm" type="button" data-action="reminder-done" data-id="${esc(row.id)}">${row.lastDone === todayISO() ? "Done today" : "Mark done today"}</button>
        <button class="btn btn--danger btn--sm" type="button" data-action="delete-reminder" data-id="${esc(row.id)}">Delete</button>
      </div>
    </article>`).join("") || `<p class="muted">No reminders yet.</p>`}
    <form class="card stack" data-action="reminder-save">
      <h2>New reminder</h2>
      ${field({ label: "What", name: "title", placeholder: "e.g. Evening tablet I was given" })}
      ${selectField("Type", "kind", "medicine", REMINDER_KINDS.map((k) => ({ value: k.id, label: k.label })))}
      ${field({ label: "Time", name: "time", type: "time", value: "08:00" })}
      ${selectField("Repeat", "repeat", "daily", [{ value: "daily", label: "Every day" }, { value: "days", label: "Pick days" }])}
      <fieldset class="field"><legend>Days, if you are not repeating daily</legend><div class="checks">${DAYS.map((day, i) => `<label class="check"><input type="checkbox" name="days" value="${i}"><span>${day}</span></label>`).join("")}</div></fieldset>
      ${area({ label: "Note for yourself", name: "note", placeholder: "Optional. Do not ask the app to choose a drug." })}
      ${errLine()}
      <button class="btn btn--gold" type="submit">Save reminder</button>
    </form>
    <button class="btn btn--line" type="button" data-action="notify-ask">Allow notifications while the app is open</button>
  </div>`;
}

function aid() {
  return `<div class="page">
    ${h1("First-aid basics", "While you get help")}
    ${disclaimer()}
    <p class="lede">These are general first-aid steps, in the spirit of public guidance such as the Red Cross. They are not training. If you have not practised a technique, do not guess at it. Call 112.</p>
    ${FIRST_AID.map((topic) => `<article class="card stack">
      <h2>${esc(topic.title)}</h2>
      <ol>${topic.steps.map((step) => `<li>${esc(step)}</li>`).join("")}</ol>
      <p class="note note--warn"><strong>Get help.</strong> ${esc(topic.help)}</p>
    </article>`).join("")}
    <a class="btn btn--gold" href="tel:112">Call 112</a>
  </div>`;
}

function care(api) {
  return `<div class="page">
    ${h1("Finding care", "PocketHealth")}
    ${disclaimer()}
    <article class="card stack">
      <h2>Where people usually start</h2>
      <p class="lede">Your local government primary health centre is the ordinary first stop for many everyday needs. A general hospital handles more serious problems. For an emergency — trouble breathing, heavy bleeding, collapse, a seizure, a baby who will not feed — go to the nearest hospital that takes emergencies, or call 112. A patent medicine shop is not an emergency room.</p>
      <p class="lede">If you are enrolled with a health insurance scheme, use the number on your card. NaijaPocket does not keep a live directory of clinics, and it will not invent one.</p>
    </article>
    <h2>Places you save</h2>
    ${api.state.places.map((place) => {
      const tel = telHref(place.phone);
      return `<article class="card stack">
        <div class="split"><b>${esc(place.name)}</b>${place.example ? `<span class="badge badge--ex">Example</span>` : `<span class="badge badge--you">Mine</span>`}</div>
        <p class="muted">${esc(place.kind || "")}${place.area ? " · " + esc(place.area) : ""}</p>
        ${place.note ? `<p>${esc(place.note)}</p>` : ""}
        ${tel ? `<a class="btn btn--line btn--sm" href="${esc(tel)}">Call</a>` : ""}
        <button class="btn btn--danger btn--sm" type="button" data-action="delete-place" data-id="${esc(place.id)}">Delete</button>
      </article>`;
    }).join("")}
    <form class="card stack" data-action="place-save">
      <h2>Save a place you know</h2>
      ${field({ label: "Name", name: "name", placeholder: "The name on the signboard" })}
      ${field({ label: "What it is", name: "kind", placeholder: "Primary health centre, pharmacy, hospital" })}
      ${field({ label: "Area", name: "area", value: api.state.profile.city || "" })}
      ${field({ label: "Phone", name: "phone", inputmode: "tel" })}
      ${area({ label: "Note", name: "note", placeholder: "Hours, who to ask for, what you went there for" })}
      ${errLine()}
      <button class="btn btn--gold" type="submit">Save on this phone</button>
    </form>
  </div>`;
}

function kindLabel(id) {
  return REMINDER_KINDS.find((k) => k.id === id)?.label || "Reminder";
}
function daysLabel(days) {
  if (!days?.length) return "No days picked";
  return days.map((d) => DAYS[d] || d).join(", ");
}

export const actions = {
  async "reminder-save"(api, form, data) {
    const title = String(data.get("title") || "").trim();
    if (!title) return api.formError(form, "Say what the reminder is for.");
    const repeat = data.get("repeat") === "days" ? "days" : "daily";
    const days = data.getAll("days").map((d) => Number(d));
    if (repeat === "days" && !days.length) return api.formError(form, "Pick at least one day, or choose every day.");
    await api.save("reminders", {
      id: uid(),
      title,
      kind: data.get("kind") || "other",
      time: data.get("time") || "",
      repeat,
      days,
      note: String(data.get("note") || "").trim(),
      enabled: true,
      lastDone: ""
    });
    api.toast("Reminder saved. It does not choose a medicine for you.");
    api.rerender();
  },
  async "reminder-done"(api, el) {
    const row = api.state.reminders.find((item) => item.id === el.dataset.id);
    if (!row) return;
    row.lastDone = row.lastDone === todayISO() ? "" : todayISO();
    await api.save("reminders", row);
    api.rerender();
  },
  async "delete-reminder"(api, el) {
    await api.remove("reminders", el.dataset.id);
    api.rerender();
  },
  async "notify-ask"(api) {
    if (!("Notification" in window)) {
      api.toast("This browser does not show notifications. The list on this page still works.");
      return;
    }
    const result = await Notification.requestPermission();
    api.toast(result === "granted" ? "Notifications allowed while NaijaPocket is open." : "Notifications stay off. Your list still works.");
  },
  async "place-save"(api, form, data) {
    const name = String(data.get("name") || "").trim();
    if (!name) return api.formError(form, "Add the name on the signboard.");
    await api.save("places", {
      id: uid(),
      name,
      kind: String(data.get("kind") || "").trim(),
      area: String(data.get("area") || "").trim(),
      phone: String(data.get("phone") || "").trim(),
      note: String(data.get("note") || "").trim(),
      example: false
    });
    api.toast("Place saved. It is your note, not a verified listing.");
    api.rerender();
  },
  async "delete-place"(api, el) {
    await api.remove("places", el.dataset.id);
    api.rerender();
  }
};

export function dueReminders(reminders, now = new Date()) {
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  const time = hh + ":" + mm;
  const day = now.getDay();
  return reminders.filter((row) => {
    if (row.enabled === false || !row.time) return false;
    if (row.time.slice(0, 5) !== time) return false;
    if (row.repeat === "days" && !(row.days || []).includes(day)) return false;
    return row.notifiedAt !== todayISO() + "T" + time;
  });
}
