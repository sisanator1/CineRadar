import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AuthProvider } from "./AuthContext.jsx";
import App from "./App.jsx";
import "./index.css";

/*  TEMPORARY MOBILE DEBUG OVERLAY */
window.onerror = function (msg, src, line, col, err) {
  alert(
    "JS ERROR:\n" +
    msg + "\n" +
    "Line: " + line
  );
};
/*  END DEBUG OVERLAY */

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>
);
