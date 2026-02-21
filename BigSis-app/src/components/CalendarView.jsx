import "./CalendarView.css";
import { getCycleDay, getCyclePhase } from "../utils/cycleCalculator.js";

const PHASE_COLORS = {
  Menstrual:  "#FBBDD0",
  Follicular: "#FAE4A0",
  Ovulation:  "#A8DDD8",
  Luteal:     "#D8C8F0",
};

const WEEKDAYS = ["Su","Mo","Tu","We","Th","Fr","Sa"];

// Format a Date as "YYYY-MM-DD" in local time (avoids UTC timezone drift)
function toLocalDateStr(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function CalendarView({ cycleRecord }) {
  const today        = new Date();
  const year         = today.getFullYear();
  const month        = today.getMonth();
  const daysInMonth  = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const todayDate    = today.getDate();
  const monthLabel   = today.toLocaleString("default", { month: "long", year: "numeric" });
  const cycleLength  = cycleRecord?.cycleLength || 28;

  // For each calendar day, compute its phase from the real cycle start date
  const getPhaseForDay = (dayNum) => {
    if (!cycleRecord?.periodStartDate) return null;
    const dateStr  = toLocalDateStr(new Date(year, month, dayNum));
    const cycleDay = getCycleDay(cycleRecord.periodStartDate, dateStr);
    // Negative cycleDay means the date is before the period start — no phase yet
    if (cycleDay < 1) return null;
    return getCyclePhase(cycleDay, cycleLength);
  };

  const cells = [];
  for (let i = 0; i < firstDayOfWeek; i++) cells.push({ empty: true });
  for (let d = 1; d <= daysInMonth; d++) {
    const phase = getPhaseForDay(d);
    cells.push({ day: d, phase, isToday: d === todayDate });
  }

  return (
    <div className="calendar-wrap card">
      <div className="cal-header">
        <span className="cal-month">{monthLabel}</span>
        <div className="cal-legend">
          {Object.entries(PHASE_COLORS).map(([p, c]) => (
            <span key={p} className="leg-item">
              <span className="leg-dot" style={{ background: c }} />
              <span className="leg-text">{p.slice(0, 3)}</span>
            </span>
          ))}
        </div>
      </div>

      {!cycleRecord && (
        <p className="cal-no-data">Set your cycle date on the Home tab to see phase colors.</p>
      )}

      <div className="cal-grid">
        {WEEKDAYS.map(d => <div key={d} className="cal-weekday">{d}</div>)}
        {cells.map((c, i) => (
          <div
            key={i}
            className={`cal-day ${c.empty ? "empty" : ""} ${c.isToday ? "today" : ""}`}
            style={!c.empty && c.phase ? { background: PHASE_COLORS[c.phase.name] } : {}}
          >
            {!c.empty && <span className="cal-num">{c.day}</span>}
            {c.isToday && <span className="today-ring" />}
          </div>
        ))}
      </div>
    </div>
  );
}
