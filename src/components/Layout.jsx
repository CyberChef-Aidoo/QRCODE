import { siteConfig } from "../site.config.js";

export default function Layout({ organisationName, children }) {
  const tagline =
    typeof siteConfig.tagline === "string" ? siteConfig.tagline.trim() : "";

  return (
    <div className="page">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="masthead">
        <p className="org-name">{organisationName}</p>
        {tagline ? <p className="tagline">“{tagline}”</p> : null}
      </header>
      <main id="main" className="sheet">
        {children}
      </main>
    </div>
  );
}
