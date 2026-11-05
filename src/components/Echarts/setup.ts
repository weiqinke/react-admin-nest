/** 图表演示页注册。登录频次图用 setup-cartesian，不要从这里带进地图。 */
import * as echarts from "echarts/core";
import { BarChart, CustomChart, EffectScatterChart, GraphChart, LineChart, LinesChart, MapChart, PictorialBarChart, PieChart } from "echarts/charts";
import {
  AxisPointerComponent,
  GeoComponent,
  GridComponent,
  LegendComponent,
  MarkLineComponent,
  MarkPointComponent,
  TimelineComponent,
  TitleComponent,
  ToolboxComponent,
  TooltipComponent,
  VisualMapComponent
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";

echarts.use([
  BarChart,
  CustomChart,
  EffectScatterChart,
  GraphChart,
  LineChart,
  LinesChart,
  MapChart,
  PictorialBarChart,
  PieChart,
  AxisPointerComponent,
  GeoComponent,
  GridComponent,
  LegendComponent,
  MarkLineComponent,
  MarkPointComponent,
  TimelineComponent,
  TitleComponent,
  ToolboxComponent,
  TooltipComponent,
  VisualMapComponent,
  CanvasRenderer
]);

export default echarts;
