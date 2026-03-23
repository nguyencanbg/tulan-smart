import React from "react";
import { createRoot } from "react-dom/client";
import { App, ZMPRouter, SnackbarProvider } from "zmp-ui";
import "zmp-ui/zaui.css";
// Dòng này cực kỳ quan trọng, phải là app viết thường:
import AppContent from "./app"; 

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