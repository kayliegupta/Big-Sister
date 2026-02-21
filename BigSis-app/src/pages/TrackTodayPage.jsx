import { useState } from "react";
import "./TrackTodayPage.css";
import { saveEntry } from "../utils/storageLayer.js";
import { createDailyEntry } from "../utils/dataModels.js";

// Exact options from mockup with colors
const METRICS = [
  {
    id: "sleep", label: "Sleep",
    options: [
      { value: "lt5",  label: "< 5",   color: "#FBBDD0" },
      { value: "6",    label: "6",      color: "#FBBDD0" },
      { value: "7",    label: "7",      color: "#FAE4A0" },
      { value: "8",    label: "8",      color: "#A8DDD8" },
      { value: "9p",   label: "9+",     color: "#A8DDD8" },
    ],
  },
  {
    id: "mood", label: "Mood",
    options: [
      { value: "irritable", label: "irritable", color: "#FBBDD0" },
      { value: "upset",     label: "upset",     color: "#FBBDD0" },
      { value: "anxious",   label: "anxious",   color: "#FAE4A0" },
      { value: "meh",       label: "meh",       color: "#FAE4A0" },
      { value: "content",   label: "content",   color: "#A8DDD8" },
      { value: "happy",     label: "happy",     color: "#A8DDD8" },
    ],
  },
  {
    id: "pain", label: "Pain",
    options: [
      { value: "cramps",   label: "cramps",           color: "#FBBDD0" },
      { value: "headache", label: "headache",          color: "#FBBDD0" },
      { value: "fatigue",  label: "fatigue",           color: "#FAE4A0" },
      { value: "bodyache", label: "body ache",         color: "#FAE4A0" },
      { value: "mild",     label: "general (mild)",    color: "#FAE4A0" },
      { value: "moderate", label: "general (moderate)",color: "#F5C090" },
      { value: "severe",   label: "general (severe)",  color: "#F5C090" },
    ],
  },
  {
    id: "exercise", label: "Exercise",
    options: [
      { value: "low",    label: "low impact",    color: "#F5C090" },
      { value: "medium", label: "medium impact", color: "#F5C090" },
      { value: "high",   label: "high impact",   color: "#F5C090" },
    ],
  },
  {
    id: "caffeine", label: "Caffeine",
    options: [
      { value: "lt50",   label: "< 50",    color: "#A8DDD8" },
      { value: "50-100", label: "50-100",  color: "#A8DDD8" },
      { value: "100-200",label: "100-200", color: "#A8DDD8" },
      { value: "200p",   label: "200+",    color: "#A8DDD8" },
    ],
  },
];

const SLEEP_HOURS = { lt5: 4.5, "6": 6, "7": 7, "8": 8, "9p": 9.5 };
const MOOD_SCORE  = { irritable: 1, upset: 1, anxious: 2, meh: 3, content: 4, happy: 5 };
const CAFFEINE_MG = { lt50: 25, "50-100": 75, "100-200": 150, "200p": 250 };

export default function TrackTodayPage() {
  const [sel, setSel] = useState({});
  const [saved, setSaved] = useState(false);

  const toggle = (id, value) => {
    setSel(prev => ({ ...prev, [id]: prev[id] === value ? null : value }));
  };

  const handleSave = () => {
    const today = new Date().toISOString().split("T")[0];
    const painSymptoms = sel.pain ? [sel.pain] : [];
    const entry = createDailyEntry({
      date: today,
      sleepHours:      SLEEP_HOURS[sel.sleep] ?? null,
      mood:            MOOD_SCORE[sel.mood] ?? null,
      caffeineServings: sel.caffeine ? 1 : 0,
      caffeineMg:      CAFFEINE_MG[sel.caffeine] ?? null,
      exercise:        sel.exercise || "none",
      symptoms:        painSymptoms,
      notes:           sel.notes || "",
    });
    saveEntry(entry);
    setSaved(true);
    setTimeout(() => { setSaved(false); }, 1200);
  };

  return (
    <div className="page track-page">
      <h2 className="track-title fade-up delay-1">Track Today</h2>

      <div className="metrics fade-up delay-2">
        {METRICS.map(metric => (
          <div key={metric.id} className="metric-block">
            <span className="metric-label">{metric.label}</span>
            <div className="pills-wrap">
              {metric.options.map(opt => (
                <button
                  key={opt.value}
                  className={`pill ${sel[metric.id] === opt.value ? "selected" : ""}`}
                  style={{
                    background: sel[metric.id] === opt.value ? opt.color : "#F5F5F5",
                    borderColor: sel[metric.id] === opt.value ? opt.color : "transparent",
                    boxShadow: sel[metric.id] === opt.value ? `0 2px 10px ${opt.color}99` : "none",
                  }}
                  onClick={() => toggle(metric.id, opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <textarea
        className="notes-input fade-up delay-3"
        placeholder="Any notes for today… (optional)"
        rows={3}
        onChange={e => setSel(p => ({ ...p, notes: e.target.value }))}
      />

      <button
        className={`save-btn btn-primary fade-up delay-4 ${saved ? "saving" : ""}`}
        onClick={handleSave}
        disabled={saved}
      >
        {saved ? "✓ Saved!" : "Save Today"}
      </button>
    </div>
  );
}
