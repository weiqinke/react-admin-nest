type ThrottleOptions = {
  leading?: boolean;
  trailing?: boolean;
};

/** 只覆盖项目里用到的 leading / trailing 行为。 */
export function throttle<T extends (...args: any[]) => void>(fn: T, wait: number, options?: ThrottleOptions) {
  const leading = options?.leading !== false;
  const trailing = options?.trailing !== false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let lastArgs: Parameters<T> | undefined;
  let lastCall = 0;

  const invoke = () => {
    lastCall = Date.now();
    const args = lastArgs;
    lastArgs = undefined;
    if (args) fn(...args);
  };

  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (!lastCall && !leading) lastCall = now;
    const remaining = wait - (now - lastCall);
    lastArgs = args;
    if (remaining <= 0 || remaining > wait) {
      if (timer !== undefined) {
        clearTimeout(timer);
        timer = undefined;
      }
      invoke();
      return;
    }
    if (timer === undefined && trailing) {
      timer = setTimeout(() => {
        timer = undefined;
        if (!leading) lastCall = 0;
        if (lastArgs) invoke();
      }, remaining);
    }
  };
}
