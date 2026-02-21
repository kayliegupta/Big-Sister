/**
 * cycleCalculator.js
 * ─────────────────────────────────────────────────────────────────
 * TECHNOLOGY: Pure functions + JavaScript Date arithmetic.
 *
 * "Pure function" means: same input always produces same output,
 * no side effects, no API calls, no storage reads. This makes
 * every function here 100% testable in isolation.
 *
 * JavaScript Date math works in milliseconds since Jan 1, 1970
 * (Unix epoch). Dividing millisecond differences by 86,400,000
 * (ms in a day) gives us day counts.
 *
 * No external libraries needed — this is all built-in JS.
 * ─────────────────────────────────────────────────────────────────
 */

import { CYCLE_PHASES } from "./dataModels.js";

// ── HELPER: parse "YYYY-MM-DD" safely without timezone drift ─────
// new Date("2024-01-15") is interpreted as UTC midnight, which can
// shift by a day in local timezones. This avoids that bug.
function parseLocalDate(dateStr) {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day); // month is 0-indexed in JS
}

// ── HELPER: format a Date object back to "YYYY-MM-DD" ────────────
function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// ── HELPER: difference between two date strings in whole days ────
function daysBetween(dateStrA, dateStrB) {
  const a = parseLocalDate(dateStrA);
  const b = parseLocalDate(dateStrB);
  return Math.round((b - a) / (1000 * 60 * 60 * 24));
}

// ─────────────────────────────────────────────────────────────────
// 1. GET CYCLE DAY
//    Given the last period start date and a target date,
//    return what "cycle day" the target date is (day 1 = period start).
//
//    Example: periodStart = "2024-01-01", targetDate = "2024-01-05"
//    → returns 5
// ─────────────────────────────────────────────────────────────────
export function getCycleDay(periodStartDate, targetDate = null) {
  const target = targetDate || formatDate(new Date());
  const diff = daysBetween(periodStartDate, target);
  return diff + 1; // day 1 = start date itself
}

// ─────────────────────────────────────────────────────────────────
// 2. GET CYCLE PHASE
//    Given a cycle day and average cycle length, return phase info.
//    Uses proportional scaling so it works for any cycle length,
//    not just the textbook 28-day cycle.
//
//    Returns: { name, color, description, cycleDay, cycleLength }
// ─────────────────────────────────────────────────────────────────
export function getCyclePhase(cycleDay, cycleLength = 28) {
  // Normalize cycle day to fit within the user's actual cycle length
  // (handles cycles that are longer or shorter than 28 days)
  const normalizedDay = ((cycleDay - 1) % cycleLength) + 1;

  // Scale phase boundaries proportionally to cycle length
  const scale = cycleLength / 28;
  const menstrualEnd   = Math.round(5 * scale);
  const follicularEnd  = Math.round(13 * scale);
  const ovulationEnd   = Math.round(16 * scale);
  // luteal goes from ovulationEnd+1 to cycleLength

  let phase;
  if (normalizedDay <= menstrualEnd) {
    phase = CYCLE_PHASES.MENSTRUAL;
  } else if (normalizedDay <= follicularEnd) {
    phase = CYCLE_PHASES.FOLLICULAR;
  } else if (normalizedDay <= ovulationEnd) {
    phase = CYCLE_PHASES.OVULATION;
  } else {
    phase = CYCLE_PHASES.LUTEAL;
  }

  return {
    ...phase,
    cycleDay: normalizedDay,
    cycleLength,
    description: PHASE_DESCRIPTIONS[phase.name],
  };
}

// ─────────────────────────────────────────────────────────────────
// 3. PREDICT NEXT PERIOD
//    Given last period start and average cycle length,
//    return the predicted next period start date.
// ─────────────────────────────────────────────────────────────────
export function predictNextPeriod(lastPeriodStartDate, cycleLength = 28) {
  const start = parseLocalDate(lastPeriodStartDate);
  start.setDate(start.getDate() + cycleLength);
  return formatDate(start);
}

