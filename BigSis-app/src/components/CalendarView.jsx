import "./CalendarView.css";

// Phase color map — matches cycleCalculator.js CYCLE_PHASES
const PHASE_COLORS = {
  Menstrual:  "#F2C4C4",
  Follicular: "#F5DFA0",
  Ovulation:  "#B8D4B8",
  Luteal:     "#C4B8D8",
};

// Generate days for current month with mock phase data
// In production: replace with generateCalendarData() from cycleCalculator.js
function getMockCalendarDays() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const todayDate = today.getDate();

  // Mock: period started on day 5 of this month, 28-day cycle
  const getPhase = (day) => {
    if (day >= 1 && day <= 5)   return "Menstrual";
    if (day >= 6 && day <= 13)  return "Follicular";
    if (day >= 14 && day <= 16) return "Ovulation";
    return "Luteal";
  };

  const days = [];
  // Empty cells for days before the 1st
  for (let i = 0; i < firstDayOfWeek; i++) {
    days.push({ empty: true });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    days.push({ day: d, phase: getPhase(d), isToday: d === todayDate });
  }
  return days;
}

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export default function CalendarView() {
  const days = getMockCalendarDays();
  const today = new Date();
  const monthLabel = today.toLocaleString("default", { month: "long", year: "numeric" });

  return (
    <div className="calendar-card card">
      <div className="calendar-header">
        <span className="calendar-month">{monthLabel}</span>
        <div className="phase-legend">
          {Object.entries(PHASE_COLORS).map(([phase, color]) => (
            <span key={phase} className="legend-item">
              <span className="legend-dot" style={{ background: color }} />
              <span className="legend-label">{phase.slice(0, 3)}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Weekday labels */}
      <div className="calendar-grid">
        {WEEKDAYS.map((d) => (
          <div key={d} className="weekday-label">{d}</div>
        ))}

        {/* Day cells */}
        {days.map((d, i) => (
          <div key={i} className={`day-cell ${d.empty ? "empty" : ""} ${d.isToday ? "today" : ""}`}
            style={d.phase && !d.empty ? { background: PHASE_COLORS[d.phase] } : {}}>
            {!d.empty && <span className="day-num">{d.day}</span>}
            {d.isToday && <span className="today-dot" />}
          </div>
        ))}
      </div>
    </div>
  );
}
