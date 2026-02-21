import HormonesView from "../components/HormonesView";
import "./HormonesPage.css";

export default function HormonesPage() {
  return (
    <div className="page hormones-page">
      <div className="hormones-header fade-up delay-1">
        <h2 className="page-title">Lab Results</h2>
        <p className="page-sub">Upload your blood test to track hormone levels</p>
      </div>
      <div className="fade-up delay-2">
        <HormonesView />
      </div>
    </div>
  );
}