// ─────────────────────────────────────────────────────────────────
// 4. PREDICT OVULATION WINDOW
//    Ovulation typically occurs ~14 days before next period.
//    Returns a 3-day window (peak day ± 1 day).
// ─────────────────────────────────────────────────────────────────
export function predictOvulationWindow(lastPeriodStartDate, cycleLength = 28) {
  const start = parseLocalDate(lastPeriodStartDate);
  const ovulationDay = cycleLength - 14; // luteal phase is ~14 days

  const peakDate = new Date(start);
  peakDate.setDate(peakDate.getDate() + ovulationDay - 1);

  const windowStart = new Date(peakDate);
  windowStart.setDate(windowStart.getDate() - 1);

  const windowEnd = new Date(peakDate);
  windowEnd.setDate(windowEnd.getDate() + 1);

  return {
    peak: formatDate(peakDate),
    windowStart: formatDate(windowStart),
    windowEnd: formatDate(windowEnd),
  };
}

// ─────────────────────────────────────────────────────────────────
// 5. GENERATE CALENDAR DATA
//    Returns an array of objects for each day in a date range,
//    each annotated with cycle phase. Used to render the calendar.
//
//    Returns: Array of { date, cycleDay, phase, isPeriod, isToday }
// ─────────────────────────────────────────────────────────────────
export function generateCalendarData(
  lastPeriodStartDate,
  cycleLength = 28,
  startDate = null,
  endDate = null
) {
  // Default: show current month
  const today = new Date();
  const rangeStart = startDate
    ? parseLocalDate(startDate)
    : new Date(today.getFullYear(), today.getMonth(), 1);
  const rangeEnd = endDate
    ? parseLocalDate(endDate)
    : new Date(today.getFullYear(), today.getMonth() + 1, 0); // last day of month

  const todayStr = formatDate(today);
  const days = [];
  const cursor = new Date(rangeStart);

  while (cursor <= rangeEnd) {
    const dateStr = formatDate(cursor);
    const cycleDay = getCycleDay(lastPeriodStartDate, dateStr);
    const phase = getCyclePhase(cycleDay, cycleLength);

    days.push({
      date: dateStr,
      cycleDay,
      phase,
      isPeriod: phase.name === "Menstrual",
      isToday: dateStr === todayStr,
      isPredicted: cycleDay > 0, // all future days are predicted
    });

    cursor.setDate(cursor.getDate() + 1);
  }

  return days;
}

// ─────────────────────────────────────────────────────────────────
// 6. CALCULATE AVERAGE CYCLE LENGTH
//    Given an array of cycle records (with periodStartDate),
//    compute the average gap between them.
//    Used to improve predictions over time.
// ─────────────────────────────────────────────────────────────────
export function calculateAverageCycleLength(cycleRecords) {
  if (!cycleRecords || cycleRecords.length < 2) return 28; // default

  // Sort by date ascending
  const sorted = [...cycleRecords].sort((a, b) =>
    a.periodStartDate.localeCompare(b.periodStartDate)
  );

  // Calculate gaps between consecutive period starts
  const gaps = [];
  for (let i = 1; i < sorted.length; i++) {
    const gap = daysBetween(sorted[i - 1].periodStartDate, sorted[i].periodStartDate);
    if (gap >= 21 && gap <= 45) gaps.push(gap); // filter outliers
  }

  if (gaps.length === 0) return 28;
  return Math.round(gaps.reduce((sum, g) => sum + g, 0) / gaps.length);
}

// ─────────────────────────────────────────────────────────────────
// PHASE DESCRIPTIONS
// Used by the AI and UI to explain what's happening hormonally.
// ─────────────────────────────────────────────────────────────────
const PHASE_DESCRIPTIONS = {
  Menstrual: "Estrogen and progesterone are at their lowest. Energy may be lower — rest is productive, not lazy.",
  Follicular: "Estrogen is rising. Cognitive clarity and energy tend to increase. Good phase for learning and new projects.",
  Ovulation: "Estrogen peaks, LH surges. Energy and confidence are typically highest. Social and communicative.",
  Luteal: "Progesterone rises then both hormones fall. PMS symptoms can appear in the second half. Caffeine and poor sleep hit harder here.",
};
