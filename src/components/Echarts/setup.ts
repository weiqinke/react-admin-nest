/** 家庭感知图专用。饼图、直角坐标、象形柱、拓扑各自有更小的注册文件。 */
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
