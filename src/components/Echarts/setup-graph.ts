/** 服务拓扑：关系图和飞线。 */
import * as echarts from "echarts/core";
import { GraphChart, LinesChart } from "echarts/charts";
import { GridComponent, TooltipComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";

echarts.use([GraphChart, LinesChart, GridComponent, TooltipComponent, CanvasRenderer]);

export default echarts;
