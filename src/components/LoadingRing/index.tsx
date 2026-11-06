const ringClass = "inline-block shrink-0 animate-spin rounded-full border-solid border-[#00ff85] border-t-transparent motion-reduce:animate-none";

export function LoadingRing({ size = "1em" }: { size?: number | string }) {
  return (
    <span
      role="status"
      aria-label="正在加载"
      className={ringClass}
      style={{
        width: size,
        height: size,
        borderWidth: typeof size === "number" ? Math.max(2, Math.round(size / 8)) : "0.18em",
        boxSizing: "border-box"
      }}
    />
  );
}

export function LoadingMark({ label = "正在加载", size = 32 }: { label?: string; size?: number }) {
  return (
    <div className="flex flex-col items-center justify-center">
      <LoadingRing size={size} />
      <p className="mt-4 animate-pulse font-mono text-xs tracking-widest text-[#94a3b8] uppercase motion-reduce:animate-none">{label}</p>
    </div>
  );
}

/** 给 ConfigProvider 用。每个消费处要单独一个元素，不能共用同一个引用。 */
export const spinIndicator = <LoadingRing />;
export const buttonLoadingIcon = <LoadingRing />;
