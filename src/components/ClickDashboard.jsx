import { useEffect, useState } from "react";
import { organisationLabel } from "../site.config.js";
import Layout from "./Layout.jsx";
import {
  CLICK_GOALS,
  DATE_RANGES,
  fetchClickStats,
  statsConfig,
} from "../lib/clickStats.js";

const emptyCounts = { users: null, clicks: null };

export default function ClickDashboard() {
  const config = statsConfig();
  const [range, setRange] = useState("7d");
  const [status, setStatus] = useState(config.ready ? "loading" : "unconfigured");
  const [counts, setCounts] = useState({
    youtube: emptyCounts,
    whatsapp: emptyCounts,
  });

  useEffect(() => {
    if (!config.ready) {
      return undefined;
    }

    const controller = new AbortController();

    fetchClickStats({
      domain: config.domain,
      apiKey: config.apiKey,
      apiBase: config.apiBase,
      dateRange: range,
      signal: controller.signal,
    })
      .then((next) => {
        setCounts(next);
        setStatus("ready");
      })
      .catch((error) => {
        if (error.name === "AbortError") {
          return;
        }
        setStatus("error");
      });

    return () => controller.abort();
  }, [config.apiBase, config.apiKey, config.domain, config.ready, range]);

  return (
    <Layout organisationName={organisationLabel()}>
      <header className="hero">
        <h1>Clicked users</h1>
        <p className="lead">
          People who clicked a channel button. A click is not a subscription or a follow.
        </p>
      </header>

      <div className="range-row" role="group" aria-label="Date range">
        {DATE_RANGES.map((item) => (
          <button
            key={item.id}
            type="button"
            className="range-button"
            aria-pressed={range === item.id}
            onClick={() => {
              setRange(item.id);
              if (config.ready) {
                setStatus("loading");
              }
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="stat-grid" aria-live="polite">
        {CLICK_GOALS.map((item) => {
          const count = counts[item.id] ?? emptyCounts;
          return (
            <article key={item.id} className={`card stat-card stat-card--${item.id}`}>
              <h2>{item.title}</h2>
              <p className="stat-value">
                {status === "ready" ? count.users : "—"}
              </p>
              <p className="stat-label">Clicked users</p>
              <p className="stat-clicks">
                {status === "ready" ? `${count.clicks} clicks` : "Clicks appear here"}
              </p>
            </article>
          );
        })}
      </div>

      {status === "loading" ? <p className="dashboard-note">Loading click counts.</p> : null}
      {status === "error" ? (
        <p className="dashboard-note" role="status">
          The click counts could not be loaded. Check the Plausible domain and the stats key,
          then reload this page.
        </p>
      ) : null}
      {status === "unconfigured" ? (
        <p className="dashboard-note">
          Add the Plausible domain and a read-only stats key in .env, then rebuild. The goals
          must be named youtube_channel_click and whatsapp_channel_click.
        </p>
      ) : null}

      <section className="quiz-card dashboard-note-card">
        <h2>Not subscriptions</h2>
        <p>
          Clicked users is an estimate of different people who clicked. Someone who clicked
          both buttons is counted on each card. YouTube subscriber and WhatsApp follower
          totals still come from those apps, not from this page.
        </p>
      </section>
    </Layout>
  );
}
