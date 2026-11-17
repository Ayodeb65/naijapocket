import { APP_STATUSES, INTERVIEW, OPP_TYPES, SKILL_TIPS } from "./content.js";
import { coverLetter, cvPlainText } from "./logic.js";
import { esc, formatDate, todayISO, uid } from "./money.js";
import { area, badge, errLine, field, freeBadge, h1, plusBadge, selectField, waLink } from "./ui.js";

export function render(route, api) {
  const path = route.path;
  if (path === "/jobs") return hub(route, api);
  if (path === "/jobs/new") {
    const existing = route.params.id ? api.state.opportunities.find((item) => item.id === route.params.id) : null;
    return formPage(api, existing);
  }
  if (path === "/jobs/item") return detail(route, api);
  if (path === "/jobs/cv") return cvPage(api);
  if (path === "/jobs/track") return track(api);
  if (path === "/jobs/skills") return skills();
  return "";
}

function hub(route, api) {
  const type = route.params.type || "all";
  const q = (route.params.q || "").trim().toLowerCase();
  const rows = api.state.opportunities.filter((row) => {
    if (type !== "all" && row.type !== type) return false;
    if (!q) return true;
    return (row.title + " " + row.org + " " + row.location).toLowerCase().includes(q);
  });
  return `<div class="page">
    ${h1("PocketJobs", "Opportunities")}
    <aside class="note"><strong>No live job board.</strong> Cards marked Example are fiction, so you can see the shape. Add an opening only after you have seen it yourself. NaijaPocket does not check that it is real, and it will not label your entry as verified.</aside>
    <form class="card stack" data-action="jobs-filter">
      ${field({ label: "Search your list", name: "q", value: route.params.q || "", placeholder: "Title or place" })}
      ${selectField("Type", "type", type, [{ value: "all", label: "All types" }, ...OPP_TYPES.map((t) => ({ value: t.id, label: t.label }))])}
      <button class="btn btn--line" type="submit">Filter</button>
    </form>
    <div class="grid-2">
      <a class="btn btn--gold" href="#/jobs/new">Add one you found</a>
      <a class="btn btn--line" href="#/jobs/cv">CV builder</a>
      <a class="btn btn--line" href="#/jobs/track">Application tracker</a>
      <a class="btn btn--line" href="#/jobs/skills">Skill tips</a>
    </div>
    <div class="list">${rows.length ? rows.map((row) => `<a class="item" href="#/jobs/item?id=${esc(row.id)}">
      <span class="split"><b>${esc(row.title)}</b>${badge(row.kind)}</span>
      <small>${esc(row.org)} · ${esc(typeLabel(row.type))} · ${row.remote ? "Remote" : esc(row.location || "Location not set")}</small>
    </a>`).join("") : `<p class="muted">Nothing in this filter. Add an opportunity you found, or clear the filter.</p>`}</div>
    <button class="btn btn--line" type="button" data-action="remove-examples" data-store="opportunities">Remove example listings</button>
  </div>`;
}

function formPage(api, existing) {
  const row = existing || { title: "", org: "", type: "job", location: api.state.profile.city || "", remote: false, eligibility: "", deadline: "", link: "", summary: "" };
  return `<div class="page">
    ${h1(existing ? "Edit opportunity" : "Add an opportunity", "Your entry")}
    <form class="card stack" data-action="job-save">
      <input type="hidden" name="id" value="${esc(row.id || "")}">
      ${field({ label: "Title", name: "title", value: row.title, placeholder: "The role, as the post states it" })}
      ${field({ label: "Organisation", name: "org", value: row.org, placeholder: "Who published it" })}
      ${selectField("Type", "type", row.type, OPP_TYPES.map((t) => ({ value: t.id, label: t.label })))}
      ${field({ label: "Location", name: "location", value: row.location })}
      <label class="check"><input type="checkbox" name="remote" ${row.remote ? "checked" : ""}><span>Remote</span></label>
      ${area({ label: "Eligibility", name: "eligibility", value: row.eligibility })}
      ${field({ label: "Closing date", name: "deadline", type: "date", value: row.deadline || "" })}
      ${field({ label: "Link you already trust", name: "link", value: row.link, placeholder: "https://…" })}
      ${area({ label: "Summary in your words", name: "summary", value: row.summary })}
      ${errLine()}
      <button class="btn btn--gold btn--block" type="submit">Save on this phone</button>
    </form>
    <p class="hint">Saving does not verify this listing. Check the source yourself before you pay anyone or share personal documents.</p>
  </div>`;
}

