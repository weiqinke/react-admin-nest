import * as echarts from "echarts/core";
import { BarChart, CustomChart, EffectScatterChart, FunnelChart, GraphChart, LineChart, LinesChart, MapChart, PictorialBarChart, PieChart, ScatterChart } from "echarts/charts";
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
