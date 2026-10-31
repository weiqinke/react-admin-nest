import * as echarts from "echarts/core";
import { PieChart } from "echarts/charts";
import { TitleComponent, TooltipComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";

echarts.use([PieChart, TitleComponent, TooltipComponent, CanvasRenderer]);

export default echarts;
