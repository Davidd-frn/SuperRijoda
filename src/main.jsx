import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App.jsx";
import "./css/style.css";
import { BASE_URL } from "./lib/basePath.js";

// Expose base URL for legacy scripts that live in /public.
window.__BASE_URL__ = BASE_URL;

createRoot(document.getElementById("root")).render(
  <HashRouter basename="/">
    <App />
  </HashRouter>
);
