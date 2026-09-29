import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import ClickDashboard from "./components/ClickDashboard.jsx";
import "./index.css";
import "./dashboard.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ClickDashboard />
  </StrictMode>,
);
