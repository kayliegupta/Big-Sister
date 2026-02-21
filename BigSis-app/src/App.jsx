import { useState } from "react";
import WelcomePage    from "./pages/WelcomePage";
import HomePage       from "./pages/HomePage";
import TrackTodayPage from "./pages/TrackTodayPage";
import HormonesPage   from "./pages/HormonesPage";
import AdvicePage     from "./pages/AdvicePage";
import "./App.css";

const NAV = [
  { id: "home",     icon: "♥", label: "Home" },
  { id: "track",    icon: "＋", label: "Track",   center: true },
  { id: "hormones", icon: "<>", label: "Lab" },
  { id: "advice",   icon: "✦", label: "Advice" },
];

export default function App() {
  const [page, setPage] = useState("welcome");

  const showNav = page !== "welcome";

  return (
    <div className="app">
      <div className="app-shell">

        {page === "welcome"  && <WelcomePage onGetStarted={() => setPage("home")} />}
        {page === "home"     && <HomePage />}
        {page === "track"    && <TrackTodayPage onBack={() => setPage("home")} />}
        {page === "hormones" && <HormonesPage />}
        {page === "advice"   && <AdvicePage />}

        {/* ── BOTTOM NAV ── */}
        {showNav && (
          <nav className="bottom-nav">
            {NAV.map(n => (
              <button
                key={n.id}
                className={`nav-btn ${n.center ? "nav-track" : ""} ${page === n.id ? "active" : ""}`}
                onClick={() => setPage(n.id)}
              >
                <span className="nav-icon">{n.icon}</span>
                <span className="nav-label">{n.label}</span>
              </button>
            ))}
          </nav>
        )}

      </div>
    </div>
  );
}
