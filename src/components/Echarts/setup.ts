/** 图表演示页全量注册。工作台/看板请用 setup-pie / setup-cartesian，避免拖入地图、词云等模块。 */
import * as echarts from "echarts/core";
import {
  BarChart,
  CustomChart,
  EffectScatterChart,
  FunnelChart,
  GraphChart,
  LineChart,
  LinesChart,
  MapChart,
  PictorialBarChart,
  PieChart,
  ScatterChart
} from "echarts/charts";
import {
  AxisPointerComponent,
  DatasetComponent,
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
  FunnelChart,
  GraphChart,
  LineChart,
  LinesChart,
  MapChart,
  PictorialBarChart,
  PieChart,
  ScatterChart,
  AxisPointerComponent,
  DatasetComponent,
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
