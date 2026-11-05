/** 饼图。不要从 setup.ts 把地图和关系图带进来。 */
import * as echarts from "echarts/core";
import { PieChart } from "echarts/charts";
import { LegendComponent, TitleComponent, TooltipComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";

echarts.use([PieChart, LegendComponent, TitleComponent, TooltipComponent, CanvasRenderer]);

export default echarts;
