import { useState, useEffect } from "react";
import "./AdvicePage.css";
import { getRecentEntries, getAllLabResults, getLatestCycleRecord } from "../utils/storageLayer.js";
import { getCycleDay, getCyclePhase } from "../utils/cycleCalculator.js";

function computeInsights(entries, labs, cycleRecord) {
  const insights = [];
  const positives = [];

  const avg = (arr, key) => {
    const vals = arr.filter(e => e[key] != null).map(e => e[key]);
    return vals.length ? vals.reduce((a,b) => a+b, 0) / vals.length : null;
  };

  const phase = cycleRecord
    ? getCyclePhase(getCycleDay(cycleRecord.periodStartDate), cycleRecord.cycleLength || 28)
    : null;
  const phaseName = phase?.name || "unknown";

  const avgSleep    = avg(entries, "sleepHours");
  const avgMood     = avg(entries, "mood");
  const avgCaffMg   = avg(entries, "caffeineMg");
  const lateCaff    = entries.filter(e => e.lastCaffeineTime && e.lastCaffeineTime >= "14:00").length;
  const luteal      = phaseName === "Luteal" || phaseName === "Menstrual";

  // Sleep
  if (avgSleep !== null && avgSleep < 6.5) {
    insights.push({ id:"sleep", label:"sleep", color:"#FAE4A0",
      body: `Averaging ${avgSleep.toFixed(1)} hrs — try for 7.5+ especially in ${phaseName} phase.`,
      tip: "Consistent bedtime beats total hours." });
  } else if (avgSleep !== null && avgSleep >= 7.5) {
    positives.push(`Great sleep this week — ${avgSleep.toFixed(1)} hrs average.`);
  }

  // Caffeine
  if (avgCaffMg !== null && avgCaffMg > 150 && luteal) {
    insights.push({ id:"caffeine", label:"caffeine", color:"#FBBDD0",
      body: `High caffeine (~${Math.round(avgCaffMg)}mg/day) during ${phaseName} phase amplifies anxiety and disrupts sleep.`,
      tip: lateCaff >= 3 ? `Caffeine after 2pm on ${lateCaff} days — cut off at noon.` : "Cap at 100mg before noon this phase." });
  } else if (avgCaffMg !== null && avgCaffMg <= 100) {
    positives.push(`Low caffeine this week (~${Math.round(avgCaffMg)}mg avg) — nice.`);
  }

  // Mood
  if (avgMood !== null && avgMood <= 2.5) {
    insights.push({ id:"mood", label:"mood", color:"#D8C8F0",
      body: `Mood averaged ${avgMood.toFixed(1)}/5. ${luteal ? "Late luteal progesterone drop pulls serotonin down — hormonal, not permanent." : "Multiple low days worth paying attention to."}`,
      tip: "10 min outdoor light in the morning shifts mood hormones." });
  } else if (avgMood !== null && avgMood >= 4) {
    positives.push(`Mood ${avgMood.toFixed(1)}/5 this week — genuinely good.`);
  }

  // Symptoms
  const syms = entries.flatMap(e => e.symptoms || []);
  const counts = syms.reduce((a, s) => { a[s]=(a[s]||0)+1; return a; }, {});
  const top = Object.entries(counts).filter(([,c])=>c>=2).sort(([,a],[,b])=>b-a).slice(0,3).map(([s])=>s);
  if (top.length) {
    insights.push({ id:"symptoms", label:"cycle", color:"#F5C090",
      body: `Recurring: ${top.join(", ")}. ${top.includes("cramps") && luteal ? "Cramps before period = prostaglandins — magnesium & omega-3s help." : "Log these at your next provider visit."}`,
      tip: "Patterns across 2–3 cycles = useful data." });
  }

  // Exercise
  const active = entries.filter(e => e.exercise && e.exercise !== "none").length;
  if (active >= 3) positives.push(`Moving ${active}x this week — great for hormonal balance.`);

  // Deep dive
  let deepDive = "Upload a blood test on the Hormones tab for a personalized deep dive connecting your hormone levels to how you've been feeling.";
  if (labs?.length > 0) {
    const latest = labs[0];
    const flags = Object.entries(latest.hormones||{}).filter(([,d])=>d.value!=null&&d.flag&&d.flag!=="normal").map(([n,d])=>({n,...d}));
    if (flags.length) {
      deepDive = `Your ${latest.testDate||"recent"} labs flagged: ${flags.map(f=>`${f.n} (${f.flag})`).join(", ")}. ${flags.some(f=>f.n==="progesterone"&&f.flag==="low") ? "Low progesterone mid-cycle explains sleep disruption, mood shifts, and fatigue. Worth discussing with your provider." : "Bring flagged values to your next provider visit."}`;
    } else {
      deepDive = `Your ${latest.testDate||"recent"} labs all came back normal — great. Keep tracking across cycles for patterns.`;
    }
  }

  const score = ((avgMood||3) + Math.min((avgSleep||7)/9*5,5)) / 2;
  const vibes = {
    low:  [`${phaseName} phase is heavy right now — this passes`, "Tough week, but you showed up"],
    mid:  [`${phaseName} phase energy: manageable`, "Steady week — not every week is a peak"],
    high: [`${phaseName} phase + good habits = strong week`, "Your data looks healthy this week"],
  };
  const tier = score < 2.5 ? "low" : score < 3.8 ? "mid" : "high";
  const dailyVibe = vibes[tier][Math.floor(Math.random()*2)];
  const cycleDay = cycleRecord ? getCycleDay(cycleRecord.periodStartDate) : null;

  return {
    dailyVibe,
    summary: `${phaseName} phase${cycleDay ? ` · day ${cycleDay}` : ""}. ${entries.length > 0 ? `Big Sis reviewed your last ${entries.length} days.` : "Start logging to get personalized insights."}`,
    insights,
    deepDive,
    positives: positives.length ? positives : ["Keep logging — insights sharpen after a few days."],
  };
}

