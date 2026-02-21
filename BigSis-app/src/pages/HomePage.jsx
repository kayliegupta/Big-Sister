import { useState } from "react";
import CalendarView from "../components/CalendarView";
import HormonesView from "../components/HormonesView";
import "./HomePage.css";

// Mock data — replace with storageLayer.js calls
const TODAY = new Date();
const MONTH = TODAY.toLocaleString("default", { month: "short" });
const DAY   = TODAY.getDate();
const DAYS_TILL_NEXT = 8; // replace with predictNextPeriod() from cycleCalculator.js
const CURRENT_PHASE = { name: "Luteal", color: "#C4B8D8" };

export default function HomePage({ onTrackToday, onGetAdvice }) {
  const [tab, setTab] = useState("calendar"); // "calendar" | "hormones"

  return (
    <div className="page home-page">
      {/* ── HEADER ── */}
      <div className="header fade-up fade-up-1">
        <div className="date-circle">
          <span className="month">{MONTH}</span>
          <span className="day">{DAY}</span>
        </div>

        <div className="header-center">
          <button className="btn-primary track-btn" onClick={onTrackToday}>
            Track Today
          </button>
          <div className="phase-pill fade-up fade-up-2" style={{ background: CURRENT_PHASE.color + "55", color: "#2C2C2C", marginTop: 8 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: CURRENT_PHASE.color, display: "inline-block" }} />
            {CURRENT_PHASE.name} Phase
          </div>
        </div>

        <div className="next-cycle fade-up fade-up-2">
          <span className="next-cycle-label">Days till</span>
          <span className="next-cycle-label">next cycle</span>
          <span className="next-cycle-number">{DAYS_TILL_NEXT}</span>
        </div>
      </div>

      {/* ── TABS ── */}
      <div className="tabs fade-up fade-up-3">
        <button className={`tab ${tab === "calendar" ? "active" : ""}`} onClick={() => setTab("calendar")}>
          Calendar
        </button>
        <button className={`tab ${tab === "hormones" ? "active" : ""}`} onClick={() => setTab("hormones")}>
          Hormones
        </button>
      </div>

      {/* ── TAB CONTENT ── */}
      <div className="tab-content fade-up fade-up-4">
        {tab === "calendar" && <CalendarView />}
        {tab === "hormones" && <HormonesView />}
      </div>

      {/* ── GET ADVICE BUTTON ── */}
      <div className="advice-row fade-up fade-up-5">
        <button className="btn-primary get-advice-btn" onClick={onGetAdvice}>
          ✦ Get Advice
        </button>
      </div>
    </div>
  );
}
