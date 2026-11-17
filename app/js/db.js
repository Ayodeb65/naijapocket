/* Device data layer.
   All user records live in IndexedDB on this phone. Nothing here sends data
   to a server. A future account sync can mirror these stores into Neon —
   see app/data/README.md and app/data/schema.sql. Do not import a database
   client into this file. */

export const DB_NAME = "naijapocket";
export const DB_VERSION = 1;

export const STORES = [
  "meta",
  "profile",
  "budgets",
  "prices",
  "lists",
  "goals",
  "challenges",
  "opportunities",
  "applications",
  "cv",
  "sales",
  "expenses",
  "invoices",
  "reminders",
  "places",
  "reports",
  "checks",
  "plans"
];

export function defaultProfile() {
  return {
    id: "me",
    name: "",
    state: "",
    city: "",
    household: 4,
    phone: "",
    businessName: "",
    interests: ["PocketSaver"],
    onboarded: false,
    updatedAt: new Date().toISOString()
  };
}

export function defaultCv() {
  return {
    id: "me",
    name: "",
    phone: "",
    email: "",
    city: "",
    state: "",
    summary: "",
    experience: [],
    education: [],
    skills: "",
    updatedAt: new Date().toISOString()
  };
}

function clone(value) {
  if (typeof structuredClone === "function") return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}

function runStore(db, store, mode, fn) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, mode);
    let result;
    tx.oncomplete = () => resolve(result);
    tx.onerror = () => reject(tx.error || new Error("IndexedDB transaction failed"));
    tx.onabort = () => reject(tx.error || new Error("IndexedDB transaction aborted"));
    const req = fn(tx.objectStore(store));
    if (req) req.onsuccess = () => { result = req.result; };
  });
}

function openIndexedDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      STORES.forEach((name) => {
        if (!db.objectStoreNames.contains(name)) db.createObjectStore(name, { keyPath: "id" });
      });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error || new Error("Could not open IndexedDB"));
  });
}

export function createMemoryRepo() {
  const tables = Object.fromEntries(STORES.map((name) => [name, new Map()]));
  return repoFrom({
    memory: true,
    async getAll(store) {
      return Array.from(tables[store].values());
    },
    async get(store, id) {
      return tables[store].get(id) || null;
    },
    async put(store, value) {
      tables[store].set(value.id, value);
      return value;
    },
    async remove(store, id) {
      tables[store].delete(id);
    },
    async clear(store) {
      tables[store].clear();
    }
  });
}

function repoFrom(driver) {
  return {
    memory: Boolean(driver.memory),
    getAll: (store) => driver.getAll(store),
    get: (store, id) => driver.get(store, id),
    put: (store, value) => driver.put(store, clone(value)),
    remove: (store, id) => driver.remove(store, id),
    clear: (store) => driver.clear(store),
    async exportAll() {
      const out = { app: "naijapocket", version: DB_VERSION, exportedAt: new Date().toISOString(), stores: {} };
      for (const store of STORES) out.stores[store] = await driver.getAll(store);
      return out;
    },
    async replaceAll(payload) {
      const stores = payload?.stores;
      if (!stores || typeof stores !== "object") throw new Error("This file is not a NaijaPocket backup.");
      for (const store of STORES) {
        if (!Array.isArray(stores[store])) continue;
        await driver.clear(store);
        for (const row of stores[store]) {
          if (row && row.id) await driver.put(store, row);
        }
      }
    },
    async wipe() {
      for (const store of STORES) await driver.clear(store);
    }
  };
}

export async function openRepo() {
  if (typeof indexedDB === "undefined") return createMemoryRepo();
  const db = await openIndexedDb();
  return repoFrom({
    memory: false,
    async getAll(store) {
      const rows = await runStore(db, store, "readonly", (objectStore) => objectStore.getAll());
      return rows || [];
    },
    async get(store, id) {
      const row = await runStore(db, store, "readonly", (objectStore) => objectStore.get(id));
      return row || null;
    },
    async put(store, value) {
      await runStore(db, store, "readwrite", (objectStore) => objectStore.put(value));
      return value;
    },
    async remove(store, id) {
      await runStore(db, store, "readwrite", (objectStore) => objectStore.delete(id));
    },
    async clear(store) {
      await runStore(db, store, "readwrite", (objectStore) => objectStore.clear());
    }
  });
}

export async function loadState(repo) {
  const [metaRows, profiles, budgets, prices, lists, goals, challenges, opportunities, applications, cvs, sales, expenses, invoices, reminders, places, reports, checks, plans] = await Promise.all([
    repo.getAll("meta"),
    repo.getAll("profile"),
    repo.getAll("budgets"),
    repo.getAll("prices"),
    repo.getAll("lists"),
    repo.getAll("goals"),
    repo.getAll("challenges"),
    repo.getAll("opportunities"),
    repo.getAll("applications"),
    repo.getAll("cv"),
    repo.getAll("sales"),
    repo.getAll("expenses"),
    repo.getAll("invoices"),
    repo.getAll("reminders"),
    repo.getAll("places"),
    repo.getAll("reports"),
    repo.getAll("checks"),
    repo.getAll("plans")
  ]);
  return {
    meta: metaRows.find((r) => r.id === "app") || { id: "app", seeded: false },
    profile: profiles.find((r) => r.id === "me") || defaultProfile(),
    cv: cvs.find((r) => r.id === "me") || defaultCv(),
    budgets, prices, lists, goals, challenges, opportunities, applications,
    sales, expenses, invoices, reminders, places, reports, checks, plans
  };
}
