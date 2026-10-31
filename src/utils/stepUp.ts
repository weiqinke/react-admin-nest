type StepUpPrompt = (title?: string) => Promise<string | null>;

let promptImpl: StepUpPrompt | null = null;

/** 由 StepUpHost 注册；拦截器通过 promptStepUp 调用。 */
export function registerStepUpPrompt(fn: StepUpPrompt | null) {
  promptImpl = fn;
}

export function promptStepUp(title = "敏感操作确认"): Promise<string | null> {
  if (!promptImpl) return Promise.resolve(null);
  return promptImpl(title);
}
