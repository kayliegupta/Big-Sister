import { useState, useEffect } from "react";
import CalendarView from "../components/CalendarView";
import PieChart     from "../components/PieChart";
import { getLatestCycleRecord, saveCycleRecord } from "../utils/storageLayer.js";
import { createCycleRecord } from "../utils/dataModels.js";
import { getCycleDay, getCyclePhase, predictNextPeriod } from "../utils/cycleCalculator.js";
import "./HomePage.css";

const PHASE_COLORS = {
  Menstrual:  "#FBBDD0",
  Follicular: "#FAE4A0",
  Ovulation:  "#A8DDD8",
  Luteal:     "#D8C8F0",
};

export default function HomePage() {
  const [tab, setTab]               = useState("calendar");
  const [cycleRecord, setCycleRecord] = useState(null);
  const [showSetup, setShowSetup]   = useState(false);
  const [cycleInput, setCycleInput] = useState("");

  // Compute today inside the component so it's always fresh
  const today    = new Date();
  const month    = today.toLocaleString("default", { month: "short" });
  const day      = today.getDate();
  const todayStr = today.toISOString().split("T")[0];

  useEffect(() => {
    const r = getLatestCycleRecord();
    setCycleRecord(r);
    if (!r) setShowSetup(true);
  }, []);

  const saveCycle = () => {
    if (!cycleInput) return;
    const r = createCycleRecord({ periodStartDate: cycleInput, cycleLength: 28 });
    saveCycleRecord(r);
    setCycleRecord(r);
    setShowSetup(false);
  };

  // All of these derive from cycleRecord — update automatically when it changes
  const cycleDay   = cycleRecord ? getCycleDay(cycleRecord.periodStartDate) : null;
  const phase      = (cycleDay && cycleDay >= 1)
    ? getCyclePhase(cycleDay, cycleRecord.cycleLength || 28)
    : null;
  const nextPeriod = cycleRecord
    ? predictNextPeriod(cycleRecord.periodStartDate, cycleRecord.cycleLength || 28)
    : null;
  const daysTill   = nextPeriod
    ? Math.max(0, Math.round((new Date(nextPeriod) - today) / 86400000))
    : "—";

  return (
    <div className="page home-page">

      {/* ── CYCLE SETUP BANNER ── */}
      {showSetup && (
        <div className="setup-banner fade-up delay-1">
          <p className="setup-q">When did your last period start?</p>
          <div className="setup-row">
            <input
              type="date"
              className="setup-input"
              value={cycleInput}
              max={todayStr}
              onChange={e => setCycleInput(e.target.value)}
            />
            <button
              className="btn-primary"
              style={{ padding: "8px 18px", fontSize: 13 }}
              onClick={saveCycle}
              disabled={!cycleInput}
            >
              Set
            </button>
          </div>
        </div>
      )}

      {/* ── HEADER ── */}
      <div className="home-header fade-up delay-1">

        {/* Teal date circle */}
        <div className="date-circle">
          <span className="date-top">Today</span>
          <span className="date-val">{month} {day}</span>
        </div>

        {/* Center — phase badge OR set date prompt */}
        <div className="header-mid">
          {phase ? (
            <button
              className="phase-badge"
              style={{ background: PHASE_COLORS[phase.name] }}
              onClick={() => setShowSetup(true)}
              title="Tap to update cycle date"
            >
              {phase.name} Phase
            </button>
          ) : (
            <button className="btn-ghost set-date-btn" onClick={() => setShowSetup(true)}>
              + Set cycle date
            </button>
          )}
        </div>

        {/* Pink days-till card */}
        <div className="days-card">
          <span className="days-top">Next cycle</span>
          <span className="days-num">{daysTill}</span>
          <span className="days-bottom">days</span>
        </div>

      </div>

      {/* ── TABS ── */}
      <div className="tabs fade-up delay-2">
        <button className={`tab ${tab === "calendar" ? "active" : ""}`} onClick={() => setTab("calendar")}>
          Calendar
        </button>
        <button className={`tab ${tab === "cycle" ? "active" : ""}`} onClick={() => setTab("cycle")}>
          Cycle
        </button>
      </div>

      {/* ── TAB CONTENT ── */}
      <div className="fade-up delay-3">
        {tab === "calendar" && <CalendarView cycleRecord={cycleRecord} />}
        {tab === "cycle"    && <PieChart cycleRecord={cycleRecord} currentPhaseName={phase?.name} />}
      </div>

    </div>
  );
}
