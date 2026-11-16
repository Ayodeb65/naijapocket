/* ==========================================================
   NaijaPocket landing page — vanilla JS, no dependencies
   ========================================================== */

/* ============================================================
   ⚙️  CONFIG — edit these three values before going live
   ============================================================ */
const CONFIG = {
  // 1) Google Apps Script web-app URL (see SETUP.md). Leave "" to preview locally.
  //    Example: "https://script.google.com/macros/s/AKfy.../exec"
  SIGNUP_ENDPOINT: "https://script.google.com/macros/s/AKfycbxQkaoYHt_GeXfFCvfob4L4tPkUYWvtlPhk0UelXbLIbJniFyNxUekO8l55BR8cpRz-zA/exec",

  // 2) Your WhatsApp community / group invite link.
  //    Example: "https://chat.whatsapp.com/AbCdEfGhIjK"
  WHATSAPP_COMMUNITY_URL: "https://whatsapp.com/channel/0029VaAZgif1CYoM9pVRF12s",

  // 3) Public address of this site (used in WhatsApp share messages).
  //    Leave "" to use whatever address the page is opened from.
  SITE_URL: "https://ayodeb65.github.io/naijapocket/"
};
/* ============================================================ */

(function () {
  "use strict";
  document.documentElement.classList.add("js");

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const naira = (n) => "₦" + Math.round(n).toLocaleString("en-NG");
  const siteUrl = () => (CONFIG.SITE_URL || (location.origin + location.pathname)).replace(/index\.html$/, "");
  const waLink = (text) => "https://wa.me/?text=" + encodeURIComponent(text);
  const isPlaceholder = (u) => !u || /REPLACE_WITH/i.test(u);

  /* ---------- year + nav state ---------- */
  const yr = $("#yr"); if (yr) yr.textContent = new Date().getFullYear();
  const nav = $(".nav");
  const onScroll = () => nav && nav.classList.toggle("is-scrolled", window.scrollY > 24);
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* ---------- reveal on scroll ---------- */
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const revealEls = $$(".reveal");
  if (!reduce && "IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          const sibs = Array.from(e.target.parentElement.children).filter((c) => c.classList.contains("reveal"));
          e.target.style.transitionDelay = Math.min(sibs.indexOf(e.target), 5) * 70 + "ms";
          e.target.classList.add("in"); io.unobserve(e.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    revealEls.forEach((el) => io.observe(el));
  } else revealEls.forEach((el) => el.classList.add("in"));

  /* ---------- Feed Your Family teaser ---------- */
  const hhOut = $("#hh"), hhUnit = $("#hh-unit"), budgetIn = $("#budget");
  const rPpd = $("#r-ppd"), rMeal = $("#r-meal"), rDay = $("#r-day"), rMsg = $("#r-msg"), calcShare = $("#calc-share");
  let hh = 4;
  const MIN_HH = 1, MAX_HH = 20, MAX_BUDGET = 10000000;

  const readBudget = () => {
    const n = parseInt((budgetIn.value || "").replace(/[^\d]/g, ""), 10);
    return isNaN(n) ? 0 : Math.min(n, MAX_BUDGET);
  };
  function animateTo(el, value) {
    if (reduce) { el.textContent = naira(value); return; }
    const from = parseInt(el.dataset.v || "0", 10), start = performance.now(), dur = 450;
    el.dataset.v = String(Math.round(value));
    const tick = (t) => {
      const p = Math.min((t - start) / dur, 1), k = 1 - Math.pow(1 - p, 3);
      el.textContent = naira(from + (value - from) * k);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
  function updateCalc() {
    const b = readBudget();
    hhOut.textContent = hh;
    hhUnit.textContent = hh === 1 ? "person" : "people";
    const day = b / 7, ppd = day / hh, meal = ppd / 3;
    animateTo(rPpd, ppd); animateTo(rMeal, meal); animateTo(rDay, day);
    $$(".quick button").forEach((btn) => btn.setAttribute("aria-pressed", String(+btn.dataset.amt === b)));
    const who = hh === 1 ? "just you" : hh + " people";
    rMsg.textContent = b > 0
      ? "PocketSaver will turn " + naira(b) + " into a week of meals and a shopping list for " + who + " — matched to prices in your area."
      : "Enter your weekly food budget to see the breakdown.";
    const msg = "🍲 Feed Your Family Challenge! My household of " + hh + " is planning meals on " + naira(b) +
      " a week — that's " + naira(ppd) + " per person per day. How far does your budget go? Try it on NaijaPocket: " + siteUrl() + "#teaser";
    calcShare.href = waLink(msg);
  }
  $$(".stepper__btn").forEach((btn) => btn.addEventListener("click", () => {
    hh = Math.max(MIN_HH, Math.min(MAX_HH, hh + parseInt(btn.dataset.step, 10))); updateCalc();
  }));
  $$(".quick button").forEach((btn) => btn.addEventListener("click", () => {
    budgetIn.value = (+btn.dataset.amt).toLocaleString("en-NG"); updateCalc();
  }));
  budgetIn.addEventListener("input", () => {
    const n = readBudget();
    budgetIn.value = n ? n.toLocaleString("en-NG") : "";
    updateCalc();
  });
  if (budgetIn) updateCalc();

  /* ---------- Early-access form ---------- */
  const form = $("#signup"), success = $("#success"), submitBtn = $("#submit");
  if (!form) return;

  // Accepts 0803 123 4567, 803 123 4567, +234 803 123 4567, 234803..., returns "+2348031234567" or null.
  function normaliseNgPhone(raw) {
    let d = String(raw || "").replace(/\D/g, "");
    if (d.startsWith("234")) d = d.slice(3);
    else if (d.startsWith("0")) d = d.slice(1);
    return /^[789][01]\d{8}$/.test(d) ? "+234" + d : null;
  }

  const fields = {
    name: { el: $("#f-name"), err: $("#e-name"), check: (v) => v.trim().length < 2 ? "Please enter your name." : "" },
    phone: { el: $("#f-phone"), err: $("#e-phone"), check: (v) => !v.trim() ? "Please enter your WhatsApp number." : (!normaliseNgPhone(v) ? "Enter a valid Nigerian number, e.g. 0803 123 4567." : "") },
    state: { el: $("#f-state"), err: $("#e-state"), check: (v) => !v ? "Please select your state." : "" },
    consent: { el: $("#f-consent"), err: $("#e-consent"), check: (_, el) => !el.checked ? "Please tick this box so we can contact you." : "" }
  };

  function validate(key) {
    const f = fields[key], msg = f.check(f.el.value, f.el);
    f.err.textContent = msg;
    f.el.closest(".field").classList.toggle("invalid", !!msg);
    f.el.setAttribute("aria-invalid", msg ? "true" : "false");
    return !msg;
  }
  Object.keys(fields).forEach((k) => {
    const el = fields[k].el;
    el.addEventListener("blur", () => { if (el.value || k === "consent") validate(k); });
    el.addEventListener(el.type === "checkbox" || el.tagName === "SELECT" ? "change" : "input", () => {
      if (el.closest(".field").classList.contains("invalid")) validate(k);
    });
  });

  function showSuccess(name) {
    $("#s-name").textContent = (name || "friend").split(/\s+/)[0];
    const community = $("#community-link");
    community.href = CONFIG.WHATSAPP_COMMUNITY_URL;
    if (isPlaceholder(CONFIG.WHATSAPP_COMMUNITY_URL)) {
      console.info("[NaijaPocket] WHATSAPP_COMMUNITY_URL is still a placeholder — set it in app.js CONFIG.");
    }
    const share = "Hey! 👋 I just joined the early-access list for NaijaPocket 🇳🇬 — a Nigerian app that helps you plan your food budget, find legit opportunities and avoid scams. It's free to join. Join me here: " + siteUrl();
    $("#share-link").href = waLink(share);
    form.hidden = true; success.hidden = false;
    success.focus({ preventScroll: true });
    success.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    $("#e-form").textContent = "";
    const ok = ["name", "phone", "state", "consent"].map(validate);
    if (ok.includes(false)) {
      const firstBad = Object.values(fields).find((f) => f.el.getAttribute("aria-invalid") === "true");
      if (firstBad) firstBad.el.focus();
      return;
    }
    if ($("#f-web").value) { showSuccess(fields.name.el.value); return; } // honeypot: quietly ignore bots

    const interests = $$('input[name="interests"]:checked').map((c) => c.value);
    const data = {
      name: fields.name.el.value.trim().slice(0, 80),
      phone: normaliseNgPhone(fields.phone.el.value),
      state: fields.state.el.value,
      interests: interests.join(", "),
      consent: "yes",
      source: document.referrer ? new URL(document.referrer).hostname : "direct",
      page: location.href.split("#")[0]
    };

    submitBtn.disabled = true; submitBtn.classList.add("is-loading");
    try {
      if (!CONFIG.SIGNUP_ENDPOINT) {
        console.info("[NaijaPocket] Preview mode: SIGNUP_ENDPOINT is empty, so this sign-up was NOT saved. " +
          "Set CONFIG.SIGNUP_ENDPOINT in app.js to your Google Apps Script URL (see SETUP.md).", data);
        await new Promise((r) => setTimeout(r, 650));
      } else {
        const ctrl = new AbortController(), t = setTimeout(() => ctrl.abort(), 15000);
        // no-cors + urlencoded = a "simple" request Apps Script accepts without CORS preflight.
        await fetch(CONFIG.SIGNUP_ENDPOINT, { method: "POST", mode: "no-cors", body: new URLSearchParams(data), signal: ctrl.signal });
        clearTimeout(t);
      }
      try { localStorage.setItem("np_joined", data.name); } catch (_) {}
      showSuccess(data.name);
    } catch (err) {
      console.warn("[NaijaPocket] Sign-up failed", err);
      $("#e-form").textContent = "Network wahala — please check your connection and try again.";
    } finally {
      submitBtn.disabled = false; submitBtn.classList.remove("is-loading");
    }
  });
})();
