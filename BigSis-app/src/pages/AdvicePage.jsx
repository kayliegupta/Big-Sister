import { useState } from "react";
import "./AdvicePage.css";

// Mock insight data — replace with getInsights() from aiInsights.js
const MOCK_INSIGHTS = {
  dailyVibe: "Luteal phase fatigue + late caffeine = rough sleep",
  summary: "You're in your luteal phase. Your progesterone dipped low last test, which tracks with the mood and fatigue you logged this week.",
  cards: {
    caffeine: {
      icon: "☕",
      title: "Caffeine",
      body: "You had caffeine after 2pm 4 days this week. In your luteal phase, caffeine clears 20% slower — try cutting off at noon.",
      tip: "Switch to decaf after 12pm",
      priority: "high",
    },
    sleep: {
      icon: "🌙",
      title: "Sleep",
      body: "You averaged 6.2hrs this week vs. your usual 7.4. Low progesterone can make sleep lighter — consistent bedtime helps.",
      tip: "Add 15 min wind-down, no screens",
      priority: "high",
    },
    cycle: {
      icon: "○",
      title: "Cycle",
      body: "Day 22 of 28. PMS window is now. The cramps and mood dips you logged are typical for late luteal — not cause for alarm.",
      tip: "Magnesium glycinate may ease cramps",
      priority: "medium",
    },
  },
  deepDive: "Your progesterone came back low at 0.8 ng/mL on Day 21. This can explain the poor sleep quality, mood swings, and low energy you've been logging. Consider mentioning this to your provider — they may want to retest on Day 18–22 of your next cycle.",
  positives: ["You logged consistently 6 out of 7 days", "Exercise 3x this week during luteal phase is impressive"],
};

const PRIORITY_COLOR = { high: "var(--rose)", medium: "var(--amber)", low: "var(--sage)" };

export default function AdvicePage({ onBack }) {
  const [loading, setLoading] = useState(false);
  const [activeCard, setActiveCard] = useState(null);
  const [insights, setInsights] = useState(MOCK_INSIGHTS);

  const refreshInsights = async () => {
    setLoading(true);
    // ── WIRE UP: replace with getInsights() from aiInsights.js ──
    // import { getInsights } from "../utils/aiInsights.js";
    // import { getRecentEntries, getAllLabResults, getProfile } from "../utils/storageLayer.js";
    // import { getCyclePhase } from "../utils/cycleCalculator.js";
    // const result = await getInsights({ entries: getRecentEntries(7), labs: getAllLabResults(), profile: getProfile(), currentPhase: ..., apiKey: ... });
    await new Promise((r) => setTimeout(r, 1600));
    setLoading(false);
    // In production, setInsights(result) here
  };

  return (
    <div className="page advice-page">
      {/* ── HEADER ── */}
      <div className="advice-header fade-up fade-up-1">
        <button className="btn-ghost back-btn" onClick={onBack}>← Back</button>
        <h2 className="advice-title">Advice</h2>
        <button className="btn-ghost refresh-btn" onClick={refreshInsights} disabled={loading}>
          {loading ? "…" : "↻"}
        </button>
      </div>

      {loading ? (
        <div className="loading-state fade-up fade-up-2">
          <div className="advice-spinner" />
          <p>Luna is thinking…</p>
        </div>
      ) : (
        <>
          {/* ── DAILY VIBE HEADER ── */}
          <div className="vibe-card card fade-up fade-up-2">
            <span className="vibe-eyebrow">daily vibe</span>
            <h3 className="vibe-headline">"{insights.dailyVibe}"</h3>
            <p className="vibe-summary">{insights.summary}</p>
          </div>

          {/* ── TLDR ── */}
          <div className="tldr-section fade-up fade-up-3">
            <span className="section-label">TLDR</span>
            <div className="tldr-cards">
              {Object.entries(insights.cards).map(([key, card]) => (
                <button
                  key={key}
                  className={`tldr-card ${activeCard === key ? "expanded" : ""}`}
                  onClick={() => setActiveCard(activeCard === key ? null : key)}
                  style={{ borderColor: activeCard === key ? PRIORITY_COLOR[card.priority] : "var(--border)" }}
                >
                  <span className="tldr-icon">{card.icon}</span>
                  <span className="tldr-label">{card.title}</span>
                  {activeCard === key && (
                    <div className="tldr-expanded">
                      <p className="tldr-body">{card.body}</p>
                      <span className="tldr-tip">→ {card.tip}</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* ── DEEP DIVE ── */}
          <div className="deep-dive-card card fade-up fade-up-4">
            <span className="section-label">deep dive — bloodwork analysis</span>
            <p className="deep-dive-body">{insights.deepDive}</p>
          </div>

          {/* ── POSITIVES ── */}
          <div className="positives-card card fade-up fade-up-5">
            <span className="section-label">you're doing great ✦</span>
            {insights.positives.map((p, i) => (
              <p key={i} className="positive-item">◆ {p}</p>
            ))}
          </div>

          {/* ── DISCLAIMER ── */}
          <p className="advice-disclaimer fade-up fade-up-5">
            These insights are for personal awareness only and are not medical advice.
          </p>
        </>
      )}
    </div>
  );
}
