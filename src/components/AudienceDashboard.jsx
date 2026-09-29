import { useEffect, useRef, useState } from "react";
import { buildAudienceCsv } from "../lib/audienceCsv.js";
import { organisationLabel } from "../site.config.js";
import Layout from "./Layout.jsx";

const PRESETS = [
  { id: "day", label: "Today" },
  { id: "7d", label: "Last 7 days" },
  { id: "30d", label: "Last 30 days" },
  { id: "custom", label: "Custom" },
];

const ZONES = ["Africa/Accra", "UTC", "Europe/London", "America/New_York"];

const INITIAL_FILTERS = {
  preset: "7d",
  timeZone: "Africa/Accra",
  from: "",
  to: "",
  campaign: "",
};

function queryString(filters) {
  const params = new URLSearchParams({
    preset: filters.preset,
    timezone: filters.timeZone,
  });
  if (filters.campaign) {
    params.set("campaign", filters.campaign);
  }
  if (filters.preset === "custom") {
    params.set("from", filters.from);
    params.set("to", filters.to);
  }
  return params.toString();
}

function filtersReady(filters) {
  if (filters.preset !== "custom") {
    return true;
  }
  return Boolean(filters.from && filters.to && filters.from <= filters.to);
}

function percent(rate) {
  return new Intl.NumberFormat("en", {
    style: "percent",
    maximumFractionDigits: 1,
  }).format(rate);
}

function formatUpdated(report) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: report.timeZone,
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(report.updatedAt));
}

function ChannelCard({ title, channel, phase }) {
  const showNumbers = channel && (phase === "ready" || phase === "empty" || phase === "stale");
  return (
    <article className="card stat-card">
      <h2>{title}</h2>
      <p className="stat-value">{showNumbers ? channel.users : "—"}</p>
      <p className="stat-label">Clicked users</p>
      <p className="stat-clicks">{showNumbers ? `${channel.clicks} clicks` : "Clicks appear after a successful load"}</p>
      {showNumbers && channel.previous ? (
        <p className="stat-clicks">
          Previous period: {channel.previous.users} clicked users and {channel.previous.clicks} clicks.
        </p>
      ) : null}
      {showNumbers && typeof channel.rate === "number" ? (
        <p className="stat-clicks">
          {percent(channel.rate)} of this campaign’s tagged visits. This is not a subscription rate.
        </p>
      ) : null}
    </article>
  );
}

function TrendChart({ trend }) {
  const width = Math.max(trend.length * 36, 280);
  const height = 180;
  const max = Math.max(
    1,
    ...trend.map((day) => Math.max(day.youtubeUsers, day.whatsappUsers)),
  );

  return (
    <div className="trend-chart">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Daily clicked users for each channel">
        {trend.map((day, index) => {
          const youtubeHeight = (day.youtubeUsers / max) * 140;
          const whatsappHeight = (day.whatsappUsers / max) * 140;
          const x = index * 36 + 8;
          return (
            <g key={day.date}>
              <rect x={x} y={150 - youtubeHeight} width="12" height={youtubeHeight} fill="#9f1239" />
              <rect x={x + 14} y={150 - whatsappHeight} width="12" height={whatsappHeight} fill="#146c43" />
            </g>
          );
        })}
      </svg>
      <p className="chart-legend">
        <span className="legend-youtube">YouTube clicked users</span>
        <span className="legend-whatsapp">WhatsApp clicked users</span>
      </p>
    </div>
  );
}

