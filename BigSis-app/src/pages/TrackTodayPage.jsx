import { useState } from "react";
import "./TrackTodayPage.css";

// Each metric has a label and set of options with emoji + label
const METRICS = [
  {
    id: "sleep",
    label: "Sleep",
    type: "options",
    options: [
      { value: "poor",   icon: "😴", label: "Poor" },
      { value: "ok",     icon: "😑", label: "OK" },
      { value: "great",  icon: "✨", label: "Great" },
    ],
  },
  {
    id: "mood",
    label: "Mood",
    type: "options",
    options: [
      { value: "low",    icon: "🌧", label: "Low" },
      { value: "meh",    icon: "😐", label: "Meh" },
      { value: "good",   icon: "☀️", label: "Good" },
    ],
  },
  {
    id: "pain",
    label: "Pain",
    type: "options",
    options: [
      { value: "none",   icon: "✦",  label: "None" },
      { value: "mild",   icon: "😬", label: "Mild" },
      { value: "bad",    icon: "🔥", label: "Bad" },
    ],
  },
  {
    id: "exercise",
    label: "Exercise",
    type: "options",
    options: [
      { value: "none",   icon: "🛋",  label: "Rest" },
      { value: "light",  icon: "🚶", label: "Light" },
      { value: "hard",   icon: "💪", label: "Hard" },
    ],
  },
  {
    id: "caffeine",
    label: "Caffeine",
    type: "options",
    options: [
      { value: "0",  icon: "🌿", label: "None" },
      { value: "1",  icon: "☕", label: "1 cup" },
      { value: "2",  icon: "⚡", label: "2+ cups" },
    ],
  },
  {
    id: "flow",
    label: "Flow",
    type: "options",
    options: [
      { value: "none",    icon: "○",  label: "None" },
      { value: "light",   icon: "●",  label: "Light" },
      { value: "heavy",   icon: "●●", label: "Heavy" },
    ],
  },
];

export default function TrackTodayPage({ onBack }) {
  const [selections, setSelections] = useState({});
  const [saved, setSaved] = useState(false);

  const select = (metricId, value) => {
    setSelections((prev) => ({ ...prev, [metricId]: value }));
  };

  const handleSave = () => {
    // ── WIRE UP: replace with saveEntry() from storageLayer.js ──
    // import { saveEntry } from "../utils/storageLayer.js";
    // import { createDailyEntry } from "../utils/dataModels.js";
    // saveEntry(createDailyEntry({ ...selections, date: today }));
    console.log("Saving:", selections);
    setSaved(true);
    setTimeout(() => { setSaved(false); onBack(); }, 1200);
  };

  const allFilled = METRICS.every((m) => selections[m.id]);

  return (
    <div className="page track-page">
      {/* ── HEADER ── */}
      <div className="track-header fade-up fade-up-1">
        <button className="btn-ghost back-btn" onClick={onBack}>← Back</button>
        <h2 className="track-title">Track Today</h2>
        <div style={{ width: 60 }} /> {/* spacer */}
      </div>

      {/* ── METRICS ── */}
      <div className="metrics-list">
        {METRICS.map((metric, i) => (
          <div key={metric.id} className={`metric-row fade-up fade-up-${Math.min(i + 2, 5)}`}>
            <span className="metric-label">{metric.label}</span>
            <div className="options-row">
              {metric.options.map((opt) => (
                <button
                  key={opt.value}
                  className={`option-btn ${selections[metric.id] === opt.value ? "selected" : ""}`}
                  onClick={() => select(metric.id, opt.value)}
                >
                  <span className="option-icon">{opt.icon}</span>
                  <span className="option-label">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ── NOTES ── */}
      <div className="notes-row fade-up fade-up-5">
        <textarea
          className="notes-input"
          placeholder="Any notes for today… (optional)"
          rows={3}
          onChange={(e) => setSelections((p) => ({ ...p, notes: e.target.value }))}
        />
      </div>

      {/* ── SAVE ── */}
      <div className="save-row fade-up fade-up-5">
        <button
          className={`btn-primary save-btn ${saved ? "saved" : ""}`}
          onClick={handleSave}
          disabled={saved}
        >
          {saved ? "✓ Saved!" : "Save Today"}
        </button>
      </div>
    </div>
  );
}
