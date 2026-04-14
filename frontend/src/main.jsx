// main.jsx — Application entry point
import React from "react";
import ReactDOM from "react-dom/client";
import { ThemeProvider, CssBaseline } from "@mui/material";
import App from "./App";
import theme from "./theme";
import { syncOfflineWorkouts } from "./utils/offlineSync";
import "@fontsource/inter/400.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/inter/800.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>
);

// Register Service Worker
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch((err) => {
      console.error("SW Registration failed: ", err);
    });
  });
}

// Sync offline data when coming back online
window.addEventListener("online", () => {
  syncOfflineWorkouts().then(syncedCount => {
    if (syncedCount > 0) {
      console.log(`Successfully synced ${syncedCount} offline workouts!`);
      // You could dispatch a global event here if you wanted a UI toast
      window.dispatchEvent(new CustomEvent('offline-sync-success', { detail: syncedCount }));
    }
  });
});
