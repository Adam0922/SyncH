import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { ThemeProvider } from "./theme/themeContext";
import MainCntrlBtns from "./components/mainControlBtns/mainCntrlBtns";

const root = createRoot(document.getElementById("root"));

root.render(
    <React.StrictMode>
        <ThemeProvider>
            <App />
            <MainCntrlBtns />
        </ThemeProvider>
    </React.StrictMode>
);