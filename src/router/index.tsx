import routes from "@/router/router";
import { createBrowserRouter } from "react-router";

const router = createBrowserRouter(routes);

/** 始终返回已挂载的那一个路由器，登录失效时的 navigate 才能落到当前实例。 */
const ProjectRouter = () => router;

export default ProjectRouter;
