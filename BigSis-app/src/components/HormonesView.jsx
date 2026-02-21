import { useState, useRef } from "react";
import "./HormonesView.css";

export default function HormonesView() {
  const [state, setState] = useState("idle");
  const [labData, setLabData] = useState(null);
  const [drag, setDrag] = useState(false);
  const fileRef = useRef();

  const handleFile = async (file) => {
    if (!file) return;
    setState("parsing");
    // WIRE UP: replace mock with parseLabFile() from labParser.js
    await new Promise(r => setTimeout(r, 1800));
    setLabData({
      testDate: "2026-01-15",
      hormones: {
        estradiol:    { value: 127, unit: "pg/mL", flag: "normal" },
        progesterone: { value: 0.8, unit: "ng/mL", flag: "low" },
        fsh:          { value: 6.2, unit: "mIU/mL", flag: "normal" },
        lh:           { value: 8.4, unit: "mIU/mL", flag: "normal" },
        tsh:          { value: 2.1, unit: "mIU/L",  flag: "normal" },
      },
    });
    setState("done");
  };

  const FLAG_COLOR = { normal: "#A8DDD8", low: "#F9B8C8", high: "#F5C090" };

  return (
    <div>
      {state === "idle" && (
        <div
          className={`upload-zone ${drag?"drag":""}`}
          onClick={() => fileRef.current.click()}
          onDragOver={e => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={e => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]); }}
        >
          <input ref={fileRef} type="file" accept=".pdf,image/*" hidden onChange={e => handleFile(e.target.files[0])} />
          <span className="upload-icon">⬆</span>
          <p className="upload-title">upload blood test</p>
          <p className="upload-sub">PDF or image · click or drag & drop</p>
        </div>
      )}

      {state === "parsing" && (
        <div className="parsing-zone">
          <div className="spinner" />
          <p className="parsing-text">Reading your lab results…</p>
        </div>
      )}

      {state === "done" && labData && (
        <div className="results-zone card" style={{ border: "2px solid var(--pink-light)" }}>
          <div className="results-top">
            <span className="results-title">Lab Results · {labData.testDate}</span>
            <button className="btn-ghost" style={{fontSize:11}} onClick={() => { setState("idle"); setLabData(null); }}>↺ New</button>
          </div>
          {Object.entries(labData.hormones).filter(([,v]) => v.value != null).map(([name, d]) => (
            <div key={name} className="hormone-row">
              <span className="hormone-name">{name.charAt(0).toUpperCase()+name.slice(1)}</span>
              <div className="hormone-bar-bg">
                <div className="hormone-bar-fill" style={{ width: `${Math.min((d.value/200)*100,100)}%`, background: FLAG_COLOR[d.flag] }} />
              </div>
              <span className="hormone-val">{d.value} <span className="hormone-unit">{d.unit}</span></span>
              <span className="hormone-flag" style={{ color: FLAG_COLOR[d.flag] === "#A8DDD8" ? "#3a9e96" : FLAG_COLOR[d.flag] === "#F9B8C8" ? "#d0446a" : "#c07030" }}>{d.flag}</span>
            </div>
          ))}
          <p className="results-note">For personal tracking only — not medical advice.</p>
        </div>
      )}
    </div>
  );
}
