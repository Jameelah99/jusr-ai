
import { useState } from "react";
import "./measures.css";

type Measure = {
  id: string;
  title: string;
  definition: string;
  display: string;
  eventSource: string;
};

const measures: Measure[] = [
  {
    id: "M1",
    title: "Time to notification",
    definition:
      "Median and 90th percentile time from result received to message delivered.",
    display: "Comparison view",
    eventSource: "T1 to T7",
  },
  {
    id: "M2",
    title: "Acknowledgement and understanding",
    definition:
      "Share acknowledged within the limit, and share answering yes to understanding.",
    display: "Percentage view",
    eventSource: "T7 to T8 or T9; patient responses",
  },
  {
    id: "M3",
    title: "Referral acceptance and appointment completion",
    definition:
      "Share of referrals accepted within the limit, and share of appointments attended.",
    display: "Percentage view",
    eventSource: "T9 or T10 to T12; T14",
  },
  {
    id: "M4",
    title: "Time to care",
    definition:
      "Time from result received to confirmatory result, consultation outcome, attendance, and treatment or monitoring start.",
    display: "Comparison view",
    eventSource: "T1 to T10, T14, T15; consultation outcome",
  },
  {
    id: "M5",
    title: "Unresolved results and closure",
    definition:
      "Open cases by status and age, share closed with documented evidence or decision, and reasons for delay and drop-off.",
    display: "Count and age view",
    eventSource: "Open statuses, T16, T17; delay follow-ups",
  },
  {
    id: "M6",
    title: "Patient understanding, reassurance and confidence",
    definition:
      "Share answering yes to understanding, mean confidence (1–5), and mean reassurance pulse (1–5).",
    display: "Measure cards",
    eventSource: "Patient responses (R-34)",
  },
];

function MeasuresPage() {
  const [facility, setFacility] = useState("all");
  const [pathway, setPathway] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  return (
    <div className="page-container measures-page">
      <div className="page-heading measures-heading">
        <div>
          <span className="measures-eyebrow">INSIGHTS & ANALYTICS</span>
          <h1>Measures</h1>
          <p>
            Monitor the screening-to-care pathway using measures calculated
            from the case event log.
          </p>
        </div>
      </div>

      <div className="measures-notice">
        <span className="notice-indicator" />
        <div>
          <strong>Simulated data only</strong>
          <p>
            This page demonstrates how the tracker measures performance. It
            does not present clinical results or evidence of improved outcomes.
          </p>
        </div>
      </div>

      <section className="measures-filter-panel">
        <div className="measures-section-heading">
          <div>
            <h2>Performance overview</h2>
            <p>Filter the measures by facility, pathway and date range.</p>
          </div>
          <span className="filter-label">FILTERS</span>
        </div>

        <div className="measures-filters">
          <label>
            <span>Facility</span>
            <select
              value={facility}
              onChange={(event) => setFacility(event.target.value)}
            >
              <option value="all">All facilities</option>
            </select>
          </label>

          <label>
            <span>Pathway</span>
            <select
              value={pathway}
              onChange={(event) => setPathway(event.target.value)}
            >
              <option value="all">All pathways</option>
            </select>
          </label>

          <label>
            <span>From date</span>
            <input
              type="date"
              value={fromDate}
              onChange={(event) => setFromDate(event.target.value)}
            />
          </label>

          <label>
            <span>To date</span>
            <input
              type="date"
              value={toDate}
              onChange={(event) => setToDate(event.target.value)}
            />
          </label>
        </div>
      </section>

      <section className="measures-section">
        <div className="measures-section-heading">
          <div>
            <h2>Six core measures</h2>
            <p>
              Each measure is derived from recorded events, not stored counters.
            </p>
          </div>
          <span className="measure-count">06 MEASURES</span>
        </div>

        <div className="measures-grid">
          {measures.map((measure) => (
            <article className="measure-card" key={measure.id}>
              <div className="measure-card-top">
                <span className="measure-id">{measure.id}</span>
                <span className="measure-display">{measure.display}</span>
              </div>

              <h3>{measure.title}</h3>
              <p className="measure-definition">{measure.definition}</p>

              <div className="measure-card-footer">
                <span>EVENT SOURCE</span>
                <strong>{measure.eventSource}</strong>
              </div>

              <div className="measure-pending">
                Awaiting event-log data
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="measures-section comparison-section">
        <div className="measures-section-heading">
          <div>
            <h2>Baseline vs tracker</h2>
            <p>
              Comparison of the simulated baseline group and cases handled
              through Jusr AI.
            </p>
          </div>
          <span className="comparison-tag">SIMULATED COMPARISON</span>
        </div>

        <div className="comparison-grid">
          <div className="comparison-panel">
            <div className="comparison-panel-heading">
              <span className="comparison-dot baseline-dot" />
              <div>
                <h3>Baseline</h3>
                <p>Without a shared tracker</p>
              </div>
            </div>
            <div className="comparison-empty">
              <strong>Assumptions pending</strong>
              <p>
                Baseline durations and drop-off assumptions have not yet been
                confirmed.
              </p>
            </div>
          </div>

          <div className="comparison-panel">
            <div className="comparison-panel-heading">
              <span className="comparison-dot tracker-dot" />
              <div>
                <h3>Jusr AI tracker</h3>
                <p>Cases handled through the tracker</p>
              </div>
            </div>
            <div className="comparison-empty">
              <strong>Event data pending</strong>
              <p>
                Measures will be calculated from the recorded event log.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default MeasuresPage;
