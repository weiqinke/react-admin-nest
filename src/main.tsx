import { message } from "antd";
import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router/dom";
import { setApiErrorReporter } from "./api/feedback";
import { setAuthExpiredHandler } from "./api/session";
import ProjectRouter from "./router/index.tsx";

import { applyHeaderTheme, readStoredTheme } from "./theme/palette";
import "./styles/reset.css";
import "./styles/tailwind.css";
import "./styles/admin.css";

applyHeaderTheme(readStoredTheme());

const router = ProjectRouter();

setAuthExpiredHandler(() => {
  const path = window.location.pathname;
  if (path.startsWith("/login") || path.startsWith("/oauth/")) return;
  void router.navigate("/login");
});

setApiErrorReporter(text => {
  message.error({ content: text, duration: 2 });
});

ReactDOM.createRoot(document.getElementById("caravan-root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
