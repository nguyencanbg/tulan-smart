import React from "react";
import { createRoot } from "react-dom/client";
import { App, ZMPRouter, SnackbarProvider } from "zmp-ui";
import "zmp-ui/zaui.css"; // Quan trọng để hiển thị giao diện đẹp
import AppContent from "./App";

const root = createRoot(document.getElementById("app")!);
root.render(
  <App>
    <SnackbarProvider>
      <ZMPRouter>
        <AppContent />
      </ZMPRouter>
    </SnackbarProvider>
  </App>
);