import { useState, useRef } from "react";
import "./HormonesView.css";

export default function HormonesView() {
  const [uploadState, setUploadState] = useState("idle"); // "idle" | "parsing" | "done" | "error"
  const [labData, setLabData] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef();

  const handleFile = async (file) => {
    if (!file) return;
    setUploadState("parsing");

    // ── WIRE UP: replace this mock with parseLabFile() from labParser.js ──
    // import { parseLabFile } from "../utils/labParser.js";
    // const result = await parseLabFile(file, import.meta.env.VITE_ANTHROPIC_KEY);
    // setLabData(result);

    // Mock response for now:
    await new Promise((r) => setTimeout(r, 1800));
    setLabData({
      testDate: "2026-01-15",
      hormones: {
        estradiol:    { value: 127,  unit: "pg/mL",  flag: "normal", referenceRange: "30–400" },
        progesterone: { value: 0.8,  unit: "ng/mL",  flag: "low",    referenceRange: "1–28" },
        fsh:          { value: 6.2,  unit: "mIU/mL", flag: "normal", referenceRange: "3–10" },
        lh:           { value: 8.4,  unit: "mIU/mL", flag: "normal", referenceRange: "2–15" },
        tsh:          { value: 2.1,  unit: "mIU/L",  flag: "normal", referenceRange: "0.5–4.5" },
        testosterone: { value: 28,   unit: "ng/dL",  flag: "normal", referenceRange: "15–70" },
      },
    });
    setUploadState("done");
  };

  const onInputChange = (e) => handleFile(e.target.files[0]);
  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const FLAG_COLORS = { normal: "var(--sage)", low: "var(--rose)", high: "var(--terracotta)" };

  return (
    <div className="hormones-view">
      {uploadState === "idle" && (
        <div
          className={`upload-zone card ${dragOver ? "drag-over" : ""}`}
          onClick={() => fileRef.current.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
        >
          <input ref={fileRef} type="file" accept=".pdf,image/*" hidden onChange={onInputChange} />
          <div className="upload-icon">⬆</div>
          <p className="upload-title">Upload blood test</p>
          <p className="upload-sub">PDF or image from your lab portal</p>
          <span className="upload-hint">click or drag & drop</span>
        </div>
      )}

      {uploadState === "parsing" && (
        <div className="card parsing-card">
          <div className="parsing-spinner" />
          <p className="parsing-text">Reading your lab results…</p>
          <p className="parsing-sub">Claude is extracting your hormone values</p>
        </div>
      )}

      {uploadState === "done" && labData && (
        <div className="card results-card">
          <div className="results-header">
            <span className="results-title">Lab Results</span>
            <span className="results-date">{labData.testDate}</span>
            <button className="btn-ghost" onClick={() => { setUploadState("idle"); setLabData(null); }}>
              ↺ New upload
            </button>
          </div>
          <div className="hormone-list">
            {Object.entries(labData.hormones)
              .filter(([, v]) => v.value != null)
              .map(([name, data]) => (
                <div key={name} className="hormone-row">
                  <div className="hormone-name">{name.charAt(0).toUpperCase() + name.slice(1)}</div>
                  <div className="hormone-bar-wrap">
                    <div className="hormone-bar"
                      style={{ width: `${Math.min((data.value / 200) * 100, 100)}%`, background: FLAG_COLORS[data.flag] || "var(--sage)" }} />
                  </div>
                  <div className="hormone-value">
                    {data.value} <span className="hormone-unit">{data.unit}</span>
                  </div>
                  <span className="hormone-flag" style={{ color: FLAG_COLORS[data.flag] }}>
                    {data.flag}
                  </span>
                </div>
              ))}
          </div>
          <p className="results-disclaimer">These values are for personal tracking only. Consult your provider for interpretation.</p>
        </div>
      )}

      {uploadState === "error" && (
        <div className="card error-card">
          <p>Couldn't read that file. Try a clearer image or a different PDF.</p>
          <button className="btn-secondary" onClick={() => setUploadState("idle")}>Try again</button>
        </div>
      )}
    </div>
  );
}
