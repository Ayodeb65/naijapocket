/* Pure calculations. Safe to run in Node tests and in the browser.
   Prices, jobs and health notes passed in are the caller's data.
   This file never invents a market quotation. */

import { BREAKFASTS, DINNERS, PROMO_STYLES, QUIZ, SCAM_TYPES, TIPS } from "./content.js";
import { addDays, clamp, dayOfYear, norm, parseMoney, sum, todayISO, uid } from "./money.js";

export function buildSeed() {
  const day = todayISO();
  const stamp = new Date().toISOString();
  const price = (id, item, unit, place) => ({
    id,
    item,
    amount: 100,
    unit,
    place,
    area: "Your area",
    date: day,
    kind: "example",
    note: "Placeholder amount for the demo. Not a live market price. Edit it or delete it.",
    createdAt: stamp
  });
  const job = (id, title, type, summary) => ({
    id,
    title,
    org: "Sample name only — not a real organisation",
    type,
    location: "Your city",
    remote: type === "remote",
    eligibility: "Example text. Replace this with the requirements you read on the real post.",
    deadline: "",
    link: "",
    summary,
    kind: "example",
    createdAt: stamp
  });
  return {
    prices: [
      price("ex-rice-1", "Rice", "cup", "Example market"),
      price("ex-rice-2", "Rice", "cup", "Second example stall"),
      price("ex-beans", "Beans", "cup", "Example market"),
      price("ex-eggs", "Eggs", "piece", "Example market")
    ],
    opportunities: [
      job("ex-job-1", "Example: shop assistant (not a real job)", "job", "This card shows how a job will look. It is not a vacancy. Delete it, or edit it into an opening you found yourself."),
      job("ex-job-2", "Example: weekend side hustle (not a real offer)", "side-hustle", "A sample side-hustle card. Nobody is hiring through this listing."),
      job("ex-job-3", "Example: short training (not a real course)", "training", "A sample training card so you can try the tracker. It is not a course you can enrol in.")
    ],
    places: [
      {
        id: "ex-place",
        name: "Example: your neighbourhood primary health centre",
        kind: "Primary health centre",
        area: "Your area",
        phone: "",
        note: "This is not a real clinic. Replace it with a place you know, or delete it.",
        example: true,
        createdAt: stamp
      }
    ]
  };
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export function summariseBudget(budget) {
  const income = sum((budget?.income || []).map((row) => row.amount));
  const planned = sum((budget?.categories || []).map((row) => row.planned));
  const spent = sum((budget?.expenses || []).map((row) => row.amount));
  const byCategory = (budget?.categories || []).map((cat) => {
    const used = sum((budget.expenses || []).filter((e) => e.categoryId === cat.id).map((e) => e.amount));
    return { ...cat, spent: used, left: round2(cat.planned - used) };
  });
  return {
    income,
    planned,
    spent,
    left: round2(income - spent),
    planLeft: round2(planned - spent),
    byCategory
  };
}

export function emptyBudget(month) {
  return {
    id: uid(),
    month,
    income: [],
    categories: [
      "Food", "Rent", "Transport", "Fuel & generator", "Light (prepaid)",
      "Airtime & data", "School & family", "Health", "Giving", "Savings", "Other"
    ].map((name) => ({ id: uid(), name, planned: 0 })),
    expenses: [],
    updatedAt: new Date().toISOString()
  };
}

function round2(n) {
  return Math.round((Number(n) || 0) * 100) / 100;
}

function scaleQty(qty, per, household) {
  const raw = qty * (household / per);
  if (raw >= 10) return Math.round(raw);
  return Math.round(raw * 2) / 2;
}

function prefer(recipes, prefs) {
  if (!prefs?.length) return recipes;
  const wanted = new Set(prefs.map(norm));
  const matched = recipes.filter((r) => (r.tags || []).some((t) => wanted.has(norm(t))));
  return matched.length ? matched : recipes;
}

export function buildFoodPlan({ household = 4, budget = 0, prefs = [] } = {}) {
  const people = clamp(parseInt(household, 10) || 1, 1, 20);
  const money = Math.max(0, parseMoney(budget));
  const dinners = pick(prefer(DINNERS, prefs).slice().sort((a, b) => b.stretch - a.stretch), 7);
  const breakfasts = prefer(BREAKFASTS, prefs);
  const days = DAYS.map((day, i) => ({
    day,
    breakfast: breakfasts[i % breakfasts.length],
    dinner: dinners[i % dinners.length]
  }));
  const list = aggregate(days, people);
  return {
    household: people,
    budget: money,
    prefs: prefs.slice(),
    perDay: round2(money / 7),
    perPersonDay: round2(money / 7 / people),
    perMeal: round2(money / 7 / people / 3),
    days: days.map((d) => ({
      day: d.day,
      breakfast: { id: d.breakfast.id, name: d.breakfast.name, note: d.breakfast.note },
      dinner: { id: d.dinner.id, name: d.dinner.name, note: d.dinner.note }
    })),
    list,
    createdAt: new Date().toISOString(),
    notice: "Meal ideas are common Nigerian dishes, scaled to your household. They are not priced. A basket total appears only for items you have saved a price for."
  };
}

function pick(list, count) {
  if (!list.length) return [];
  const out = [];
  for (let i = 0; i < count; i++) out.push(list[i % list.length]);
  return out;
}

function aggregate(days, people) {
  const map = new Map();
  days.forEach((day) => {
    [day.breakfast, day.dinner].forEach((meal) => {
      (meal.ingredients || []).forEach((ing) => {
        const key = norm(ing.item) + "|" + norm(ing.unit);
        const qty = scaleQty(ing.qty, ing.per || 4, people);
        const prev = map.get(key);
        if (prev) prev.qty = round2(prev.qty + qty);
        else map.set(key, { id: uid(), item: ing.item, qty, unit: ing.unit, group: ing.group || "other", done: false });
      });
    });
  });
  return Array.from(map.values());
}

export function estimateBasket(list, prices) {
  const lines = (list || []).map((item) => {
    const mine = (prices || []).filter((p) => norm(p.item) === norm(item.item) && p.kind !== "example");
    if (!mine.length) {
      return { ...item, used: false, cost: null, reason: "No price you saved for this item." };
    }
    const sameUnit = mine.filter((p) => norm(p.unit) === norm(item.unit));
    if (!sameUnit.length) {
      return {
        ...item,
        used: false,
        cost: null,
        reason: "You saved a price per " + mine[0].unit + ", but this list counts " + item.unit + "."
      };
    }
    const latest = sameUnit.slice().sort((a, b) => String(b.date).localeCompare(String(a.date)))[0];
    const cost = round2(latest.amount * item.qty);
    return {
      ...item,
      used: true,
      cost,
      priceId: latest.id,
      place: latest.place,
      date: latest.date,
      unitAmount: latest.amount,
      reason: ""
    };
  });
  const used = lines.filter((l) => l.used);
  return {
    lines,
    total: sum(used.map((l) => l.cost)),
    covered: used.length,
    missing: lines.length - used.length
  };
}

export function comparePrices(prices) {
  const groups = new Map();
  (prices || []).forEach((p) => {
    const key = norm(p.item);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(p);
  });
  return Array.from(groups.values()).map((rows) => {
    const units = new Set(rows.map((r) => norm(r.unit)));
    let note = "These are the prices you saved. Example rows are placeholders, not market quotes.";
    let cheapest = null;
    if (units.size === 1 && rows.length > 1) {
      const real = rows.filter((r) => r.kind !== "example");
      const pool = real.length ? real : [];
      if (pool.length > 1) {
        cheapest = pool.slice().sort((a, b) => a.amount - b.amount)[0];
        note = "Lowest among prices you entered yourself. Examples are not included in this comparison.";
      } else if (!real.length) {
        note = "Every row here is an example placeholder. Enter your own price before treating any number as a comparison.";
      } else {
        note = "Add another price you paid, in the same unit, to compare.";
      }
    } else if (units.size > 1) {
      note = "These rows use different units, so NaijaPocket will not call one of them cheaper.";
    }
    return { item: rows[0].item, rows, cheapest, note };
  });
}

const MESSAGE_RULES = [
  { id: "secret", weight: 3, re: /\b(otp|one[-\s]?time|pin\b|cvv|bvn|password|passcode|token)\b/i, flag: "It asks for a code, PIN, password, BVN or card detail." },
  { id: "rush", weight: 2, re: /\b(immediately|right now|now now|within \d+\s*(minute|hour)|account (will be|has been) (blocked|suspended|closed)|urgent|last chance)\b/i, flag: "It pushes you to act quickly." },
  { id: "prize", weight: 2, re: /\b(you have won|you've won|congratulations|lottery|raffle|promo winner|claim your (prize|reward|funds))\b/i, flag: "It talks about a prize or a win." },
  { id: "fee", weight: 3, re: /\b(pay|send|transfer).{0,40}\b(fee|tax|activation|registration|processing)\b|\b(activation|registration|processing) fee\b/i, flag: "It asks you to pay a fee to receive something." },
  { id: "guarantee", weight: 2, re: /\b(guaranteed|double your money|risk[-\s]?free|\d+\s*%\s*(daily|weekly|in \d+ days))\b/i, flag: "It promises a sure or very fast profit." },
  { id: "official", weight: 3, re: /\b(efcc|police|court|army|navy|dss|custom).{0,60}\b(pay|transfer|fine|settle)\b|\b(arrest|warrant).{0,40}\b(pay|transfer)\b/i, flag: "It threatens official trouble and asks for money." },
  { id: "remote", weight: 2, re: /\b(anydesk|teamviewer|remote access|screen sharing)\b/i, flag: "It asks you to install a remote-access app." },
  { id: "link", weight: 1, re: /https?:\/\/|bit\.ly|tinyurl|wa\.me\/\d{6,}/i, flag: "It contains a link or a short web address." }
];

export function checkMessage(text) {
  const raw = String(text || "").trim();
  if (!raw) {
    return { level: "empty", score: 0, flags: [], summary: "Paste a message to check it." };
  }
  const flags = MESSAGE_RULES.filter((rule) => rule.re.test(raw)).map(({ id, flag, weight }) => ({ id, flag, weight }));
  const score = flags.reduce((a, f) => a + f.weight, 0);
  let level = "low";
  let summary = "No common warning words stood out. That does not mean this message is safe.";
  if (score >= 3) {
    level = "high";
    summary = "Several warning signs. Do not pay, and do not share any code. Check through a channel you already trust.";
  } else if (score >= 1) {
    level = "some";
    summary = "Some warning signs. Slow down. Confirm the person on a number you saved before this message arrived.";
  }
  return {
    level,
    score,
    flags,
    summary,
    disclaimer: "This check only looks for common warning words on your phone. It cannot confirm that a message, person or payment is safe, and it cannot recover money."
  };
}

export function checkLink(input) {
  const raw = String(input || "").trim();
  const notes = [];
  if (!raw) return { notes: [], summary: "Paste a web address to look at it.", disclaimer: linkDisclaimer() };
  let url;
  try {
    url = new URL(/^[a-z]+:\/\//i.test(raw) ? raw : "https://" + raw);
  } catch {
    return { notes: ["This does not look like a web address."], summary: "Check the spelling, or don't open it.", disclaimer: linkDisclaimer() };
  }
  if (url.protocol !== "https:") notes.push("It does not use https.");
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(url.hostname)) notes.push("The address is a raw IP number, which genuine banks and shops rarely send.");
  if (raw.includes("@")) notes.push("It contains an @ sign. That can hide the real site before the @.");
  if ((url.hostname.match(/\./g) || []).length >= 4) notes.push("The address has many dots. The real site name is easy to miss.");
  if (/(login|verify|secure|update|bonus|reward|wallet|kyc)[-.]/i.test(url.hostname) && (url.hostname.match(/\./g) || []).length >= 2) {
    notes.push("The address uses words like verify, secure or bonus. Scam pages often do. This is not proof either way.");
  }
  const summary = notes.length
    ? "There are reasons to be careful. NaijaPocket still cannot tell you the site is safe or unsafe."
    : "Nothing obvious stood out in the address itself. That does not mean the site is safe. If you were not expecting it, do not open it.";
  return { notes, summary, host: url.hostname, disclaimer: linkDisclaimer() };
}

function linkDisclaimer() {
  return "NaijaPocket cannot certify a website. A normal-looking address can still be a scam, and an odd address can be harmless. When it matters, type the official address yourself.";
}

export function scoreQuiz(answers) {
  let correct = 0;
  const review = QUIZ.map((item, i) => {
    const picked = Number(answers[i]);
    const ok = picked === item.answer;
    if (ok) correct += 1;
    return { ok, picked, answer: item.answer, why: item.why, q: item.q };
  });
  return {
    correct,
    total: QUIZ.length,
    review,
    note: "This is practice, not a certificate and not a promise that you will spot every scam."
  };
}

export function businessTotals(sales, expenses) {
  const salesTotal = sum((sales || []).map((row) => round2((row.qty || 0) * (row.unitPrice || 0))));
  const expenseTotal = sum((expenses || []).map((row) => row.amount));
  return { sales: salesTotal, expenses: expenseTotal, profit: round2(salesTotal - expenseTotal) };
}

export function suggestPrice({ cost = 0, extra = 0, margin = 0 } = {}) {
  const goods = Math.max(0, parseMoney(cost));
  const other = Math.max(0, parseMoney(extra));
  const pct = clamp(parseMoney(margin), 0, 500);
  const totalCost = round2(goods + other);
  const price = round2(totalCost * (1 + pct / 100));
  return { goods, other, margin: pct, totalCost, price, profit: round2(price - totalCost) };
}

export function invoiceTotal(items) {
  const lines = (items || []).map((item) => ({
    ...item,
    amount: round2((parseMoney(item.qty) || 0) * (parseMoney(item.price) || 0))
  }));
  return { lines, total: sum(lines.map((l) => l.amount)) };
}

export function promoText(styleId, fields) {
  const style = PROMO_STYLES.find((s) => s.id === styleId) || PROMO_STYLES[0];
  const product = clean(fields.product, "your product");
  const price = clean(fields.price, "");
  const benefit = clean(fields.benefit, "made to last");
  const area = clean(fields.area, "your area");
  const contact = clean(fields.contact, "this number");
  const priceBit = price ? " — " + price : "";
  const map = {
    whatsapp: product + priceBit + ".\n" + benefit + ".\nPickup / delivery around " + area + ".\nMessage " + contact + " to order.\n\n(Edit this before you post. It is a template, not a live writer.)",
    caption: product + priceBit + "\n" + benefit + ".\nWe are in " + area + ". Send a message to " + contact + ".\n\n(Template — change anything that is not true.)",
    product: product + ".\n" + benefit + ".\nPrice: " + (price || "add your price") + ".\nAvailable in " + area + ". Contact " + contact + ".\n\n(Plain template. Add size, colour or flavour if they matter.)",
    followup: "Good day, just checking if you still want the " + product + (price ? " (" + price + ")" : "") + ". I kept it aside in case. You can reply to " + contact + " whenever you are ready — no pressure.\n\n(Template. Only send this if the person actually asked.)",
    restock: "New stock: " + product + priceBit + ".\n" + benefit + ".\n" + area + ". Message " + contact + ".\n\n(Pocket Plus template. Edit it so it matches what you really have.)",
    thankyou: "Thank you for paying for " + product + (price ? " (" + price + ")" : "") + ". We appreciate you. If anything is wrong with the order, message " + contact + " and we will look at it.\n\n(Template. A thank-you is not a tax invoice.)"
  };
  return { style, text: map[style.id] || map.whatsapp };
}

function clean(value, fallback) {
  const v = String(value || "").trim();
  return v || fallback;
}

export function coverLetter({ name, role, org, city, strengths }) {
  const who = clean(name, "your name");
  const job = clean(role, "the role");
  const place = clean(org, "your organisation");
  const where = clean(city, "my city");
  const skill = clean(strengths, "showing up on time and learning the work quickly");
  return [
    "Dear Hiring Manager,",
    "",
    "My name is " + who + ", and I am applying for the " + job + " role at " + place + ". I live in " + where + ".",
    "",
    "What I would bring: " + skill + ".",
    "",
    "I am happy to come in for a conversation and to show you work I have actually done. Thank you for reading.",
    "",
    "Sincerely,",
    who,
    "",
    "— Draft from a NaijaPocket template. Change every line that is not true. This was not written by a live AI service."
  ].join("\n");
}

export function cvPlainText(cv) {
  if (!cv) return "";
  const lines = [];
  lines.push(cv.name || "Your name");
  const contact = [cv.phone, cv.email, [cv.city, cv.state].filter(Boolean).join(", ")].filter(Boolean);
  if (contact.length) lines.push(contact.join(" · "));
  if (cv.summary) lines.push("", cv.summary);
  if (cv.experience?.length) {
    lines.push("", "Experience");
    cv.experience.forEach((row) => {
      lines.push([row.role, row.place].filter(Boolean).join(" — "));
      if (row.years) lines.push(row.years);
      if (row.detail) lines.push(row.detail);
    });
  }
  if (cv.education?.length) {
    lines.push("", "Education");
    cv.education.forEach((row) => lines.push([row.qualification, row.school, row.year].filter(Boolean).join(" — ")));
  }
  if (cv.skills) lines.push("", "Skills", cv.skills);
  lines.push("", "— Built in NaijaPocket on this phone. Check every fact before you send it.");
  return lines.join("\n");
}

export function tipForToday(date = new Date()) {
  return TIPS[dayOfYear(date) % TIPS.length];
}

export function scamForToday(date = new Date()) {
  return SCAM_TYPES[dayOfYear(date) % SCAM_TYPES.length];
}

export function challengeProgress(challenge, today = todayISO()) {
  if (!challenge) return null;
  const days = [];
  for (let i = 0; i < 30; i++) {
    const date = addDays(challenge.start, i);
    days.push({ index: i + 1, date, done: Boolean(challenge.ticks?.[date]), future: date > today });
  }
  const done = days.filter((d) => d.done).length;
  return {
    days,
    done,
    saved: round2(done * (parseMoney(challenge.daily) || 0)),
    target: round2(30 * (parseMoney(challenge.daily) || 0)),
    today
  };
}

export function receiptText(invoice) {
  const calc = invoiceTotal(invoice.items || []);
  const lines = [
    invoice.business || "Receipt",
    "Receipt " + (invoice.number || ""),
    invoice.date || "",
    invoice.customer ? "To: " + invoice.customer : "",
    ""
  ];
  calc.lines.forEach((item) => {
    lines.push(item.desc + " × " + item.qty + " — " + item.amount);
  });
  lines.push("", "Total: " + calc.total);
  if (invoice.note) lines.push(invoice.note);
  lines.push("", "Simple receipt made in NaijaPocket. Add any tax details your business is required to show. NaijaPocket does not file tax for you.");
  return lines.filter((l) => l !== undefined).join("\n");
}

export function planShareText(plan, basket) {
  if (!plan) return "";
  const lines = [
    "NaijaPocket weekly food plan",
    plan.household + " people · budget " + plan.budget + " for the week",
    "About " + plan.perPersonDay + " per person per day (maths on your budget, not a price list).",
    ""
  ];
  plan.days.forEach((d) => lines.push(d.day + ": " + d.breakfast.name + " / " + d.dinner.name));
  lines.push("");
  if (basket) {
    lines.push("Basket from prices I saved myself: " + basket.total + " (" + basket.covered + " items priced, " + basket.missing + " still without my price).");
  }
  lines.push("Meal names are ideas, not a priced quotation.");
  return lines.join("\n");
}

export { QUIZ, SCAM_TYPES };
