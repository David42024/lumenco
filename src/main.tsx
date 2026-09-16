import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { useThemeStore } from "@/store/themeStore";
import "./index.css";

function Root() {
  const apply = useThemeStore((s) => s.apply);
  useEffect(() => {
    apply();
  }, [apply]);

  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Root />
  </StrictMode>
);