function detail(route, api) {
  const row = api.state.opportunities.find((item) => item.id === route.params.id);
  if (!row) return `<div class="page">${h1("Opportunity")}<p class="lede">That card is not on this phone.</p></div>`;
  const href = safeLink(row.link);
  return `<div class="page">
    ${h1(row.title, "PocketJobs")}
    <div class="row">${badge(row.kind)}<span class="badge">${esc(typeLabel(row.type))}</span></div>
    ${row.kind === "example" ? `<aside class="note"><strong>Example only.</strong> This is not a real vacancy, course or organisation.</aside>` : `<aside class="note"><strong>You added this.</strong> NaijaPocket has not checked the organisation, the link or the deadline.</aside>`}
    <section class="card stack">
      <p><b>Organisation.</b> ${esc(row.org)}</p>
      <p><b>Where.</b> ${row.remote ? "Remote" : esc(row.location || "Not set")}</p>
      <p><b>Closes.</b> ${row.deadline ? formatDate(row.deadline) : "No date saved"}</p>
      <p><b>Eligibility.</b> ${esc(row.eligibility || "Not added")}</p>
      <p>${esc(row.summary || "")}</p>
      ${href ? `<a class="btn btn--line" href="${esc(href)}" target="_blank" rel="noopener">Open the link you saved</a>` : `<p class="hint">No application link saved.</p>`}
    </section>
    <button class="btn btn--gold" type="button" data-action="track-add" data-id="${esc(row.id)}">Add to my tracker</button>
    <a class="btn btn--line" href="#/jobs/new?id=${esc(row.id)}">Edit</a>
    <button class="btn btn--line" type="button" data-action="job-concern" data-id="${esc(row.id)}">Flag it as suspicious</button>
    <button class="btn btn--danger" type="button" data-action="delete-job" data-id="${esc(row.id)}">Delete</button>
  </div>`;
}

function cvPage(api) {
  const cv = api.state.cv;
  const letter = api.state.letter || "";
  return `<div class="page">
    ${h1("CV builder", "Stays on this phone")}
    <p class="lede">Write only what is true. You can copy it into an email or WhatsApp.</p>
    <form class="card stack" data-action="cv-save">
      ${field({ label: "Full name", name: "name", value: cv.name })}
      ${field({ label: "Phone", name: "phone", value: cv.phone, inputmode: "tel" })}
      ${field({ label: "Email", name: "email", value: cv.email, type: "email" })}
      <div class="grid-2">${field({ label: "City", name: "city", value: cv.city })}${field({ label: "State", name: "state", value: cv.state })}</div>
      ${area({ label: "Short summary", name: "summary", value: cv.summary, placeholder: "Two or three true sentences." })}
      ${area({ label: "Experience — one role per block, with what you actually did", name: "experience", value: experienceText(cv), hint: "Separate roles with a blank line." })}
      ${area({ label: "Education", name: "education", value: educationText(cv), hint: "One line each: qualification, school, year." })}
      ${area({ label: "Skills", name: "skills", value: cv.skills })}
      ${errLine()}
      <button class="btn btn--gold" type="submit">Save CV</button>
    </form>
    <section class="card">
      <h2>Preview</h2>
      <pre class="out">${esc(cvPlainText(cv))}</pre>
      <div class="grid-2" style="margin-top:10px">
        <button class="btn btn--line" type="button" data-action="copy-cv">Copy</button>
        <a class="btn btn--wa" href="${waLink(cvPlainText(cv))}" target="_blank" rel="noopener">WhatsApp</a>
      </div>
    </section>
    <form class="card stack" data-action="cover-make">
      <div class="spread"><h2>Cover letter draft</h2>${freeBadge()}</div>
      <p class="hint">A template, not a live writer. Change anything that is not true before you send it.</p>
      ${field({ label: "Role", name: "role", placeholder: "Sales assistant" })}
      ${field({ label: "Organisation", name: "org", placeholder: "The name on the post" })}
      ${area({ label: "A true strength", name: "strengths", placeholder: "I kept the daily sales book for a year." })}
      ${errLine()}
      <button class="btn btn--gold" type="submit">Write the draft</button>
      ${letter ? `<pre class="out">${esc(letter)}</pre><a class="btn btn--wa" href="${waLink(letter)}" target="_blank" rel="noopener">Share draft</a>` : ""}
    </form>
    <section class="card">
      <div class="spread"><h2>Extra tones</h2>${plusBadge()}</div>
      <p class="lede">More than one letter style is Pocket Plus (₦500 / month). The draft above is free.</p>
      <button class="btn btn--line" type="button" data-action="premium" data-feature="Extra cover-letter styles">See premium</button>
    </section>
  </div>`;
}

