// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { CustomThemeProvider } from "./contexts/themeContext";


ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <CustomThemeProvider>
        
          <App />
      </CustomThemeProvider>
    </BrowserRouter>
  // </React.StrictMode>
);
