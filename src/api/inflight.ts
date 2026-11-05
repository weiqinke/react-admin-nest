const inflight = new Map<string, Promise<unknown>>();

/** 同一时刻相同的 GET 只发一次。完成后下次再要会重新请求。 */
export function shareInflight<T>(key: string, run: () => Promise<T>): Promise<T> {
  const existing = inflight.get(key) as Promise<T> | undefined;
  if (existing) return existing;
  const task = run().finally(() => {
    if (inflight.get(key) === task) inflight.delete(key);
  });
  inflight.set(key, task);
  return task;
}

export function queryKey(url: string, params: Record<string, unknown>) {
  const text = Object.keys(params)
    .sort()
    .map(key => `${key}=${String(params[key])}`)
    .join("&");
  return `GET ${url}?${text}`;
}

/** 取消只作用于这一次等待，不把进行中的共享请求掐掉。 */
export function withCallerAbort<T>(task: Promise<T>, signal?: AbortSignal): Promise<T> {
  if (!signal) return task;
  if (signal.aborted) return Promise.reject(new DOMException("The operation was aborted.", "AbortError"));
  return new Promise((resolve, reject) => {
    const onAbort = () => reject(new DOMException("The operation was aborted.", "AbortError"));
    signal.addEventListener("abort", onAbort, { once: true });
    task.then(resolve, reject).finally(() => signal.removeEventListener("abort", onAbort));
  });
}
