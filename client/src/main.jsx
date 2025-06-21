import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { CivicAuthProvider } from "@civic/auth/react";
import AppContextProvider from './context/AppContext.jsx'
import { WalletProvider } from "./context/WalletContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <CivicAuthProvider clientId={import.meta.env.VITE_CIVIC_CLIENT_ID}>
      <WalletProvider>
      <AppContextProvider>
        <App /> 
      </AppContextProvider>
      </WalletProvider>
    </CivicAuthProvider>
  </BrowserRouter>
);
