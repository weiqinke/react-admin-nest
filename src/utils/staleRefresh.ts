type RefreshFn = () => void | Promise<void>;

/**
 * 限制同一刷新函数的调用频率：TTL 内复用上次结果，并发时共享同一请求。
 * force=true 时跳过 TTL（仍会并入进行中的请求）。
 */
export function createStaleRefresh(fn: RefreshFn, ttlMs = 45000) {
  let lastOk = 0;
  let inflight: Promise<void> | null = null;

  return (force = false) => {
    const now = Date.now();
    if (!force && lastOk > 0 && now - lastOk < ttlMs) return Promise.resolve();
    if (inflight) return inflight;

    inflight = Promise.resolve()
      .then(() => fn())
      .then(() => {
        lastOk = Date.now();
      })
      .finally(() => {
        inflight = null;
      });

    return inflight;
  };
}
