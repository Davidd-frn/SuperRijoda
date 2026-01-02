import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./css/style.css";
import { BASE_URL } from "./lib/basePath.js";

// Expose base URL for legacy scripts that live in /public.
window.__BASE_URL__ = BASE_URL;

createRoot(document.getElementById("root")).render(
  <BrowserRouter basename={BASE_URL}>
    <App />
  </BrowserRouter>
);