export default function AdvicePage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [noData, setNoData] = useState(false);
  const [active, setActive] = useState(null);

  const load = () => {
    setLoading(true); setActive(null);
    setTimeout(() => {
      const entries = getRecentEntries(7);
      const labs    = getAllLabResults();
      const cycle   = getLatestCycleRecord();
      if (!entries.length && !cycle) { setNoData(true); setLoading(false); return; }
      setData(computeInsights(entries, labs, cycle));
      setNoData(false); setLoading(false);
    }, 700);
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="page advice-page">
      <div className="fade-up delay-1" style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18}}>
        <h2 className="advice-title">Advice</h2>
        <button className="btn-ghost" onClick={load} disabled={loading}>{loading?"…":"↻"}</button>
      </div>

      {loading && (
        <div className="advice-loading fade-up delay-2">
          <div className="advice-spinner" />
          <p>Big Sis is thinking…</p>
        </div>
      )}

      {!loading && noData && (
        <div className="card no-data fade-up delay-2">
          <p style={{fontWeight:700, marginBottom:8}}>No data yet</p>
          <p style={{fontSize:13, color:"var(--mid)", marginBottom:16}}>Log at least one day so Big Sis has something to work with.</p>
          <p style={{fontSize:13,color:"var(--mid)"}}>Use the Track tab below to get started.</p>
        </div>
      )}

      {!loading && data && (
        <>
          {/* Daily Vibe — pink block */}
          <div className="vibe-block fade-up delay-2">
            <span className="vibe-eyebrow">daily vibe</span>
            <p className="vibe-headline">"{data.dailyVibe}"</p>
            <p className="vibe-sub">{data.summary}</p>
          </div>

          {/* TLDR */}
          {data.insights.length > 0 && (
            <div className="tldr-section fade-up delay-3">
              <span className="section-label">TLDR;</span>
              <div className="tldr-row">
                {data.insights.map(ins => (
                  <button
                    key={ins.id}
                    className={`tldr-pill ${active===ins.id?"expanded":""}`}
                    style={{ background: ins.color }}
                    onClick={() => setActive(active===ins.id ? null : ins.id)}
                  >
                    <span className="tldr-label">{ins.label}</span>
                    {active === ins.id && (
                      <div className="tldr-detail">
                        <p className="tldr-body">{ins.body}</p>
                        <span className="tldr-tip">→ {ins.tip}</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Deep dive — teal block */}
          <div className="deep-block fade-up delay-4">
            <span className="deep-label">deep dive — bloodwork analysis</span>
            <p className="deep-body">{data.deepDive}</p>
          </div>

          {/* Positives */}
          <div className="positives-block fade-up delay-5">
            <span className="section-label">you're doing great ✦</span>
            {data.positives.map((p,i) => <p key={i} className="positive-item">◆ {p}</p>)}
          </div>

          <p className="advice-disclaimer fade-up delay-5">
            For personal tracking only — not medical advice.
          </p>
        </>
      )}
    </div>
  );
}
