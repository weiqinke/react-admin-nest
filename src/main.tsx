import ReactDOM from "react-dom/client";
import ProjectRouter from "./router/index.tsx";
import { RouterProvider } from "react-router-dom";
import React from "react";

import "./reset.css";
const router = ProjectRouter();

ReactDOM.createRoot(document.getElementById("caravan-root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
