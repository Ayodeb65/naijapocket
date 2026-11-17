/* Shared helpers. No browser storage, no network. */

export function uid() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return "id-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10);
}

export function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[c]));
}

export function parseMoney(value) {
  if (typeof value === "number") return Number.isFinite(value) ? round2(value) : 0;
  const cleaned = String(value ?? "").replace(/[^\d.]/g, "");
  if (!cleaned || cleaned === ".") return 0;
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? round2(n) : 0;
}

export function parseQty(value) {
  const n = parseMoney(value);
  return n < 0 ? 0 : n;
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

export function formatNaira(value) {
  const n = Number(value) || 0;
  const kobo = Math.round(Math.abs(n) * 100) % 100 !== 0;
  const formatted = Math.abs(n).toLocaleString("en-NG", {
    minimumFractionDigits: kobo ? 2 : 0,
    maximumFractionDigits: 2
  });
  return (n < 0 ? "−₦" : "₦") + formatted;
}

export function todayISO(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return y + "-" + m + "-" + day;
}

export function thisMonth(date = new Date()) {
  return todayISO(date).slice(0, 7);
}

export function monthLabel(ym) {
  const [y, m] = String(ym || "").split("-");
  if (!y || !m) return "";
  const d = new Date(Number(y), Number(m) - 1, 1);
  if (Number.isNaN(d.getTime())) return ym;
  return d.toLocaleDateString("en-NG", { month: "long", year: "numeric" });
}

export function shiftMonth(ym, delta) {
  const [y, m] = String(ym).split("-").map(Number);
  const d = new Date(y, (m - 1) + delta, 1);
  return thisMonth(d);
}

export function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso.length === 10 ? iso + "T12:00:00" : iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
}

export function greeting(date = new Date()) {
  const h = date.getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export function safeHttpUrl(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  try {
    const url = new URL(raw);
    if (url.protocol === "http:" || url.protocol === "https:") return url.href;
  } catch {
    return "";
  }
  return "";
}

export function telHref(value) {
  const digits = String(value || "").replace(/[^\d+]/g, "");
  if (digits.replace(/\D/g, "").length < 7) return "";
  return "tel:" + digits;
}

export function sum(list) {
  return round2((list || []).reduce((a, b) => a + (Number(b) || 0), 0));
}

export function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

export function norm(value) {
  return String(value || "").trim().toLowerCase().replace(/\s+/g, " ");
}

export function dayOfYear(date = new Date()) {
  const start = new Date(date.getFullYear(), 0, 0);
  return Math.floor((date - start) / 86400000);
}

export function addDays(iso, days) {
  const d = new Date(iso + "T12:00:00");
  d.setDate(d.getDate() + days);
  return todayISO(d);
}
