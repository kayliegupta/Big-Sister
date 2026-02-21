import React from "react";
import "./WelcomePage.css";

// This SVG is custom-drawn to match the "chunky" proportions in your screenshot
const LogoIcon = ({ size = 60 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 100 100" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Main Circular Body */}
    <circle cx="50" cy="40" r="32" fill="#e3308d" />
    
    {/* Inner White Circle */}
    <circle cx="50" cy="40" r="20" fill="white" />
    
    {/* The Heart Inside */}
    <path 
      d="M50 48L48.5 46.5C43.3 41.8 40 38.8 40 35.2C40 32.2 42.3 30 45.2 30C46.9 30 48.5 30.8 50 32.1C51.5 30.8 53.1 30 54.8 30C57.7 30 60 32.2 60 35.2C60 38.8 56.7 41.8 51.5 46.5L50 48Z" 
      fill="#e3308d" 
    />
    
    {/* The Thick Vertical Stem */}
    <rect x="45" y="60" width="10" height="300" rx="5" fill="#e3308d" />
    
    {/* The Wide Rounded Crossbar */}
    <rect x="30" y="75" width="40" height="10" rx="5" fill="#e3308d" />
  </svg>
);

export default function WelcomePage({ onGetStarted }) {
  return (
    <div className="welcome-page">
      {/* Aura gradient background — only on this page */}
      <div className="aura-bg" />

      <div className="welcome-content fade-up">
        <p className="welcome-to">Welcome to</p>
        <div className="welcome-logo">
          <LogoIcon size={60} />
          <h1 className="logo-name">Big Sister</h1>
        </div>
        <button className="btn-primary welcome-btn" onClick={onGetStarted}>
          Get Started
        </button>
      </div>
    </div>
  );
}