function track(api) {
  const rows = api.state.applications;
  return `<div class="page">
    ${h1("Application tracker", "PocketJobs")}
    <p class="lede">Move each application as you go. This list is only on this phone.</p>
    ${rows.length ? rows.map((row) => `<article class="card stack">
      <div class="split"><b>${esc(row.title)}</b><span class="badge">${esc(statusLabel(row.status))}</span></div>
      <p class="muted">${esc(row.org || "")}${row.deadline ? " · closes " + formatDate(row.deadline) : ""}</p>
      <label class="field"><span>Status</span>
        <select data-change="app-status" data-id="${esc(row.id)}">${APP_STATUSES.map((s) => `<option value="${s.id}"${s.id === row.status ? " selected" : ""}>${s.label}</option>`).join("")}</select>
      </label>
      ${row.notes ? `<p>${esc(row.notes)}</p>` : ""}
      <button class="btn btn--danger btn--sm" type="button" data-action="delete-app" data-id="${esc(row.id)}">Remove</button>
    </article>`).join("") : `<section class="card"><p class="lede">Nothing tracked yet. Open an opportunity and tap “Add to my tracker”, or add a note here.</p></section>`}
    <form class="card stack" data-action="app-create">
      <h2>Add without a listing</h2>
      ${field({ label: "Role", name: "title" })}
      ${field({ label: "Organisation", name: "org" })}
      ${field({ label: "Deadline", name: "deadline", type: "date" })}
      ${errLine()}
      <button class="btn btn--line" type="submit">Save</button>
    </form>
  </div>`;
}

function skills() {
  return `<div class="page">
    ${h1("Skill tips", "PocketJobs")}
    <p class="lede">General advice for looking for work in Nigeria. Not a promise of a job.</p>
    ${SKILL_TIPS.map((tip) => `<article class="card"><h2>${esc(tip.title)}</h2><p class="lede" style="margin-top:6px">${esc(tip.body)}</p></article>`).join("")}
    <section class="card stack">
      <h2>Interview practice</h2>
      ${INTERVIEW.map((item) => `<div><b>${esc(item.q)}</b><p class="lede">${esc(item.a)}</p></div>`).join("")}
      <button class="btn btn--line" type="button" data-action="premium" data-feature="Personal interview scripts">Personal scripts are premium</button>
    </section>
  </div>`;
}

function typeLabel(id) {
  return OPP_TYPES.find((t) => t.id === id)?.label || id;
}
function statusLabel(id) {
  return APP_STATUSES.find((s) => s.id === id)?.label || id;
}
function experienceText(cv) {
  return (cv.experience || []).map((row) => [row.role, row.place, row.years, row.detail].filter(Boolean).join("\n")).join("\n\n");
}
function educationText(cv) {
  return (cv.education || []).map((row) => [row.qualification, row.school, row.year].filter(Boolean).join(" — ")).join("\n");
}
function parseBlocks(text) {
  return String(text || "").split(/\n\s*\n/).map((block) => block.trim()).filter(Boolean);
}
function safeLink(value) {
  try {
    const url = new URL(value);
    if (url.protocol === "http:" || url.protocol === "https:") return url.href;
  } catch { /* ignore */ }
  return "";
}

