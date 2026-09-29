import { useState } from "react";
import { logoSrc, siteConfig } from "../site.config.js";

function BrandLogo() {
  const src = logoSrc();
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return null;
  }

  return (
    <img
      className="brand-logo"
      src={src}
      alt=""
      width="72"
      height="72"
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}

export default function Layout({ organisationName, children }) {
  const tagline =
    typeof siteConfig.tagline === "string" ? siteConfig.tagline.trim() : "";

  return (
    <div className="page">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="masthead">
        <div className="brand-row">
          <BrandLogo />
          <div className="brand-copy">
            <p className="org-name">{organisationName}</p>
            {tagline ? <p className="tagline">“{tagline}”</p> : null}
          </div>
        </div>
      </header>
      <main id="main" className="sheet">
        {children}
      </main>
    </div>
  );
}
