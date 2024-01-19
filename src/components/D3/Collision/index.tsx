import * as d3 from "d3";
import { useEffect, useRef } from "react";

const width = 600;
const height = 300;

const createData = () => {
  const k = width / 200;
  const r = d3.randomUniform(k, k * 4);
  const n = 4;
  return Array.from({ length: 200 }, (_, i) => ({
    r: r(),
    group: i && (i % n) + 1,
  }));
};
const data = createData();
const nodes = data.map(Object.create);

const Collision = () => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  const pointermoved = (event) => {
    const [x, y] = d3.pointer(event);
    nodes[0].fx = x - width / 2;
    nodes[0].fy = y - height / 2;
  };

  useEffect(() => {
    const color = d3.scaleOrdinal(d3.schemeTableau10);
    const context = svgRef.current.getContext("2d");
    d3.forceSimulation(nodes)
      .alphaTarget(0.3) // stay hot
      .velocityDecay(0.1) // low friction
      .force("x", d3.forceX().strength(0.01))
      .force("y", d3.forceY().strength(0.01))
      .force(
        "collide",
        d3
          .forceCollide()
          .radius((d) => d.r + 1)
          .iterations(3)
      )
      .force(
        "charge",
        d3.forceManyBody().strength((d, i) => (i ? 0 : (-width * 2) / 3))
      )
      .on("tick", () => {
        context.clearRect(0, 0, width, height);
        context.save();
        context.translate(width / 2, height / 2);
        for (let i = 1; i < nodes.length; ++i) {
          const d = nodes[i];
          context.beginPath();
          context.moveTo(d.x + d.r, d.y);
          context.arc(d.x, d.y, d.r, 0, 2 * Math.PI);
          context.fillStyle = color(d.group);
          context.fill();
        }
        context.restore();
      });

    d3.select(context.canvas)
      .on("touchmove", (event) => event.preventDefault())
      .on("pointermove", pointermoved);
  }, []);

  return <canvas ref={svgRef} width="600" height={height} />;
};

export default Collision;
