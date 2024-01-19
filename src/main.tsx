import ReactDOM from "react-dom/client";
import ProjectRouter from "./router/index.tsx";
import { RouterProvider } from "react-router-dom";

import "./reset.css";
const router = ProjectRouter();

ReactDOM.createRoot(document.getElementById("caravan-root")!).render(
  <RouterProvider router={router} />
);
