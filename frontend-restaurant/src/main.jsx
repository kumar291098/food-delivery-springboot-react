import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles.css";
import { initDatadogRum } from "./datadog";

// Initialize Datadog Real User Monitoring
initDatadogRum("food-delivery-frontend-restaurant");

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
