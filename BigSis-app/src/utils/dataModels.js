// ── 1. DAILY LOG ENTRY ───────────────────────────────────────────
// One record per day. The user fills this out each day.
export function createDailyEntry(overrides = {}) {
  return {
    id: crypto.randomUUID(),          // built-in browser API, no library needed
    date: new Date().toISOString().split("T")[0], // "YYYY-MM-DD"

    // Cycle
    cycleDay: null,                   // integer: day 1 = first day of period
    periodFlow: null,                 // "none" | "spotting" | "light" | "medium" | "heavy"
    cyclePhase: null,                 // filled in automatically by cycleCalculator.js

    // Sleep
    sleepHours: null,                 // float: e.g. 7.5
    sleepQuality: null,               // integer 1–5

    // Caffeine
    caffeineServings: null,           // integer: number of cups/drinks
    caffeineMg: null,                 // integer: total mg (optional, more precise)
    lastCaffeineTime: null,           // "HH:MM" string, e.g. "14:30"

    // Mood & Energy
    mood: null,                       // integer 1–5
    energy: null,                     // integer 1–5
    stress: null,                     // integer 1–5

    // Symptoms (array of strings for flexibility)
    symptoms: [],                     // e.g. ["cramps", "headache", "bloating", "acne"]

    // Free text
    notes: "",

    // Timestamps
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),

    // Spread any overrides last so caller can set specific fields
    ...overrides,
  };
}

// ── 2. CYCLE RECORD ──────────────────────────────────────────────
// Tracks the start of each period so we can calculate phases.
export function createCycleRecord(overrides = {}) {
  return {
    id: crypto.randomUUID(),
    periodStartDate: null,            // "YYYY-MM-DD" — the most important field
    periodEndDate: null,              // "YYYY-MM-DD" — filled in later
    cycleLength: 28,                  // integer: days until next period (default 28)
    notes: "",
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

// ── 3. LAB RESULT ────────────────────────────────────────────────
// Extracted from an uploaded PDF/image via the Claude API (labParser.js).
export function createLabResult(overrides = {}) {
  return {
    id: crypto.randomUUID(),
    testDate: null,                   // "YYYY-MM-DD" — when the blood was drawn
    uploadedAt: new Date().toISOString(),
    sourceFileName: null,             // original filename for reference

    // Common hormone panel values — all nullable (not every test includes all)
    hormones: {
      estradiol:      { value: null, unit: "pg/mL", referenceRange: null },
      progesterone:   { value: null, unit: "ng/mL", referenceRange: null },
      fsh:            { value: null, unit: "mIU/mL", referenceRange: null },
      lh:             { value: null, unit: "mIU/mL", referenceRange: null },
      testosterone:   { value: null, unit: "ng/dL", referenceRange: null },
      dheas:          { value: null, unit: "μg/dL", referenceRange: null },
      tsh:            { value: null, unit: "mIU/L", referenceRange: null },  // thyroid
      cortisol:       { value: null, unit: "μg/dL", referenceRange: null },
      amh:            { value: null, unit: "ng/mL", referenceRange: null },  // ovarian reserve
    },

    // Raw text extracted by Claude, useful for debugging / display
    rawExtractedText: "",

    // Any notes Claude added about interpretation
    aiNotes: "",

    ...overrides,
  };
}

// ── 4. USER PROFILE ──────────────────────────────────────────────
// Stored once. Used to personalize AI suggestions.
export function createUserProfile(overrides = {}) {
  return {
    id: "user-profile",              // singleton — only one profile per device
    firstName: "",
    averageCycleLength: 28,          // integer: days, used by cycleCalculator
    averagePeriodLength: 5,          // integer: days
    birthYear: null,                 // for age-appropriate context
    conditions: [],                  // e.g. ["PCOS", "endometriosis", "thyroid"]
    medications: [],                 // e.g. ["birth control", "levothyroxine"]
    caffeineSensitivity: "moderate", // "low" | "moderate" | "high"
    goals: [],                       // e.g. ["better sleep", "reduce PMS", "track cycle"]
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

// ── 5. VALID SYMPTOM TAGS ─────────────────────────────────────────
// Centralized list so the UI and logic always use the same strings.
export const SYMPTOM_TAGS = [
  "cramps", "bloating", "headache", "migraine", "breast tenderness",
  "acne", "mood swings", "irritability", "anxiety", "brain fog",
  "fatigue", "insomnia", "nausea", "back pain", "hot flashes",
  "spotting", "heavy flow", "clotting",
];

// ── 6. CYCLE PHASES ──────────────────────────────────────────────
export const CYCLE_PHASES = {
  MENSTRUAL:   { name: "Menstrual",   days: [1, 5],   color: "#E05C5C" },
  FOLLICULAR:  { name: "Follicular",  days: [6, 13],  color: "#F5A623" },
  OVULATION:   { name: "Ovulation",   days: [14, 16], color: "#7ED321" },
  LUTEAL:      { name: "Luteal",      days: [17, 28], color: "#9B59B6" },
};