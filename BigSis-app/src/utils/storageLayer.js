/**
 * storageLayer.js
 * ─────────────────────────────────────────────────────────────────
 * TECHNOLOGY: Browser localStorage API + JSON serialization.
 *
 * localStorage is a key-value store built into every browser.
 * It persists between page refreshes and browser sessions.
 * Values must be strings, so we use JSON.stringify() to save
 * objects and JSON.parse() to read them back.
 *
 * Capacity: ~5MB per origin — more than enough for years of logs.
 * Scope: data is per-device, per-browser (no sync, no accounts).
 *
 * We organize data into "tables" using key prefixes:
 *   "entry:2024-01-15"   → daily log for that date
 *   "cycle:uuid"         → a period start record
 *   "lab:uuid"           → a lab result
 *   "user-profile"       → singleton user settings
 *
 * All functions are synchronous (localStorage has no async API)
 * but wrapped to handle errors gracefully.
 * ─────────────────────────────────────────────────────────────────
 */

// ── KEY NAMESPACES ────────────────────────────────────────────────
const KEYS = {
  ENTRY:   (date) => `luna:entry:${date}`,    // "luna:" prefix avoids collisions
  CYCLE:   (id) => `luna:cycle:${id}`,
  LAB:     (id) => `luna:lab:${id}`,
  PROFILE: () => `luna:user-profile`,
  INDEX:   (type) => `luna:index:${type}`,    // index = array of IDs for each type
};

// ── INTERNAL HELPERS ─────────────────────────────────────────────

function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.error(`[storageLayer] Failed to save key "${key}":`, e);
    return false;
  }
}

function load(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error(`[storageLayer] Failed to load key "${key}":`, e);
    return null;
  }
}

function remove(key) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (e) {
    return false;
  }
}

// Index management — we keep a list of IDs per record type
// so we can list all records without scanning all localStorage keys.
function getIndex(type) {
  return load(KEYS.INDEX(type)) || [];
}

function addToIndex(type, id) {
  const index = getIndex(type);
  if (!index.includes(id)) {
    index.push(id);
    save(KEYS.INDEX(type), index);
  }
}

function removeFromIndex(type, id) {
  const index = getIndex(type).filter((i) => i !== id);
  save(KEYS.INDEX(type), index);
}

// ─────────────────────────────────────────────────────────────────
// DAILY ENTRY CRUD
// Key is the date string "YYYY-MM-DD" — one entry per day max.
// ─────────────────────────────────────────────────────────────────

export function saveEntry(entry) {
  const key = KEYS.ENTRY(entry.date);
  entry.updatedAt = new Date().toISOString();
  const ok = save(key, entry);
  if (ok) addToIndex("entries", entry.date);
  return ok;
}

export function getEntry(date) {
  return load(KEYS.ENTRY(date));
}

export function getAllEntries() {
  const dates = getIndex("entries");
  return dates
    .map((date) => load(KEYS.ENTRY(date)))
    .filter(Boolean)
    .sort((a, b) => b.date.localeCompare(a.date)); // newest first
}

export function getEntriesByDateRange(startDate, endDate) {
  return getAllEntries().filter(
    (e) => e.date >= startDate && e.date <= endDate
  );
}

export function getRecentEntries(days = 7) {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);
  const startStr = start.toISOString().split("T")[0];
  const endStr = end.toISOString().split("T")[0];
  return getEntriesByDateRange(startStr, endStr);
}

export function deleteEntry(date) {
  removeFromIndex("entries", date);
  return remove(KEYS.ENTRY(date));
}

// ─────────────────────────────────────────────────────────────────
// CYCLE RECORD CRUD
// ─────────────────────────────────────────────────────────────────

export function saveCycleRecord(record) {
  const ok = save(KEYS.CYCLE(record.id), record);
  if (ok) addToIndex("cycles", record.id);
  return ok;
}

export function getAllCycleRecords() {
  const ids = getIndex("cycles");
  return ids
    .map((id) => load(KEYS.CYCLE(id)))
    .filter(Boolean)
    .sort((a, b) => b.periodStartDate.localeCompare(a.periodStartDate));
}

export function getLatestCycleRecord() {
  const all = getAllCycleRecords();
  return all.length > 0 ? all[0] : null;
}

export function deleteCycleRecord(id) {
  removeFromIndex("cycles", id);
  return remove(KEYS.CYCLE(id));
}

// ─────────────────────────────────────────────────────────────────
// LAB RESULT CRUD
// ─────────────────────────────────────────────────────────────────

export function saveLabResult(result) {
  const ok = save(KEYS.LAB(result.id), result);
  if (ok) addToIndex("labs", result.id);
  return ok;
}

export function getAllLabResults() {
  const ids = getIndex("labs");
  return ids
    .map((id) => load(KEYS.LAB(id)))
    .filter(Boolean)
    .sort((a, b) => b.testDate.localeCompare(a.testDate));
}

export function getLatestLabResult() {
  const all = getAllLabResults();
  return all.length > 0 ? all[0] : null;
}

export function deleteLabResult(id) {
  removeFromIndex("labs", id);
  return remove(KEYS.LAB(id));
}

// ─────────────────────────────────────────────────────────────────
// USER PROFILE (singleton)
// ─────────────────────────────────────────────────────────────────

export function saveProfile(profile) {
  profile.updatedAt = new Date().toISOString();
  return save(KEYS.PROFILE(), profile);
}

export function getProfile() {
  return load(KEYS.PROFILE());
}

// ─────────────────────────────────────────────────────────────────
// UTILITY: EXPORT ALL DATA
// Dumps everything to a JSON blob — useful for backup or debug.
// ─────────────────────────────────────────────────────────────────

export function exportAllData() {
  return {
    exportedAt: new Date().toISOString(),
    profile: getProfile(),
    entries: getAllEntries(),
    cycles: getAllCycleRecords(),
    labs: getAllLabResults(),
  };
}

// ─────────────────────────────────────────────────────────────────
// UTILITY: CLEAR ALL DATA (use with caution — for reset/debug)
// ─────────────────────────────────────────────────────────────────

export function clearAllData() {
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith("luna:")) keysToRemove.push(key);
  }
  keysToRemove.forEach((k) => localStorage.removeItem(k));
  return keysToRemove.length;
}
