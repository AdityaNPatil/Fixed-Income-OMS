import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./styles.css";
import { BondProvider } from "./context/BondContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <BondProvider>
        <App />
      </BondProvider>
    </BrowserRouter>
  </React.StrictMode>
);
