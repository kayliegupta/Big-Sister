import { useState } from "react";
import HomePage from "./pages/HomePage";
import TrackTodayPage from "./pages/TrackTodayPage";
import AdvicePage from "./pages/AdvicePage";
import "./App.css";

export default function App() {
  const [currentPage, setCurrentPage] = useState("home");

  return (
    <div className="app">
      {currentPage === "home" && (
        <HomePage
          onTrackToday={() => setCurrentPage("track")}
          onGetAdvice={() => setCurrentPage("advice")}
        />
      )}
      {currentPage === "track" && (
        <TrackTodayPage onBack={() => setCurrentPage("home")} />
      )}
      {currentPage === "advice" && (
        <AdvicePage onBack={() => setCurrentPage("home")} />
      )}
    </div>
  );
}
