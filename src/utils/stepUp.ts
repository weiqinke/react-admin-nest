type StepUpPrompt = (title?: string) => Promise<string | null>;

let promptImpl: StepUpPrompt | null = null;
const pending: Array<(fn: StepUpPrompt) => void> = [];

/** 由 StepUpHost 注册；拦截器通过 promptStepUp 调用。 */
export function registerStepUpPrompt(fn: StepUpPrompt | null) {
  promptImpl = fn;
  if (!fn) return;
  pending.splice(0).forEach(wait => wait(fn));
}

export function promptStepUp(title = "敏感操作确认"): Promise<string | null> {
  if (promptImpl) return promptImpl(title);
  window.dispatchEvent(new Event("stepup:need"));
  return new Promise(resolve => {
    let settled = false;
    const timer = window.setTimeout(() => {
      settled = true;
      resolve(null);
    }, 4000);
    pending.push(fn => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      resolve(fn(title));
    });
  });
}
