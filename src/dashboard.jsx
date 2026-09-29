import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import AudienceDashboard from "./components/AudienceDashboard.jsx";
import "./index.css";
import "./dashboard.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AudienceDashboard />
  </StrictMode>,
);