export const actions = {
  "jobs-filter"(api, form, data) {
    const q = String(data.get("q") || "").trim();
    const type = data.get("type") || "all";
    api.go(`/jobs?type=${encodeURIComponent(type)}&q=${encodeURIComponent(q)}`);
  },
  async "job-save"(api, form, data) {
    const title = String(data.get("title") || "").trim();
    const org = String(data.get("org") || "").trim();
    if (!title || !org) return api.formError(form, "Add a title and an organisation.");
    const id = data.get("id") || uid();
    const previous = api.state.opportunities.find((row) => row.id === id);
    await api.save("opportunities", {
      id,
      title,
      org,
      type: data.get("type") || "job",
      location: String(data.get("location") || "").trim(),
      remote: data.get("remote") === "on",
      eligibility: String(data.get("eligibility") || "").trim(),
      deadline: data.get("deadline") || "",
      link: String(data.get("link") || "").trim(),
      summary: String(data.get("summary") || "").trim(),
      kind: "yours",
      concern: previous?.concern || "",
      createdAt: previous?.createdAt || new Date().toISOString()
    });
    api.toast("Saved as your listing. Not verified.");
    api.go("/jobs/item?id=" + id);
  },
  async "delete-job"(api, el) {
    await api.remove("opportunities", el.dataset.id);
    api.go("/jobs");
  },
  "job-concern"(api, el) {
    const row = api.state.opportunities.find((item) => item.id === el.dataset.id);
    if (!row) return;
    api.sheet(`<form class="sheet__pad" data-action="job-concern-save">
      <h2 id="sheet-title">Flag this listing</h2>
      <p class="lede">This note stays on your phone. It is not sent to the organisation or to NaijaPocket.</p>
      <input type="hidden" name="id" value="${esc(row.id)}">
      ${area({ label: "What worries you?", name: "concern", value: row.concern || "" })}
      <button class="btn btn--gold" type="submit">Save the flag</button>
    </form>`);
  },
  async "job-concern-save"(api, form, data) {
    const row = api.state.opportunities.find((item) => item.id === data.get("id"));
    if (!row) return;
    row.concern = String(data.get("concern") || "").trim();
    await api.save("opportunities", row);
    api.closeSheet();
    api.toast("Flag saved on this phone only.");
    api.rerender();
  },
  async "track-add"(api, el) {
    const row = api.state.opportunities.find((item) => item.id === el.dataset.id);
    if (!row) return;
    if (api.state.applications.some((app) => app.opportunityId === row.id)) {
      api.toast("Already in your tracker.");
      api.go("/jobs/track");
      return;
    }
    await api.save("applications", {
      id: uid(),
      title: row.title,
      org: row.org,
      status: "saved",
      deadline: row.deadline || "",
      link: row.link || "",
      notes: row.kind === "example" ? "Tracked from an example card." : "",
      opportunityId: row.id
    });
    api.toast("Added to your tracker.");
    api.go("/jobs/track");
  },
  async "app-create"(api, form, data) {
    const title = String(data.get("title") || "").trim();
    if (!title) return api.formError(form, "Add the role.");
    await api.save("applications", {
      id: uid(), title, org: String(data.get("org") || "").trim(),
      status: "saved", deadline: data.get("deadline") || "", notes: "", link: ""
    });
    api.rerender();
  },
  async "app-status"(api, el) {
    const row = api.state.applications.find((item) => item.id === el.dataset.id);
    if (!row) return;
    row.status = el.value;
    await api.save("applications", row);
    api.toast("Status updated.");
    api.rerender();
  },
  async "delete-app"(api, el) {
    await api.remove("applications", el.dataset.id);
    api.rerender();
  },
  async "cv-save"(api, form, data) {
    const name = String(data.get("name") || "").trim();
    if (!name) return api.formError(form, "Add your name.");
    const experience = parseBlocks(data.get("experience")).map((block) => {
      const [role, place, years, ...rest] = block.split("\n");
      return { id: uid(), role: role || "", place: place || "", years: years || "", detail: rest.join("\n") };
    });
    const education = String(data.get("education") || "").split("\n").map((line) => line.trim()).filter(Boolean).map((line) => {
      const [qualification, school, year] = line.split("—").map((part) => part.trim());
      const bits = line.includes("—") ? [qualification, school, year] : line.split(",").map((part) => part.trim());
      return { id: uid(), qualification: bits[0] || "", school: bits[1] || "", year: bits[2] || "" };
    });
    await api.save("cv", {
      ...api.state.cv,
      id: "me",
      name,
      phone: String(data.get("phone") || "").trim(),
      email: String(data.get("email") || "").trim(),
      city: String(data.get("city") || "").trim(),
      state: String(data.get("state") || "").trim(),
      summary: String(data.get("summary") || "").trim(),
      skills: String(data.get("skills") || "").trim(),
      experience,
      education
    });
    api.toast("CV saved on this phone.");
    api.rerender();
  },
  async "copy-cv"(api) {
    try {
      await navigator.clipboard.writeText(cvPlainText(api.state.cv));
      api.toast("CV copied.");
    } catch {
      api.toast("Copy failed. Use the WhatsApp button.");
    }
  },
  "cover-make"(api, form, data) {
    const role = String(data.get("role") || "").trim();
    if (!role) return api.formError(form, "Add the role you are applying for.");
    api.state.letter = coverLetter({
      name: api.state.cv.name,
      city: api.state.cv.city,
      role,
      org: data.get("org"),
      strengths: data.get("strengths")
    });
    api.toast("Draft ready. Read it before you send it.");
    api.rerender();
  }
};

export function editRoute(route, api) {
  if (route.path === "/jobs/new" && route.params.id) {
    const row = api.state.opportunities.find((item) => item.id === route.params.id);
    if (row) return formPage(api, row);
  }
  return "";
}
