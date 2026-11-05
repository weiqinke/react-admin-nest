/** 象形柱。只注册柱状图需要的坐标系。 */
import * as echarts from "echarts/core";
import { BarChart, PictorialBarChart } from "echarts/charts";
import { GridComponent, TooltipComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";

echarts.use([BarChart, PictorialBarChart, GridComponent, TooltipComponent, CanvasRenderer]);

export default echarts;
