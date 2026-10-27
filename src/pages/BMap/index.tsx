import { useEffect, useRef } from "react";

type BMapInstance = {
  centerAndZoom: (center: unknown, zoom: number) => void;
  enableScrollWheelZoom: (enabled?: boolean) => void;
};

type BMapNamespace = {
  Map: new (container: HTMLElement, opts?: object) => BMapInstance;
  Point: new (lng: number, lat: number) => unknown;
};

const BMapPage = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    const BMap = (window as Window & { BMap?: BMapNamespace }).BMap;
    if (!el || !BMap) return;

    const map = new BMap.Map(el, { enableMapClick: false });
    map.centerAndZoom(new BMap.Point(116.402544, 39.928216), 11);
    map.enableScrollWheelZoom(true);

    return () => {
      el.innerHTML = "";
    };
  }, []);

  return (
    <div style={{ padding: 12 }}>
      <div
        ref={containerRef}
        style={{
          height: "calc(100vh - 120px)",
          width: "100%"
        }}
      />
    </div>
  );
};

export default BMapPage;
