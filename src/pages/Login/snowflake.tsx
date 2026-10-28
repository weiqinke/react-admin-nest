import snowflake_png from "@/assets/snowflake.png";
import sakura_png from "@/assets/sakura.png";
import { useEffect, useRef } from "react";

type SnowflakeProps = {
  rdm: number;
};

/** 一片雪花（或樱花）。角度一律用弧度。 */
type Flake = {
  /** 左右摆动的中心，风加在这上面 */
  anchorX: number;
  y: number;
  /** 0 远、1 近 */
  depth: number;
  size: number;
  /** 绕自身 x / y / z 轴的旋转弧度 */
  rx: number;
  ry: number;
  rz: number;
  /** 各轴角速度，弧度/秒 */
  vrx: number;
  vry: number;
  vrz: number;
  fall: number;
  swayAmp: number;
  swayFreq: number;
  phase: number;
  opacity: number;
};

const FLAKE_COUNT = 72;

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function signed(min: number, max: number) {
  return rand(min, max) * (Math.random() < 0.5 ? -1 : 1);
}

/** 绕 x 或 y 轴的投影。符号表示翻过正面，幅度在接近 0 时仍留一条窄边。 */
function axisScale(radians: number) {
  const projected = Math.cos(radians);
  const sign = projected < 0 ? -1 : 1;
  return sign * (0.16 + 0.84 * Math.abs(projected));
}

function createFlake(width: number, height: number, isSnow: boolean, fromTop: boolean): Flake {
  const depth = rand(0.25, 1);
  const size = (isSnow ? 22 : 20) + depth * (isSnow ? 50 : 36);
  // 远处的更轻，摆幅更大
  const swayAmp = (isSnow ? 14 : 26) + (1 - depth) * (isSnow ? 34 : 46);
  const spin = 1.15 - depth * 0.45;

  return {
    anchorX: rand(0, Math.max(width, 1)),
    y: fromTop ? -rand(size, size + height * 0.2) : rand(-size, height),
    depth,
    size,
    rx: rand(0, Math.PI * 2),
    ry: rand(0, Math.PI * 2),
    rz: rand(0, Math.PI * 2),
    vrx: signed(0.9, 2.1) * spin * (isSnow ? 1 : 1.2),
    vry: signed(0.8, 1.9) * spin * (isSnow ? 1 : 1.15),
    vrz: signed(0.5, 1.6) * (isSnow ? 1 : 1.1),
    fall: (isSnow ? 32 : 46) + depth * (isSnow ? 88 : 64),
    swayAmp,
    swayFreq: rand(0.45, 1.2),
    phase: rand(0, Math.PI * 2),
    opacity: (isSnow ? 0.5 : 0.7) + depth * 0.45
  };
}

function fitCanvas(canvas: HTMLCanvasElement) {
  const width = document.body.clientWidth;
  const height = document.body.clientHeight;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.max(1, Math.floor(width * dpr));
  canvas.height = Math.max(1, Math.floor(height * dpr));
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  const ctx = canvas.getContext("2d");
  ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, width, height };
}

const Snowflake = ({ rdm }: SnowflakeProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = ref.current;
    if (!host) return;

    const isSnow = rdm >= 0.45;
    const img = new Image();
    img.src = isSnow ? snowflake_png : sakura_png;

    const canvas = document.createElement("canvas");
    canvas.style.cssText = "position:absolute;left:0;top:0;pointer-events:none;";
    host.appendChild(canvas);

    let { ctx, width, height } = fitCanvas(canvas);
    const flakes: Flake[] = [];
    let raf = 0;
    let running = true;
    let started = false;
    let last = 0;
    let elapsed = 0;

    const onResize = () => {
      const next = fitCanvas(canvas);
      ctx = next.ctx;
      width = next.width;
      height = next.height;
    };

    const positionOf = (flake: Flake, time: number) => {
      const sway = time * flake.swayFreq + flake.phase;
      return {
        x: flake.anchorX + Math.sin(sway) * flake.swayAmp,
        y: flake.y + Math.cos(sway) * flake.swayAmp * 0.18
      };
    };

    const drawFlake = (flake: Flake, time: number) => {
      if (!ctx) return;
      const { x, y } = positionOf(flake, time);
      // z：画面内自旋。x / y：翻转到侧面时宽高被压扁，负值表示翻过正面。
      const scaleX = axisScale(flake.ry);
      const scaleY = axisScale(flake.rx);
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(flake.rz);
      ctx.scale(scaleX, scaleY);
      ctx.globalAlpha = flake.opacity;
      ctx.drawImage(img, -flake.size / 2, -flake.size / 2, flake.size, flake.size);
      ctx.restore();
    };

    const step = (dt: number, time: number) => {
      const wind = Math.sin(time * 0.17) * (isSnow ? 16 : 28) + (isSnow ? 6 : -20);
      for (const flake of flakes) {
        flake.anchorX += wind * dt * (0.4 + flake.depth * 0.6);
        flake.y += flake.fall * dt;
        flake.rx += flake.vrx * dt;
        flake.ry += flake.vry * dt;
        flake.rz += flake.vrz * dt;

        const { x, y } = positionOf(flake, time);
        const gone = x < -flake.size - flake.swayAmp || x > width + flake.size + flake.swayAmp || y > height + flake.size;
        if (gone) Object.assign(flake, createFlake(width, height, isSnow, true));
      }
    };

    const frame = (now: number) => {
      if (!running) return;
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
      last = now;
      elapsed += dt;
      if (ctx) {
        if (dt > 0) step(dt, elapsed);
        ctx.clearRect(0, 0, width, height);
        flakes.sort((a, b) => a.depth - b.depth);
        for (const flake of flakes) drawFlake(flake, elapsed);
      }
      raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (started) return;
      started = true;
      for (let i = 0; i < FLAKE_COUNT; i += 1) flakes.push(createFlake(width, height, isSnow, false));
      raf = requestAnimationFrame(frame);
    };

    img.onload = start;
    if (img.complete && img.naturalWidth > 0) start();

    window.addEventListener("resize", onResize);
    return () => {
      running = false;
      img.onload = null;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      canvas.remove();
    };
  }, [rdm]);

  return <div ref={ref} />;
};

export default Snowflake;
