import "./PieChart.css";
import { getCycleDay, getCyclePhase } from "../utils/cycleCalculator.js";

const PHASE_COLORS = {
  Menstrual:  "#FBBDD0",
  Follicular: "#FAE4A0",
  Ovulation:  "#A8DDD8",
  Luteal:     "#D8C8F0",
};

const PHASE_BLURBS = {
  Menstrual:  "Energy is lower — rest is productive. Estrogen and progesterone are at their lowest.",
  Follicular: "Energy rises with estrogen. Good time for new projects and social plans.",
  Ovulation:  "Peak energy and confidence. Estrogen and LH surge — you may feel your best.",
  Luteal:     "Progesterone rises. PMS can appear late in this phase. Caffeine hits harder.",
};

// Scale the standard 5/8/3/12 day breakdown to the user's actual cycle length
function getPhaseDays(cycleLength) {
  const scale = cycleLength / 28;
  return [
    { name: "Menstrual",  days: Math.round(5  * scale), color: PHASE_COLORS.Menstrual },
    { name: "Follicular", days: Math.round(8  * scale), color: PHASE_COLORS.Follicular },
    { name: "Ovulation",  days: Math.round(3  * scale), color: PHASE_COLORS.Ovulation },
    { name: "Luteal",     days: Math.round(12 * scale), color: PHASE_COLORS.Luteal },
  ];
}

function buildSlices(phases, total) {
  let cumAngle = -90;
  return phases.map(p => {
    const angle = (p.days / total) * 360;
    const start = cumAngle;
    const end   = cumAngle + angle;
    cumAngle    = end;

    const r  = 80, cx = 100, cy = 100, gap = 1.5;
    const toRad = deg => (deg * Math.PI) / 180;
    const x1 = cx + r * Math.cos(toRad(start + gap / 2));
    const y1 = cy + r * Math.sin(toRad(start + gap / 2));
    const x2 = cx + r * Math.cos(toRad(end   - gap / 2));
    const y2 = cy + r * Math.sin(toRad(end   - gap / 2));
    const large = angle > 180 ? 1 : 0;

    const midAngle = start + angle / 2;
    const lr = 57;
    const lx = cx + lr * Math.cos(toRad(midAngle));
    const ly = cy + lr * Math.sin(toRad(midAngle));

    return { ...p, path: `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`, lx, ly };
  });
}

export default function PieChart({ cycleRecord, currentPhaseName }) {
  const cycleLength = cycleRecord?.cycleLength || 28;
  const phases      = getPhaseDays(cycleLength);
  const total       = phases.reduce((s, p) => s + p.days, 0);
  const slices      = buildSlices(phases, total);

  // Compute the actual current phase from the real cycle start date
  const today = new Date();
  const toLocalDateStr = d => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  let activePhaseName = currentPhaseName;
  if (cycleRecord?.periodStartDate) {
    const cycleDay = getCycleDay(cycleRecord.periodStartDate, toLocalDateStr(today));
    if (cycleDay >= 1) {
      activePhaseName = getCyclePhase(cycleDay, cycleLength).name;
    }
  }

  return (
    <div className="pie-card card">
      <div className="pie-header">
        <span className="pie-title">Cycle Breakdown</span>
        <span className="pie-sub">{cycleLength}-day cycle</span>
      </div>

      <div className="pie-body">
        <div className="pie-wrap">
          <svg viewBox="0 0 200 200" className="pie-svg">
            {slices.map(s => (
              <g key={s.name}>
                <path
                  d={s.path}
                  fill={s.color}
                  stroke="white"
                  strokeWidth="2"
                  className={`pie-slice ${activePhaseName === s.name ? "active-slice" : ""}`}
                />
                <text x={s.lx} y={s.ly} textAnchor="middle" dominantBaseline="middle"
                  fontSize="10" fontWeight="700" fontFamily="Nunito, sans-serif"
                  fill="#2A2A2A" opacity="0.75">
                  {s.days}d
                </text>
              </g>
            ))}
            {/* Donut hole */}
            <circle cx="100" cy="100" r="42" fill="white" />
            {/* Center label */}
            <text x="100" y="95" textAnchor="middle" dominantBaseline="middle"
              fontSize="10" fontWeight="800" fontFamily="Nunito, sans-serif" fill="#2A2A2A">
              {activePhaseName || "—"}
            </text>
            <text x="100" y="109" textAnchor="middle" dominantBaseline="middle"
              fontSize="9" fontFamily="Nunito, sans-serif" fill="#888">
              {cycleRecord ? "now" : "set date"}
            </text>
          </svg>
        </div>

        {/* Legend — shows actual day counts for this user's cycle */}
        <div className="pie-legend">
          {phases.map(p => (
            <div key={p.name} className={`legend-row ${activePhaseName === p.name ? "legend-active" : ""}`}>
              <span className="legend-dot" style={{ background: p.color }} />
              <span className="legend-name">{p.name}</span>
              <span className="legend-days">{p.days}d</span>
            </div>
          ))}
        </div>
      </div>

      {/* Phase description card — updates based on real current phase */}
      {activePhaseName && (
        <div className="pie-phase-desc" style={{ background: PHASE_COLORS[activePhaseName] + "66" }}>
          <span className="pie-phase-label">You are here →</span>
          <span className="pie-phase-name">{activePhaseName} phase</span>
          <span className="pie-phase-blurb">{PHASE_BLURBS[activePhaseName]}</span>
        </div>
      )}

      {!cycleRecord && (
        <p className="pie-no-data">Set your cycle start date on the Home tab to personalize this chart.</p>
      )}
    </div>
  );
}
