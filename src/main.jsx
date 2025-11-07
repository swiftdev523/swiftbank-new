import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
// App Check disabled to prevent API errors in production
// import { initAppCheck } from "./config/appCheckConfig";

// Initialize App Check before rendering the app
// initAppCheck();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
