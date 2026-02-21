import "./WelcomePage.css";

export default function WelcomePage({ onGetStarted }) {
  return (
    <div className="welcome-page">
      {/* Aura gradient background — only on this page */}
      <div className="aura-bg" />

      <div className="welcome-content fade-up">
        <p className="welcome-to">Welcome to</p>
        <div className="welcome-logo">
          <span className="logo-icon">♀</span>
          <h1 className="logo-name">Big Sister</h1>
        </div>
        <button className="btn-primary welcome-btn" onClick={onGetStarted}>
          Get Started
        </button>
      </div>
    </div>
  );
}
