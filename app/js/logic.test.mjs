import test from "node:test";
import assert from "node:assert/strict";
import {
  buildFoodPlan, buildSeed, businessTotals, challengeProgress, checkLink,
  checkMessage, comparePrices, coverLetter, estimateBasket, invoiceTotal,
  planShareText, promoText, scoreQuiz, suggestPrice, summariseBudget
} from "./logic.js";
import { formatNaira, parseMoney } from "./money.js";

test("naira formatting and parsing", () => {
  assert.equal(formatNaira(25000), "₦25,000");
  assert.equal(formatNaira(10.5), "₦10.50");
  assert.equal(parseMoney("₦25,000"), 25000);
  assert.equal(parseMoney("10.5"), 10.5);
  assert.equal(parseMoney(""), 0);
});

test("budget summary uses only the numbers stored", () => {
  const summary = summariseBudget({
    income: [{ amount: 100000 }],
    categories: [{ id: "food", name: "Food", planned: 40000 }],
    expenses: [{ categoryId: "food", amount: 15000 }, { categoryId: "food", amount: 5000 }]
  });
  assert.equal(summary.income, 100000);
  assert.equal(summary.spent, 20000);
  assert.equal(summary.left, 80000);
  assert.equal(summary.byCategory[0].left, 20000);
});

test("food plan is seven days and does not invent prices", () => {
  const plan = buildFoodPlan({ household: 4, budget: 28000, prefs: ["beans"] });
  assert.equal(plan.days.length, 7);
  assert.equal(plan.perPersonDay, 1000);
  assert.ok(plan.list.length > 0);
  assert.match(plan.notice, /not priced/i);
  assert.equal("total" in plan, false);
  const text = planShareText(plan, null);
  assert.match(text, /not a priced quotation/);
  assert.doesNotMatch(text, /verified/i);
});

test("basket ignores example prices and mismatched units", () => {
  const list = [
    { item: "Rice", qty: 2, unit: "cup" },
    { item: "Eggs", qty: 4, unit: "piece" }
  ];
  const prices = [
    { id: "a", item: "Rice", amount: 500, unit: "cup", kind: "example", date: "2026-01-01" },
    { id: "b", item: "Rice", amount: 200, unit: "kg", kind: "entry", date: "2026-02-01", place: "Mile 12" },
    { id: "c", item: "Eggs", amount: 150, unit: "piece", kind: "entry", date: "2026-02-02", place: "Junction" }
  ];
  const basket = estimateBasket(list, prices);
  assert.equal(basket.covered, 1);
  assert.equal(basket.total, 600);
  assert.match(basket.lines[0].reason, /kg/);
});

test("price comparison does not crown an example", () => {
  const groups = comparePrices([
    { item: "Rice", amount: 100, unit: "cup", kind: "example", date: "2026-01-01" },
    { item: "Rice", amount: 80, unit: "cup", kind: "example", date: "2026-01-02" }
  ]);
  assert.equal(groups[0].cheapest, null);
  assert.match(groups[0].note, /example/i);

  const real = comparePrices([
    { item: "Rice", amount: 400, unit: "cup", kind: "entry", date: "2026-03-01", place: "A" },
    { item: "Rice", amount: 350, unit: "cup", kind: "estimate", date: "2026-03-02", place: "B" }
  ]);
  assert.equal(real[0].cheapest.amount, 350);
});

test("message checker flags secrets and never clears a message", () => {
  const bad = checkMessage("Your account will be blocked. Send the OTP now and pay the activation fee.");
  assert.equal(bad.level, "high");
  assert.ok(bad.flags.length >= 2);
  assert.match(bad.disclaimer, /cannot confirm/i);
  const plain = checkMessage("See you at the market by 4.");
  assert.equal(plain.level, "low");
  assert.match(plain.summary, /does not mean this message is safe/i);
});

test("link checker does not certify a site", () => {
  const odd = checkLink("http://10.1.2.3/login");
  assert.ok(odd.notes.length >= 2);
  assert.match(odd.disclaimer, /cannot certify/i);
  const calm = checkLink("https://example.com");
  assert.match(calm.summary, /does not mean the site is safe/i);
});

test("quiz score is practice, not a certificate", () => {
  const result = scoreQuiz([2, 1, 1, 1, 1, 1]);
  assert.equal(result.correct, 6);
  assert.match(result.note, /not a certificate/i);
});

test("business maths", () => {
  const totals = businessTotals(
    [{ qty: 2, unitPrice: 1500 }, { qty: 1, unitPrice: 500 }],
    [{ amount: 800 }]
  );
  assert.equal(totals.sales, 3500);
  assert.equal(totals.profit, 2700);
  const price = suggestPrice({ cost: 1000, extra: 200, margin: 25 });
  assert.equal(price.totalCost, 1200);
  assert.equal(price.price, 1500);
  const invoice = invoiceTotal([{ desc: "Soap", qty: 3, price: 500 }]);
  assert.equal(invoice.total, 1500);
});

test("templates stay labelled as templates", () => {
  const letter = coverLetter({ name: "Ada", role: "Sales assistant", org: "Sample Shop", city: "Akure", strengths: "keeping a sales book" });
  assert.match(letter, /Ada/);
  assert.match(letter, /not written by a live AI/i);
  const promo = promoText("whatsapp", { product: "Zobo", price: "₦500", benefit: "Cold and sweet", area: "Akure", contact: "0800" });
  assert.match(promo.text, /Zobo/);
  assert.match(promo.text, /Template/i);
});

test("seed data is labelled example and uses placeholder amounts", () => {
  const seed = buildSeed();
  assert.ok(seed.prices.length >= 3);
  seed.prices.forEach((row) => {
    assert.equal(row.kind, "example");
    assert.equal(row.amount, 100);
    assert.match(row.note, /Not a live market price/);
  });
  seed.opportunities.forEach((row) => {
    assert.equal(row.kind, "example");
    assert.match(row.title, /not a real/i);
    assert.equal(row.link, "");
  });
  assert.equal(seed.places[0].example, true);
  assert.match(seed.places[0].name, /Example/);
});

test("30-day challenge does not pretend to hold money", () => {
  const progress = challengeProgress({
    start: "2026-11-01",
    daily: 200,
    ticks: { "2026-11-01": true, "2026-11-02": true }
  }, "2026-11-03");
  assert.equal(progress.days.length, 30);
  assert.equal(progress.done, 2);
  assert.equal(progress.saved, 400);
  assert.equal(progress.target, 6000);
});