function TrendTable({ trend }) {
  return (
    <table className="trend-table">
      <caption>
        Daily engagement. Do not add these daily clicked-user counts to get the period total.
      </caption>
      <thead>
        <tr>
          <th scope="col">Date</th>
          <th scope="col">YouTube clicked users</th>
          <th scope="col">YouTube clicks</th>
          <th scope="col">WhatsApp clicked users</th>
          <th scope="col">WhatsApp clicks</th>
        </tr>
      </thead>
      <tbody>
        {trend.map((day) => (
          <tr key={day.date}>
            <th scope="row">{day.date}</th>
            <td>{day.youtubeUsers}</td>
            <td>{day.youtubeClicks}</td>
            <td>{day.whatsappUsers}</td>
            <td>{day.whatsappClicks}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function AudienceDashboard() {
  const [phase, setPhase] = useState("loading");
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [report, setReport] = useState(null);
  const [exportError, setExportError] = useState("");
  const [setupOpen, setSetupOpen] = useState(false);
  const reportRef = useRef(null);
  const requestRef = useRef(0);

  async function load(nextFilters, { preserve }) {
    const requestId = requestRef.current + 1;
    requestRef.current = requestId;
    if (!preserve) {
      reportRef.current = null;
      setReport(null);
      setPhase("loading");
    }

    const response = await fetch(`/api/audience?${queryString(nextFilters)}`, {
      credentials: "same-origin",
    });
    if (requestId !== requestRef.current) {
      return;
    }
    if (response.status === 502) {
      if (preserve && reportRef.current) {
        setPhase("stale");
        return;
      }
      setReport(null);
      setPhase("error");
      return;
    }
    if (!response.ok) {
      setReport(null);
      setPhase("error");
      return;
    }

    const body = await response.json();
    if (requestId !== requestRef.current) {
      return;
    }
    if (body.status === "unconfigured") {
      reportRef.current = null;
      setReport(body);
      setSetupOpen(true);
      setPhase("unconfigured");
      return;
    }
    reportRef.current = body;
    setReport(body);
    setPhase(body.status === "empty" ? "empty" : "ready");
  }

  useEffect(() => {
    if (!filtersReady(filters)) {
      return;
    }
    load(filters, { preserve: false });
    // Reload when the selected range, timezone, or campaign changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.preset, filters.timeZone, filters.from, filters.to, filters.campaign]);

  function onExport() {
    const current = reportRef.current;
    if (!current || current.status === "unconfigured" || current.status === "error") {
      setExportError("There is no report to export.");
      return;
    }
    const csv = buildAudienceCsv(current);
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "audience.csv";
    link.click();
    URL.revokeObjectURL(url);
    setExportError("");
  }

  const missing = report?.missing ?? [];
  const showFigures = phase === "ready" || phase === "empty" || phase === "stale";

  return (
    <Layout organisationName={organisationLabel()}>
      <header className="hero dashboard-heading">
        <div>
          <h1>Audience overview</h1>
          <p className="lead">
            Channel button clicks for the selected range. A click is not a subscription or a follow.
          </p>
        </div>
      </header>

      <>
          <div className="dashboard-toolbar">
            <div className="range-row" role="group" aria-label="Date range">
              {PRESETS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="range-button"
                  aria-pressed={filters.preset === item.id}
                  onClick={() => setFilters((current) => ({ ...current, preset: item.id }))}
                >
                  {item.label}
                </button>
              ))}
            </div>
            {filters.preset === "custom" ? (
              <div className="date-row">
                <label>
                  Start
                  <input
                    type="date"
                    value={filters.from}
                    onChange={(event) => setFilters((current) => ({ ...current, from: event.target.value }))}
                  />
                </label>
                <label>
                  End
                  <input
                    type="date"
                    value={filters.to}
                    onChange={(event) => setFilters((current) => ({ ...current, to: event.target.value }))}
                  />
                </label>
              </div>
            ) : null}
            <label className="field-label">
              Reporting timezone
              <select
                value={filters.timeZone}
                onChange={(event) => setFilters((current) => ({ ...current, timeZone: event.target.value }))}
              >
                {ZONES.map((zone) => (
                  <option key={zone} value={zone}>
                    {zone}
                  </option>
                ))}
              </select>
            </label>
            <label className="field-label">
              Campaign
              <select
                value={filters.campaign}
                onChange={(event) => setFilters((current) => ({ ...current, campaign: event.target.value }))}
                disabled={!report?.campaignsAvailable}
              >
                <option value="">All campaigns</option>
                {(report?.campaigns ?? []).map((campaign) => (
                  <option key={campaign} value={campaign}>
                    {campaign}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              className="range-button"
              onClick={() => load(filters, { preserve: true })}
            >
              Refresh
            </button>
            <button type="button" className="range-button" onClick={onExport} disabled={!showFigures}>
              Export CSV
            </button>
          </div>

          <p className="dashboard-note" role="status">
            {phase === "loading" ? "Loading audience figures." : null}
            {phase === "unconfigured" ? "Analytics is not configured on the server." : null}
            {phase === "empty" ? "No channel clicks in this range." : null}
            {phase === "error" ? "The audience figures could not be loaded. Failed requests are not shown as zero." : null}
            {phase === "stale" && report
              ? `These figures are from the last successful update at ${formatUpdated(report)}. The latest refresh did not succeed, so they were not replaced.`
              : null}
            {phase === "ready" && report
              ? `Last successful update ${formatUpdated(report)}. Reporting timezone ${report.timeZone}.`
              : null}
            {filters.preset === "custom" && !filtersReady(filters) ? " Choose a start date and an end date." : null}
          </p>
          {report?.campaignsAvailable === false ? (
            <p className="dashboard-note">Campaign attribution is not available for this range.</p>
          ) : null}
          {report?.campaignsAvailable && report.campaigns?.length === 0 ? (
            <p className="dashboard-note">No campaign values were returned for this range.</p>
          ) : null}
          {exportError ? <p className="dashboard-note">{exportError}</p> : null}

          <div className="stat-grid" aria-live="polite">
            <ChannelCard title="YouTube" channel={report?.channels?.youtube} phase={phase} />
            <ChannelCard title="WhatsApp" channel={report?.channels?.whatsapp} phase={phase} />
          </div>

          <section className="card" aria-labelledby="trend-title">
            <h2 id="trend-title">Engagement trend</h2>
            {showFigures && report?.trend?.length ? (
              <>
                <TrendChart trend={report.trend} />
                <TrendTable trend={report.trend} />
              </>
            ) : (
              <p className="dashboard-note">
                {phase === "error" || report?.trend == null
                  ? "The daily trend is not available."
                  : "No daily engagement in this range."}
              </p>
            )}
          </section>

          <details
            className="card setup-panel"
            open={setupOpen}
            onToggle={(event) => setSetupOpen(event.currentTarget.open)}
          >
            <summary>Analytics setup</summary>
            <p>
              The stats key stays on the server. This page does not receive it. Set
              PLAUSIBLE_DOMAIN and PLAUSIBLE_API_KEY in the server environment, then restart.
              The public landing page still uses VITE_PLAUSIBLE_DOMAIN only to load the counter script.
            </p>
            {missing.length > 0 ? (
              <p>Missing on the server: {missing.join(", ")}.</p>
            ) : (
              <p>The server has a Plausible domain and a stats key.</p>
            )}
            <p>
              Plausible goals must keep these names: qr_landing_view, youtube_channel_click,
              and whatsapp_channel_click. Preset and custom dates are sent in the reporting
              timezone selected above. Plausible labels each daily row in the timezone saved
              on that site.
            </p>
          </details>
      </>
    </Layout>
  );
}
